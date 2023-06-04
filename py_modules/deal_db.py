#!/usr/bin/env python3

import json
import os
from enum import Enum
from decky_plugin import logger
from request_lib import request

INIT_JSON = {}
DEFAULT_FILE_PATH = 'deal_db.json'
DEAL_API_ENDPOINT = 'https://www.gamerpower.com/api/giveaways?platform=steam&type=game'

class Deal(Enum):
    ID = 'id'
    TITLE = 'title'
    WORTH = 'worth'
    THUMBNAIL = 'thumbnail'
    IMAGE = 'image'
    DESCRIPTION = 'description'
    INSTRUCTIONS = 'instructions'
    OPEN_GIVEAWAY_URL = 'open_giveaway_url'
    PUBLISHED_DATE = 'published_date'
    TYPE = 'type'
    PLATFORMS = 'platforms'
    END_DATE = 'end_date'
    USERS = 'users'
    STATUS = 'status'
    GAMERPOWER_URL = 'gamerpower_url'
    OPEN_GIVEAWAY = 'open_giveaway'

class DealDB:
    def __init__(self, deals: dict = {}):
        self.deals: dict = deals
        
    def import_from_json(self, file_path: str = DEFAULT_FILE_PATH) -> dict:
        # if file does not exist create it
        if not os.path.isfile(file_path):
            with open(file_path, 'w') as json_file:
                json.dump(INIT_JSON, json_file, indent=4)
            return INIT_JSON
        
        with open(file_path, 'r') as json_file:
            return json.load(json_file)
        
    def export_to_json(self, file_path: str = DEFAULT_FILE_PATH) -> None:
        with open(file_path, 'w') as json_file:
            json.dump(self.deals, json_file, indent=4)
            
    def compare_new_deals(self, new_deals: dict) -> dict:
        new_db = {}
        for key in new_deals:
            if key in self.deals:
                # we have already seen this deal
                new_db[key] = True
            else:
                # we have not seen this deal
                new_db[key] = False
        return new_db
    
    def compare_and_export_new_deals(self, new_deals: dict) -> dict:
        new_db = self.compare_new_deals(new_deals)
        self.export_to_json(new_db)
        return new_db
    
    def get_new_deals(self) -> dict:
        r = request(DEAL_API_ENDPOINT)
        if r.status == 201:
            logger.info('No current deals')
            return {}
        
        if r.status == 200:
            logger.info('Parsing deals response')
            logger.info(r.json())
            
            # for deal in request.json():
            #     print(datetime.strptime(deal.get(Deal.END_DATE.value)))
            return {}
                
        logger.error(f'Something went wrong. Received status code {r.status}')
        return None

test = DealDB()
test.get_new_deals()