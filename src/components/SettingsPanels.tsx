import { ButtonItem, Field, PanelSection, PanelSectionRow, ToggleField } from "decky-frontend-lib";
import { createContext, useCallback, useState } from "react";
import { PyCaller } from "../PyCaller";
import { Settings, loadSettings } from "./utils/settings";
import { FrequencyRow } from "./FrequencyRow";
import { UpdateGamesListTimer } from "./utils/UpdateGamesListTimer";

let cur_settings = {}
let loaded = false

export const UpdateFreqConext = createContext((setting: Settings, increment: boolean) => { setting; increment; });

const SettingsPanel: React.FunctionComponent = () => {
  let [days, setDays] = useState(cur_settings[Settings.UPDATE_FREQ_DAY]);
  let [hours, setHours] = useState(cur_settings[Settings.UPDATE_FREQ_HOUR]);
  let [mins, setMins] = useState(cur_settings[Settings.UPDATE_FREQ_MIN]);

  let [notifyFreeGames, setNotifyFreeGames] = useState(cur_settings[Settings.NOTIFY_ON_FREE_GAMES]);

  const updateAllStates = useCallback(async () => {
    setDays(cur_settings[Settings.UPDATE_FREQ_DAY])
    setHours(cur_settings[Settings.UPDATE_FREQ_HOUR])
    setMins(cur_settings[Settings.UPDATE_FREQ_MIN])
    setNotifyFreeGames(cur_settings[Settings.NOTIFY_ON_FREE_GAMES]);
  }, [cur_settings]);

  const updateFreq = useCallback(async (setting: Settings, increment: boolean) => {
    const MAX_VALUE = 99;
    const MIN_VALUE = 0;

    if (increment) {
      let inc_value = cur_settings[setting] + 1;
      if (inc_value > MAX_VALUE)
        return;
      cur_settings[setting] = inc_value;
    } else {
      let dec_value = cur_settings[setting] - 1;
      if (dec_value < MIN_VALUE)
        return;
      cur_settings[setting] = dec_value;
    }
    await PyCaller.setSetting(setting, cur_settings[setting]);
    updateAllStates();
    await UpdateGamesListTimer.updateTimer(cur_settings);
  }, [cur_settings]);

  if (!loaded) {
    loadSettings().then(async (output) => {
      loaded = Object.keys(output).length > 0;
      if (loaded) {
        cur_settings = output;
        PyCaller.loggerInfo('Loaded settings:');
        PyCaller.loggerInfo(cur_settings);
      } else {
        PyCaller.loggerError('Could not load settings...restoring settings file.');
        PyCaller.restoreSettings();
        loadSettings().then(async (output) => {
          cur_settings = output;
          loaded = true;
        });
      }
      updateAllStates();
      await UpdateGamesListTimer.updateTimer(cur_settings);
    });
  }

  return (
    <div>
      <PanelSection title="Update Frequency">
        <PanelSectionRow>
          <Field
            bottomSeparator="none"
            inlineWrap="keep-inline"
            padding="none"
            spacingBetweenLabelAndChild="none"
            childrenContainerWidth="max"
          >
            <UpdateFreqConext.Provider value={updateFreq}>
              <FrequencyRow label='Days' setting={Settings.UPDATE_FREQ_DAY} value={days}></FrequencyRow>
              <FrequencyRow label='Hours' setting={Settings.UPDATE_FREQ_HOUR} value={hours}></FrequencyRow>
              <FrequencyRow label='Minutes' setting={Settings.UPDATE_FREQ_MIN} value={mins}></FrequencyRow>
            </UpdateFreqConext.Provider>
          </Field>
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title="Settings">
        <PanelSectionRow>
          <ToggleField
            label='Notify on Free Games'
            checked={notifyFreeGames}
            layout='below'
            onChange={async () => {
              cur_settings[Settings.NOTIFY_ON_FREE_GAMES] = !cur_settings[Settings.NOTIFY_ON_FREE_GAMES];
              await PyCaller.setSetting(
                Settings.NOTIFY_ON_FREE_GAMES,
                cur_settings[Settings.NOTIFY_ON_FREE_GAMES]);
              setNotifyFreeGames(cur_settings[Settings.NOTIFY_ON_FREE_GAMES]);
            }} />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout='below' onClick={async () => {
            await PyCaller.restoreSettings();
            await loadSettings().then((output) => {
              cur_settings = output;
              updateAllStates();
            });
            await UpdateGamesListTimer.updateTimer(cur_settings);
          }}>Restore Settings</ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </div>
  );
}

export { SettingsPanel };