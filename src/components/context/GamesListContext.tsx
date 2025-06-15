import { createContext } from "react";

const GamesListContext = createContext({
    gamesList: [<div></div>],
    setGamesList: (_: JSX.Element[]) => {},
});

export default GamesListContext;
