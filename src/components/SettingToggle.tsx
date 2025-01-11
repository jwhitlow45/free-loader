import { ToggleField } from "decky-frontend-lib";
import { SettingsType } from "./utils/settings";
import { PyCaller } from "../PyCaller";

type SettingToggleProps = {
  label: string;
  value: boolean;
  setting: SettingsType;
  setter: (value: boolean) => void;
  cur_settings: { [key: SettingsType]: any};
}

const SettingToggle: React.FunctionComponent<SettingToggleProps> = (props) => {
  return (<ToggleField
    label={props.label}
    checked={props.value}
    layout='below'
    onChange={async () => {
      props.cur_settings[props.setting] = !props.cur_settings[props.setting];
      await PyCaller.setSetting(
        props.setting,
        props.cur_settings[props.setting]);
      props.setter(props.cur_settings[props.setting]);
    }} />);
}

export { SettingToggle };