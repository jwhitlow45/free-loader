import { ButtonItem, PanelSection, PanelSectionRow, ToggleField } from "decky-frontend-lib";
import { useState } from "react";
import { PyCaller } from "../PyCaller";
import { loadSettings } from "./utils/settings";

enum Settings {
  NOTIFY_FOREVER_GAMES = 'notify_forever_games',
  NOTIFY_TRIAL_GAMES = 'notify_trial_games'
}

let cur_settings = {}
let loaded = false

const SettingsPanel: React.FunctionComponent = () => {
  let [notifyForeverGames, setNotifyForeverGames] = useState(cur_settings[Settings.NOTIFY_FOREVER_GAMES]);
  let [notifyTrialGames, setNotifyTrialGames] = useState(cur_settings[Settings.NOTIFY_TRIAL_GAMES]);

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
      setNotifyForeverGames(cur_settings[Settings.NOTIFY_FOREVER_GAMES]);
      setNotifyTrialGames(cur_settings[Settings.NOTIFY_TRIAL_GAMES]);
    });
  }

  return (
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
            setNotifyForeverGames(cur_settings[Settings.NOTIFY_FOREVER_GAMES]);
            setNotifyTrialGames(cur_settings[Settings.NOTIFY_TRIAL_GAMES]);
          });
        }}>Restore Settings</ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
}

export { SettingsPanel };