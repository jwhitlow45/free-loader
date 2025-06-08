import { ActionsPanel } from "./ActionsPanel"
import { FreeGamesPanel } from "./FreeGamesPanel"

const Sidebar: React.FunctionComponent = () => {
    return (
        <div>
            <ActionsPanel />
            <FreeGamesPanel />
        </div>
    )
}

export { Sidebar }