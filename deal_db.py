import json
import os

INIT_JSON = {}
DEFAULT_FILE_PATH = 'deal_db.json'

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