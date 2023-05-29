import { DialogButton, DialogLabel, Focusable } from "decky-frontend-lib";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

const ArrowButtonStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '10px',
  margin: '2px 0px',
  minWidth: 'auto',
  marginLeft: '.5em'
};

function FrequencyRow({ label, value }) {
  return (
    <Focusable style={{ display: 'flex', alignItems: 'center' }}>
      <DialogLabel style={{ display: 'flex' }}>{label + ': ' + value.toString()}</DialogLabel>
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