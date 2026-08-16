import { createContext } from "react";
import { GamesListState, INITIAL_GAMES_LIST_STATE } from "../utils/games";

const GamesListContext = createContext({
    gamesList: INITIAL_GAMES_LIST_STATE,
    setGamesList: (_: GamesListState) => {},
});

export default GamesListContext;
