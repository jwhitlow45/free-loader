import { PyCaller } from "../../PyCaller";
import { Settings, loadSettings } from "./settings";

export function convert_frequency_to_ms(days: number, hours: number, mins: number) {
  return days * 86400000 + hours * 3600000 + mins * 60000
}

export async function update_loop() {
  while (true) {
    // get time of last games list update
    const last_update_time = new Date(String((await PyCaller.getSetting(Settings.LAST_UPDATE_TIME)).result));
    // get interval of frequency check
    const settings = await loadSettings();
    const freq_ms = convert_frequency_to_ms(
      settings[Settings.UPDATE_FREQ_DAY],
      settings[Settings.UPDATE_FREQ_HOUR],
      settings[Settings.UPDATE_FREQ_MIN]
    );
    // get ms time of next update
    let next_update_ms = last_update_time.getTime() + freq_ms;
    // if current time is before next update time then wait for update time
    if (next_update_ms >= (new Date()).getTime()) {
      await PyCaller.logger(`Next games list update at ${new Date(next_update_ms)}`);
      const ms_until_next_update = next_update_ms - (new Date()).getTime()
      await new Promise(resolve => setTimeout(resolve, Math.max(ms_until_next_update, 0)));
    }
    // update games list and last update timestamp
    await PyCaller.logger('Updating games list now')
    await PyCaller.updateDealsNow(false);
    await PyCaller.setSetting(Settings.LAST_UPDATE_TIME, (new Date()).toISOString())
  }
}