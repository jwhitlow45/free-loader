#!/usr/bin/env python3

from enum import StrEnum
import json
import os
import threading
from datetime import datetime
from typing import Any
from decky import logger, DECKY_PLUGIN_SETTINGS_DIR
from request_lib import request

from py_modules.plugin_settings import Settings, settingsManager

DEFAULT_DB_FILE_PATH = os.path.join(DECKY_PLUGIN_SETTINGS_DIR, "deal_db.json")
# guards deal db file access, as updates run in a thread off the event loop
_db_lock = threading.RLock()


class Deal:
    def __init__(
        self,
        id: str,
        title: str,
        worth: str,
        image: str,
        open_giveaway_url: str,
        published_date: str,
        end_date: str,
        status: str,
        platforms: str,
    ):
        self.id = id
        self.title = title
        self.worth = worth
        self.image = image
        self.open_giveaway_url = open_giveaway_url
        self.published_date = published_date
        self.end_date = end_date
        self.status = status
        self.platforms = platforms
        self.hidden = False


class DealDbKey(StrEnum):
    ID = "id"
    TITLE = "title"
    WORTH = "worth"
    IMAGE = "image"
    OPEN_GIVEAWAY_URL = "open_giveaway_url"
    PUBLISHED_DATE = "published_date"
    END_DATE = "end_date"
    STATUS = "status"
    PLATFORMS = "platforms"
    HIDDEN = "hidden"


class Store:
    def __init__(
        self, platform_name: str, title_name: str, setting: Settings
    ):
        self.platform_name = platform_name
        self.title_name = title_name
        self.setting = setting


STORE_GAMES_ENDPOINT = "https://www.gamerpower.com/api/giveaways?type=game"
# title markers that appear in forms not covered by the store list
EXTRA_TITLE_FILTERS = ["(PC)", "(itchio)"]
# order matters for store priority
STORE_LIST = [
    Store(
        "GOG",
        "(GOG)",
        Settings.ENABLE_GOG_GAMES,
    ),
    Store(
        "Steam",
        "(Steam)",
        Settings.ENABLE_STEAM_GAMES,
    ),
    Store(
        "Epic Games Store",
        "(Epic Games)",
        Settings.ENABLE_EGS_GAMES,
    ),
    Store(
        "Itch.io",
        "(itch.io)",
        Settings.ENABLE_ITCHIO_GAMES,
    ),
]


class DealDB:
    def __init__(self):
        self.deals: dict[str, Deal] = {}
        self.num_new_deals = 0

    def to_dict(self) -> dict[str, dict[str, Any]]:
        return {id: deal.__dict__ for id, deal in self.deals.items()}

    def import_from_json(self, file_path: str = DEFAULT_DB_FILE_PATH) -> None:
        with _db_lock:
            # if file does not exist create it
            if not os.path.isfile(file_path):
                logger.info("No deals db, creating new empty one")
                self.deals = {}
                self.export_to_json(file_path)
                return

            try:
                with open(file_path, "r") as json_file:
                    deal_json: dict[str, dict[str, Any]] = json.load(json_file)
                for id, deal in deal_json.items():
                    is_hidden = deal.pop(DealDbKey.HIDDEN, False)
                    self.deals[id] = Deal(**deal)
                    self.deals[id].hidden = is_hidden
            except Exception:
                # the db is just a cache of the store api, so recover from a
                # corrupt or outdated file by starting over instead of
                # failing every plugin method forever
                logger.exception(
                    "Deals db is corrupt or outdated...resetting to empty db"
                )
                self.deals = {}
                self.export_to_json(file_path)
                return

        logger.info("Loaded deals from db")

    def export_to_json(self, file_path: str = DEFAULT_DB_FILE_PATH) -> None:
        with _db_lock:
            # write to a temp file then rename so a crash mid-write cannot
            # corrupt the db
            tmp_file_path = file_path + ".tmp"
            with open(tmp_file_path, "w") as json_file:
                json.dump(self.to_dict(), json_file, indent=4)
            os.replace(tmp_file_path, file_path)
        logger.info(f"Wrote deals to {file_path}")

    def compare_deals(self, deals: dict[str, Deal]) -> dict[str, Deal]:
        for key in deals:
            if key not in self.deals:
                self.num_new_deals += 1
            else:
                deals[key].hidden = self.deals[key].hidden

        logger.info(f"Found {self.num_new_deals} new deals")

        return deals

    def compare_and_export_deals(self, deals: dict[str, Deal]):
        new_deals = self.compare_deals(deals)
        self.deals = new_deals
        self.export_to_json()

    def format_deals(self, deals: list[dict[str, str | int]]) -> dict[str, Deal]:
        formatted_deals = {}
        for new_deal in deals:
            # ensure deal is active
            if new_deal.get(DealDbKey.STATUS) != "Active":
                continue

            # some deals on gamerpower have an end date of N/A
            # these are promotional, require third-party accounts, and overall
            # will just clutter the games available, they will be ignored unless
            # they are GOG games which often have N/A
            end_date_str = str(new_deal.get(DealDbKey.END_DATE))

            try:
                end_date = datetime.strptime(end_date_str, "%Y-%m-%d %H:%M:%S")
                # overwrite with just date information
                new_deal[DealDbKey.END_DATE] = end_date.strftime("%Y-%m-%d")
            except Exception as _:
                # routine for GOG deals, so not worth a warning per deal per update
                logger.debug("Could not parse date, setting end_date to N/A")
                new_deal[DealDbKey.END_DATE] = "N/A"

            cur_deal: dict[str, str] = {}
            for att in DealDbKey:
                if (
                    att == DealDbKey.HIDDEN
                ):  # skip hidden attribute as it does not originate from the deal request
                    continue

                att_value = str(new_deal.get(att))
                if att == DealDbKey.TITLE:
                    cur_deal[att] = self.cleanup_deal_title(att_value)
                elif att == DealDbKey.PLATFORMS:
                    cur_deal[att] = self.cleanup_deal_platforms(att_value)
                else:
                    cur_deal[att] = att_value
            id = new_deal.get(DealDbKey.ID)
            formatted_deals[str(id)] = Deal(**cur_deal)

        return formatted_deals

    def cleanup_deal_title(self, title: str) -> str:
        title_filters = [store.title_name for store in STORE_LIST] + EXTRA_TITLE_FILTERS
        # markers appear with inconsistent casing (e.g. "(itch.io)" and
        # "(Itch.io)"), so match them case-insensitively
        lowered_title = title.casefold()
        # collect positions of filters present in the title; > 0 intentionally
        # skips both missing filters (-1 from .find()) and filters at position 0,
        # which would otherwise truncate the title to an empty string
        filter_indicies = [
            index
            for filter in title_filters
            if ((index := lowered_title.find(filter.casefold())) > 0)
        ]
        # get earliest point in string of filter to terminate string, removing all filter strings,
        # but if filter_indices is empty then just set str_end to -1 so title is left as is
        str_end = min(filter_indicies) if len(filter_indicies) > 0 else -1
        if str_end != -1:
            title = title[:str_end]
        else:
            # it is guaranteed that the Giveaway ending to the title will need to be removed if the above
            # filters are not in the string
            title = title.removesuffix(" Giveaway")
            if title.startswith("Get ") and title.endswith(" for FREE!"):
                title = title.removeprefix("Get ")  # Remove Get prefix from GOG games
                title = title.removesuffix(" for FREE!")  # Remove GOG giveaway suffix
            else:
                title = title.removeprefix(
                    "Free "
                )  # Remove Free prefix from long-standing steam giveaways
        return title.strip()

    def cleanup_deal_platforms(self, platforms: str) -> str:
        # ordering is important as earlier platforms have higher priority
        platform_name_list = [store.platform_name for store in STORE_LIST]
        for name in platform_name_list:
            if name in platforms:
                return name
        return ""

    def get_new_deals(self) -> dict[str, Deal]:
        response = request(STORE_GAMES_ENDPOINT)
        deal_response_list: list[dict[str, str | int]] = []

        if response.status >= 400:
            logger.error(
                f"Something went wrong. Received status code {response.status} from {STORE_GAMES_ENDPOINT}"
            )
            return {}

        if response.status == 201:
            logger.info("No current deals available")
            return {}

        if response.status == 200:
            logger.info(f"Received response containing deals from {STORE_GAMES_ENDPOINT}")
            response_json = response.json()
            # ensure deal ids are stored as strings and not integers
            for deal in response_json:
                for store in STORE_LIST:
                    # only return games from enabled stores and supported platforms
                    if settingsManager.getSetting(store.setting, False) and store.platform_name in deal[DealDbKey.PLATFORMS]:
                        deal[DealDbKey.ID] = str(deal[DealDbKey.ID])
                        deal_response_list.append(deal)
                        break

        # return formatted deals
        return self.format_deals(deal_response_list)

    def process_new_deals(self) -> None:
        # fetch over the network before taking the lock so file access is
        # never blocked behind a slow request
        new_deals = self.get_new_deals()
        with _db_lock:
            self.import_from_json()
            self.compare_and_export_deals(new_deals)

    def toggle_deal_visibility(self, id: str) -> bool:
        self.import_from_json()
        is_hidden = not self.deals[id].hidden
        self.deals[id].hidden = is_hidden
        self.export_to_json()
        return is_hidden
