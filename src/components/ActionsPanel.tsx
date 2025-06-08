import { DialogButton, Field, Focusable, PanelSection, PanelSectionRow, Router } from "decky-frontend-lib";
import { FaCog, FaRedo } from "react-icons/fa";
import { PyCaller } from "../PyCaller";
import { useState } from "react";

const ActionsPanel: React.FunctionComponent = () => {
  const [disabled, setDisabled] = useState(false);

  return (
    <PanelSection title="Actions">
      <PanelSectionRow>
        <Field
          bottomSeparator="none"
          inlineWrap="keep-inline"
          padding="none"
          spacingBetweenLabelAndChild="none"
          childrenContainerWidth="max"
        >
          <Focusable style={{ display: 'flex' }}>
            <DialogButton
              onOKActionDescription='Open Settings'
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '10px',
                minWidth: 'auto',
              }}
              onClick={async () => { 
                Router.CloseSideMenus();
                Router.Navigate("/free-loader-configuration");
              }}
            >
              <FaCog />
            </DialogButton>
            <DialogButton
              disabled={disabled}
              onOKActionDescription='Update Game List'
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '10px',
                minWidth: 'auto',
                marginLeft: '.5em',
              }}
              onClick={async () => {
                setDisabled(true);
                await PyCaller.updateDealsNow();
                await new Promise(res => setTimeout(res, 1000));
                setDisabled(false);
              }}
            >
              <FaRedo />
            </DialogButton>
          </Focusable>
        </Field>
      </PanelSectionRow>
    </PanelSection>
  );
}

export { ActionsPanel };