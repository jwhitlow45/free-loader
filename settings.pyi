#!/usr/bin/env python
class SettingsManager:
    def __init__(self, name, settings_directory=None) -> None: ...
    def read(self): ...
    def commit(self): ...
    def getSetting(self, key, default): ...
    def setSetting(self, key, value): ...
