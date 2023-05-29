import os

# The decky plugin module is located at decky-loader/plugin
# For easy intellisense checkout the decky-loader code one directory up
# or add the `decky-loader/plugin` path to `python.analysis.extraPaths` in `.vscode/settings.json`
import decky_plugin
from decky_plugin import logger
from settings import SettingsManager

settingsDir = os.environ["DECKY_PLUGIN_SETTINGS_DIR"]
settings = SettingsManager(name="settings", settings_directory=settingsDir)

class Plugin:
    # Expose settings methods to allow them to be called from typescript
    # Credit to the decky-autosuspend plugin for this snippet
    # https://github.com/jurassicplayer/decky-autosuspend/blob/main/main.py
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
