import React from "react";
import { Tabs as AntTabs, Segmented, Row, Skeleton } from "antd";
import SliderMain from "../design-components/common-component/SliderMain";
import ContentIcons from "./ModuleContentData/ContentComponents/ContentIcons";
import { PostModuleIconLockedSection } from "./ModuleContentData/shared/postModuleTier";
import PostModuleIconProPanel from "./ModuleContentData/PostModuleIconProPanel";
import { collapseMainContentClass } from "../../../utils/collapseMainContentClass";

const Tabs = (props) => (
  <AntTabs
    {...props}
    items={Array.isArray(props.items) ? props.items.filter(Boolean) : props.items}
  />
);

/**
 * Collapse items keys "3" (Spacing), "4" (Icons) for post DesignTab.
 */
export function buildPostDesignTabStyleItemsPart2(ctx) {
  const {
    props,
    module,
    item,
    modulesKeysArray,
    selectedSubTab,
    handleSettingChange,
    subTabCommonItems,
    onChangeStyle,
    styleStateSpacing,
    hoverSwitchSpacing,
    onHoverSwitchSpacing,
    isMarginVerticalJoint,
    toggleMarginVerticalJoint,
    isMarginHorizontalJoint,
    toggleMarginHorizontalJoint,
    isPaddingVerticalJoint,
    togglePaddingVerticalJoint,
    isPaddingHorizontalJoint,
    togglePaddingHorizontalJoint,
    iconsArray,
  } = ctx;

  return [
    //3:Spacing
    {
      key: "3",
      label: "Spacing",
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
        <div className={collapseMainContentClass("spacing")}>
          <div className="hoverswitchguard">
            <Segmented
              value={hoverSwitchSpacing}
              style={{ marginBottom: 8 }}
              onChange={onHoverSwitchSpacing}
              className={"hoverTabCaf"}
              options={[
                { label: "Default", value: false },
                { label: "Hover", value: true },
              ]}
            />
          </div>
          <span className="label-span-spacing">Margin</span>
          <div className="caf-spacing-look">
            <Row>
              <SliderMain
                data={props.data}
                indexes={props.indexes}
                property="marginTop"
                label="Top"
                defaultSuffix="px"
                defaultValue="0"
                onChangeStyle={onChangeStyle}
                extraClass="colm2"
                styleState={styleStateSpacing}
                deviceSwitch={props.deviceSwitch}
                labelBottom={true}
                isSpacingJoint={isMarginVerticalJoint}
                styleTab={(selectedSubTab !== "container") ? selectedSubTab:""}
              />
              <SliderMain
                data={props.data}
                indexes={props.indexes}
                property="marginBottom"
                label="Bottom"
                defaultSuffix="px"
                defaultValue="0"
                onChangeStyle={onChangeStyle}
                extraClass="colm2"
                styleState={styleStateSpacing}
                deviceSwitch={props.deviceSwitch}
                labelBottom={true}
                isSpacingJoint={isMarginVerticalJoint}
                styleTab={(selectedSubTab !== "container") ? selectedSubTab:""}
              />
              <div
                className={`spacing-joint ${
                  isMarginVerticalJoint ? "active" : ""
                }`}
                onClick={toggleMarginVerticalJoint}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z"
                    fill="#383A3D"
                  />
                </svg>
              </div>
            </Row>
            <Row>
              <SliderMain
                data={props.data}
                indexes={props.indexes}
                property="marginLeft"
                label="Left"
                defaultSuffix="px"
                defaultValue="0"
                onChangeStyle={onChangeStyle}
                extraClass="colm2"
                styleState={styleStateSpacing}
                deviceSwitch={props.deviceSwitch}
                labelBottom={true}
                isSpacingJoint={isMarginHorizontalJoint}
                styleTab={(selectedSubTab !== "container") ? selectedSubTab:""}
              />
              <SliderMain
                data={props.data}
                indexes={props.indexes}
                property="marginRight"
                label="Right"
                defaultSuffix="px"
                defaultValue="0"
                onChangeStyle={onChangeStyle}
                extraClass="colm2"
                styleState={styleStateSpacing}
                deviceSwitch={props.deviceSwitch}
                labelBottom={true}
                isSpacingJoint={isMarginHorizontalJoint}
                styleTab={(selectedSubTab !== "container") ? selectedSubTab:""}
              />
              <div
                className={`spacing-joint ${
                  isMarginHorizontalJoint ? "active" : ""
                }`}
                onClick={toggleMarginHorizontalJoint}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z"
                    fill="#383A3D"
                  />
                </svg>
              </div>
            </Row>
          </div>

          <span className="label-span-spacing">Padding</span>
          <div className="caf-spacing-look">
            <Row className="without-border">
              <SliderMain
                data={props.data}
                indexes={props.indexes}
                property="paddingTop"
                label="Top"
                defaultSuffix="px"
                defaultValue="10"
                onChangeStyle={onChangeStyle}
                extraClass="colm2"
                styleState={styleStateSpacing}
                deviceSwitch={props.deviceSwitch}
                labelBottom={true}
                isSpacingJoint={isPaddingVerticalJoint}
                styleTab={(selectedSubTab !== "container") ? selectedSubTab:""}
              />
              <SliderMain
                data={props.data}
                indexes={props.indexes}
                property="paddingBottom"
                label="Bottom"
                defaultSuffix="px"
                defaultValue="10"
                onChangeStyle={onChangeStyle}
                extraClass="colm2"
                styleState={styleStateSpacing}
                deviceSwitch={props.deviceSwitch}
                labelBottom={true}
                isSpacingJoint={isPaddingVerticalJoint}
                styleTab={(selectedSubTab !== "container") ? selectedSubTab:""}
              />
              <div
                className={`spacing-joint ${
                  isPaddingVerticalJoint ? "active" : ""
                }`}
                onClick={togglePaddingVerticalJoint}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z"
                    fill="#383A3D"
                  />
                </svg>
              </div>
            </Row>
            <Row>
              <SliderMain
                data={props.data}
                indexes={props.indexes}
                property="paddingLeft"
                label="Left"
                defaultSuffix="px"
                defaultValue="10"
                onChangeStyle={onChangeStyle}
                extraClass="colm2"
                styleState={styleStateSpacing}
                deviceSwitch={props.deviceSwitch}
                labelBottom={true}
                isSpacingJoint={isPaddingHorizontalJoint}
                styleTab={(selectedSubTab !== "container") ? selectedSubTab:""}
              />
              <SliderMain
                data={props.data}
                indexes={props.indexes}
                property="paddingRight"
                label="Right"
                defaultSuffix="px"
                defaultValue="10"
                onChangeStyle={onChangeStyle}
                extraClass="colm2"
                styleState={styleStateSpacing}
                deviceSwitch={props.deviceSwitch}
                labelBottom={true}
                isSpacingJoint={isPaddingHorizontalJoint}
                styleTab={(selectedSubTab !== "container") ? selectedSubTab:""}
              />
              <div
                className={`spacing-joint ${
                  isPaddingHorizontalJoint ? "active" : ""
                }`}
                onClick={togglePaddingHorizontalJoint}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z"
                    fill="#383A3D"
                  />
                </svg>
              </div>
            </Row>
          </div>
        </div>
      )}
        </>
      ),
    },
    //4:icons
    {
      key: "4",
      label: "Icons",
      children: (
        <PostModuleIconLockedSection>
          <PostModuleIconProPanel
            className={collapseMainContentClass("icons")}
            module={module}
            data={props.data}
            indexes={props.indexes}
            iconsArray={iconsArray}
            onSettingChange={onChangeStyle}
          />
        </PostModuleIconLockedSection>
      ),
    },
  ];
}
