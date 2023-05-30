import os
import platform
import json
from decky_plugin import logger

class Plugin:
    def __init__(self):
        self.user_settings = Settings()
        self.user_settings.read_settings()
        
    async def _main(self):
        logger.info(
            f"Plugin loaded with python version {platform.python_version()}")

    async def _unload(self):
        logger.info("Goodbye World!")
        pass
        
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
        return { 'value' : self.user_settings.notify_forever_games}
        
    async def settings_toggle_notify_trial_games(self):
        self.user_settings.notify_forever_games -= 1
        self.user_settings.notify_trial_games *= 1
        self.settings_commit()
        return { 'value' : self.user_settings.notify_trial_games}
        
        
DEF_DAYS = 0
DEF_HOURS = 12
DEF_MINUTES = 0
DEF_NOTIFY_FOREVER_GAMES = 1
DEF_NOTIFY_TRIAL_GAMES = 1

__SETTINGS_FILE_DIR = os.path.dirname(os.path.realpath(__file__))
SETTINGS_FOLDER_NAME = 'settings'
SETTINGS_FILE_NAME = 'user_settings.json'
SETTINGS_FILE_PATH = os.path.join(__SETTINGS_FILE_DIR, SETTINGS_FOLDER_NAME, SETTINGS_FILE_NAME)

class UpdateFrequency:
    def __init__(self, days: int = DEF_DAYS, hours: int = DEF_HOURS, minutes: int = DEF_MINUTES):
        self.days = days
        self.hours = hours
        self.minutes = minutes

class UpdateFrequencyEncoder(json.JSONEncoder):
        def default(self, o):
            return o.__dict__
    
class Settings:
    def __init__(self,
                 update_frequency: UpdateFrequency = UpdateFrequency(),
                 notify_forever_games: int = DEF_NOTIFY_FOREVER_GAMES,
                 notify_trial_games: int = DEF_NOTIFY_TRIAL_GAMES):
        self.update_frequency = update_frequency
        self.notify_forever_games = notify_forever_games
        self.notify_trial_games = notify_trial_games
    
    def read_settings(self):
        if not self.__is_settings_file_exist():
            self.restore_settings()
        try:
            with open(SETTINGS_FILE_PATH, 'r') as file:
                user_settings = json.load(file)
                self.__parse_settings(user_settings)
        except Exception as e:
            logger.info(f'Exception while trying to read settings file: {e}')
            self.restore_settings()
        logger.info('Read user settings')
    
    def commit_settings(self):
        if not self.__is_settings_file_exist():
            self.restore_settings()
        with open(SETTINGS_FILE_PATH, 'w') as file:
            file.seek(0)
            json.dump(vars(self), file, indent=4, cls=UpdateFrequencyEncoder)
            file.truncate()
        logger.info('Saved changes to settings file')
    
    def restore_settings(self):
        defaults = Settings()
        with open(SETTINGS_FILE_PATH, 'w') as file:
            file.seek(0)
            json.dump(vars(defaults), file, indent=4, cls=UpdateFrequencyEncoder)
            file.truncate()
        logger.info('Restored settings file')

    def __is_settings_file_exist(self):
        return os.path.exists(SETTINGS_FILE_PATH) and os.path.isfile(SETTINGS_FILE_PATH)

    def __parse_settings(self, user_settings):
        self.__parse_update_frequency_settings(user_settings)
        self.__parse_notification_settings(user_settings)
        
    def __parse_update_frequency_settings(self, user_settings):
        update_frequency = user_settings.get('update_frequency', UpdateFrequency())
        self.update_frequency.days = update_frequency.get('days', DEF_DAYS)
        self.update_frequency.hours = update_frequency.get('hours', DEF_HOURS)
        self.update_frequency.minutes = update_frequency.get('minutes', DEF_MINUTES)
        
    def __parse_notification_settings(self, user_settings):
        self.notify_forever_games = user_settings.get('notify_forever_games', DEF_NOTIFY_FOREVER_GAMES)
        self.notify_trial_games = user_settings.get('notify_trial_games', DEF_NOTIFY_TRIAL_GAMES)