import { ButtonItem, Field, PanelSection, PanelSectionRow } from "decky-frontend-lib";
import { createContext, useCallback, useState } from "react";
import { PyCaller } from "../PyCaller";
import { Settings, SettingsType, loadSettings } from "./utils/settings";
import { FrequencyRow } from "./FrequencyRow";
import { UpdateGamesListTimer } from "./utils/UpdateGamesListTimer";
import { SettingToggle } from "./SettingToggle";

let cur_settings: { [key: string]: any } = {}
let loaded = false

export const UpdateFreqConext = createContext((setting: SettingsType, increment: boolean) => { setting; increment; });

const ConfigurationPanels: React.FunctionComponent = () => {
  let [days, setDays] = useState(cur_settings[Settings.UPDATE_FREQ_DAY]);
  let [hours, setHours] = useState(cur_settings[Settings.UPDATE_FREQ_HOUR]);
  let [mins, setMins] = useState(cur_settings[Settings.UPDATE_FREQ_MIN]);

  let [notifyFreeGames, setNotifyFreeGames] = useState(cur_settings[Settings.NOTIFY_ON_FREE_GAMES]);
  let [enableSteamGames, setEnableSteamGames] = useState(cur_settings[Settings.ENABLE_STEAM_GAMES]);
  let [enableEgsGames, setEnableEgsGames] = useState(cur_settings[Settings.ENABLE_EGS_GAMES]);
  let [enableGogGames, setEnableGogGames] = useState(cur_settings[Settings.ENABLE_GOG_GAMES]);
  let [enableItchioGames, setEnableItchioGames] = useState(cur_settings[Settings.ENABLE_ITCHIO_GAMES]);
  let [showTitles, setShowTitles] = useState(cur_settings[Settings.SHOW_TITLES]);
  let [showHiddenGames, setShowHiddenGames] = useState(cur_settings[Settings.SHOW_HIDDEN_GAMES]);

  const updateAllStates = useCallback(async () => {
    setDays(cur_settings[Settings.UPDATE_FREQ_DAY])
    setHours(cur_settings[Settings.UPDATE_FREQ_HOUR])
    setMins(cur_settings[Settings.UPDATE_FREQ_MIN])
    setNotifyFreeGames(cur_settings[Settings.NOTIFY_ON_FREE_GAMES]);
    setEnableSteamGames(cur_settings[Settings.ENABLE_STEAM_GAMES]);
    setEnableEgsGames(cur_settings[Settings.ENABLE_EGS_GAMES]);
    setEnableGogGames(cur_settings[Settings.ENABLE_GOG_GAMES]);
    setEnableItchioGames(cur_settings[Settings.ENABLE_ITCHIO_GAMES]);
    setShowTitles(cur_settings[Settings.SHOW_TITLES]);
    setShowHiddenGames(cur_settings[Settings.SHOW_HIDDEN_GAMES]);
  }, [cur_settings]);

  const updateFreq = useCallback(async (setting: SettingsType, increment: boolean) => {
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
      <PanelSection title="Stores">
        <PanelSectionRow>
          <SettingToggle
            label='Steam'
            value={enableSteamGames}
            setting={Settings.ENABLE_STEAM_GAMES}
            setter={setEnableSteamGames}
            cur_settings={cur_settings} />
        </PanelSectionRow>
        <PanelSectionRow>
          <SettingToggle
            label='Epic Games Store'
            value={enableEgsGames}
            setting={Settings.ENABLE_EGS_GAMES}
            setter={setEnableEgsGames}
            cur_settings={cur_settings} />
        </PanelSectionRow>
        <PanelSectionRow>
          <SettingToggle
            label='GOG'
            value={enableGogGames}
            setting={Settings.ENABLE_GOG_GAMES}
            setter={setEnableGogGames}
            cur_settings={cur_settings} />
        </PanelSectionRow>
        <PanelSectionRow>
          <SettingToggle
            label='Itch.io'
            value={enableItchioGames}
            setting={Settings.ENABLE_ITCHIO_GAMES}
            setter={setEnableItchioGames}
            cur_settings={cur_settings} />
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title="Settings">
        <PanelSectionRow>
          <SettingToggle
            label='Notify on Free Games'
            value={notifyFreeGames}
            setting={Settings.NOTIFY_ON_FREE_GAMES}
            setter={setNotifyFreeGames}
            cur_settings={cur_settings} />
        </PanelSectionRow>
        <PanelSectionRow>
          <SettingToggle
            label='Show Game Titles'
            value={showTitles}
            setting={Settings.SHOW_TITLES}
            setter={setShowTitles}
            cur_settings={cur_settings} />
        </PanelSectionRow>
        <PanelSectionRow>
          <SettingToggle
            label='Show Hidden Games'
            value={showHiddenGames}
            setting={Settings.SHOW_HIDDEN_GAMES}
            setter={setShowHiddenGames}
            cur_settings={cur_settings} />
        </PanelSectionRow>
      </PanelSection>
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
      <PanelSection title="Data">
        <PanelSectionRow>
          <ButtonItem layout='below' onClick={async () => {
            await PyCaller.clearDeals();
          }}>Clear Games Database</ButtonItem>
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

export { ConfigurationPanels };