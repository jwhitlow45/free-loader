import { DialogButton, Navigation, PanelSectionRow } from "decky-frontend-lib";
import { PyCaller } from "../PyCaller";
import React, { useContext } from "react";
import GamesListContext from "./context/GamesListContext";
import { fetchGamesList } from "./utils/games";

type GamePanelProps = {
  id: string,
  title: string;
  worth: string;
  image_url: string;
  link: string;
  end_date: string;
  platforms: string;
  show_title: boolean;
  hidden: boolean;
  show_hidden_game: boolean;
}

const GamePanel: React.FunctionComponent<GamePanelProps> = (props) => {
  const [hiddenState, setHiddenState] = React.useState(props.hidden);
  const [hideGamePanel, setHideGamePanel] = React.useState(!props.show_hidden_game && props.hidden);

  const { setGamesList } = useContext(GamesListContext);

  if (hideGamePanel) return null;
  return (
    <div style={{ display: 'flex', marginBottom: '10px', animation: 'fadeIn 0.25s ease-in-out' }}>
      <PanelSectionRow>
        <DialogButton
          onClick={async () => {
            Navigation.CloseSideMenus()
            Navigation.NavigateToExternalWeb(props.link);
          }}
          onSecondaryButton={async () => {
            let response = await PyCaller.toggleDealVisibility(props.id)
            if (response.success) {
              let hidden_state = Boolean(response.result['hidden'])
              setHiddenState(hidden_state)
              setHideGamePanel(!props.show_hidden_game && hidden_state)
              setGamesList(await fetchGamesList())
            }
          }}
          onOKActionDescription='Open Store Page'
          onSecondaryActionDescription={hiddenState ? 'Show Game' : 'Hide Game'}
        >
          <table>
            <tr>
              <td style={{ width: '100%' }}>
                <img src={props.image_url} style={{ borderRadius: '10px', width: '100%' }} />
              </td>
            </tr>
            <tr>
              <td style={{ width: '100%' }}>
                <div>
                  {props.show_title && <h3 style={{ lineHeight: '20px' }}>{props.title}</h3>}
                  <h4 style={{ lineHeight: '3px' }}>{props.platforms}</h4>
                  <h4 style={{ lineHeight: '3px' }}><s>{props.worth}</s> Free</h4>
                  <h4 style={{ lineHeight: '3px' }}>Ends {props.end_date}</h4>
                  {hiddenState && <h4 style={{ lineHeight: '3px' }}><i>Hidden</i></h4>}
                </div>
              </td>
            </tr>
          </table>
        </DialogButton>
      </PanelSectionRow>
      <style>
        {`@keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }`}
      </style>
    </div>
  );
}

export { GamePanel };