import os
import sys

sys.path.append(os.path.abspath("../plugins/free-loader"))

from decky_plugin import logger
from py_modules.deal_db import DealDB
from py_modules.settings import settingsManager, SETTINGS_DEFAULTS


class Plugin:
    async def _main(self):
        try:
            # check settings for validity, if a setting is malformed then set it to default
            for key, value in SETTINGS_DEFAULTS.items():
                setting = await Plugin.settings_getSetting(self, key)
                if setting is None:
                    logger.info(f"Setting {key} is malformed...resetting to default.")
                    await Plugin.settings_setSetting(self, key, value)
        except Exception as e:
            logger.exception(e)
            raise e

    async def update_deals_now(self):
        try:
            dealdb = DealDB()
            dealdb.process_new_deals()
            return dealdb.num_new_deals
        except Exception as e:
            logger.exception(e)
            raise e

    async def read_deals(self) -> dict:
        try:
            logger.info("Reading deals from local json")
            dealdb = DealDB()
            dealdb.import_from_json()
            return dealdb.to_dict()
        except Exception as e:
            logger.exception(e)
            raise e

    async def clear_deals(self) -> dict:
        try:
            dealdb = DealDB()
            dealdb.export_to_json()
            logger.info("Cleared game database")
            return dealdb.to_dict()
        except Exception as e:
            logger.exception(e)
            raise e

    async def toggle_deal_visibility(self, id: str) -> dict:
        try:
            dealdb = DealDB()
            is_hidden = dealdb.toggle_deal_visibility(id)
            logger.info(f"Game id {id} hidden: {is_hidden}")
            return {"hidden": is_hidden}
        except Exception as e:
            logger.exception(e)
            raise e

    async def settings_commit(self):
        logger.info("Saving settings")
        return settingsManager.commit()

    async def settings_getSetting(self, key: str):
        logger.info("Get {}".format(key))
        return settingsManager.getSetting(key, None)

    async def settings_setSetting(self, key: str, value):
        logger.info("Set {}: {}".format(key, value))
        return settingsManager.setSetting(key, value)

    async def settings_restoreSettings(self):
        for key, value in SETTINGS_DEFAULTS.items():
            settingsManager.setSetting(key, value)
        logger.info("Restored settings to defaults")
        return settingsManager.commit()

    async def logger_info(self, info):
        logger.info(info)

    async def logger_error(self, error):
        logger.error(error)
