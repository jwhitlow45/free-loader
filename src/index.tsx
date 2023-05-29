import {
  definePlugin,
  DialogButton,
  Router,
  ServerAPI,
  staticClasses,
} from "decky-frontend-lib";
import { VFC } from "react";
import { FaBell } from "react-icons/fa";
import { FreeLoader } from "./components/FreeLoader";
import { PyCaller } from "./PyCaller";

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
  PyCaller.setServer(serverApi);
  serverApi.routerHook.addRoute("/free-games", FreeGamesRouter, {
    exact: true,
  });
  
  serverApi.callPluginMethod('settings_toggle_notify_forever_games', {});

  return {
    title: <div className={staticClasses.Title}>Free Loader</div>,
    content: <FreeLoader />,
    icon: <FaBell />,
    onDismount() {
      serverApi.routerHook.removeRoute("/free-games");
    },
  };
});
