import { createContext } from "react";
import { ActionsPanel } from "./ActionsPanel";
import { SettingsPanel } from "./SettingsPanels";

type FreeGamesPageProps = {
  setTimer(newTimer: NodeJS.Timer): void
}

export const TimerContext = createContext((newTimer: NodeJS.Timer) => { newTimer; });

const FreeLoader: React.FunctionComponent<FreeGamesPageProps> = (props) => {
  return (
    <TimerContext.Provider value={props.setTimer}>
      <ActionsPanel />
      <SettingsPanel />
    </TimerContext.Provider>
  );
}

export { FreeLoader };