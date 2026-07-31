import React, { useState, useEffect } from "react";
import InputMain from "./GeneralComponents/CommonComponents/InputMain";
import Post from "./design-components/CollapseSets/Post";
import Misc from "./design-components/CollapseSets/Misc";
import { resolvePreviewTemplateDataFromBuilderData } from "../../utils/builderDataAdapters";
const Advanced = (props) => {
  const previewTemplateData = resolvePreviewTemplateDataFromBuilderData(
    props.mainBuilderData
  );
  let filterPreviewData = previewTemplateData?.filter_preview_data;

  const [deviceType, setDeviceType] = useState(props.deviceType);

  useEffect(() => {
    setDeviceType(props.deviceType);
  }, [props.deviceType]);
  const commitPreviewPatch = (mutator) => {
    const nextBuilder = structuredClone(props.mainBuilderData || {});
    if (!nextBuilder.common_data) {
      nextBuilder.common_data = {};
    }
    if (!nextBuilder.common_data.preview_template_data) {
      nextBuilder.common_data.preview_template_data = {};
    }
    if (!nextBuilder.common_data.preview_template_data.filter_preview_data) {
      nextBuilder.common_data.preview_template_data.filter_preview_data = {};
    }
    mutator(nextBuilder.common_data.preview_template_data.filter_preview_data);
    props.updatedBuilderData(nextBuilder);
  };

  const onChangeFilterData = (data) => {
    commitPreviewPatch((filterPreview) => {
      Object.assign(filterPreview, data || {});
    });
  };
   const upadtedPreviewStyle = (data) => {
    props.updatedBuilderData(data);
  }
  return (
    <div className="caf-preview-setting-pop-advanced-tab-content-main advanced">
      {props.selectedTab === "misc-layout" && (
        <div className="caf-preview-setting-pop-content misc">
          {/* <InputMain
            onChangeData={onChangeMiscData}
            defaultValue=""
            data={miscPreviewData?.[props.selectedModule]}
            property="custom_class"
            label="Add Custom Class"
            type="text"
          /> */}
        <Misc 
          mainBuilderData={props.mainBuilderData}
          selectedModule={props.selectedModule}
          deviceSwitch={deviceType}
          style="style"
          miscPreviewStyle={upadtedPreviewStyle}
          tab = "advanced"
          selectedItemDnd = {props?.selectedItemDnd}
        />
        </div>
      )}
      
      {props.selectedTab === "post-layout" && (
       <div className="caf-preview-setting-pop-content">
        <Post
          mainBuilderData={props.mainBuilderData}
          selectedModule={props.selectedModule}
          deviceSwitch={deviceType}
          style="style"
          postPreviewStyle={upadtedPreviewStyle}
          tab = "advanced"
        />
        </div>
      )}
      {props.selectedTab === "filter-layout" && (
        <div className="caf-preview-setting-pop-content filter-lt">
          <InputMain
            onChangeData={onChangeFilterData}
            defaultValue=""
            data={filterPreviewData}
            property="custom_class"
            label="Add Custom Class"
            type="text"
          />
        </div>
      )}
    </div>
  );
};

export default Advanced;
