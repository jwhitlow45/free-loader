import os
import shutil
import json
from decky_plugin import logger
from Settings import Settings

class Plugin:
    def __init__(self):
        self.user_settings = Settings()
        self.user_settings.read_settings()
        
    async def settings_read(self):
        self.user_settings.read_settings()
        return vars(self.user_settings)
            
    async def settings_commit(self):
        self.user_settings.commit_settings()
        
    async def settings_getSetting(self, key: str):
        logger.info('Get {}'.format(key))
        settings_dict = vars(self.user_settings)
        return settings_dict.get(key)
    
    async def settings_set_update_frequency(self, update_freq_json):
        self.user_settings.__parse_update_frequency_settings(update_freq_json)
        self.settings_commit()        
    
    async def settings_toggle_notify_forever_games(self):
        self.user_settings.notify_forever_games -= 1
        self.user_settings.notify_forever_games *= -1
        self.settings_commit()
        
    async def settings_toggle_notify_trial_games(self):
        self.user_settings.notify_forever_games -= 1
        self.user_settings.notify_trial_games *= 1
        self.settings_commit()
        
