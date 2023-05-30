import { ButtonItem, PanelSection, PanelSectionRow, ToggleField } from "decky-frontend-lib";
import { useEffect, useState } from "react";
import { PyCaller, SettingsWrapper } from "../PyCaller";

const SettingsPanel: React.FunctionComponent = () => {

  const [settings, setSettings] = useState<SettingsWrapper>({});
  const [isSettingsLoaded, setSettingsLoaded] = useState(false);
  const [notifyForeverGames, setNotifyForeverGames] = useState(false);
  const [notifyTrialGames, setNotifyTrialGames] = useState(false);

  const [_, updateGUI] = useState('');

  useEffect(() => {
    PyCaller.getSettings().then((response) => {
      if (response.success) {
        setSettings(response.result)
        setSettingsLoaded(true);
        setNotifyForeverGames(settings[0].notify_forever_games)
        setNotifyTrialGames(settings[0].notify_trial_games)
      }
    });
  });

  return (
    <PanelSection title="Settings">
      <PanelSectionRow>
        <ToggleField
          label='Notify on Forever Games'
          checked={notifyForeverGames}
          layout='below'
          onChange={() => {
            
        }}></ToggleField>
        <ButtonItem layout='below' onClick={async () => {
          await PyCaller.restoreSettings();
        }}>Notify on Trial Games</ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
}

export { SettingsPanel };