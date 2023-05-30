from settings import SettingsManager
from decky_plugin import logger
# Get environment variable
settingsDir = os.environ["DECKY_PLUGIN_SETTINGS_DIR"]

import os
logger.info('Settings path: {}'.format(os.path.join(settingsDir, 'settings.json'))
settings = SettingsManager(name="settings", settings_directory=settingsDir)
settings.read()

class Plugin:
  async def settings_read(self):
    logger.info('Reading settings')
    return settings.read()
  async def settings_commit(self):
    logger.info('Saving settings')
    return settings.commit()
  async def settings_getSetting(self, key: str, defaults):
    logger.info('Get {}'.format(key))
    return settings.getSetting(key, defaults)
  async def settings_setSetting(self, key: str, value):
    logger.info('Set {}: {}'.format(key, value))
    return settings.setSetting(key, value)