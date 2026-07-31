import React from "react";
import { Select, Space } from "antd";
import ModuleFilterGeneral from "./ModuleContentData/ModuleFilterGeneral";
import ModuleSearchGenerals from "./ModuleContentData/ModuleSearchGenerals";
import ModuleResetGeneral from "./ModuleContentData/ModuleResetGeneral";
import ModuleCustomTextFilterGeneral from "./ModuleContentData/ModuleCustomTextFilterGeneral";
import WooFilterSettings from "./ModuleContentData/WooFilterSettings";
import { isWooFilterModuleKey } from "../woocommerce/wooFilterModuleTemplates";
const ContentTab = (props) => {
  //console.log(props);
  const { type, rowindex, columnindex, moduleindex, module } = props.indexes;
   //console.log(type);
  const handleChange = (value) => {
    //console.log(`selected ${value}`);
  };
  const onSettingChange = (data) => {
    props.onChangeStyle(data);
  };

  return (
    <div className="setting-pop-content caf-filter">
      {type === "row" ? (
        <div className="rowdata">
          <div className="caf-builder-setting-row-label">
            Row Data
          </div>
        </div>
      ) : (
        ""
      )}

      {type === "column" ? <div className="columndata">Column Data</div> : ""}

      {type === "module" ? (
        <div className="moduledata">
          {module.key === "checkbox_filter" || module.key === "range_slider" ? (
            <ModuleFilterGeneral
              mainBuilderData={props.mainBuilderData}
              openBuilderSetting={props.openBuilderSetting}
              data={props.data}
              indexes={props.indexes}
              onSettingChange={onSettingChange}
              selectedDevice={props.selectedDevice}
            ></ModuleFilterGeneral>
          ) : module.key === "dropdown_filter" ? (
            <ModuleFilterGeneral
              mainBuilderData={props.mainBuilderData}
              openBuilderSetting={props.openBuilderSetting}
              data={props.data}
              indexes={props.indexes}
              onSettingChange={onSettingChange}
              selectedDevice={props.selectedDevice}
            ></ModuleFilterGeneral>
          ) : module.key === "search" ? (
            <ModuleSearchGenerals
              mainBuilderData={props.mainBuilderData}
              data={props.data}
              indexes={props.indexes}
              onSettingChange={onSettingChange}
              selectedDevice={props.selectedDevice}
            ></ModuleSearchGenerals>
          ) : module.key === "reset" ? (
            <ModuleResetGeneral
              mainBuilderData={props.mainBuilderData}
              data={props.data}
              indexes={props.indexes}
              onSettingChange={onSettingChange}
              selectedDevice={props.selectedDevice}
            />
          ) : module.key === "customtext" ? (
            <ModuleCustomTextFilterGeneral
              data={props.data}
              indexes={props.indexes}
              onSettingChange={onSettingChange}
              selectedDevice={props.selectedDevice}
            />
          ) : isWooFilterModuleKey(module.key) ? (
            <WooFilterSettings
              data={props.data}
              indexes={props.indexes}
              onSettingChange={onSettingChange}
              selectedDevice={props.selectedDevice}
            />
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default ContentTab;
