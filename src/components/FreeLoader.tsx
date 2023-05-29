import { ServerAPI } from "decky-frontend-lib";
import { ActionsPanel } from "./ActionsPanel";
import { SettingsPanel } from "./SettingsPanel";
import { UpdateFrequencyPanel } from "./UpdateFrequencyPanel";

export type ApiProps = {
    serverAPI: ServerAPI;
}

const FreeLoader: React.FunctionComponent<ApiProps> = (props) => {
    return (
        <div>
          <ActionsPanel />
          <UpdateFrequencyPanel serverAPI={props.serverAPI} />
          <SettingsPanel serverAPI={props.serverAPI}/>
        </div>
      );
}

export { FreeLoader };