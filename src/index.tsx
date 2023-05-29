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
    title: <div className={staticClasses.Title}>Free Loader</div>,
    content: <FreeLoader serverAPI={serverApi} />,
    icon: <FaBell />,
    onDismount() {
      serverApi.routerHook.removeRoute("/free-games");
    },
  };
});
