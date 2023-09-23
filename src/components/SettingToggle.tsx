import { ToggleField } from "decky-frontend-lib";
import { Settings } from "./utils/settings";
import { PyCaller } from "../PyCaller";

type SettingToggleProps = {
  label: string;
  value: boolean;
  setting: Settings;
  setter: (value: boolean) => void;
  cur_settings: object;
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