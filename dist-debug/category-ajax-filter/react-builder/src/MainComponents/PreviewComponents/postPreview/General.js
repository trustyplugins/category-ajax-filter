import React from "react";
import Misc from "./GeneralComponents/Misc";
import Post from "./GeneralComponents/Post";

const General = (props) => {
  const onSettingsChange = (data) => {
    props.updatedBuilderData(data);
  };

  return (
    <div className="caf-post-preview-setting-pop-content general-tab">
      {/* {props.selectedTab == 'post-layout' && (
      <>
      <div class="module-content-tab-row">
        <label>Select Column Layout</label>
        <div className="caf-post-preview-general-column-layout">
          <InputWithIcon
            Icon={DesktopOutlined}
            value={desktopValue}
            onChange={(e) => {
              setDesktopValue(e.target.value);
              handleColLayout("desktop", e.target.value);
            }}
          />
          <InputWithIcon
            Icon={TabletOutlined}
            value={tabletValue}
            onChange={(e) => {
              setTabletValue(e.target.value);
              handleColLayout("tablet", e.target.value);
            }}
          />
          <InputWithIcon
            Icon={MobileOutlined}
            value={mobileValue}
            onChange={(e) => {
              setMobileValue(e.target.value);
              handleColLayout("mobile", e.target.value);
            }}
          />
        </div>
      </div>
      <div class="module-content-tab-row">
        <label>Sorting</label>
        <SelectMain
          property1="sorting_data"
          property2="posts_order_by"
          label="Posts Order By"
          options={[...PostsOrderOptions]}
          updatedBuilderData={props.updatedBuilderData}
          mainBuilder={mainBuilder}
        />
        <SelectMain
          property1="sorting_data"
          property2="post_order_type"
          label="Posts Order Type"
          options={[...PostsOrderTypeOption]}
          updatedBuilderData={props.updatedBuilderData}
          mainBuilder={mainBuilder}
        />
      </div>
      </>
  )} */}
      {props.selectedTab === "misc-layout" && (
        <Misc
          mainBuilderData={props.mainBuilderData}
          onSettingsChange={onSettingsChange}
          selectedTab={props.selectedTab}
          selectedModule={props.selectedModule}
          deviceType={props.deviceType}
          selectedItemDnd = {props?.selectedItemDnd}
        />
      )}
      {props.selectedTab === "post-layout" && (
      <Post 
        mainBuilderData={props.mainBuilderData}
        onSettingsChange={onSettingsChange}
        selectedTab={props.selectedTab}
        selectedModule={props.selectedModule}
        deviceType={props.deviceType}
      />
      )}
    </div>
  );
};

export default General;
