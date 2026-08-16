import logging
import os
import sys
import tempfile
import types
import unittest

# stub the decky module injected by the loader at runtime, before importing
# any plugin code
_decky_stub = types.ModuleType("decky")
_decky_stub.logger = logging.getLogger("test")
_decky_stub.DECKY_PLUGIN_SETTINGS_DIR = tempfile.mkdtemp()
sys.modules.setdefault("decky", _decky_stub)

_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path[:0] = [_ROOT, os.path.join(_ROOT, "py_modules")]

from py_modules.deal_db import Deal, DealDB  # noqa: E402


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
        self.assertEqual(self.db.cleanup_deal_title("Awesome Game (Steam) Giveaway"), "Awesome Game")
        self.assertEqual(self.db.cleanup_deal_title("Big Game (Epic Games) Giveaway"), "Big Game")
        self.assertEqual(self.db.cleanup_deal_title("Indie Gem (itch.io) Giveaway"), "Indie Gem")
        self.assertEqual(self.db.cleanup_deal_title("Old Game (PC) Key Giveaway"), "Old Game")

    def test_earliest_marker_wins(self):
        self.assertEqual(self.db.cleanup_deal_title("Some Game (Steam) (PC) Giveaway"), "Some Game")

    def test_gog_get_for_free_wrapper(self):
        self.assertEqual(self.db.cleanup_deal_title("Get Classic RPG for FREE!"), "Classic RPG")

    def test_giveaway_suffix_removed(self):
        self.assertEqual(self.db.cleanup_deal_title("Neat Game Giveaway"), "Neat Game")

    def test_free_prefix_removed(self):
        self.assertEqual(self.db.cleanup_deal_title("Free Space Sim Giveaway"), "Space Sim")

    def test_marker_at_position_zero_is_kept(self):
        # a marker at position 0 is ignored so the title is not truncated to
        # an empty string
        self.assertEqual(self.db.cleanup_deal_title("(Steam) Game Giveaway"), "(Steam) Game")


class TestCleanupDealPlatforms(unittest.TestCase):
    def setUp(self):
        self.db = DealDB()

    def test_single_platform(self):
        self.assertEqual(self.db.cleanup_deal_platforms("PC, Steam"), "Steam")
        self.assertEqual(self.db.cleanup_deal_platforms("PC, Epic Games Store"), "Epic Games Store")

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
