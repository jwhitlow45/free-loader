import { ButtonItem, PanelSection, PanelSectionRow } from "decky-frontend-lib";
import { ApiProps } from "./FreeLoader";

const SettingsPanel: React.FunctionComponent<ApiProps> = (props) => {
  return (
    <PanelSection title="Settings">
      <PanelSectionRow>
        <ButtonItem layout='below' onClick={() => {
          props.serverAPI.callPluginMethod('settings_setSetting', { 'key':'freeloader', 'value':'test' });
          props.serverAPI.callPluginMethod('settings_commit', {});
        }}>set setting</ButtonItem>
        <ButtonItem id='test-element' layout='below' onClick={() => {
          let test = document.getElementById('test-element');
          let result = props.serverAPI.callPluginMethod('settings_getSetting', { 'key':'freeloader' });
          result.then((value) => {if (test != null) test.innerText = value.result.toString()})
        }}>get setting</ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
}

export { SettingsPanel };