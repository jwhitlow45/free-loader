import { definePlugin, routerHook } from "@decky/api";
import { FC, useRef } from "react";
import { FaDollarSign } from "react-icons/fa";
import { UpdateGamesListTimer } from "./components/utils/UpdateGamesListTimer";
import { loadSettings } from "./components/utils/settings";
import { ConfigurationPanels } from "./components/ConfigurationPanels";
import { Sidebar } from "./components/Sidebar";

// focused rows closer than this to the top of the page snap the scroll all
// the way up so the first section header is revealed as well
const SNAP_TO_TOP_THRESHOLD_PX = 150;

const FreeLoaderConfigurationRouter: FC = () => {
  const scrollContainer = useRef<HTMLDivElement>(null);
  return (
    // top and bottom margins account for browser header and footer, scroll
    // padding keeps focused rows clear of both when steam scrolls to them
    <div
      ref={scrollContainer}
      style={{ overflowY: 'scroll', marginTop: '40px', marginBottom: '40px', height: 'calc(100% - 80px)', scrollPaddingTop: '48px', scrollPaddingBottom: '48px' }}
      onFocusCapture={(event) => {
        const container = scrollContainer.current;
        const target = event.target;
        if (!container || !(target instanceof HTMLElement)) {
          return;
        }
        // steam's focus driven scrolling only reveals the focused row, which
        // leaves the section header above the topmost rows clipped under the
        // steam top bar; snap fully to the top after steam's own scrolling
        window.requestAnimationFrame(() => {
          const offsetInContent =
            target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
          if (offsetInContent < SNAP_TO_TOP_THRESHOLD_PX && container.scrollTop > 0) {
            container.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
      }}
    >
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
