import { ActionsPanel } from "./ActionsPanel";
import { SettingsPanel } from "./SettingsPanel";
import { UpdateFrequencyPanel } from "./UpdateFrequencyPanel";

const FreeLoader: React.FunctionComponent = () => {
    return (
        <div>
          <ActionsPanel />
          <UpdateFrequencyPanel />
          <SettingsPanel />
        </div>
      );
}

export { FreeLoader };