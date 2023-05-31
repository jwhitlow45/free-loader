import { PyCaller } from "../../PyCaller";

// configs
const MAX_LOAD_SETTINGS_RETRIES = 3;
const RETRY_COOLDOWN = 1000;

export async function loadSettings(settings: any, retries: number = 0): Promise<{}> {
    let output_settings = {};
    // wait for 1 second to give time for loading
    if (retries > MAX_LOAD_SETTINGS_RETRIES) {
        PyCaller.logger(`Max retries of ${MAX_LOAD_SETTINGS_RETRIES} reached for loading settings.`);
        return {};
    }

    for (let item in settings) {
        let response = await PyCaller.getSetting(settings[item]);
        if (response.success) {
            output_settings[settings[item]] = !!response.result;
        } else {
            PyCaller.logger(`Cannot load settings...retrying in ${RETRY_COOLDOWN / 1000} second(s).`);
            await new Promise(f => setTimeout(f, RETRY_COOLDOWN));
            return loadSettings(settings, retries + 1);
        }
    }
    return output_settings;
}