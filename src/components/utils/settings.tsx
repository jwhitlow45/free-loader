import { PyCaller } from "../../PyCaller";

// configs
const MAX_LOAD_SETTINGS_RETRIES = 3;
const RETRY_COOLDOWN = 1000;

export enum Settings {
    UPDATE_FREQ_DAY = "update_frequency_day",
    UPDATE_FREQ_HOUR = "update_frequency_hour",
    UPDATE_FREQ_MIN = "update_frequency_min",
    NOTIFY_ON_FREE_GAMES = "notify_on_free_games",
    LAST_UPDATE_TIME = "last_update_timestamp",
    ENABLE_STEAM_GAMES = "enable_steam_games",
    ENABLE_EGS_GAMES = "enable_egs_games",
    ENABLE_GOG_GAMES = "enable_gog_games",
    ENABLE_ITCHIO_GAMES = "enable_itchio_games",
    SHOW_TITLES = "show_titles",
    SHOW_HIDDEN_GAMES = "show_hidden_games",
}

export async function loadSettings(retries: number = 0): Promise<{}> {
    let output_settings = {};
    // wait for 1 second to give time for loading
    if (retries > MAX_LOAD_SETTINGS_RETRIES) {
        PyCaller.loggerError(`Max retries of ${MAX_LOAD_SETTINGS_RETRIES} reached for loading settings.`);
        return {};
    }

    for (let item in Settings) {
        let response = await PyCaller.getSetting(Settings[item]);
        if (response.success) {
            output_settings[Settings[item]] = response.result;
        } else {
            PyCaller.loggerError(`Cannot load settings...retrying in ${RETRY_COOLDOWN / 1000} second(s).`);
            await new Promise(f => setTimeout(f, RETRY_COOLDOWN));
            return loadSettings(retries + 1);
        }
    }
    return output_settings;
}