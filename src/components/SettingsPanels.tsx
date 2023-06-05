import { ButtonItem, Field, PanelSection, PanelSectionRow, ToggleField } from "decky-frontend-lib";
import { useState } from "react";
import { PyCaller } from "../PyCaller";
import { loadSettings } from "./utils/settings";
import { FrequencyRow } from "./FrequencyRow";

export enum Settings {
  UPDATE_FREQ_DAY = "update_frequency_day",
  UPDATE_FREQ_HOUR = "update_frequency_hour",
  UPDATE_FREQ_MIN = "update_frequency_min",
  NOTIFY_FOREVER_GAMES = "notify_forever_games",
  NOTIFY_TRIAL_GAMES = "notify_trial_games"
}

let cur_settings = {}
let loaded = false

const SettingsPanel: React.FunctionComponent = () => {
  let [days, setDays] = useState(cur_settings[Settings.UPDATE_FREQ_DAY]);
  let [hours, setHours] = useState(cur_settings[Settings.UPDATE_FREQ_HOUR]);
  let [mins, setMins] = useState(cur_settings[Settings.UPDATE_FREQ_MIN]);

  let [notifyForeverGames, setNotifyForeverGames] = useState(cur_settings[Settings.NOTIFY_FOREVER_GAMES]);
  let [notifyTrialGames, setNotifyTrialGames] = useState(cur_settings[Settings.NOTIFY_TRIAL_GAMES]);

  async function updateAllStates() {
    setDays(cur_settings[Settings.UPDATE_FREQ_DAY])
    setHours(cur_settings[Settings.UPDATE_FREQ_HOUR])
    setMins(cur_settings[Settings.UPDATE_FREQ_MIN])
    setNotifyForeverGames(cur_settings[Settings.NOTIFY_FOREVER_GAMES]);
    setNotifyTrialGames(cur_settings[Settings.NOTIFY_TRIAL_GAMES]);
  }

  async function updateFreq(setting: Settings, increment: boolean) {
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
  }

  if (!loaded) {
    loadSettings(Settings).then((output) => {
      loaded = Object.keys(output).length > 0;
      if (loaded) {
        cur_settings = output;
        PyCaller.logger('Loaded settings:');
        PyCaller.logger(cur_settings);
      } else {
        PyCaller.logger('Could not load settings...restoring settings file.');
        PyCaller.restoreSettings();
        loadSettings(Settings).then((output) => {
          cur_settings = output;
          loaded = true;
        });
      }
      updateAllStates();
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
            <FrequencyRow label='Days' setting={Settings.UPDATE_FREQ_DAY} value={days} OnClick={updateFreq}></FrequencyRow>
            <FrequencyRow label='Hours' setting={Settings.UPDATE_FREQ_HOUR} value={hours} OnClick={updateFreq}></FrequencyRow>
            <FrequencyRow label='Minutes' setting={Settings.UPDATE_FREQ_MIN} value={mins} OnClick={updateFreq}></FrequencyRow>
          </Field>
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title="Settings">
        <PanelSectionRow>
          <ToggleField
            label='Notify on Forever Games'
            checked={notifyForeverGames}
            layout='below'
            onChange={async () => {
              cur_settings[Settings.NOTIFY_FOREVER_GAMES] = !cur_settings[Settings.NOTIFY_FOREVER_GAMES];
              await PyCaller.setSetting(
                Settings.NOTIFY_FOREVER_GAMES,
                cur_settings[Settings.NOTIFY_FOREVER_GAMES]);
              setNotifyForeverGames(cur_settings[Settings.NOTIFY_FOREVER_GAMES]);
            }} />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            disabled
            label='Notify on Trial Games (WIP)'
            checked={notifyTrialGames}
            layout='below'
            onChange={async () => {
              cur_settings[Settings.NOTIFY_TRIAL_GAMES] = !cur_settings[Settings.NOTIFY_TRIAL_GAMES];
              await PyCaller.setSetting(
                Settings.NOTIFY_TRIAL_GAMES,
                cur_settings[Settings.NOTIFY_TRIAL_GAMES]);
              setNotifyTrialGames(cur_settings[Settings.NOTIFY_TRIAL_GAMES]);
            }} />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout='below' onClick={async () => {
            await PyCaller.restoreSettings();
            await loadSettings(Settings).then((output) => {
              cur_settings = output;
              updateAllStates();
            });
          }}>Restore Settings</ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </div>
  );
}

export { SettingsPanel };