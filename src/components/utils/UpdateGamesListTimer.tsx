import { Settings, SettingsType } from "./settings";
import { PyCaller } from "../../PyCaller";

export class UpdateGamesListTimer {
  private static timer: NodeJS.Timeout | undefined;

  // getInterval is synchronous so there is no await window between clearing
  // the old timer and storing the new one, which could orphan an interval
  public static updateTimer = async (settings: {}) => {
    this.stop();
    this.timer = this.getInterval(settings);
  }

  public static stop = () => {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private static convert_frequency_to_ms(days: number, hours: number, mins: number) {
    return days * 86400000 + hours * 3600000 + mins * 60000
  }

  private static getInterval(settings: { [key: SettingsType]: any }): NodeJS.Timeout {
    // get interval of frequency check
    let freq_ms = this.convert_frequency_to_ms(
      settings[Settings.UPDATE_FREQ_DAY],
      settings[Settings.UPDATE_FREQ_HOUR],
      settings[Settings.UPDATE_FREQ_MIN]
    );
    // make minimum update time 60 seconds
    freq_ms = freq_ms > 0 ? freq_ms : 60000
    PyCaller.loggerInfo(`Next games list update at ${new Date(new Date().getTime() + freq_ms)}`);
    let timer = setInterval(async () => {
      // update games list; updateDealsNow records the last update timestamp
      await PyCaller.loggerInfo('Updating games list now')
      await PyCaller.updateDealsNow(false);
      await PyCaller.loggerInfo(`Next games list update at ${new Date(new Date().getTime() + freq_ms)}`);
    }, freq_ms)

    return timer;
  }
}