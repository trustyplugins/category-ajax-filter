import React, { useState, useEffect } from "react";
import GeneralTab from "./General";
import DesignTab from "./Design";
import AdvancedTab from "./Advanced";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Skeleton } from "antd";
const SettingPopUp = (props) => {
  // console.log(props);
  const [activeTab, setActiveTab] = useState("general");
  const [collapse, setCollapse] = useState(props.popupCollapse);
  const [loading, setLoading] = useState(false);
  const [metaloading, setMetaLoading] = useState(false);
  useEffect(() => {
    setCollapse(props.popupCollapse)
  }, [props.popupCollapse])
  const handleSettingTab = (div) => {
    setActiveTab(div);
  };
  const handleExpand = () => {
    setCollapse((prev) => !prev);
    props.updateCollapse((prev) => !prev);
  };
  useEffect(() => {

    if(props?.selectedTab ==="misc-layout" && props?.selectedItemDnd?.type === 'column'){
      setActiveTab("design");
    }
    else{
      if(props?.selectedTab ==="misc-layout" && props?.selectedItemDnd?.type === 'item'){
        if(props.deviceType ==="desktop"){
          setActiveTab("general");
        }else{
          setActiveTab("design");
        }
      }else{
        setActiveTab("general");
      }
    }

    setMetaLoading(true);
    setTimeout(() => {
      setMetaLoading(false);
    }, 500);

    if (collapse === true) {
      setCollapse(false);
    }
  }, [props?.selectedModule,props?.selectedTab,props?.selectedItemDnd,props?.selectedItemDnd?.type]);
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, [activeTab]);

  useEffect(()=>{
    if(props?.selectedTab ==="misc-layout" && props?.selectedItemDnd?.type === 'column'){
      setActiveTab("design");
    }
    if(props?.selectedTab ==="misc-layout" && props?.selectedItemDnd?.type === 'item'){
      if(props.deviceType ==="desktop"){
        setActiveTab("general");
      }else{
        setActiveTab("design");
      }
    }
    setMetaLoading(true);
    setTimeout(() => {
      setMetaLoading(false);
    }, 500);

    if (collapse === true) {
      setCollapse(false);
    }

  },[props.deviceType ,props?.selectedItemDnd?.itemData?.settings?.is_enable])

  //console.log(props?.selectedTab)
  // console.log(props?.selectedTab ,props?.selectedItemDnd?.type ,activeTab);
  function getPanelTitle(obj) {
    const formatKey = (key = "") =>
      key
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
  
    if (obj?.type === "column" && obj?.columnKey) {
      return formatKey(obj.columnKey);
    }
  
    if (obj?.type === "item" && obj?.itemKey) {
      return formatKey(obj.itemKey);
    }
  
    return "Settings";
  }
  return (
    <div
      className={`setting-popup-overlay-wrapper animate common-setting-popup`}
    >
      <div className={`setting-popup caf-builder-post-preview-setting-popup`}>
        <div className="setting-popup-title-bar">
          <div className="setting-popup-title-bar-label">{props?.selectedTab === "misc-layout" ? getPanelTitle(props?.selectedItemDnd) : "Layout Settings"}</div>
          <span
            onClick={() => handleExpand()}
            className="caf-builder-post-preview-arrow"
          >
            <FontAwesomeIcon
              icon={collapse ? faChevronDown : faChevronUp}
              color="white"
              size="1x"
            />
          </span>
        </div>
        {metaloading ? 
        (<Skeleton /> 
        ):(
        <div
          className="setting-popup caf-builder-post-preview-setting-popup-toggle-main-content"
          style={{ display: !collapse ? "flex" : "none" }}
        >
          <div
            // style={{ display: !collapse ? "flex" : "none" }}
            className="setting-popup-tab-bar"
          >
            {((props?.selectedTab === "misc-layout" && props?.selectedItemDnd?.type === 'item' && props.deviceType === "desktop") || (props?.selectedTab === "post-layout"))  &&(
            <div
              className={`setting-popup-tab general${activeTab === "general" ? " active" : ""
                }`}
              onClick={() => handleSettingTab("general")}
            >
              Settings
            </div>
            )}
            <div
              className={`setting-popup-tab design${activeTab === "design" ? " active" : ""
                }`}
              onClick={() => handleSettingTab("design")}
            >
              Design
            </div>
            <div
              className={`setting-popup-tab advanced${activeTab === "advanced" ? " active" : ""
                }`}
              onClick={() => handleSettingTab("advanced")}
            >
              Advanced
            </div>
          </div>

          <div
            //  style={{ display: !collapse ? "block" : "none" }}
            className={`caf-post-preview-setting-popup-tab-content ${activeTab === "design" ? "design-tab" : activeTab === "advanced" ? "advanced-tab":""}`}
          >
            {!loading ? (
              <>
                {activeTab === "general" ? (
                  <>
                    <GeneralTab
                      mainBuilderData={props.mainBuilderData}
                      updatedBuilderData={props.updatedBuilderData}
                      selectedTab={props.selectedTab}
                      selectedModule={props.selectedModule}
                      deviceType={props.deviceType}
                      selectedItemDnd = {props?.selectedItemDnd}
                    ></GeneralTab>
                  </>
                ) : null}

                {activeTab === "design" ? (
                  <DesignTab
                    mainBuilderData={props.mainBuilderData}
                    updatedBuilderData={props.updatedBuilderData}
                    deviceType={props.deviceType}
                    selectedTab={props.selectedTab}
                    selectedModule={props.selectedModule}
                    selectedItemDnd = {props?.selectedItemDnd}
                  ></DesignTab>
                ) : null}

                {activeTab === "advanced" ? (
                  <AdvancedTab
                    mainBuilderData={props.mainBuilderData}
                    updatedBuilderData={props.updatedBuilderData}
                    selectedTab={props.selectedTab}
                    selectedModule={props.selectedModule}
                    deviceType={props.deviceType}
                    selectedItemDnd = {props?.selectedItemDnd}
                  />
                ) : null}
                
              </>
            ) : (
              <Skeleton />
            )}
          </div>
        </div>
)}
      </div>
    </div>
  );
};

export default SettingPopUp;
