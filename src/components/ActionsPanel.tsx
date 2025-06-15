import { DialogButton, Field, Focusable, PanelSection, PanelSectionRow, Router } from "decky-frontend-lib";
import { FaCog, FaRedo } from "react-icons/fa";
import { PyCaller } from "../PyCaller";
import { useContext, useState } from "react";
import GamesListContext from "./context/GamesListContext";
import { fetchGamesList } from "./utils/games";

const ActionsPanel: React.FunctionComponent = () => {
  const [updateButtonDisabled, setUpdateButtonDisabled] = useState(false);
  const { setGamesList } = useContext(GamesListContext)

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
              disabled={updateButtonDisabled}
              onOKActionDescription='Update Game List'
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '10px',
                minWidth: 'auto',
              }}
              onClick={async () => {
                setUpdateButtonDisabled(true);
                await PyCaller.updateDealsNow();
                const gamesList = await fetchGamesList();
                setGamesList(gamesList);
                await new Promise(res => setTimeout(res, 500));
                setUpdateButtonDisabled(false);
              }}
            >
              <FaRedo />
            </DialogButton>
            <DialogButton
              onOKActionDescription='Open Settings'
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '10px',
                minWidth: 'auto',
                marginLeft: '.5em',
              }}
              onClick={async () => {
                Router.CloseSideMenus();
                Router.Navigate("/free-loader-configuration");
              }}
            >
              <FaCog />
            </DialogButton>
          </Focusable>
        </Field>
      </PanelSectionRow>
    </PanelSection>
  );
}

export { ActionsPanel };