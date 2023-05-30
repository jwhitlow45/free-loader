import { ButtonItem, PanelSection, PanelSectionRow, ToggleField } from "decky-frontend-lib";
import { useEffect, useState } from "react";
import { PyCaller } from "../PyCaller";

enum Settings {
  NOTIFY_FOREVER_GAMES = 'notify_forever_games',
  NOTIFY_TRIAL_GAMES = 'notify_trial_games'
}

const SettingsPanel: React.FunctionComponent = () => {

  const [settings, setSettings] = useState({});
  const [isSettingsLoaded, setSettingsLoaded] = useState(false);
  const [notifyForeverGames, setNotifyForeverGames] = useState(false);
  const [notifyTrialGames, setNotifyTrialGames] = useState(false);

  let cur_settings = {}

  useEffect(() => {
    async function loadSettings() {
      for (let item in Settings) {
        let response = await PyCaller.getSetting(Settings[item]);
        if (response.success) {
          cur_settings[Settings[item]] = !!response.result;
        } else {
          setSettingsLoaded(false);
          break;
        }
        setSettingsLoaded(true);
      }

      PyCaller.logger('Loaded settings:');
      PyCaller.logger(cur_settings);
      setNotifyForeverGames(cur_settings[Settings.NOTIFY_FOREVER_GAMES]);
      setNotifyTrialGames(cur_settings[Settings.NOTIFY_TRIAL_GAMES]);
    }

    if (!isSettingsLoaded) {
      loadSettings()
    }
  })

  return (
    <PanelSection title="Settings">
      <PanelSectionRow>
        <ToggleField
          label='Notify on Forever Games'
          checked={notifyForeverGames}
          layout='below'
          onChange={async () => {
            settings[Settings.NOTIFY_FOREVER_GAMES] = !settings[Settings.NOTIFY_FOREVER_GAMES];
            await PyCaller.setSetting(
              Settings.NOTIFY_FOREVER_GAMES,
              settings[Settings.NOTIFY_FOREVER_GAMES]);
        }}></ToggleField>
        <ToggleField
          label='Notify on Trial Games'
          checked={notifyTrialGames}
          layout='below'
          onChange={async () => {
            cur_settings[Settings.NOTIFY_TRIAL_GAMES] = !cur_settings[Settings.NOTIFY_TRIAL_GAMES];
            await PyCaller.setSetting(
              Settings.NOTIFY_TRIAL_GAMES,
              cur_settings[Settings.NOTIFY_TRIAL_GAMES]);
        }}>Notify on Trial Games</ToggleField>
        <ButtonItem layout='below' onClick={async () => {
          await PyCaller.restoreSettings();
        }}>Restore Settings</ButtonItem>
        <ButtonItem layout='below' onClick={async () => {
          let response = await PyCaller.getSettings();
          PyCaller.logger(response.success);
          PyCaller.logger(response.result);
        }}>Test Button</ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
}

export { SettingsPanel };