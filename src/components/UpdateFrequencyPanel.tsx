import { Field, PanelSection, PanelSectionRow } from "decky-frontend-lib";
import { FrequencyRow } from "./FrequencyRow";

const UpdateFrequencyPanel: React.FunctionComponent = () => {
  return (
    <PanelSection title="Update Frequency">
      <PanelSectionRow>
        <Field
          bottomSeparator="none"
          inlineWrap="keep-inline"
          padding="none"
          spacingBetweenLabelAndChild="none"
          childrenContainerWidth="max"
        >
          <FrequencyRow label='Days' value={0}></FrequencyRow>
          <FrequencyRow label='Hours' value={0}></FrequencyRow>
          <FrequencyRow label='Minutes' value={0}></FrequencyRow>
        </Field>
      </PanelSectionRow>
    </PanelSection>
  );
}

export { UpdateFrequencyPanel };