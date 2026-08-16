import { callable, toaster } from "@decky/api";
import { Settings } from "./components/utils/settings";
import type { Deal } from "./components/utils/games";

// typed bindings to python backend methods; calls reject when the backend
// call fails
const updateDealsNowBackend = callable<[], number>('update_deals_now');
const readDealsBackend = callable<[], { [id: string]: Deal }>('read_deals');
const clearDealsBackend = callable<[], { [id: string]: Deal }>('clear_deals');
const toggleDealVisibilityBackend = callable<[id: string], { hidden: boolean }>('toggle_deal_visibility');
const settingsReadBackend = callable<[], { [key: string]: any }>('settings_read');
const settingsGetSettingBackend = callable<[key: string], any>('settings_getSetting');
const settingsSetSettingBackend = callable<[key: string, value: any], void>('settings_setSetting');
const settingsRestoreBackend = callable<[], void>('settings_restoreSettings');
const loggerInfoBackend = callable<[info: any], void>('logger_info');
const loggerErrorBackend = callable<[error: any], void>('logger_error');

export class PyCaller {
    private static toastTitle = 'Free Loader';

    static async getSettings(): Promise<{ [key: string]: any }> {
        return await settingsReadBackend();
    }

    static async getSetting(key: string): Promise<any> {
        return await settingsGetSettingBackend(key);
    }

    static async setSetting(key: string, value: any) {
        await settingsSetSettingBackend(key, value);
    }

    static async restoreSettings() {
        await settingsRestoreBackend();
    }

    static async updateDealsNow(notifyOnZeroNewGames = true) {
        try {
            const numFreeGames = await updateDealsNowBackend();
            const isNotificationsEnabled = Boolean(await PyCaller.getSetting(Settings.NOTIFY_ON_FREE_GAMES));
            const msg = `Found ${numFreeGames} new free games!`;
            if ((notifyOnZeroNewGames || numFreeGames > 0) && isNotificationsEnabled) {
                toaster.toast({ title: PyCaller.toastTitle, body: msg });
            }
            await PyCaller.setSetting(Settings.LAST_UPDATE_TIME, new Date().toISOString());
            PyCaller.loggerInfo(msg);
        } catch (error) {
            const msg = 'Failed to update games list';
            toaster.toast({ title: PyCaller.toastTitle, body: msg });
            PyCaller.loggerError(`${msg}: ${error}`);
        }
    }

    static async readDeals(): Promise<{ [id: string]: Deal }> {
        return await readDealsBackend();
    }

    static async clearDeals() {
        try {
            await clearDealsBackend();
            toaster.toast({ title: PyCaller.toastTitle, body: 'Cleared games database' });
        } catch (error) {
            toaster.toast({ title: PyCaller.toastTitle, body: 'Failed to clear games database' });
            PyCaller.loggerError(`Failed to clear games database: ${error}`);
        }
    }

    static async toggleDealVisibility(id: string): Promise<{ hidden: boolean }> {
        return await toggleDealVisibilityBackend(id);
    }

    static loggerInfo(info: any) {
        loggerInfoBackend(info).catch(() => { });
    }

    static loggerError(error: any) {
        loggerErrorBackend(error).catch(() => { });
    }
}
