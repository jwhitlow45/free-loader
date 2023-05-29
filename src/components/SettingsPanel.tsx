import { ButtonItem, PanelSection, PanelSectionRow } from "decky-frontend-lib";
import { ApiProps } from "./FreeLoader";

const SettingsPanel: React.FunctionComponent<ApiProps> = (props) => {
  return (
    <PanelSection title="Settings">
      <PanelSectionRow>
        <ButtonItem layout='bottom' onClick={() => {

        }}>set setting</ButtonItem>
        <ButtonItem layout='bottom' onClick={() => {

        }}>read setting</ButtonItem>
        <ButtonItem layout='bottom' onClick={() => {

        }}>clear setting</ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
}

export { SettingsPanel };