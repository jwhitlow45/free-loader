import { PyCaller } from "../../PyCaller";
import { GamePanel } from "../GamePanel";
import { Settings } from "./settings";

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

const MAX_ATTEMPTS = 3;
const NO_GAMES_PAGE_STYLE = { display: 'flex', justifyContent: 'center' }
const FAILED_TO_LOAD_PAGE = [
  <div><h3 style={NO_GAMES_PAGE_STYLE}>
    Failed to load games!</h3></div>
];
export const NO_GAMES_PAGE = [
  <div><h3 style={NO_GAMES_PAGE_STYLE}>
    No free games right now.<br />Check back later!</h3></div>
];

export const fetchGamesList = async (attempts: number = 1): Promise<JSX.Element[]> => {
    let show_titles = Boolean((await PyCaller.getSetting(Settings.SHOW_TITLES)).result)
    let show_hidden_games = Boolean((await PyCaller.getSetting(Settings.SHOW_HIDDEN_GAMES)).result)
  
    let response = await PyCaller.readDeals();
    if (response.success) {
      await PyCaller.loggerInfo('Read json db');
      let gamesInfo = response.result;
  
      const gameRows: JSX.Element[] = Object.keys(gamesInfo).map((key: string) => 
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
          show_hidden_game={show_hidden_games} />
      );
  
      const all_hidden = gameRows.every((elem) => Boolean(elem.props.hidden))
      if (gameRows.length == 0 || (all_hidden && !show_hidden_games)) {
        return NO_GAMES_PAGE;
      }
  
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
      return gameRows;
    }
  
    if (attempts >= MAX_ATTEMPTS) {
      await PyCaller.loggerError(`Reached max retry limit of ${MAX_ATTEMPTS}...cannot load page.`);
      return FAILED_TO_LOAD_PAGE;
    }
    return fetchGamesList(attempts + 1);
  }