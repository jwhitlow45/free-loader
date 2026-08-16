import { ToggleField } from "decky-frontend-lib";
import { SettingsType } from "./utils/settings";

type SettingToggleProps = {
  label: string;
  value: boolean;
  setting: SettingsType;
  onUpdate: (setting: SettingsType, value: boolean) => void;
}

const SettingToggle: React.FunctionComponent<SettingToggleProps> = (props) => {
  return (<ToggleField
    label={props.label}
    checked={props.value}
    layout='below'
    onChange={(checked) => props.onUpdate(props.setting, checked)} />);
}

export { SettingToggle };
