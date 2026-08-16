import { PyCaller } from "../../PyCaller";
import { Settings } from "./settings";

export type Deal = {
  id: string;
  title: string;
  worth: string;
  image: string;
  open_giveaway_url: string;
  published_date: string;
  end_date: string;
  status: string;
  platforms: string;
  hidden: boolean;
}

export type GamesListState = {
  status: 'loading' | 'error' | 'ready';
  deals: Deal[];
  showTitles: boolean;
  showHiddenGames: boolean;
  showAnimations: boolean;
}

export const INITIAL_GAMES_LIST_STATE: GamesListState = {
  status: 'loading',
  deals: [],
  showTitles: true,
  showHiddenGames: false,
  showAnimations: true,
}

const MAX_ATTEMPTS = 3;

// sort by soonest end date first with N/A dates last, ties broken by title
const compareDeals = (a: Deal, b: Deal): number => {
  const dateA = a.end_date === 'N/A' ? null : new Date(a.end_date);
  const dateB = b.end_date === 'N/A' ? null : new Date(b.end_date);

  if (dateA && dateB) {
    const dateDifference = dateA.getTime() - dateB.getTime();
    if (dateDifference !== 0) {
      return dateDifference
    }
    // if dates are the same sort by title
    return a.title.localeCompare(b.title);
  } else if (!dateA && dateB) {
    return 1;
  } else if (dateA && !dateB) {
    return -1;
  }
  // if dates are both N/A then sort by title
  return a.title.localeCompare(b.title);
}

export const fetchGamesList = async (attempts: number = 1): Promise<GamesListState> => {
  // fall back to setting defaults when settings cannot be read
  let showTitles = true;
  let showHiddenGames = false;
  let showAnimations = true;
  try {
    const settings = await PyCaller.getSettings();
    showTitles = Boolean(settings[Settings.SHOW_TITLES]);
    showHiddenGames = Boolean(settings[Settings.SHOW_HIDDEN_GAMES]);
    showAnimations = Boolean(settings[Settings.ENABLE_ANIMATIONS]);
  } catch (error) {
    PyCaller.loggerError(`Could not read settings for games list: ${error}`);
  }

  try {
    const gamesInfo = await PyCaller.readDeals();
    PyCaller.loggerInfo('Read json db');
    const deals = Object.values(gamesInfo).sort(compareDeals);
    return { status: 'ready', deals, showTitles, showHiddenGames, showAnimations };
  } catch (error) {
    if (attempts >= MAX_ATTEMPTS) {
      PyCaller.loggerError(`Reached max retry limit of ${MAX_ATTEMPTS}...cannot load page.`);
      return { status: 'error', deals: [], showTitles, showHiddenGames, showAnimations };
    }
    return fetchGamesList(attempts + 1);
  }
}
