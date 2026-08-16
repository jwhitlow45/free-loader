import { PyCaller } from "../PyCaller";
import { ReactNode, useEffect, useState } from "react";
import { PanelSection, SteamSpinner } from "@decky/ui";
import { FaExclamationTriangle, FaGift } from "react-icons/fa";
import { ActionsPanel } from "./ActionsPanel";
import { GamePanel } from "./GamePanel";
import GamesListContext from "./context/GamesListContext";
import { fetchGamesList, GamesListState, INITIAL_GAMES_LIST_STATE } from "./utils/games";

const StatusMessage: React.FunctionComponent<{ icon: ReactNode; children: ReactNode }> = ({ icon, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px 0', color: 'rgba(255, 255, 255, 0.5)' }}>
    {icon}
    <span style={{ fontSize: '13px', textAlign: 'center', lineHeight: '1.4' }}>{children}</span>
  </div>
);

const Sidebar: React.FunctionComponent = () => {
  const [gamesList, setGamesList] = useState<GamesListState>(INITIAL_GAMES_LIST_STATE);

  useEffect(() => {
    (async () => {
      setGamesList(await fetchGamesList());
      await PyCaller.loggerInfo('Loaded games list');
    })();
  }, []);

  const visibleDeals = gamesList.showHiddenGames
    ? gamesList.deals
    : gamesList.deals.filter((deal) => !deal.hidden);

  return (
    <GamesListContext.Provider value={{ gamesList, setGamesList }}>
      <ActionsPanel />
      <PanelSection title="Free Games">
        {gamesList.status === 'loading' &&
          <div style={{ height: '80px' }}>
            <SteamSpinner />
          </div>}
        {gamesList.status === 'error' &&
          <StatusMessage icon={<FaExclamationTriangle size={22} />}>
            Failed to load games!
          </StatusMessage>}
        {gamesList.status === 'ready' && visibleDeals.length === 0 &&
          <StatusMessage icon={<FaGift size={22} />}>
            No free games right now.<br />Check back later!
          </StatusMessage>}
        {visibleDeals.map((deal) =>
          <GamePanel key={deal.id} deal={deal} show_title={gamesList.showTitles} animate={gamesList.showAnimations} />)}
      </PanelSection>
      {/* keyframes are global to the whole steam ui document, so they are
          namespaced to avoid clashing with steam or decky animations and
          defined once here rather than per card */}
      <style>
        {`@keyframes free-loader-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes free-loader-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }`}
      </style>
    </GamesListContext.Provider>
  );
}

export { Sidebar };
