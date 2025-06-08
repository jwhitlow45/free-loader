import {
  definePlugin,
  ServerAPI,
  staticClasses,
} from "decky-frontend-lib";
import { VFC } from "react";
import { FaDollarSign } from "react-icons/fa";
import { PyCaller } from "./PyCaller";
import { UpdateGamesListTimer } from "./components/utils/UpdateGamesListTimer";
import { loadSettings } from "./components/utils/settings";
import { ConfigurationPanels } from "./components/ConfigurationPanels";
import { Sidebar } from "./components/Sidebar";

const FreeLoaderConfigurationRouter: VFC = () => {
  return (
    // top and bottom margins account for browser header and footer
    <div style={{ overflowY: 'scroll', marginTop: '40px', marginBottom: '40px', height: 'calc(100% - 80px)' }}>
      <ConfigurationPanels />
    </div>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  PyCaller.setServer(serverApi);
  serverApi.routerHook.addRoute("/free-loader-configuration", FreeLoaderConfigurationRouter, {
    exact: true,
  });

  (async () => {
    let settings = await loadSettings();
    await UpdateGamesListTimer.updateTimer(settings);
  })()

  PyCaller.updateDealsNow(false);

  return {
    title: <div className={staticClasses.Title}>Free Loader</div>,
    content: <Sidebar />,
    icon: <FaDollarSign />,
    onDismount() {
      serverApi.routerHook.removeRoute("/free-loader-configuration");
    },
  };
});