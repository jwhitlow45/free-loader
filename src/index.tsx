import {
  definePlugin,
  DialogButton,
  Router,
  ServerAPI,
  staticClasses,
} from "decky-frontend-lib";
import { VFC } from "react";
import { FaBell } from "react-icons/fa";

import { ActionsPanel } from "./components/ActionsPanel";
import { SettingsPanel } from "./components/SettingsPanel";

const STEAM_DB_FREE_GAMES_URL = 'https://steamdb.info/upcoming/free/';

const Content: VFC<{ serverAPI: ServerAPI }> = ({ }) => {

  return (
    <div>
      <ActionsPanel />
      <SettingsPanel />
    </div>
  );
};

const FreeGamesRouter: VFC = () => {
  return (
    <div style={{ marginTop: "50px", color: "white" }}>
      Hello World!
      <DialogButton onClick={() => Router.NavigateToLibraryTab()}>
        Go to Library
      </DialogButton>
    </div>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  serverApi.routerHook.addRoute("/free-games", FreeGamesRouter, {
    exact: true,
  });

  return {
    title: <div className={staticClasses.Title}>Free Game Notifier</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaBell />,
    onDismount() {
      serverApi.routerHook.removeRoute("/free-games");
    },
  };
});
