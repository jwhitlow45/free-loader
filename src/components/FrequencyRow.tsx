import { DialogButton, DialogLabel, Focusable } from "decky-frontend-lib";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

type FrequencyRowProps = {
  label: string;
  value: number;
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
      <DialogLabel style={{ display: 'flex' }}>{props.label + ': ' + props.value.toString()}</DialogLabel>
      <div style={{ display: 'flex', width: '30%', marginLeft: 'auto' }}>
        <DialogButton style={ArrowButtonStyle}>
          <FaArrowUp />
        </DialogButton>
        <DialogButton style={ArrowButtonStyle}>
          <FaArrowDown />
        </DialogButton>
      </div>
    </Focusable>
  );
}

export { FrequencyRow };