import { DialogButton, Focusable, Navigation, PanelSection, PanelSectionRow } from "@decky/ui";
import { FaCog, FaRedo } from "react-icons/fa";
import { PyCaller } from "../PyCaller";
import { useContext, useState } from "react";
import GamesListContext from "./context/GamesListContext";
import { fetchGamesList } from "./utils/games";
import { describeTimeSince } from "./utils/time";

const ACTION_BUTTON_STYLE: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '10px',
  flex: 1,
  minWidth: 0,
};

const ActionsPanel: React.FunctionComponent = () => {
  const [updating, setUpdating] = useState(false);
  const { gamesList, setGamesList } = useContext(GamesListContext)

  const lastUpdatedText = describeTimeSince(gamesList.lastUpdated);

  return (
    <PanelSection>
      <PanelSectionRow>
        <Focusable style={{ display: 'flex', gap: '8px' }}>
          <DialogButton
            disabled={updating}
            onOKActionDescription='Update Game List'
            style={ACTION_BUTTON_STYLE}
            onClick={async () => {
              setUpdating(true);
              await PyCaller.updateDealsNow();
              setGamesList(await fetchGamesList());
              setUpdating(false);
            }}
          >
            <FaRedo style={updating && gamesList.showAnimations ? { animation: 'free-loader-spin 1s linear infinite' } : {}} />
          </DialogButton>
          <DialogButton
            onOKActionDescription='Open Settings'
            style={ACTION_BUTTON_STYLE}
            onClick={async () => {
              Navigation.CloseSideMenus();
              Navigation.Navigate("/free-loader-configuration");
            }}
          >
            <FaCog />
          </DialogButton>
        </Focusable>
      </PanelSectionRow>
      {lastUpdatedText &&
        <PanelSectionRow>
          <div style={{ fontSize: gamesList.largerText ? '14px' : '11px', color: 'rgba(255, 255, 255, 0.45)', textAlign: 'center', marginTop: '4px' }}>
            Updated {lastUpdatedText}
          </div>
        </PanelSectionRow>}
    </PanelSection>
  );
}

export { ActionsPanel };
