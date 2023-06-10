import {
  definePlugin,
  ServerAPI,
  staticClasses,
} from "decky-frontend-lib";
import {  VFC } from "react";
import { FaBell } from "react-icons/fa";
import { FreeLoader } from "./components/FreeLoader";
import { PyCaller } from "./PyCaller";
import { FreeGamesPage } from "./components/FreeGamesPage";
import { updateInterval } from "./components/utils/updateInterval";
import { loadSettings } from "./components/utils/settings";

const FreeGamesRouter: VFC = () => {
  return (
    <FreeGamesPage />
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  PyCaller.setServer(serverApi);
  serverApi.routerHook.addRoute("/free-games", FreeGamesRouter, {
    exact: true,
  });

  let updateTimer: NodeJS.Timer;
  (async () => {
    let settings = await loadSettings();
    updateTimer = await updateInterval(settings);
  })()

  const setTimer = (newTimer: NodeJS.Timer) => {
    clearInterval(updateTimer);
    updateTimer = newTimer;
  };

  PyCaller.updateDealsNow(false);

  return {
    title: <div className={staticClasses.Title}>Free Loader</div>,
    content: <FreeLoader setTimer={setTimer} />,
    icon: <FaBell />,
    onDismount() {
      serverApi.routerHook.removeRoute("/free-games");
    },
  };
});