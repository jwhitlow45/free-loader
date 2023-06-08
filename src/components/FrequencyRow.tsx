import { DialogButton, DialogLabel, Focusable } from "decky-frontend-lib";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { Settings } from "./utils/settings";
import { UpdateFreqConext } from "./SettingsPanels";
import { useContext } from "react";

type FrequencyRowProps = {
  label: string;
  value: number;
  setting: Settings;
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
  const update_freq = useContext(UpdateFreqConext);
  return (
    <Focusable style={{ display: 'flex', alignItems: 'center' }}>
      <DialogLabel style={{ display: 'flex' }}>{props.label + ': ' + props.value}</DialogLabel>
      <div style={{ display: 'flex', width: '30%', marginLeft: 'auto' }}>
        <DialogButton 
          onOKActionDescription = {'Increase'}
          style={ArrowButtonStyle}
          onClick={() => {
            update_freq(props.setting, true);
          }}>
          <FaArrowUp />
        </DialogButton>
        <DialogButton 
          onOKActionDescription = {'Decrease'}
          style={ArrowButtonStyle}
          onClick={() => {
            update_freq(props.setting, false)
          }}>
          <FaArrowDown />
        </DialogButton>
      </div>
    </Focusable>
  );
}

export { FrequencyRow };