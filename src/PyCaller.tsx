import { ServerAPI, ServerResponse } from "decky-frontend-lib";
import { Settings } from "./components/utils/settings";

export class PyCaller {
    private static serverAPI: ServerAPI;
    private static toastTitle = 'Free Loader';

    static setServer(server: ServerAPI) {
        this.serverAPI = server;
    }

    static get server() { return this.serverAPI; }

    static async getSettings(): Promise<ServerResponse<{}>> {
        return await this.serverAPI.callPluginMethod<{}, {}>('settings_read', {});
    }

    static async getSetting(key: string): Promise<ServerResponse<{}>> {
        return await this.serverAPI.callPluginMethod<{}, {}>('settings_getSetting', { key: key })
    }

    static async setSetting(key: string, value: any) {
        await this.serverAPI.callPluginMethod<{}, {}>('settings_setSetting', { key: key, value: value });
    }

    static async restoreSettings() {
        await this.serverAPI.callPluginMethod<{}, {}>('settings_restoreSettings', {});
    }

    static async updateDealsNow(notifyOnZeroNewGames = true) {
        let response = await this.serverAPI.callPluginMethod<{}, {}>('update_deals_now', {});
        let is_notifications_enabled = (await this.getSetting(Settings.NOTIFY_ON_FREE_GAMES)).result;
        let msg;
        if (response.success) {
            let numFreeGames = Number(response.result);
            msg = `Found ${response.result} new free games!`
            if ((notifyOnZeroNewGames == true || numFreeGames > 0) && is_notifications_enabled) {
                this.serverAPI.toaster.toast({ title: PyCaller.toastTitle, body: msg });
            }
            PyCaller.loggerInfo(msg);
        } else {
            msg = 'Failed to update games list'
            this.serverAPI.toaster.toast({ title: PyCaller.toastTitle, body: msg });
            PyCaller.loggerError(msg);
        }
    }

    static async readDeals(): Promise<any> {
        return await this.serverAPI.callPluginMethod<{}, {}>('read_deals', {});
    }

    static async clearDeals(): Promise<any> {
        this.serverAPI.toaster.toast({ title: PyCaller.toastTitle, body: 'Cleared games database' })
        return await this.serverAPI.callPluginMethod<{}, {}>('clear_deals', {});
    }

    static async toggleDealVisibility(id: string): Promise<any> {
        return await this.serverAPI.callPluginMethod<{}, {}>('toggle_deal_visibility', { 'id': id })
    }

    static async loggerInfo(info: any) {
        await this.serverAPI.callPluginMethod<{}, {}>('logger_info', { 'info': info })
    }

    static async loggerError(error: any) {
        await this.serverAPI.callPluginMethod<{}, {}>('logger_error', { 'error': error })
    }
}