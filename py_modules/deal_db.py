#!/usr/bin/env python3

import json
import os
from enum import Enum
from time import daylight
from datetime import datetime, timedelta
from decky_plugin import logger
from request_lib import request
from typing import List

INIT_JSON = {}
DEFAULT_DB_FILE_PATH = os.path.join(os.environ.get('DECKY_PLUGIN_SETTINGS_DIR'), 'deal_db.json')
DEAL_API_ENDPOINT = 'https://www.gamerpower.com/api/giveaways?platform=steam&type=game'

class Deal(Enum):
    ID = 'id'
    TITLE = 'title'
    WORTH = 'worth'
    IMAGE = 'image'
    OPEN_GIVEAWAY_URL = 'open_giveaway_url'
    PUBLISHED_DATE = 'published_date'
    END_DATE = 'end_date'
    STATUS = 'status'

class DealDB:
    def __init__(self, deals: dict = {}):
        self.deals: dict = deals
        self.num_new_deals = 0
        
    def import_from_json(self, file_path: str = DEFAULT_DB_FILE_PATH) -> None:
        # if file does not exist create it
        if not os.path.isfile(file_path):
            logger.info('No deals db, creating new empty one')
            with open(file_path, 'w') as json_file:
                json.dump(INIT_JSON, json_file, indent=4)
            self.deals = INIT_JSON
        
        with open(file_path, 'r') as json_file:
            logger.info('Loaded deals from db')
            self.deals = json.load(json_file)
        
    def export_to_json(self, file_path: str = DEFAULT_DB_FILE_PATH) -> None:
        with open(file_path, 'w') as json_file:
            json.dump(self.deals, json_file, indent=4)
            logger.info(f'Wrote deals to {DEFAULT_DB_FILE_PATH}')
            
    def compare_deals(self, deals: dict[Deal]) -> dict:
        new_db = {}
        
        for key in deals:
            new_db[key] = deals[key]
            
            if key not in self.deals:
                self.num_new_deals += 1
            
        logger.info(f'Found {self.num_new_deals} new deals')
        return new_db
    
    def compare_and_export_deals(self, deals: dict[Deal]) -> dict:
        new_deals = self.compare_deals(deals)
        self.deals = new_deals
        self.export_to_json()
    
    def format_deals(self, deals: List[dict]) -> dict:
        formatted_deals = {}
        for new_deal in deals:
            # ensure deal is active
            if new_deal.get(Deal.STATUS.value) != "Active":
                continue
            
            # ensure deal was published within last 90 days
            pub_date = datetime.strptime(new_deal.get(Deal.PUBLISHED_DATE.value), '%Y-%m-%d %H:%M:%S')
            if pub_date < (datetime.utcnow() - timedelta(days=90)):
                continue
            
            # overwrite with just date information
            end_date = datetime.strptime(new_deal.get(Deal.END_DATE.value), '%Y-%m-%d %H:%M:%S')
            new_deal[Deal.END_DATE.value] = end_date.strftime('%Y-%m-%d')
            
            cur_deal = {}
            for att in Deal:
                if att == Deal.TITLE:
                    # remove extra text from title
                    title = new_deal.get(att.value)
                    str_end = title.find(' (Steam)')
                    if str_end != -1:
                        cur_deal[att.value] = title[:str_end]
                        continue
                cur_deal[att.value] = new_deal.get(att.value)
            id = new_deal.get(Deal.ID.value)
            formatted_deals[str(id)] = cur_deal
        return formatted_deals
    
    def get_new_deals(self) -> dict:
        r = request(DEAL_API_ENDPOINT)
        if r.status == 201:
            logger.info('No current deals')
            return {}
        
        if r.status == 200:
            logger.info('Received response containing deals')
            return self.format_deals(r.json())
                
        logger.error(f'Something went wrong. Received status code {r.status}')
        return None
    
    def process_new_deals(self) -> None:
        self.import_from_json()
        new_deals = self.get_new_deals()
        self.compare_and_export_deals(new_deals)