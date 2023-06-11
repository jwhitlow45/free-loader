import { ActionsPanel } from "./ActionsPanel";
import { SettingsPanel } from "./SettingsPanels";

const FreeLoader: React.FunctionComponent = () => {
  return (
    <div>
      <ActionsPanel />
      <SettingsPanel />
    </div>
  );
}

export { FreeLoader };