"""Type stub for the `decky` module injected by Decky Loader at runtime
(api_version 1). Only used for local type checking."""

from logging import Logger
from typing import Any

HOME: str
USER: str
DECKY_VERSION: str
DECKY_USER: str
DECKY_USER_HOME: str
DECKY_HOME: str
DECKY_PLUGIN_SETTINGS_DIR: str
DECKY_PLUGIN_DIR: str
DECKY_PLUGIN_NAME: str
DECKY_PLUGIN_VERSION: str
DECKY_PLUGIN_AUTHOR: str
DECKY_PLUGIN_LOG_DIR: str
DECKY_PLUGIN_RUNTIME_DIR: str
DECKY_PLUGIN_LOG: str

logger: Logger

async def emit(event: str, *args: Any) -> None: ...
