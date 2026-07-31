import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRectangleXmark } from "@fortawesome/free-solid-svg-icons";
import ContentTab from "./settingTabContent/ContentTab";
import DesignTab from "./settingTabContent/DesignTab";
import FilterDesignTab from "../../FilterComponents/components/settingTabContent/DesignTab";
import AdvancedTab from "./settingTabContent/AdvancedTab"; 
import { Skeleton} from "antd";
const SettingPopUp = (props) => {
  // console.log(props);
  const [resetState, setResetState] = useState(false);
  //const {animation}=props;
  const { type, rowindex, columnindex, moduleindex, module } = props.indexes;
  const ref = useRef();

  // useEffect(() => {
  //   let items = [...props.data];
  //   let item = "";
  //   let settings = "";
  //   if (type == "row") {
  //     item = { ...items[rowindex]["style"]["default"] };
  //   }
  //   if (type == "column") {
  //     item = { ...items[rowindex].data[columnindex]["style"]["default"] };
  //   }
  //   if (type == "module") {
  //     item = {
  //       ...items[rowindex]?.data[columnindex]?.data[moduleindex]["style"][
  //         "default"
  //       ],
  //     };
  //     settings = {
  //       ...items[rowindex]?.data[columnindex]?.data[moduleindex]["settings"],
  //     };
  //   }
  //   ref.current = item;
  //   ref.currentSettings = settings;
  // }, []);

  // const cancelPopUp = () => {
  //   let items = [...props.data];
  //   if (type == "row") {
  //     let item = { ...items[rowindex]["style"]["default"] };
  //     items[rowindex]["style"]["default"] = ref.current;
  //     let item2 = items[rowindex];
  //     item2["settings"] = ref.currentSettings;
  //     props.closePopup("reset", items);
  //   }
  //   if (type == "column") {
  //     let item = { ...items[rowindex].data[columnindex] };
  //     item["style"]["default"] = ref.current;
  //     let item2 = items[rowindex].data[columnindex];
  //     item2["settings"] = ref.currentSettings;
  //     props.closePopup("reset", items);
  //   }
  //   if (type == "module") {
  //     let item = { ...items[rowindex].data[columnindex].data[moduleindex] };
  //     item["style"]["default"] = ref.current;
  //     let item2 = items[rowindex].data[columnindex].data[moduleindex];
  //     item2["settings"] = ref.currentSettings;
  //     props.closePopup("reset", items);
  //   }
  // };

  // console.log(type,rowindex,columnindex,moduleindex);
  
  const [activeTab, setActiveTab] = useState(type==='row' || type==='column' ? 'design' : 'content');
  
  const [loading,setLoading]=useState(false);
  const handleSettingTab = (div) => {
    setActiveTab(div);
  };
  const onChangeStyle = (style) => {
    //console.log(style);
    props.onChangeStyle(style);
  };
  const onSettingChange=(data)=> {
    props.onChangeStyle(data);
 }
  useEffect(()=>{
    setLoading(true)
    setTimeout(()=>{
      setLoading(false)
    },500)
  },[activeTab])
  
  useEffect(()=>{
    if(type==='module'){
    if(props.selectedDevice === "desktop"){
      setActiveTab("content")
    }else{
      setActiveTab("design")
    }
    }
  },[props.selectedDevice])

  const getAdminLabel = (obj,type) => {
  
    if (type === "row") {
     let adminLabel  =  obj[rowindex]["settings"]?.admin_label?.trim();

      if (adminLabel) {
      return adminLabel;
      }
      else{
      return "Row";
      }
    }
  
    if (type === "column") {
      let adminLabel  =  obj[rowindex].data[columnindex]["settings"]?.admin_label?.trim();
      if (adminLabel) {
      return adminLabel;
      }
      else{
      return "Column";
      }
    }
  
    if (type === "module") {
      let adminLabel  =  obj[rowindex].data[columnindex].data[moduleindex]["settings"]?.admin_label?.trim();
      if (adminLabel) {
      return adminLabel;
      }
      else{
      return obj[rowindex].data[columnindex].data[moduleindex]?.title || "Module";
      }
    }
  
    return "";
  };
  return (
    <div
      className={`setting-popup-overlay-wrapper animate common-setting-popup`}
    >
      <div className={`setting-popup ${props?.animation}`}>
        {!props.addSkelton ? (
        <>  
        <div className="setting-popup-title-bar">
          {getAdminLabel(props?.data,type)} Settings
          {/* <div className="closeSettingPop" onClick={props.closePopup}>
            <FontAwesomeIcon icon={faRectangleXmark} />
          </div> */}
        </div>
        <div className="setting-popup-tab-bar">
          {type!=='row' && type!=='column' && props?.selectedDevice === "desktop" &&
          (
          <div
            className={`setting-popup-tab content${
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
        {!loading ? (
          <>
          {activeTab === "content" ? (
            <>
            {type === "module"  ?(
            <ContentTab
              data={props.data}
              indexes={props.indexes}
              onChangeStyle={onChangeStyle}
              postPreviewData={props.postData}
              selectedDevice={props.selectedDevice}
              mainBuilderData={props.mainBuilderData}
            ></ContentTab>
            ):(
              <DesignTab
              data={props.data}
              indexes={props.indexes}
              onChangeStyle={onChangeStyle}
              deviceSwitch={props.selectedDevice}
              postPreviewData={props.postData}
              onSettingChange={onSettingChange}
              widgets ="1"
            ></DesignTab>
            )}
            </>
          ) : null}
          {activeTab === "design" ? (
            module?.key === "woo_attribute_swatch" ? (
              <FilterDesignTab
                data={props.data}
                indexes={props.indexes}
                onChangeStyle={onChangeStyle}
                selectedDevice={props.selectedDevice}
              />
            ) : (
            <DesignTab
              data={props.data}
              indexes={props.indexes}
              onChangeStyle={onChangeStyle}
              deviceSwitch={props.selectedDevice}
              postPreviewData={props.postData}
               widgets =""
            ></DesignTab>
            )
          ) : null}
          {activeTab === "advanced" ? (
            <AdvancedTab
              data={props.data}
              indexes={props.indexes}
              onChangeData={onChangeStyle}
              onChangeStyle={onChangeStyle}
              deviceSwitch={props.selectedDevice}
              exportPostType={props.exportPostType}
            ></AdvancedTab>
          ) : null}
          </>
        ):(
          <Skeleton active/>
        )}
        </div>
        {/* <div className="setting-popup-footer">
          <div className="setting-popup-footer-btn cancel" onClick={cancelPopUp}>Cancel</div>
          <div className="setting-popup-footer-btn save" onClick={() => props.closePopup('save')}>Save</div>
        </div> */}
        </>
       ):(
        <Skeleton active/>
      )}
      </div>
    </div>
  );
};

export default SettingPopUp;
