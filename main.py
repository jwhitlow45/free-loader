import os
import sys

sys.path.append(os.path.abspath('../plugins/free-loader'))

from enum import Enum
from time import sleep
from settings import SettingsManager
from decky_plugin import logger
from py_modules.deal_db import DealDB


# Get environment variable
settingsDir = os.environ["DECKY_PLUGIN_SETTINGS_DIR"]

logger.info('Settings path: {}'.format(os.path.join(settingsDir, 'settings.json')))
settings = SettingsManager(name="settings", settings_directory=settingsDir)

class Settings(Enum):
    UPDATE_FREQ_DAY = "update_frequency_day"
    UPDATE_FREQ_HOUR = "update_frequency_hour"
    UPDATE_FREQ_MIN = "update_frequency_min"
    NOTIFY_ON_FREE_GAMES = "notify_on_free_games"
    
SETTINGS_DEFAULTS = {
    Settings.UPDATE_FREQ_DAY.value : 0,
    Settings.UPDATE_FREQ_HOUR.value : 12,
    Settings.UPDATE_FREQ_MIN.value : 0,
    Settings.NOTIFY_ON_FREE_GAMES.value : True,
}

class Plugin:
    async def _main(self):

        # while True:
        #     sleep(3)
        #     await self.log(self, info='hello world')
        pass
    
    async def settings_commit(self):
        logger.info('Saving settings')
        return settings.commit()

    async def settings_getSetting(self, key: str):
        logger.info('Get {}'.format(key))
        return settings.getSetting(key)

    async def settings_setSetting(self, key: str, value):
        logger.info('Set {}: {}'.format(key, value))
        return settings.setSetting(key, value)
    
    async def settings_restoreSettings(self):
        for key, value in SETTINGS_DEFAULTS.items():
            settings.setSetting(key, value)
        logger.info('Restored settings to defaults')
        return settings.commit()
    
    async def update_deals_now(self):
        dealdb = DealDB()
        dealdb.process_new_deals()
        return dealdb.num_new_deals
        
    async def read_deals(self) -> dict:
        logger.info('Reading deals from local json')
        dealdb = DealDB()
        dealdb.import_from_json()
        return dealdb.deals
        
    async def log(self, info):
        logger.info(info)
