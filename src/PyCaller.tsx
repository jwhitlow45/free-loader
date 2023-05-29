import { ServerAPI, ServerResponse } from "decky-frontend-lib";

type UpdateFrequency = {
    days: number,
    hours: number,
    minutes: number
}

type Settings = {
    update_frequency: UpdateFrequency,
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

    static async toggleNotifyForeverGames(): Promise<ServerResponse<ToggleResponseWrapper>> {
        return await this.serverAPI.callPluginMethod<{}, ToggleResponseWrapper>('settings_toggle_notify_forever_games', {});
    }

    static async toggleTrialForeverGames(): Promise<ServerResponse<ToggleResponseWrapper>> {
        return await this.serverAPI.callPluginMethod<{}, ToggleResponseWrapper>('settings_toggle_notify_trial_games', {});
    }
}