import React from "react";
import { Tabs as AntTabs, Segmented } from "antd";
import ColorMain from "../design-components/common-component/ColorMain";
import BorderMain from "../design-components/common-component/BorderMain";
import BoxShadow from "../design-components/common-component/BoxShadow";
import ContentImage from "./ModuleContentData/ContentComponents/ContentImage";
import { collapseMainContentClass } from "../../../utils/collapseMainContentClass";

const Tabs = (props) => (
  <AntTabs
    {...props}
    items={Array.isArray(props.items) ? props.items.filter(Boolean) : props.items}
  />
);

/**
 * Collapse items keys "5" (Background), "7" (Border), "8" (Box Shadow) for post DesignTab.
 */
export function buildPostDesignTabStyleItemsPart3(ctx) {
  const {
    props,
    module,
    item,
    modulesKeysArray,
    selectedSubTab,
    handleSettingChange,
    subTabCommonItems,
    onChangeStyle,
    type,
    bgType,
    handleBgType,
    styleStateBg,
    hoverSwitchBg,
    onHoverSwitchBg,
    styleStateBr,
    hoverSwitchBr,
    onHoverSwitchBr,
    styleStateBs,
    hoverSwitchBs,
    onHoverSwitchBs,
  } = ctx;

  return [
    //5:Background
    {
      key: "5",
      label: "Background",
      children: (
        <>
        {modulesKeysArray.includes(module?.key) && (item?.prefix?.is_enable ==="true" || item?.suffix?.is_enable ==="true")  &&
        <div className="caf-builder-setting-row-label meta-dropdown-dyn">
          <Tabs
            activeKey={selectedSubTab}
            onChange={(value) => handleSettingChange(value)}
            items={subTabCommonItems}
            defaultActiveKey={selectedSubTab}
          />
        </div>
        }
        {module?.key ==="categories" &&(
            <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              activeKey={selectedSubTab}
              onChange={(value) => handleSettingChange(value)}
              items={[
                {
                key: "container",
                label: "Main",
              },
              {
                key: "meta",
                label: "Item",
              }
              ]}
              defaultActiveKey={selectedSubTab}
            />
          </div>
          )}
        {( 
      <div className={collapseMainContentClass("background")}>
        {type === "row" || type === "column" ?(
          <>
          <div className="hoverswitchguard">
          <Segmented
            value={bgType}
            style={{ marginBottom: 8 }}
            onChange={handleBgType}
            className={"hoverTabCaf"}
            options={[
              { label: "Color", value: "color" },
              { label: "Image", value: 'image' },
              { label: "Post Image", value: 'post_image' },
            ]}
          />
        </div>
        {bgType === "color" &&
        <ColorMain
          data={props.data}
          indexes={props.indexes}
          property="backgroundColor"
          defaultValue="#333333"
          label="Background Color"
          onChangeStyle={onChangeStyle}
          styleState={styleStateBg}
          deviceSwitch={props.deviceSwitch}
          styleTab={(selectedSubTab !== "container") ? selectedSubTab:""}
        />
        }
        {(bgType === "image" || bgType === "post_image")  &&
          <ContentImage
            data={props.data}
            indexes={props.indexes}
            postPreviewData={props.postPreviewData}
            label="Background Image"
            type="background-image"
            onChangeStyle={onChangeStyle}
            styleState={styleStateBg}
            deviceSwitch={props.deviceSwitch}
            bgType={bgType}
          ></ContentImage>
        }
        </>
        ):(
        <div className="hoverswitchguard">
          <Segmented
            value={hoverSwitchBg}
            style={{ marginBottom: 8 }}
            onChange={onHoverSwitchBg}
            className={"hoverTabCaf"}
            options={[
              { label: "Default", value: false },
              { label: "Hover", value: true },
            ]}
          />
        </div>
        )}
        {type === "module" &&
        <ColorMain
          data={props.data}
          indexes={props.indexes}
          property="backgroundColor"
          defaultValue="#333333"
          label="Background Color"
          onChangeStyle={onChangeStyle}
          styleState={styleStateBg}
          deviceSwitch={props.deviceSwitch}
          styleTab={(selectedSubTab !== "container") ? selectedSubTab:""}
        />
        }
        {/* {type != "module" && ( // hide bg image option for module
          <ContentImage
            data={props.data}
            indexes={props.indexes}
            label="Background Image"
            type="background-image"
            onChangeStyle={onChangeStyle}
            styleState={styleStateBg}
            deviceSwitch={props.deviceSwitch}
          ></ContentImage>
        )} */}
      </div>
          )}
        </>
      ),
    },
    //7:Border
    {
      key: "7",
      label: "Border",
      children: (
        <>
        {modulesKeysArray.includes(module?.key) && (item?.prefix?.is_enable ==="true" || item?.suffix?.is_enable ==="true")  &&
        <div className="caf-builder-setting-row-label meta-dropdown-dyn">
          <Tabs
            activeKey={selectedSubTab}
            onChange={(value) => handleSettingChange(value)}
            items={subTabCommonItems}
            defaultActiveKey={selectedSubTab}
          />
        </div>
        }  
        {module?.key ==="categories" &&(
            <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              activeKey={selectedSubTab}
              onChange={(value) => handleSettingChange(value)}
              items={[
                {
                key: "container",
                label: "Main",
              },
              {
                key: "meta",
                label: "Item",
              }
              ]}
              defaultActiveKey={selectedSubTab}
            />
          </div>
          )}
        {( 
        <div className={collapseMainContentClass("border")}>
          <div className="hoverswitchguard">
            <Segmented
              value={hoverSwitchBr}
              style={{ marginBottom: 8 }}
              onChange={onHoverSwitchBr}
              className={"hoverTabCaf"}
              options={[
                { label: "Default", value: false },
                { label: "Hover", value: true },
              ]}
            />
          </div>
          <BorderMain
            data={props.data}
            indexes={props.indexes}
            property="border"
            label="Border"
            onChangeStyle={onChangeStyle}
            styleState={styleStateBr}
            deviceSwitch={props.deviceSwitch}
            styleTab={(selectedSubTab !== "container") ? selectedSubTab:""}
          ></BorderMain>
        </div>
            )}
        </>
      ),
    },
    //8:Box Shadow
    {
      key: "8",
      label: "Box Shadow",
      children: (
        <>
        {modulesKeysArray.includes(module?.key) && (item?.prefix?.is_enable ==="true" || item?.suffix?.is_enable ==="true")  &&
        <div className="caf-builder-setting-row-label meta-dropdown-dyn">
          <Tabs
            activeKey={selectedSubTab}
            onChange={(value) => handleSettingChange(value)}
            items={subTabCommonItems}
            defaultActiveKey={selectedSubTab}
          />
        </div>
        }
        {module?.key ==="categories" &&(
            <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              activeKey={selectedSubTab}
              onChange={(value) => handleSettingChange(value)}
              items={[
                {
                key: "container",
                label: "Main",
              },
              {
                key: "meta",
                label: "Item",
              }
              ]}
              defaultActiveKey={selectedSubTab}
            />
          </div>
          )}
          {( 
        <div className={collapseMainContentClass("box-shadow")}>
          <div className="hoverswitchguard">
            <Segmented
              value={hoverSwitchBs}
              style={{ marginBottom: 8 }}
              onChange={onHoverSwitchBs}
              className={"hoverTabCaf"}
              options={[
                { label: "Default", value: false },
                { label: "Hover", value: true },
              ]}
            />
          </div>
          <BoxShadow
            data={props.data}
            indexes={props.indexes}
            property="boxShadow"
            label="Box Shadow"
            onChangeStyle={onChangeStyle}
            styleState={styleStateBs}
            deviceSwitch={props.deviceSwitch}
            styleTab={(selectedSubTab !== "container") ? selectedSubTab:""}
          ></BoxShadow>
        </div>
            )}
        </>
      ),
    },
  ];
}
