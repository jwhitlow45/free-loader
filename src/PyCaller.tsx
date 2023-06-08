import { ServerAPI, ServerResponse } from "decky-frontend-lib";
import { Settings } from "./components/utils/settings";

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

    static async updateDealsNow(notifyOnZeroNewGames = true) {
        let response = await this.serverAPI.callPluginMethod<{}, {}>('update_deals_now', {});
        let is_notifications_enabled = (await this.getSetting(Settings.NOTIFY_ON_FREE_GAMES)).result;
        if (response.success) {
            let numFreeGames = Number(response.result);
            if ((notifyOnZeroNewGames == true || numFreeGames > 0) && is_notifications_enabled) {
                this.serverAPI.toaster.toast({title:'Free Loader', body:`Found ${response.result} new free games!`});
            }
        } else {
            this.serverAPI.toaster.toast({title:'Free Loader', body:'Failed to update games list.'});
        }
    }

    static async readDeals(): Promise<any> {
        return await this.serverAPI.callPluginMethod<{}, {}>('read_deals', {}); 
    }

    static async logger(info: any) {
        await this.serverAPI.callPluginMethod<{}, {}>('log', {'info' : info})
    }
}