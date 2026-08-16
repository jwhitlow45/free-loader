import json
import logging
import os
import sys
import tempfile
import types
import unittest
from datetime import datetime
from unittest.mock import patch

# stub the decky module injected by the loader at runtime, before importing
# any plugin code
_decky_stub = types.ModuleType("decky")
_decky_stub.logger = logging.getLogger("test")
_decky_stub.DECKY_PLUGIN_SETTINGS_DIR = tempfile.mkdtemp()
sys.modules.setdefault("decky", _decky_stub)

_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path[:0] = [_ROOT, os.path.join(_ROOT, "py_modules")]

from py_modules.amazon_feed import parse_amazon_game_feed  # noqa: E402
from py_modules.deal_db import (  # noqa: E402
    AMAZON_SOURCE,
    Deal,
    DealDB,
    GAMERPOWER_SOURCE,
)
from py_modules.plugin_settings import Settings, settingsManager  # noqa: E402
from request_lib import USER_AGENT  # noqa: E402


class TestUserAgent(unittest.TestCase):
    def test_user_agent_uses_package_json_version(self):
        with open(os.path.join(_ROOT, "package.json"), "r") as package_file:
            version = json.load(package_file)["version"]
        self.assertIn(f"FreeLoader/{version}", USER_AGENT)


def make_raw_deal(**overrides):
    deal = {
        "id": 101,
        "title": "Awesome Game (Steam) Giveaway",
        "worth": "$9.99",
        "image": "http://example.com/1.png",
        "open_giveaway_url": "http://example.com/1",
        "published_date": "2026-08-01 00:00:00",
        "end_date": "2026-09-01 23:59:00",
        "status": "Active",
        "platforms": "PC, Steam",
    }
    deal.update(overrides)
    return deal


def make_deal(id: str, hidden: bool = False) -> Deal:
    deal = Deal(
        id=id,
        title=f"Game {id}",
        worth="$9.99",
        image="http://example.com/img.png",
        open_giveaway_url="http://example.com/deal",
        published_date="2026-08-01 00:00:00",
        end_date="2026-09-01",
        status="Active",
        platforms="Steam",
    )
    deal.hidden = hidden
    return deal


class TestCleanupDealTitle(unittest.TestCase):
    def setUp(self):
        self.db = DealDB()

    def test_store_marker_terminates_title(self):
        self.assertEqual(
            self.db.cleanup_deal_title("Awesome Game (Steam) Giveaway"), "Awesome Game"
        )
        self.assertEqual(
            self.db.cleanup_deal_title("Big Game (Epic Games) Giveaway"), "Big Game"
        )
        self.assertEqual(
            self.db.cleanup_deal_title("Indie Gem (itch.io) Giveaway"), "Indie Gem"
        )
        self.assertEqual(
            self.db.cleanup_deal_title("Old Game (PC) Key Giveaway"), "Old Game"
        )

    def test_earliest_marker_wins(self):
        self.assertEqual(
            self.db.cleanup_deal_title("Some Game (Steam) (PC) Giveaway"), "Some Game"
        )

    def test_gog_get_for_free_wrapper(self):
        self.assertEqual(
            self.db.cleanup_deal_title("Get Classic RPG for FREE!"), "Classic RPG"
        )

    def test_giveaway_suffix_removed(self):
        self.assertEqual(self.db.cleanup_deal_title("Neat Game Giveaway"), "Neat Game")

    def test_free_prefix_removed(self):
        self.assertEqual(
            self.db.cleanup_deal_title("Free Space Sim Giveaway"), "Space Sim"
        )

    def test_marker_matching_is_case_insensitive(self):
        self.assertEqual(
            self.db.cleanup_deal_title("Indie Gem (Itch.io) Giveaway"), "Indie Gem"
        )
        self.assertEqual(
            self.db.cleanup_deal_title("Indie Gem (ITCH.IO) Giveaway"), "Indie Gem"
        )
        self.assertEqual(
            self.db.cleanup_deal_title("Some Game (STEAM) Giveaway"), "Some Game"
        )

    def test_dotless_itchio_marker(self):
        self.assertEqual(
            self.db.cleanup_deal_title("Indie Gem (itchio) Giveaway"), "Indie Gem"
        )
        self.assertEqual(
            self.db.cleanup_deal_title("Indie Gem (Itchio) Giveaway"), "Indie Gem"
        )

    def test_marker_at_position_zero_is_kept(self):
        # a marker at position 0 is ignored so the title is not truncated to
        # an empty string
        self.assertEqual(
            self.db.cleanup_deal_title("(Steam) Game Giveaway"), "(Steam) Game"
        )


class TestCleanupDealPlatforms(unittest.TestCase):
    def setUp(self):
        self.db = DealDB()

    def test_single_platform(self):
        self.assertEqual(self.db.cleanup_deal_platforms("PC, Steam"), "Steam")
        self.assertEqual(
            self.db.cleanup_deal_platforms("PC, Epic Games Store"), "Epic Games Store"
        )

    def test_priority_order(self):
        # GOG is listed before Steam in STORE_LIST so it wins
        self.assertEqual(self.db.cleanup_deal_platforms("PC, GOG, Steam"), "GOG")

    def test_unsupported_platforms(self):
        self.assertEqual(self.db.cleanup_deal_platforms("Android, iOS"), "")


class TestFormatDeals(unittest.TestCase):
    def setUp(self):
        self.db = DealDB()

    def test_only_active_deals_kept(self):
        formatted = self.db.format_deals([make_raw_deal(status="Expired")])
        self.assertEqual(formatted, {})

    def test_deal_formatting(self):
        formatted = self.db.format_deals([make_raw_deal()])
        self.assertEqual(list(formatted.keys()), ["101"])
        deal = formatted["101"]
        self.assertEqual(deal.id, "101")
        self.assertEqual(deal.title, "Awesome Game")
        self.assertEqual(deal.platforms, "Steam")
        self.assertEqual(deal.end_date, "2026-09-01")
        self.assertFalse(deal.hidden)

    def test_unparseable_end_date_becomes_na(self):
        formatted = self.db.format_deals([make_raw_deal(end_date="N/A")])
        self.assertEqual(formatted["101"].end_date, "N/A")


AMAZON_FEED_XML = """<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:html="http://www.w3.org/1999/xhtml">
  <entry>
    <id>https://feed.eikowagenknecht.com/lootscraper/10837</id>
    <title>Amazon Prime (Game, PC) - Steelrising</title>
    <link href="https://luna.amazon.com/claims/steelrising" rel="alternate"/>
    <updated>2026-08-13T18:00:53.586Z</updated>
    <content type="xhtml"><html:div><html:img src="https://images.example.com/steelrising.jpg"/><html:ul><html:li><html:b>Offer valid from:</html:b> 2026-08-13 18:00</html:li><html:li><html:b>Offer valid to:</html:b> 2026-09-16 00:00</html:li><html:li><html:b>Recommended price (Steam):</html:b> 49.99 EUR</html:li><html:li><html:b>Description:</html:b> Paris, 1789: a game about automatons.</html:li></html:ul></html:div></content>
  </entry>
  <entry>
    <id>https://feed.eikowagenknecht.com/lootscraper/10000</id>
    <title>Amazon Prime (Game, PC) - Expired Game</title>
    <link href="https://luna.amazon.com/claims/expired" rel="alternate"/>
    <content type="xhtml"><html:div><html:ul><html:li><html:b>Offer valid to:</html:b> 2026-08-01 12:00</html:li></html:ul></html:div></content>
  </entry>
  <entry>
    <id>https://feed.eikowagenknecht.com/lootscraper/10001</id>
    <title>Amazon Prime (Game, PC) - No End Date Game</title>
    <link href="https://luna.amazon.com/claims/no-end" rel="alternate"/>
    <content type="xhtml"><html:div/></content>
  </entry>
</feed>"""


class TestAmazonFeed(unittest.TestCase):
    def setUp(self):
        self.offers = parse_amazon_game_feed(AMAZON_FEED_XML, now=datetime(2026, 8, 20))

    def test_offer_fields(self):
        offer = self.offers[0]
        self.assertEqual(offer["id"], "amazon-10837")
        self.assertEqual(offer["title"], "Steelrising")
        self.assertEqual(offer["worth"], "49.99€")
        self.assertEqual(offer["image"], "https://images.example.com/steelrising.jpg")
        self.assertEqual(
            offer["open_giveaway_url"], "https://luna.amazon.com/claims/steelrising"
        )
        self.assertEqual(offer["platforms"], "Amazon Prime")
        self.assertEqual(offer["status"], "Active")

    def test_midnight_end_rolls_back_to_previous_day(self):
        # offers ending at exactly midnight are last claimable the day before
        self.assertEqual(self.offers[0]["end_date"], "2026-09-15")

    def test_expired_offers_filtered(self):
        self.assertNotIn("amazon-10000", [offer["id"] for offer in self.offers])

    def test_missing_end_date_becomes_na(self):
        no_end = next(o for o in self.offers if o["id"] == "amazon-10001")
        self.assertEqual(no_end["end_date"], "N/A")

    def test_offers_build_valid_deals(self):
        for offer in self.offers:
            Deal(**offer)  # raises if fields do not match the deal model

    def test_entities_unescaped(self):
        feed = AMAZON_FEED_XML.replace(
            "Amazon Prime (Game, PC) - Steelrising",
            "Amazon Prime (Game, PC) - Command &amp; Conquer&#039;s &quot;Remaster&quot;",
        )
        offers = parse_amazon_game_feed(feed, now=datetime(2026, 8, 20))
        self.assertEqual(offers[0]["title"], 'Command & Conquer\'s "Remaster"')


class TestFetchAllSources(unittest.TestCase):
    def setUp(self):
        settingsManager.setSetting(Settings.ENABLE_AMAZON_GAMES, True)

    def test_one_source_failing_keeps_the_other(self):
        db = DealDB()
        with (
            patch.object(DealDB, "get_gamerpower_deals", side_effect=RuntimeError),
            patch.object(
                DealDB,
                "get_amazon_deals",
                return_value={"amazon-1": make_deal("amazon-1")},
            ),
        ):
            new_deals, failed_sources = db.fetch_all_sources()
        self.assertEqual(set(new_deals), {"amazon-1"})
        self.assertEqual(failed_sources, {GAMERPOWER_SOURCE})

    def test_all_sources_failing_raises(self):
        db = DealDB()
        with (
            patch.object(DealDB, "get_gamerpower_deals", side_effect=RuntimeError),
            patch.object(DealDB, "get_amazon_deals", side_effect=RuntimeError),
        ):
            with self.assertRaises(RuntimeError):
                db.fetch_all_sources()

    def test_deal_source_from_id(self):
        db = DealDB()
        self.assertEqual(db.deal_source("amazon-10837"), AMAZON_SOURCE)
        self.assertEqual(db.deal_source("101"), GAMERPOWER_SOURCE)

    def test_failed_source_deals_retained_with_hidden_flags(self):
        db = DealDB()
        db.deals = {
            "1": make_deal("1", hidden=True),
            "amazon-2": make_deal("amazon-2"),
        }
        new_deals = {"amazon-3": make_deal("amazon-3")}
        db.retain_deals_from_failed_sources(new_deals, {GAMERPOWER_SOURCE})
        self.assertIn("1", new_deals)
        self.assertTrue(new_deals["1"].hidden)
        # the amazon source succeeded, so its stale deal is not retained
        self.assertNotIn("amazon-2", new_deals)


class TestCompareDeals(unittest.TestCase):
    def test_new_deals_counted(self):
        db = DealDB()
        db.compare_deals({"1": make_deal("1"), "2": make_deal("2")})
        self.assertEqual(db.num_new_deals, 2)

    def test_hidden_state_carried_over(self):
        db = DealDB()
        db.deals = {"1": make_deal("1", hidden=True)}
        result = db.compare_deals({"1": make_deal("1"), "2": make_deal("2")})
        self.assertTrue(result["1"].hidden)
        self.assertFalse(result["2"].hidden)
        self.assertEqual(db.num_new_deals, 1)


if __name__ == "__main__":
    unittest.main()
