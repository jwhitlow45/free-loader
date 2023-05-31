import { ButtonItem, Field, PanelSection, PanelSectionRow, ToggleField } from "decky-frontend-lib";
import { useState } from "react";
import { PyCaller } from "../PyCaller";
import { loadSettings } from "./utils/settings";
import { FrequencyRow } from "./FrequencyRow";

enum Settings {
  UPDATE_FREQ_DAY = "update_frequency_day",
  UPDATE_FREQ_HOUR = "update_frequency_hour",
  UPDATE_FREQ_MIN = "update_frequency_min",
  NOTIFY_FOREVER_GAMES = 'notify_forever_games',
  NOTIFY_TRIAL_GAMES = 'notify_trial_games'
}

let cur_settings = {}
let loaded = false

const SettingsPanel: React.FunctionComponent = () => {
  let cur_day = cur_settings[Settings.UPDATE_FREQ_DAY]
  let cur_hour = cur_settings[Settings.UPDATE_FREQ_HOUR]
  let cur_min = cur_settings[Settings.UPDATE_FREQ_MIN]
  let [days, setDays] = useState(cur_day === undefined ? 0 : cur_day);
  let [hours, setHours] = useState(cur_hour === undefined ? 0 : cur_hour);
  let [mins, setMins] = useState(cur_min === undefined ? 0 : cur_min);

  let [notifyForeverGames, setNotifyForeverGames] = useState(cur_settings[Settings.NOTIFY_FOREVER_GAMES]);
  let [notifyTrialGames, setNotifyTrialGames] = useState(cur_settings[Settings.NOTIFY_TRIAL_GAMES]);

  async function update_all_states() {
    setDays(cur_settings[Settings.UPDATE_FREQ_DAY])
    setHours(cur_settings[Settings.UPDATE_FREQ_HOUR])
    setMins(cur_settings[Settings.UPDATE_FREQ_MIN])
    setNotifyForeverGames(cur_settings[Settings.NOTIFY_FOREVER_GAMES]);
    setNotifyTrialGames(cur_settings[Settings.NOTIFY_TRIAL_GAMES]);
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
      update_all_states();
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
            <FrequencyRow label='Days' value={days}></FrequencyRow>
            <FrequencyRow label='Hours' value={hours}></FrequencyRow>
            <FrequencyRow label='Minutes' value={mins}></FrequencyRow>
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
            label='Notify on Trial Games'
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
              update_all_states();
            });
          }}>Restore Settings</ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </div>
  );
}

export { SettingsPanel };