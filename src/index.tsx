import {
  definePlugin,
  ServerAPI,
  staticClasses,
} from "decky-frontend-lib";
import { VFC } from "react";
import { FaBell } from "react-icons/fa";
import { FreeLoader } from "./components/FreeLoader";
import { PyCaller } from "./PyCaller";
import { FreeGamesPage } from "./components/FreeGamesPage";
import { update_loop } from "./components/utils/update_loop";

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

  update_loop()

  return {
    title: <div className={staticClasses.Title}>Free Loader</div>,
    content: <FreeLoader />,
    icon: <FaBell />,
    onDismount() {
      serverApi.routerHook.removeRoute("/free-games");
    },
  };
});
