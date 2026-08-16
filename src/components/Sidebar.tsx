import { PyCaller } from "../PyCaller";
import { useEffect, useState } from "react";
import { PanelSection } from "@decky/ui";
import { ActionsPanel } from "./ActionsPanel";
import { GamePanel } from "./GamePanel";
import GamesListContext from "./context/GamesListContext";
import { fetchGamesList, GamesListState, INITIAL_GAMES_LIST_STATE } from "./utils/games";

const MESSAGE_STYLE = { display: 'flex', justifyContent: 'center' }

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
        {gamesList.status === 'error' &&
          <div><h3 style={MESSAGE_STYLE}>Failed to load games!</h3></div>}
        {gamesList.status === 'ready' && visibleDeals.length === 0 &&
          <div><h3 style={MESSAGE_STYLE}>No free games right now.<br />Check back later!</h3></div>}
        {visibleDeals.map((deal) =>
          <GamePanel key={deal.id} deal={deal} show_title={gamesList.showTitles} animate={gamesList.showAnimations} />)}
      </PanelSection>
    </GamesListContext.Provider>
  );
}

export { Sidebar };
