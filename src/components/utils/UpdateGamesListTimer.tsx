import { Settings, SettingsType } from "./settings";
import { PyCaller } from "../../PyCaller";

export class UpdateGamesListTimer {
  private static firstUpdate: ReturnType<typeof setTimeout> | undefined;
  private static timer: ReturnType<typeof setInterval> | undefined;

  // scheduling is synchronous so there is no await window between clearing
  // the old timers and storing the new ones, which could orphan a timer
  public static updateTimer = async (settings: { [key: SettingsType]: any }) => {
    this.stop();
    // get interval of frequency check
    let freq_ms = this.convert_frequency_to_ms(
      settings[Settings.UPDATE_FREQ_DAY],
      settings[Settings.UPDATE_FREQ_HOUR],
      settings[Settings.UPDATE_FREQ_MIN]
    );
    // fall back to one hour when settings are missing or zero, as a
    // one minute floor hammers the store api
    freq_ms = freq_ms > 0 ? freq_ms : 3600000

    // schedule the first update from the last update timestamp so the
    // frequency is honored across restarts, updating immediately if overdue
    const last_update_ms = new Date(settings[Settings.LAST_UPDATE_TIME]).getTime();
    const elapsed_ms = new Date().getTime() - (isNaN(last_update_ms) ? 0 : last_update_ms);
    const first_delay_ms = Math.max(freq_ms - elapsed_ms, 0);
    PyCaller.loggerInfo(`Next games list update at ${new Date(new Date().getTime() + first_delay_ms)}`);
    this.firstUpdate = setTimeout(() => {
      this.timer = setInterval(() => this.updateGamesList(freq_ms), freq_ms);
      this.updateGamesList(freq_ms);
    }, first_delay_ms);
  }

  public static stop = () => {
    if (this.firstUpdate) {
      clearTimeout(this.firstUpdate);
      this.firstUpdate = undefined;
    }
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private static convert_frequency_to_ms(days: number, hours: number, mins: number) {
    return days * 86400000 + hours * 3600000 + mins * 60000
  }

  private static updateGamesList = async (freq_ms: number) => {
    // updateDealsNow records the last update timestamp
    await PyCaller.loggerInfo('Updating games list now')
    await PyCaller.updateDealsNow(false);
    await PyCaller.loggerInfo(`Next games list update at ${new Date(new Date().getTime() + freq_ms)}`);
  }
}