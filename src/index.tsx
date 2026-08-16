import { definePlugin, routerHook } from "@decky/api";
import { FC } from "react";
import { FaDollarSign } from "react-icons/fa";
import { UpdateGamesListTimer } from "./components/utils/UpdateGamesListTimer";
import { loadSettings } from "./components/utils/settings";
import { ConfigurationPanels } from "./components/ConfigurationPanels";
import { Sidebar } from "./components/Sidebar";

const FreeLoaderConfigurationRouter: FC = () => {
  return (
    // top and bottom margins account for browser header and footer
    <div style={{ overflowY: 'scroll', marginTop: '40px', marginBottom: '40px', height: 'calc(100% - 80px)' }}>
      <ConfigurationPanels />
    </div>
  );
};

export default definePlugin(() => {
  routerHook.addRoute("/free-loader-configuration", FreeLoaderConfigurationRouter, {
    exact: true,
  });

  // the timer performs an immediate update when one is overdue, so no
  // unconditional update is needed on load
  (async () => {
    let settings = await loadSettings();
    await UpdateGamesListTimer.updateTimer(settings);
  })()

  return {
    // no titleView: the loader's default header renders the name without
    // nesting steam's Title styling twice, which bled into the back button
    name: "Free Loader",
    content: <Sidebar />,
    icon: <FaDollarSign />,
    onDismount() {
      UpdateGamesListTimer.stop();
      routerHook.removeRoute("/free-loader-configuration");
    },
  };
});
