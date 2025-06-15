import { PyCaller } from "../PyCaller";
import { useEffect, useState } from "react";
import { PanelSection } from "decky-frontend-lib";
import { ActionsPanel } from "./ActionsPanel";
import GamesListContext from "./context/GamesListContext";
import { fetchGamesList } from "./utils/games";

const Sidebar: React.FunctionComponent = () => {
  const [gamesList, setGamesList] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const fetchAndSetGamesList = async () => {
      if (gamesList.length === 0 || gamesList[0] === (<div></div>)) {
        setGamesList(await fetchGamesList());
        await PyCaller.loggerInfo('Loaded games list');
      }
    };
    fetchAndSetGamesList();
  }, []);

  return (
    <GamesListContext.Provider value={{ gamesList, setGamesList }}>
      <ActionsPanel />
      <PanelSection title="Free Games">
        {gamesList}
      </PanelSection>
    </GamesListContext.Provider>
  );
}

export { Sidebar };