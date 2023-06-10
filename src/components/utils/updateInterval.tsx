import { PyCaller } from "../../PyCaller";
import { Settings } from "./settings";

function convert_frequency_to_ms(days: number, hours: number, mins: number) {
  return days * 86400000 + hours * 3600000 + mins * 60000
}

export async function updateInterval(settings: {}): Promise<NodeJS.Timer> {
  // get interval of frequency check
  let freq_ms = convert_frequency_to_ms(
    settings[Settings.UPDATE_FREQ_DAY],
    settings[Settings.UPDATE_FREQ_HOUR],
    settings[Settings.UPDATE_FREQ_MIN]
  );
  // make minimum update time 60 seconds
  freq_ms = freq_ms > 0 ? freq_ms : 60000
  await PyCaller.loggerInfo(`Next games list update at ${new Date(new Date().getTime() + freq_ms)}`);
  let timer = setInterval(async () => {
    // update games list and last update timestamp
    await PyCaller.loggerInfo('Updating games list now')
    await PyCaller.updateDealsNow(false);
    const now = new Date();
    await PyCaller.setSetting(Settings.LAST_UPDATE_TIME, now.toISOString())
    await PyCaller.loggerInfo(`Next games list update at ${new Date(now.getTime() + freq_ms)}`);
  }, freq_ms)

  return timer;
}