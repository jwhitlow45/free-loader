import { DialogButton, Navigation, PanelSectionRow } from "decky-frontend-lib";
import { PyCaller } from "../PyCaller";
import React, { useContext } from "react";
import GamesListContext from "./context/GamesListContext";
import { fetchGamesList, Deal } from "./utils/games";
import QRCode from "react-qr-code";

type GamePanelProps = {
  deal: Deal;
  show_title: boolean;
}

const GamePanel: React.FunctionComponent<GamePanelProps> = ({ deal, show_title }) => {
  const [showQrCode, setShowQrCode] = React.useState(false);

  const { setGamesList } = useContext(GamesListContext);

  return (
    <div style={{ display: 'flex', marginBottom: '10px', animation: 'fadeIn 0.25s ease-in-out' }}>
      <PanelSectionRow>
        <DialogButton
          onClick={async () => {
            Navigation.CloseSideMenus()
            Navigation.NavigateToExternalWeb(deal.open_giveaway_url);
          }}
          onOKActionDescription='Open Store Page'
          onSecondaryButton={async () => {
            const response = await PyCaller.toggleDealVisibility(deal.id)
            if (response.success) {
              setGamesList(await fetchGamesList())
            }
          }}
          onSecondaryActionDescription={deal.hidden ? 'Show Game' : 'Hide Game'}
          onOptionsButton={() => {
            setShowQrCode(!showQrCode)
          }}
          onOptionsActionDescription={showQrCode ? 'Hide QR Code' : 'Show QR Code'}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', margin: 'auto' }}>
              <img src={deal.image} hidden={showQrCode} style={{ height: '105px', borderRadius: '10px', animation: 'fadeIn 0.5s ease-in-out' }} />
              <div hidden={!showQrCode} style={{ height: '105px', animation: 'fadeIn 0.5s ease-in-out' }}>
                <QRCode size={105} value={deal.open_giveaway_url} style={{ padding: '0 59.8255814px' }} />
              </div>
            </div>
            <div style={{ width: '100%', marginTop: '8px' }}>
              {show_title && <h3 style={{ lineHeight: '20px' }}>{deal.title}</h3>}
              <h4 style={{ lineHeight: '3px' }}>{deal.platforms}</h4>
              <h4 style={{ lineHeight: '3px' }}><s>{deal.worth}</s> Free</h4>
              <h4 style={{ lineHeight: '3px' }}>Ends {deal.end_date}</h4>
              {deal.hidden && <h4 style={{ lineHeight: '3px' }}><i>Hidden</i></h4>}
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
