#!/usr/bin/env python3

import json
import os
from enum import Enum
from datetime import datetime
from decky_plugin import logger
from request_lib import request
from typing import List

from py_modules.settings import Settings, settingsManager

INIT_JSON = {}
DEFAULT_DB_FILE_PATH = os.path.join(os.environ.get(
    'DECKY_PLUGIN_SETTINGS_DIR'), 'deal_db.json')


class Deal(Enum):
    ID = 'id'
    TITLE = 'title'
    WORTH = 'worth'
    IMAGE = 'image'
    OPEN_GIVEAWAY_URL = 'open_giveaway_url'
    PUBLISHED_DATE = 'published_date'
    END_DATE = 'end_date'
    STATUS = 'status'
    PLATFORMS = 'platforms'
    HIDDEN = 'hidden'


class Endpoint(Enum):
    STEAM_REQUEST = 'https://www.gamerpower.com/api/giveaways?platform=steam&type=game'
    EGS_REQUEST = 'https://www.gamerpower.com/api/giveaways?platform=epic-games-store&type=game'
    GOG_REQUEST = 'https://www.gamerpower.com/api/giveaways?platform=gog&type=game'


class DealDB:
    def __init__(self, deals: dict = {}):
        self.deals: dict = deals
        self.num_new_deals = 0

    def import_from_json(self, file_path: str = DEFAULT_DB_FILE_PATH) -> None:
        # if file does not exist create it
        if not os.path.isfile(file_path):
            logger.info('No deals db, creating new empty one')
            with open(file_path, 'w') as json_file:
                json.dump(INIT_JSON, json_file, indent=4)
            self.deals = INIT_JSON

        with open(file_path, 'r') as json_file:
            logger.info('Loaded deals from db')
            self.deals = json.load(json_file)

    def export_to_json(self, file_path: str = DEFAULT_DB_FILE_PATH) -> None:
        with open(file_path, 'w') as json_file:
            json.dump(self.deals, json_file, indent=4)
            logger.info(f'Wrote deals to {DEFAULT_DB_FILE_PATH}')
    
    def get_deal_endpoints(self) -> dict:
        endpoints = {
            Endpoint.STEAM_REQUEST: settingsManager.getSetting(Settings.ENABLE_STEAM_GAMES.value),
            Endpoint.EGS_REQUEST: settingsManager.getSetting(Settings.ENABLE_EGS_GAMES.value),
            Endpoint.GOG_REQUEST: settingsManager.getSetting(Settings.ENABLE_GOG_GAMES.value),
        }
        return endpoints

    def compare_deals(self, deals: dict[Deal]) -> dict:
        for key in deals:
            if key not in self.deals:
                self.num_new_deals += 1
            else:
                deals[key][Deal.HIDDEN.value] = self.deals[key].get(Deal.HIDDEN.value) or False

        logger.info(f'Found {self.num_new_deals} new deals')
        return deals

    def compare_and_export_deals(self, deals: dict[Deal]):
        new_deals = self.compare_deals(deals)
        self.deals = new_deals
        self.export_to_json()

    def format_deals(self, deals: List[dict]) -> dict:
        formatted_deals = {}
        for new_deal in deals:
            # ensure deal is active
            if new_deal.get(Deal.STATUS.value) != "Active":
                continue

            # ensure deal was published within last 90 days
            # pub_date = datetime.strptime(new_deal.get(
            #     Deal.PUBLISHED_DATE.value), '%Y-%m-%d %H:%M:%S')
            # if pub_date < (datetime.utcnow() - timedelta(days=90)):
            #     continue

            # some deals on gamerpower have an end date of N/A
            # these are promotional, require third-party accounts, and overall
            # will just clutter the games available, they will be ignored unless
            # they are GOG games which often have N/A
            end_date_str = new_deal.get(Deal.END_DATE.value)
            # if end_date_str == 'N/A':
            #     continue
            
            try:
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d %H:%M:%S')
                # overwrite with just date information
                new_deal[Deal.END_DATE.value] = end_date.strftime('%Y-%m-%d')
            except Exception as _:
                logger.warning('Could not parse date, setting end_date to N/A')
                new_deal[Deal.END_DATE.value] = 'N/A'


            cur_deal = {}
            for att in Deal:
                if att == Deal.TITLE:
                    title = new_deal.get(att.value)
                    cur_deal[att.value] = self.cleanup_deal_title(title)
                elif att == Deal.PLATFORMS:
                    platforms = new_deal.get(att.value)
                    cur_deal[att.value] = self.cleanup_deal_platforms(platforms)
                else:
                    cur_deal[att.value] = new_deal.get(att.value)
            id = new_deal.get(Deal.ID.value)
            formatted_deals[str(id)] = cur_deal
        return formatted_deals

    def cleanup_deal_title(self, title: str) -> str:
        title_filters = [' (Steam)', ' (Epic Games)']
        # check title for instance of filter, if not present, return nothing instead of -1 from .find()
        filter_indicies = [index for filter in title_filters if (
            (index := title.find(filter)) > 0)]
        # get earliest point in string of filter to terminate string, removing all filter strings,
        # but if filter_indices is empty then just set str_end to -1 so title is left as is
        str_end = min(filter_indicies) if len(filter_indicies) > 0 else -1
        if str_end != -1:
            title = title[:str_end]
        else:
            # it is guaranteed that the Giveaway ending to the title will need to be removed if the above
            # filters are not in the string
            title = title.removesuffix(' Giveaway')
            if title.startswith('Get ') and title.endswith(' for FREE!'):
                title = title.removeprefix('Get ') # Remove Get prefix from GOG games
                title = title.removesuffix(' for FREE!') # Remove GOG giveaway suffix
            else:
                title = title.removeprefix('Free ') # Remove Free prefix from long-standing steam giveaways
        return title
    
    def cleanup_deal_platforms(self, platforms: str):
        # ordering is important as earlier platforms have higher priority
        store_names = ['GOG', 'Steam', 'Epic Games Store']
        for store_name in store_names:
            if store_name in platforms:
                return store_name

    def get_new_deals(self) -> dict:
        responses = {endpoint.name: request(endpoint.value) for endpoint, enabled in self.get_deal_endpoints().items() \
                        if enabled}
        logger.info(f'Requested free game information for the following endpoints: {[r for r in responses]}')
        deal_response_list = []

        for endpoint, response in responses.items():
            if response.status == 201:
                logger.info(f'No current deals for {endpoint}')
                continue

            if response.status == 200:
                logger.info(
                    f'Received response containing deals from {endpoint}')
                response_json = response.json()
                # ensure deal ids are stored as strings and not integers
                for deal in response_json:
                    deal[Deal.ID.value] = str(deal[Deal.ID.value])
                deal_response_list.append(response_json)
                continue

            logger.error(
                f'Something went wrong. Received status code {response.status} from {endpoint}')
            return None

        # convert list of api response lists to single list and return formatted version of them
        return self.format_deals(sum(deal_response_list, []))

    def process_new_deals(self) -> None:
        self.import_from_json()
        new_deals = self.get_new_deals()
        self.compare_and_export_deals(new_deals)
        
    def toggle_deal_visibility(self, id: str) -> bool:
        self.import_from_json()
        is_hidden = not self.deals[id][Deal.HIDDEN.value]
        self.deals[id][Deal.HIDDEN.value] = is_hidden
        self.export_to_json()
        return is_hidden
        
