import React, { useState, useRef, useEffect, lazy, Suspense } from "react";
import { Skeleton } from "antd";

const ContentTab = lazy(() => import("./settingTabContent/ContentTab"));
const DesignTab = lazy(() => import("./settingTabContent/DesignTab"));
const AdvancedTab = lazy(() => import("./settingTabContent/AdvancedTab"));
import { cloneFilterLayoutData } from "./settingTabContent/ModuleContentData/filterSettingsSnapshot";
const SettingPopUp = (props) => {
 // console.log(props);
  const [resetState, setResetState] = useState(false);
  const { type, rowindex, columnindex, moduleindex, module } = props.indexes;
  const [activeTab, setActiveTab] = useState(type==='row' || type==='column' ? 'design' : 'content');
  const ref = useRef();
  
useEffect(()=>{
    if(type==='row' || type==='column') {
    setActiveTab("design");
    }
    // else {
    //   setActiveTab("content");
    // }
  if(type==='module'){
      if(props.selectedDevice === "desktop"){
        setActiveTab("content")
      }else{
        setActiveTab("design")
      }
  }
},[type,props.selectedDevice])

// useEffect(()=>{
//   if(type==='module'){
//     if(props.selectedDevice === "desktop"){
//       setActiveTab("content")
//     }else{
//       setActiveTab("design")
//     }
//   }
// },[])

  useEffect(() => {
    let items = [...props.data];
    let item = "";
    let settings = "";
    if (type === "row") {
      item = { ...items[rowindex]["style"]["default"] };
    }
    if (type === "column") {
      item = { ...items[rowindex].data[columnindex]["style"]["default"] };
    }
    if (type === "module") {
      item = {
        ...items[rowindex]?.data[columnindex]?.data[moduleindex]["style"][
          "default"
        ],
      };
      settings = {
        ...items[rowindex]?.data[columnindex]?.data[moduleindex]["settings"],
      };
    }
    ref.current = item;
    ref.currentSettings = settings;
  }, []);

  const cancelPopUp = () => {
    let items = cloneFilterLayoutData(props.data);
    if (type === "row") {
      let item = { ...items[rowindex]["style"]["default"] };
      items[rowindex]["style"]["default"] = ref.current;
      let item2 = items[rowindex];
      item2["settings"] = ref.currentSettings;
      props.closePopup("reset", items);
    }
    if (type ==="column") {
      let item = { ...items[rowindex].data[columnindex] };
      item["style"]["default"] = ref.current;
      let item2 = items[rowindex].data[columnindex];
      item2["settings"] = ref.currentSettings;
      props.closePopup("reset", items);
    }
    if (type === "module") {
      let item = { ...items[rowindex].data[columnindex].data[moduleindex] };
      item["style"]["default"] = ref.current;
      let item2 = items[rowindex].data[columnindex].data[moduleindex];
      item2["settings"] = ref.currentSettings;
      props.closePopup("reset", items);
    }
  };

  const handleSettingTab = (div) => {
    setActiveTab(div);
  };
  const onChangeStyle = (style) => {
    props.onChangeStyle(style);
  };
  const getAdminLabel = (obj,type) => {
  
    if (type === "row") {
     let adminLabel  =  obj?.[rowindex]?.["settings"]?.admin_label?.trim();

      if (adminLabel) {
      return adminLabel;
      }
      else{
      return "Row";
      }
    }
  
    if (type === "column") {
      let adminLabel  =  obj?.[rowindex]?.data?.[columnindex]?.["settings"]?.admin_label?.trim();
      if (adminLabel) {
      return adminLabel;
      }
      else{
      return "Column";
      }
    }
  
    if (type === "module") {
      let adminLabel  =  obj?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex]?.["settings"]?.admin_label?.trim();
      if (adminLabel) {
      return adminLabel;
      }
      else{
      return obj?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex]?.title || "Module";
      }
    }
  
    return "";
  };
  return (
    <div className={`setting-popup-overlay-wrapper animate common-setting-popup`}>
        <div className={`setting-popup ${props?.animation}`}>
        {!props.addSkelton ? (
          <>
          <div className="setting-popup-title-bar">
            {getAdminLabel(props?.data,type)} Settings
          </div>
          <div className="setting-popup-tab-bar">
          {type!=='row' && type!=='column' && props?.selectedDevice === "desktop" &&
          (
            <div
              className={`setting-popup-tab content ${
                activeTab === "content" ? " active" : ""
              }`}
              onClick={() => handleSettingTab("content")}
            >
              Settings
            </div>
            )}
            <div
              className={`setting-popup-tab design${
                activeTab === "design" ? " active" : ""
              }`}
              onClick={() => handleSettingTab("design")}
            >
              Design
            </div>
            <div
              className={`setting-popup-tab advanced${
                activeTab === "advanced" ? " active" : ""
              }`}
              onClick={() => handleSettingTab("advanced")}
            >
              Advanced
            </div>
          </div>
          <div className="setting-popup-tab-content">
            <Suspense fallback={<Skeleton active />}>
              {activeTab === "content" ? (
                <>
                  {type === "module" ? (
                    <ContentTab
                      mainBuilderData={props.mainBuilderData}
                      setSaveLayoutClick={props.setSaveLayoutClick}
                      saveLayoutClick={props.saveLayoutClick}
                      openBuilderSetting={props.openBuilderSetting}
                      data={props.data}
                      indexes={props.indexes}
                      onChangeStyle={onChangeStyle}
                      selectedDevice={props.selectedDevice}
                    />
                  ) : (
                    <DesignTab
                      mainBuilderData={props.mainBuilderData}
                      data={props.data}
                      indexes={props.indexes}
                      onChangeStyle={onChangeStyle}
                      selectedDevice={props.selectedDevice}
                      widgets="1"
                    />
                  )}
                </>
              ) : null}
              {activeTab === "design" ? (
                <DesignTab
                  mainBuilderData={props.mainBuilderData}
                  data={props.data}
                  indexes={props.indexes}
                  onChangeStyle={onChangeStyle}
                  selectedDevice={props.selectedDevice}
                />
              ) : null}
              {activeTab === "advanced" ? (
                <AdvancedTab
                  mainBuilderData={props.mainBuilderData}
                  data={props.data}
                  indexes={props.indexes}
                  onChangeData={onChangeStyle}
                  onChangeStyle={onChangeStyle}
                  deviceSwitch={props.selectedDevice}
                />
              ) : null}
            </Suspense>
          </div>
          </>
        ):(
          <Skeleton active />
        )}
        </div>
    </div>
  );
};

export default SettingPopUp;
