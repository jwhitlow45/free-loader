import { Field, PanelSection, PanelSectionRow } from "decky-frontend-lib";
import { FrequencyRow } from "./FrequencyRow";

function UpdateFrequencyPanel() {
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
          <FrequencyRow label='Minutes' value='10'></FrequencyRow>
          <FrequencyRow label='Hours' value='10'></FrequencyRow>
          <FrequencyRow label='Days' value='10'></FrequencyRow>
        </Field>
      </PanelSectionRow>
    </PanelSection>
  );
}

export { UpdateFrequencyPanel };