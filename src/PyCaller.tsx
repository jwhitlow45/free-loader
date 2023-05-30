import { ServerAPI, ServerResponse } from "decky-frontend-lib";

type Settings = {
    update_frequency_day: number,
    update_frequency_hour: number,
    update_frequency_min: number,
    notify_forever_games: boolean,
    notify_trial_games: boolean
}

export type SettingsWrapper = {
    [key: string]: Settings
}

type ToggleResponse = {
    value: boolean
}

export type ToggleResponseWrapper = {
    [key: string]: ToggleResponse
}

export class PyCaller {
    private static serverAPI: ServerAPI;

    static setServer(server: ServerAPI) {
        this.serverAPI = server;
    }

    static get server() { return this.serverAPI; }

    static async getSettings(): Promise<ServerResponse<SettingsWrapper>> {
        return await this.serverAPI.callPluginMethod<{}, SettingsWrapper>('settings_read', {});
    }

    static async restoreSettings() {
        await this.serverAPI.callPluginMethod<{}, {}>('settings_restoreSettings', {});
    }

    static async logger(info: string) {
        await this.serverAPI.callPluginMethod<{}, {}>('log', {'info' : info})
    }
}