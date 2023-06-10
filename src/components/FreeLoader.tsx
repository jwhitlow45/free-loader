import { createContext } from "react";
import { ActionsPanel } from "./ActionsPanel";
import { SettingsPanel } from "./SettingsPanels";
import { updateInterval } from "./utils/updateInterval";

export const TimerContext = createContext({setTimer: (newTimer: NodeJS.Timer) => { }});

const FreeLoader: React.FunctionComponent = () => {

  let updateTimer: NodeJS.Timer;
  (async () => {
    updateTimer = await updateInterval();
  })()

  return (
    <div>
      <TimerContext.Provider value={{setTimer: (newTimer: NodeJS.Timer) => {
        clearInterval(updateTimer);
        updateTimer = newTimer;
      }}
      }>
        <ActionsPanel />
        <SettingsPanel />
      </TimerContext.Provider>
    </div>
  );
}

export { FreeLoader };