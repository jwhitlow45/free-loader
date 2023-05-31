import { DialogButton, DialogLabel, Focusable } from "decky-frontend-lib";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { Settings } from "./SettingsPanels";

type FrequencyRowProps = {
  label: string;
  value: number;
  setting: Settings;
  OnClick(setting: Settings, increment: boolean): void
}

const ArrowButtonStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '10px',
  margin: '2px 0px',
  minWidth: 'auto',
  marginLeft: '.5em'
};

const FrequencyRow: React.FunctionComponent<FrequencyRowProps> = (props) => {
  return (
    <Focusable style={{ display: 'flex', alignItems: 'center' }}>
      <DialogLabel style={{ display: 'flex' }}>{props.label + ': ' + props.value}</DialogLabel>
      <div style={{ display: 'flex', width: '30%', marginLeft: 'auto' }}>
        <DialogButton 
          style={ArrowButtonStyle}
          onClick={() => {
              props.OnClick(props.setting, true);
            }}>
          <FaArrowUp />
        </DialogButton>
        <DialogButton 
          style={ArrowButtonStyle}
          onClick={() => {
            props.OnClick(props.setting, false)
          }}>
          <FaArrowDown />
        </DialogButton>
      </div>
    </Focusable>
  );
}

export { FrequencyRow };