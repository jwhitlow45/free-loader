import { ServerAPI, ServerResponse } from "decky-frontend-lib";

export class PyCaller {
    private static serverAPI: ServerAPI;

    static setServer(server: ServerAPI) {
        this.serverAPI = server;
    }

    static get server() { return this.serverAPI; }

    static async getSettings(): Promise<ServerResponse<{}>> {
        return await this.serverAPI.callPluginMethod<{}, {}>('settings_read', {});
    }

    static async getSetting(key: string) : Promise<ServerResponse<{}>> {
        return await this.serverAPI.callPluginMethod<{}, {}>('settings_getSetting', { key : key })
    }

    static async setSetting(key: string, value: any) {
        await this.serverAPI.callPluginMethod<{}, {}>('settings_setSetting', { key : key, value : value });
    }

    static async restoreSettings() {
        await this.serverAPI.callPluginMethod<{}, {}>('settings_restoreSettings', {});
    }

    static async updateDealsNow() {
        await this.serverAPI.callPluginMethod<{}, boolean>('update_deals_now', {});
    }

    static async logger(info: any) {
        await this.serverAPI.callPluginMethod<{}, {}>('log', {'info' : info})
    }
}