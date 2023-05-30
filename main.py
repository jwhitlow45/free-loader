import os
from settings import SettingsManager
from decky_plugin import logger
# Get environment variable
settingsDir = os.environ["DECKY_PLUGIN_SETTINGS_DIR"]

logger.info('Settings path: {}'.format(os.path.join(settingsDir, 'settings.json')))
settings = SettingsManager(name="settings", settings_directory=settingsDir)

SETTINGS_DEFAULTS = {
    'update_frequency_day': 0,
    'update_frequency_hour': 12,
    'update_frequency_min': 0,
    'notify_forever_games': True,
    'notify_trial_games': True,
}

class Plugin:
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
        
    async def log(self, info):
        logger.info(info)
