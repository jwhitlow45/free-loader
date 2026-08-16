import { ButtonItem, Field, PanelSection, PanelSectionRow } from "@decky/ui";
import { createContext, useCallback, useEffect, useState } from "react";
import { PyCaller } from "../PyCaller";
import { Settings, SettingsType, loadSettings } from "./utils/settings";
import { FrequencyRow } from "./FrequencyRow";
import { UpdateGamesListTimer } from "./utils/UpdateGamesListTimer";
import { SettingToggle } from "./SettingToggle";

export const UpdateFreqConext = createContext((setting: SettingsType, increment: boolean) => { setting; increment; });

const ConfigurationPanels: React.FunctionComponent = () => {
  const [settings, setSettings] = useState<{ [key: SettingsType]: any } | null>(null);

  const loadAndApply = useCallback(async () => {
    let output: { [key: SettingsType]: any } = await loadSettings();
    if (Object.keys(output).length === 0) {
      PyCaller.loggerError('Could not load settings...restoring settings file.');
      try {
        await PyCaller.restoreSettings();
      } catch (error) {
        PyCaller.loggerError(`Failed to restore settings: ${error}`);
        return;
      }
      output = await loadSettings();
    }
    if (Object.keys(output).length > 0) {
      setSettings(output);
      await UpdateGamesListTimer.updateTimer(output);
    }
  }, []);

  useEffect(() => {
    loadAndApply();
  }, []);

  // focus config panel container ensuring scroll position is at top of the
  // settings page once it renders
  const isLoaded = settings !== null;
  useEffect(() => {
    if (isLoaded) {
      document.getElementById('configuration-panel-container')?.focus()
    }
  }, [isLoaded]);

  const updateSetting = useCallback(async (setting: SettingsType, value: any) => {
    setSettings((prev) => prev === null ? prev : { ...prev, [setting]: value });
    try {
      await PyCaller.setSetting(setting, value);
    } catch (error) {
      PyCaller.loggerError(`Failed to save setting ${setting}: ${error}`);
    }
  }, []);

  const updateFreq = useCallback(async (setting: SettingsType, increment: boolean) => {
    const MAX_VALUE = 99;
    const MIN_VALUE = 0;
    if (settings === null)
      return;

    const new_value = settings[setting] + (increment ? 1 : -1);
    if (new_value > MAX_VALUE || new_value < MIN_VALUE)
      return;
    // prevent a frequency of zero, which would poll the store api constantly
    const freq_settings = [Settings.UPDATE_FREQ_DAY, Settings.UPDATE_FREQ_HOUR, Settings.UPDATE_FREQ_MIN];
    const total = freq_settings.reduce((sum, s) => sum + (s === setting ? new_value : settings[s]), 0);
    if (total <= 0)
      return;

    await updateSetting(setting, new_value);
    await UpdateGamesListTimer.updateTimer({ ...settings, [setting]: new_value });
  }, [settings, updateSetting]);

  if (settings === null) {
    return null;
  }

  return (
    <div id="configuration-panel-container">
      <PanelSection title="Stores">
        <PanelSectionRow>
          <SettingToggle
            label='Steam'
            value={Boolean(settings[Settings.ENABLE_STEAM_GAMES])}
            setting={Settings.ENABLE_STEAM_GAMES}
            onUpdate={updateSetting} />
        </PanelSectionRow>
        <PanelSectionRow>
          <SettingToggle
            label='Epic Games Store'
            value={Boolean(settings[Settings.ENABLE_EGS_GAMES])}
            setting={Settings.ENABLE_EGS_GAMES}
            onUpdate={updateSetting} />
        </PanelSectionRow>
        <PanelSectionRow>
          <SettingToggle
            label='GOG'
            value={Boolean(settings[Settings.ENABLE_GOG_GAMES])}
            setting={Settings.ENABLE_GOG_GAMES}
            onUpdate={updateSetting} />
        </PanelSectionRow>
        <PanelSectionRow>
          <SettingToggle
            label='Itch.io'
            value={Boolean(settings[Settings.ENABLE_ITCHIO_GAMES])}
            setting={Settings.ENABLE_ITCHIO_GAMES}
            onUpdate={updateSetting} />
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title="Settings">
        <PanelSectionRow>
          <SettingToggle
            label='Notify on Free Games'
            value={Boolean(settings[Settings.NOTIFY_ON_FREE_GAMES])}
            setting={Settings.NOTIFY_ON_FREE_GAMES}
            onUpdate={updateSetting} />
        </PanelSectionRow>
        <PanelSectionRow>
          <SettingToggle
            label='Show Game Titles'
            value={Boolean(settings[Settings.SHOW_TITLES])}
            setting={Settings.SHOW_TITLES}
            onUpdate={updateSetting} />
        </PanelSectionRow>
        <PanelSectionRow>
          <SettingToggle
            label='Show Hidden Games'
            value={Boolean(settings[Settings.SHOW_HIDDEN_GAMES])}
            setting={Settings.SHOW_HIDDEN_GAMES}
            onUpdate={updateSetting} />
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
              <FrequencyRow label='Days' setting={Settings.UPDATE_FREQ_DAY} value={settings[Settings.UPDATE_FREQ_DAY]}></FrequencyRow>
              <FrequencyRow label='Hours' setting={Settings.UPDATE_FREQ_HOUR} value={settings[Settings.UPDATE_FREQ_HOUR]}></FrequencyRow>
              <FrequencyRow label='Minutes' setting={Settings.UPDATE_FREQ_MIN} value={settings[Settings.UPDATE_FREQ_MIN]}></FrequencyRow>
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
            await loadAndApply();
          }}>Restore Settings</ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </div>
  );
}

export { ConfigurationPanels };
