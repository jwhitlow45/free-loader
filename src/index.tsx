import {
  definePlugin,
  ServerAPI,
  staticClasses,
} from "decky-frontend-lib";
import { VFC } from "react";
import { FaDollarSign } from "react-icons/fa";
import { FreeLoader } from "./components/FreeLoader";
import { PyCaller } from "./PyCaller";
import { FreeGamesPage } from "./components/FreeGamesPage";
import { UpdateGamesListTimer } from "./components/utils/UpdateGamesListTimer";
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

  (async () => {
    let settings = await loadSettings();
    await UpdateGamesListTimer.updateTimer(settings);
  })()

  PyCaller.updateDealsNow(false);

  return {
    title: <div className={staticClasses.Title}>Free Loader</div>,
    content: <FreeLoader />,
    icon: <FaDollarSign />,
    onDismount() {
      serverApi.routerHook.removeRoute("/free-games");
    },
  };
});