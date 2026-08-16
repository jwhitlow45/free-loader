import json
import os
import threading
from enum import StrEnum

from decky import logger, DECKY_PLUGIN_SETTINGS_DIR


class SettingsManager:
    """Minimal replacement for the loader's legacy settings helper, which is
    not exposed to api_version 1 plugins. Reads and writes the same
    settings.json file so existing settings carry over."""

    def __init__(self, name: str, settings_directory: str):
        self._path = os.path.join(settings_directory, f"{name}.json")
        self._lock = threading.RLock()
        self.settings: dict = {}
        self.read()

    def read(self) -> None:
        with self._lock:
            try:
                with open(self._path, "r") as settings_file:
                    self.settings = json.load(settings_file)
            except FileNotFoundError:
                self.settings = {}
            except Exception:
                logger.exception(
                    "Settings file is corrupt...starting with empty settings"
                )
                self.settings = {}

    def commit(self) -> None:
        with self._lock:
            # write to a temp file then rename so a crash mid-write cannot
            # corrupt the settings file
            tmp_path = self._path + ".tmp"
            with open(tmp_path, "w") as settings_file:
                json.dump(self.settings, settings_file, indent=4)
            os.replace(tmp_path, self._path)

    def getSetting(self, key, default=None):
        with self._lock:
            return self.settings.get(key, default)

    def setSetting(self, key, value) -> None:
        with self._lock:
            self.settings[key] = value
            self.commit()


logger.info(
    "Settings path: {}".format(os.path.join(DECKY_PLUGIN_SETTINGS_DIR, "settings.json"))
)
settingsManager = SettingsManager(
    name="settings", settings_directory=DECKY_PLUGIN_SETTINGS_DIR
)


class Settings(StrEnum):
    UPDATE_FREQ_DAY = "update_frequency_day"
    UPDATE_FREQ_HOUR = "update_frequency_hour"
    UPDATE_FREQ_MIN = "update_frequency_min"
    NOTIFY_ON_FREE_GAMES = "notify_on_free_games"
    LAST_UPDATE_TIME = "last_update_timestamp"
    ENABLE_STEAM_GAMES = "enable_steam_games"
    ENABLE_EGS_GAMES = "enable_egs_games"
    ENABLE_GOG_GAMES = "enable_gog_games"
    ENABLE_ITCHIO_GAMES = "enable_itchio_games"
    SHOW_TITLES = "show_titles"
    SHOW_HIDDEN_GAMES = "show_hidden_games"
    DISABLE_ANIMATIONS = "disable_animations"
    LARGER_TEXT = "larger_text"


SETTINGS_DEFAULTS = {
    Settings.UPDATE_FREQ_DAY: 0,
    Settings.UPDATE_FREQ_HOUR: 12,
    Settings.UPDATE_FREQ_MIN: 0,
    Settings.NOTIFY_ON_FREE_GAMES: True,
    Settings.LAST_UPDATE_TIME: "1970-01-01T00:00:00Z",
    Settings.ENABLE_STEAM_GAMES: True,
    Settings.ENABLE_EGS_GAMES: True,
    Settings.ENABLE_GOG_GAMES: True,
    Settings.ENABLE_ITCHIO_GAMES: True,
    Settings.SHOW_TITLES: True,
    Settings.SHOW_HIDDEN_GAMES: False,
    Settings.DISABLE_ANIMATIONS: False,
    Settings.LARGER_TEXT: False,
}
