import os
from enum import Enum
from settings import SettingsManager
from decky_plugin import logger

# Get environment variable
settingsDir = os.environ["DECKY_PLUGIN_SETTINGS_DIR"]
logger.info("Settings path: {}".format(os.path.join(settingsDir, "settings.json")))
settingsManager = SettingsManager(name="settings", settings_directory=settingsDir)


class Settings(Enum):
    UPDATE_FREQ_DAY = "update_frequency_day"
    UPDATE_FREQ_HOUR = "update_frequency_hour"
    UPDATE_FREQ_MIN = "update_frequency_min"
    NOTIFY_ON_FREE_GAMES = "notify_on_free_games"
    LAST_UPDATE_TIME = "last_update_timestamp"
    ENABLE_STEAM_GAMES = "enable_steam_games"
    ENABLE_EGS_GAMES = "enable_egs_games"
    ENABLE_GOG_GAMES = "enable_gog_games"


SETTINGS_DEFAULTS = {
    Settings.UPDATE_FREQ_DAY.value: 0,
    Settings.UPDATE_FREQ_HOUR.value: 12,
    Settings.UPDATE_FREQ_MIN.value: 0,
    Settings.NOTIFY_ON_FREE_GAMES.value: True,
    Settings.LAST_UPDATE_TIME.value: "1970-01-01T00:00:00Z",
    Settings.ENABLE_STEAM_GAMES.value: True,
    Settings.ENABLE_EGS_GAMES.value: True,
    Settings.ENABLE_GOG_GAMES.value: True,
}
