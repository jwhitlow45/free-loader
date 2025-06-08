import { PyCaller } from "../PyCaller";
import { useCallback, useEffect, useState } from "react";
import { GamePanel } from "./GamePanel";
import { Settings } from "./utils/settings";
import { PanelSection } from "decky-frontend-lib";

enum Deal {
  ID = 'id',
  TITLE = 'title',
  WORTH = 'worth',
  IMAGE = 'image',
  OPEN_GIVEAWAY_URL = 'open_giveaway_url',
  PUBLISHED_DATE = 'published_date',
  END_DATE = 'end_date',
  STATUS = 'status',
  PLATFORMS = 'platforms',
  HIDDEN = 'hidden'
}

const MAX_RETRIES = 3;
const EMPTY_DIV = [<div></div>];
const NON_GAMES_PAGE_STYLE = { display: 'flex', justifyContent: 'center' }
const FAILED_TO_LOAD_PAGE = [
  <div><h3 style={NON_GAMES_PAGE_STYLE}>
    Failed to load games!</h3></div>
];
const NO_GAMES_PAGE = [
  <div><h3 style={NON_GAMES_PAGE_STYLE}>
    No free games right now.<br />Check back later!</h3></div>
]

const FreeGamesPanel: React.FunctionComponent = () => {
  const [gamesContainer, setGamesContainer] = useState(EMPTY_DIV)

  const loadGames = useCallback(async (retries = 0) => {
    let show_titles = Boolean((await PyCaller.getSetting(Settings.SHOW_TITLES)).result)
    let show_hidden_games = Boolean((await PyCaller.getSetting(Settings.SHOW_HIDDEN_GAMES)).result)

    let response = await PyCaller.readDeals();
    if (response.success) {
      PyCaller.loggerInfo('Read json db and loaded games page');
      let gamesInfo = response.result;
      let gameRows = [];
      for (let key in gamesInfo) {
        gameRows.push(
          <GamePanel
            id={gamesInfo[key][Deal.ID]}
            title={gamesInfo[key][Deal.TITLE]}
            worth={gamesInfo[key][Deal.WORTH]}
            image_url={gamesInfo[key][Deal.IMAGE]}
            link={gamesInfo[key][Deal.OPEN_GIVEAWAY_URL]}
            end_date={gamesInfo[key][Deal.END_DATE]}
            platforms={gamesInfo[key][Deal.PLATFORMS]}
            hidden={gamesInfo[key][Deal.HIDDEN]}
            show_title={show_titles}
            show_hidden_game={show_hidden_games} />)
      }
      if (gameRows.length == 0) {
        gameRows.push(NO_GAMES_PAGE[0])
      } else {
        let all_hidden = gameRows.every((elem) => Boolean(elem.props.hidden))
        if (all_hidden && !show_hidden_games) {
          gameRows.push(NO_GAMES_PAGE[0]);
        } else {
          gameRows.sort((a, b) => {
            const dateA = a.props.end_date === 'N/A' ? null : new Date(a.props.end_date);
            const dateB = b.props.end_date === 'N/A' ? null : new Date(b.props.end_date);

            if (dateA && dateB) {
              const dateDifference = dateA.getTime() - dateB.getTime();
              if (dateDifference !== 0) {
                return dateDifference
              }
              // if dates are the same sort by title
              return a.props.title.localeCompare(b.props.title);
            } else if (!dateA && dateB) {
              return 1;
            } else if (dateA && !dateB) {
              return -1;
            } else {
              // if dates are both N/A then sort by title
              return a.props.title.localeCompare(b.props.title);
            }
          });
        }
      };
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
    <PanelSection title="Free Games">
      {gamesContainer}
    </PanelSection>
  );
}

export { FreeGamesPanel };