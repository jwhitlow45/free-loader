import { ButtonItem, PanelSection, PanelSectionRow, ToggleField } from "decky-frontend-lib";
import { useState } from "react";
import { PyCaller } from "../PyCaller";

enum Settings {
  NOTIFY_FOREVER_GAMES = 'notify_forever_games',
  NOTIFY_TRIAL_GAMES = 'notify_trial_games'
}

let cur_settings = {}
// configs
const MAX_LOAD_SETTINGS_RETRIES = 3;
const RETRY_COOLDOWN = 1000;

async function loadSettings(retries: number = 0) {
  // wait for 1 second to give time for loading
  if (retries > MAX_LOAD_SETTINGS_RETRIES) {
    PyCaller.logger(`Max retries of ${MAX_LOAD_SETTINGS_RETRIES} reached for loading settings.`);
    return false;
  }

  for (let item in Settings) {
    let response = await PyCaller.getSetting(Settings[item]);
    if (response.success) {
      cur_settings[Settings[item]] = !!response.result;
    } else {
      PyCaller.logger(`Cannot load settings...retrying in ${RETRY_COOLDOWN / 1000} second(s).`);
      await new Promise(f => setTimeout(f, RETRY_COOLDOWN));
      return loadSettings(retries + 1);
    }
  }
  return true;
}

var loaded = false

const SettingsPanel: React.FunctionComponent = () => {
  let [notifyForeverGames, setNotifyForeverGames] = useState(cur_settings[Settings.NOTIFY_FOREVER_GAMES]);
  let [notifyTrialGames, setNotifyTrialGames] = useState(cur_settings[Settings.NOTIFY_TRIAL_GAMES]);

  if (!loaded) {
    loadSettings().then((success) => {
      loaded = success;
      if (loaded) {
        PyCaller.logger('Loaded settings:');
        PyCaller.logger(cur_settings);
      } else {
        PyCaller.logger('Could not load settings...restoring settings file.');
        PyCaller.restoreSettings();
        loadSettings();
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
          await loadSettings().then(() => {
            setNotifyForeverGames(cur_settings[Settings.NOTIFY_FOREVER_GAMES]);
            setNotifyTrialGames(cur_settings[Settings.NOTIFY_TRIAL_GAMES]);
          });
        }}>Restore Settings</ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
}

export { SettingsPanel };