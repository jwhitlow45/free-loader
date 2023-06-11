import { PyCaller } from "../PyCaller";
import { useCallback, useEffect, useState } from "react";
import { GamePanel } from "./GamePanel";

enum Deal {
  ID = 'id',
  TITLE = 'title',
  WORTH = 'worth',
  IMAGE = 'image',
  OPEN_GIVEAWAY_URL = 'open_giveaway_url',
  PUBLISHED_DATE = 'published_date',
  END_DATE = 'end_date',
  STATUS = 'status',
  NOTIFIED = 'notified'
}

const MAX_RETRIES = 3;
const EMPTY_DIV = [<div></div>];
const FAILED_TO_LOAD_PAGE = [
  <div><h1 style={{ display: 'flex', justifyContent: 'center', marginTop: '175px' }}>Failed to load games!</h1></div>
];

const FreeGamesPage: React.FunctionComponent = () => {
  const [gamesContainer, setGamesContainer] = useState(EMPTY_DIV)
  const loadGames = useCallback(async (retries = 0) => {
    let response = await PyCaller.readDeals();
    if (response.success) {
      PyCaller.loggerInfo('Read json db and loaded games page');
      let gamesInfo = response.result;
      let gameRows = [];
      for (let key in gamesInfo) {
        gameRows.push(
          <GamePanel
            title={gamesInfo[key][Deal.TITLE]}
            worth={gamesInfo[key][Deal.WORTH]} 
            image_url={gamesInfo[key][Deal.IMAGE]}
            link={gamesInfo[key][Deal.OPEN_GIVEAWAY_URL]}
            end_date={gamesInfo[key][Deal.END_DATE]}/>)
      }
      setGamesContainer(gameRows);
    } else {
      if (retries <= MAX_RETRIES) {
        PyCaller.loggerError('Failed to read deals from json db...retrying');
        loadGames(retries + 1);
      } else {
        PyCaller.loggerError(`Reached max retry limit of ${MAX_RETRIES}...cannot load page.`);
        setGamesContainer(FAILED_TO_LOAD_PAGE);
      }
    }
  }, [gamesContainer]);

  useEffect(() => {
    if (gamesContainer == EMPTY_DIV) {
      loadGames();
    }
  });

  return (
    <div style={{ overflowY: 'scroll', marginTop: '60px', height: 'calc(100%-80px)' }}>
      {gamesContainer}
    </div>
  );
}

export { FreeGamesPage };