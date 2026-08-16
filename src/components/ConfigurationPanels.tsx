import { ButtonItem, ConfirmModal, PanelSection, PanelSectionRow, SliderField, SteamSpinner, showModal } from "@decky/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { PyCaller } from "../PyCaller";
import { Settings, SettingsType, loadSettings } from "./utils/settings";
import { UpdateGamesListTimer } from "./utils/UpdateGamesListTimer";
import { SettingToggle } from "./SettingToggle";

const FREQ_SLIDERS = [
  { label: 'Days', setting: Settings.UPDATE_FREQ_DAY, max: 30 },
  { label: 'Hours', setting: Settings.UPDATE_FREQ_HOUR, max: 23 },
  { label: 'Minutes', setting: Settings.UPDATE_FREQ_MIN, max: 59 },
];

const ConfigurationPanels: React.FunctionComponent = () => {
  const [settings, setSettings] = useState<{ [key: SettingsType]: any } | null>(null);
  const timerDebounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
      // clamp frequency values saved before the sliders bounded their ranges
      for (const { setting, max } of FREQ_SLIDERS) {
        if (typeof output[setting] === 'number' && output[setting] > max) {
          output[setting] = max;
          PyCaller.setSetting(setting, max).catch(() => { });
        }
      }
      setSettings(output);
      await UpdateGamesListTimer.updateTimer(output);
    }
  }, []);

  useEffect(() => {
    loadAndApply();
    // flush any pending debounced timer update on unmount
    return () => {
      if (timerDebounce.current) {
        clearTimeout(timerDebounce.current);
      }
    };
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

  const updateFreq = useCallback(async (setting: SettingsType, value: number) => {
    if (settings === null || value === settings[setting]) {
      return;
    }
    // prevent a frequency of zero, which would poll the store api constantly
    const total = FREQ_SLIDERS.reduce((sum, slider) => sum + (slider.setting === setting ? value : settings[slider.setting]), 0);
    if (total <= 0) {
      // rerender so the slider snaps back to its stored value
      setSettings((prev) => prev === null ? prev : { ...prev });
      return;
    }

    await updateSetting(setting, value);
    // debounce timer rescheduling so dragging a slider does not reschedule
    // on every step
    if (timerDebounce.current) {
      clearTimeout(timerDebounce.current);
    }
    const newSettings = { ...settings, [setting]: value };
    timerDebounce.current = setTimeout(() => UpdateGamesListTimer.updateTimer(newSettings), 500);
  }, [settings, updateSetting]);

  if (settings === null) {
    return <SteamSpinner />;
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
      <PanelSection title="Accessibility">
        <PanelSectionRow>
          <SettingToggle
            label='Larger Text'
            value={Boolean(settings[Settings.LARGER_TEXT])}
            setting={Settings.LARGER_TEXT}
            onUpdate={updateSetting} />
        </PanelSectionRow>
        <PanelSectionRow>
          <SettingToggle
            label='Disable Animations'
            value={Boolean(settings[Settings.DISABLE_ANIMATIONS])}
            setting={Settings.DISABLE_ANIMATIONS}
            onUpdate={updateSetting} />
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title="Update Frequency">
        {FREQ_SLIDERS.map(({ label, setting, max }) =>
          <PanelSectionRow key={setting}>
            <SliderField
              label={label}
              value={settings[setting]}
              min={0}
              max={max}
              step={1}
              showValue={true}
              onChange={(value) => updateFreq(setting, value)} />
          </PanelSectionRow>)}
      </PanelSection>
      <PanelSection title="Data">
        <PanelSectionRow>
          <ButtonItem layout='below' onClick={() => {
            showModal(
              <ConfirmModal
                strTitle='Clear Games Database'
                strDescription='This removes all cached games, including which games are hidden. The list fills back up on the next update.'
                strOKButtonText='Clear'
                bDestructiveWarning={true}
                onOK={async () => {
                  await PyCaller.clearDeals();
                }} />
            );
          }}>Clear Games Database</ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout='below' onClick={() => {
            showModal(
              <ConfirmModal
                strTitle='Restore Settings'
                strDescription='This resets every setting back to its default value.'
                strOKButtonText='Restore'
                bDestructiveWarning={true}
                onOK={async () => {
                  await PyCaller.restoreSettings();
                  await loadAndApply();
                }} />
            );
          }}>Restore Settings</ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </div>
  );
}

export { ConfigurationPanels };
