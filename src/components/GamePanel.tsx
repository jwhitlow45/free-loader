import { DialogButton, Navigation, PanelSectionRow } from "@decky/ui";
import { PyCaller } from "../PyCaller";
import React, { useContext } from "react";
import { IconType } from "react-icons";
import { FaEyeSlash, FaSteam } from "react-icons/fa";
import { SiEpicgames, SiGogdotcom, SiItchdotio } from "react-icons/si";
import GamesListContext from "./context/GamesListContext";
import { fetchGamesList, Deal } from "./utils/games";
import { describeEndDate } from "./utils/time";
import QRCode from "react-qr-code";

// secondary text is dimmed with opacity rather than an explicit color so it
// inherits the button's text color, which steam inverts while the card is
// focused and its background turns white
const SECONDARY_OPACITY = 0.55;

// mirrors the steam storefront discount badge styling
const FREE_BADGE_STYLE: React.CSSProperties = {
  backgroundColor: '#4c6b22',
  color: '#BEEE11',
  borderRadius: '2px',
  padding: '2px 6px',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.5px',
};

const STORES: { [platform: string]: { icon: IconType; label: string } } = {
  'Steam': { icon: FaSteam, label: 'Steam' },
  'GOG': { icon: SiGogdotcom, label: 'GOG' },
  'Epic Games Store': { icon: SiEpicgames, label: 'Epic Games' },
  'Itch.io': { icon: SiItchdotio, label: 'Itch.io' },
};

type GamePanelProps = {
  deal: Deal;
  show_title: boolean;
  animate: boolean;
}

const GamePanel: React.FunctionComponent<GamePanelProps> = ({ deal, show_title, animate }) => {
  const [showQrCode, setShowQrCode] = React.useState(false);

  const { setGamesList } = useContext(GamesListContext);
  const fadeIn = (duration: string) => animate ? `free-loader-fade-in ${duration} ease-in-out` : 'none';

  const store = STORES[deal.platforms];
  const endDateText = describeEndDate(deal.end_date);

  return (
    <PanelSectionRow>
      <div style={{ marginBottom: '10px', opacity: deal.hidden ? 0.5 : 1, animation: fadeIn('0.25s') }}>
        <DialogButton
          style={{ padding: '10px', width: '100%' }}
          onClick={async () => {
            Navigation.CloseSideMenus()
            Navigation.NavigateToExternalWeb(deal.open_giveaway_url);
          }}
          onOKActionDescription='Open Store Page'
          onSecondaryButton={async () => {
            try {
              await PyCaller.toggleDealVisibility(deal.id)
              setGamesList(await fetchGamesList())
            } catch (error) {
              PyCaller.loggerError(`Failed to toggle game visibility: ${error}`)
            }
          }}
          onSecondaryActionDescription={deal.hidden ? 'Show Game' : 'Hide Game'}
          onOptionsButton={() => {
            setShowQrCode(!showQrCode)
          }}
          onOptionsActionDescription={showQrCode ? 'Hide QR Code' : 'Show QR Code'}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            {!showQrCode
              ? <img
                  src={deal.image}
                  style={{ width: '100%', height: '118px', objectFit: 'cover', borderRadius: '4px', animation: fadeIn('0.5s') }} />
              : <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '118px', backgroundColor: '#fff', borderRadius: '4px', animation: fadeIn('0.25s') }}>
                  <QRCode size={100} value={deal.open_giveaway_url} />
                </div>}
            {show_title &&
              <div style={{ fontSize: '14px', fontWeight: 500, lineHeight: '1.3' }}>{deal.title}</div>}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: SECONDARY_OPACITY, fontSize: '12px', minWidth: 0 }}>
                {store && <store.icon size={12} style={{ flexShrink: 0 }} />}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {store ? store.label : deal.platforms}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                {deal.worth.startsWith('$') &&
                  <s style={{ opacity: SECONDARY_OPACITY, fontSize: '12px' }}>{deal.worth}</s>}
                <span style={FREE_BADGE_STYLE}>FREE</span>
              </div>
            </div>
            {(endDateText || deal.hidden) &&
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: SECONDARY_OPACITY, fontSize: '11px' }}>
                <span>{endDateText}</span>
                {deal.hidden &&
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaEyeSlash size={11} /> Hidden
                  </span>}
              </div>}
          </div>
        </DialogButton>
      </div>
    </PanelSectionRow>
  );
}

export { GamePanel };
