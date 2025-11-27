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
  const [showQrCode, setShowQrCode] = React.useState(false);
  const [hideGamePanel, setHideGamePanel] = React.useState(!props.show_hidden_game && props.hidden);

  const { setGamesList } = useContext(GamesListContext);

  function getQrCodeImageUrl() {
    const encodeQueryParams = (p: { [key: string]: string | number | boolean }) =>
      Object.entries(p).map(kv => kv.map(encodeURIComponent).join("=")).join("&");

    const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/?'
    const queryParams = {
      size: `150x150`,
      data: props.link
    }
    return baseUrl + encodeQueryParams(queryParams)
  }
  const qrCodeUrl = getQrCodeImageUrl();

  if (hideGamePanel) return null;
  return (
    <div style={{ display: 'flex', marginBottom: '10px', animation: 'fadeIn 0.25s ease-in-out' }}>
      <PanelSectionRow>
        <DialogButton
          onClick={async () => {
            Navigation.CloseSideMenus()
            Navigation.NavigateToExternalWeb(props.link);
          }}
          onOKActionDescription='Open Store Page'
          onSecondaryButton={async () => {
            let response = await PyCaller.toggleDealVisibility(props.id)
            if (response.success) {
              let hidden_state = Boolean(response.result['hidden'])
              setHiddenState(hidden_state)
              setHideGamePanel(!props.show_hidden_game && hidden_state)
              setGamesList(await fetchGamesList())
            }
          }}
          onSecondaryActionDescription={hiddenState ? 'Show Game' : 'Hide Game'}
          onOptionsButton={() => {
            setShowQrCode(!showQrCode)
          }}
          onOptionsActionDescription={showQrCode ? 'Hide QR Code' : 'Show QR Code'}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', margin: 'auto' }}>
              <img src={props.image_url} hidden={showQrCode} style={{ height: '105px', borderRadius: '10px', animation: 'fadeIn 0.5s ease-in-out' }} />
              <img src={qrCodeUrl} hidden={!showQrCode} style={{ height: '105px', padding: '0 59.8255814px', animation: 'fadeIn 0.5s ease-in-out' }} />
            </div>
            <div style={{ width: '100%', marginTop: '8px' }}>
              {props.show_title && <h3 style={{ lineHeight: '20px' }}>{props.title}</h3>}
              <h4 style={{ lineHeight: '3px' }}>{props.platforms}</h4>
              <h4 style={{ lineHeight: '3px' }}><s>{props.worth}</s> Free</h4>
              <h4 style={{ lineHeight: '3px' }}>Ends {props.end_date}</h4>
              {hiddenState && <h4 style={{ lineHeight: '3px' }}><i>Hidden</i></h4>}
            </div>
          </div>
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