import React from "react";
import DropdownFilter from "./FilterTypes/DropdownFilter";
import CheckboxFilter from "./FilterTypes/CheckboxFilter";
import RangeSliderFilter from "./FilterTypes/RangeSliderFilter";
import { canUseFilterModule } from "../../../../../tier/capabilities";
import FilterModuleLockedPanel from "./shared/FilterModuleLockedPanel";
const ModuleFilterGeneral = (props) => {
  const { module } = props.indexes;
  const onSettingChange = (data) => {
    props.onSettingChange(data);
  };
  return (
    <>
      {module.key == "checkbox_filter" && (
         <CheckboxFilter
          mainBuilderData={props.mainBuilderData}
          openBuilderSetting={props.openBuilderSetting}
          data={props.data}
          indexes={props.indexes}
          onSettingChange={onSettingChange}
          selectedDevice={props.selectedDevice}
        />
      )}
      {module.key == "range_slider" && (
        canUseFilterModule("range_slider") ? (
        <RangeSliderFilter
          mainBuilderData={props.mainBuilderData}
          openBuilderSetting={props.openBuilderSetting}
          data={props.data}
          indexes={props.indexes}
          onSettingChange={onSettingChange}
          selectedDevice={props.selectedDevice}
        />
        ) : (
          <FilterModuleLockedPanel
            title="Range Slider"
            upgradeMessage="Range Slider is available in Category Ajax Filter Pro."
          />
        )
      )}
      {module.key == "dropdown_filter" && (
         <DropdownFilter
          mainBuilderData={props.mainBuilderData}
          openBuilderSetting={props.openBuilderSetting}
          data={props.data}
          indexes={props.indexes}
          onSettingChange={onSettingChange}
          selectedDevice={props.selectedDevice}
        />
      )}
    </>
  );
};

export default ModuleFilterGeneral;
