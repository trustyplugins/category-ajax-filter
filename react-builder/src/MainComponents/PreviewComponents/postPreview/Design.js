import React, { useState, useEffect } from "react";
import Misc from "./design-components/CollapseSets/Misc";
import Post from "./design-components/CollapseSets/Post";
import Filter from "./design-components/CollapseSets/Filter";
import { Tooltip } from "antd";
import {
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";

const Design = (props) => {
  const [deviceType, setDeviceType] = useState(props.deviceType);
  // const handleDeviceType = (type) => {
  //   props.deviceType(type);
  //   setDeviceType(type);
  // };

  useEffect(() => {
    setDeviceType(props.deviceType)
  }, [props.deviceType])

  const upadtedPreviewStyle = (data) => {
    props.updatedBuilderData(data);
  }
  // let styleItems = [
  //   //0:Layout
  //   {
  //     key: "0",
  //     label: "Layout",
  //     children: (
  //       <>
  //         <div className="caf-builder-setting-row-label meta-dropdown-dyn">
  //           <Tabs
  //             activeKey={styleTab}
  //             onChange={(value) => handleSettingChange(value)}
  //             items={subTabItems}
  //             defaultActiveKey={'container'}
  //           />
  //         </div>

  //         <div className="collapse-main-content webflow-sync">
  //           <>
  //             <AlignMain
  //               data={props.data}
  //               indexes={props.indexes}
  //               property="display"
  //               label="Display"
  //               defaultValue="flex"
  //               onChangeStyle={onChangeStyle}
  //               styleState={styleStateAl}
  //               //  styleState={false}
  //               styleTab={(selectedCustomFieldMeta !== "container") ? selectedCustomFieldMeta : ""}
  //               deviceSwitch={props.deviceSwitch}
  //               options={[
  //                 {
  //                   value: "block",
  //                   label: "Block",
  //                 },
  //                 {
  //                   value: "flex",
  //                   label: "Flex",
  //                 },
  //               ]}
  //               isNewTab={true}
  //             />

  //             <div className="webflow-custom-dropdown">
  //               <AlignMain
  //                 data={props.data}
  //                 indexes={props.indexes}
  //                 property="flexFlow"
  //                 label="Direction"
  //                 defaultValue="row"
  //                 onChangeStyle={onChangeStyle}
  //                 styleState={styleStateAl}
  //                 styleTab={(selectedCustomFieldMeta !== "container") ? selectedCustomFieldMeta : ""}
  //                 deviceSwitch={props.deviceSwitch}
  //                 options={[
  //                   {
  //                     value: "row",
  //                     label: (
  //                       <Tooltip title="Horizontal">
  //                         <ArrowRightOutlined />
  //                       </Tooltip>
  //                     ),
  //                   },
  //                   {
  //                     value: "column",
  //                     label: (
  //                       <Tooltip title="Vertical">
  //                         <ArrowDownOutlined />
  //                       </Tooltip>
  //                     ),
  //                   },
  //                 ]}
  //               />
  //               <SelectMain
  //                 data={props.data}
  //                 indexes={props.indexes}
  //                 property="flexFlow"
  //                 label="Direction"
  //                 defaultValue="unset"
  //                 onChangeStyle={onChangeStyle}
  //                 styleState={styleStateAl}
  //                 styleTab={(selectedCustomFieldMeta !== "container") ? selectedCustomFieldMeta : ""}
  //                 //  styleState={false}
  //                 deviceSwitch={props.deviceSwitch}
  //                 class={"flex-direction"}
  //                 hoverValue={hoverValue}
  //                 options={[
  //                   {
  //                     label: <span>Left to right</span>,
  //                     title: "Left to right",
  //                     options: [
  //                       {
  //                         label: (
  //                           <div
  //                             onMouseEnter={() =>
  //                               handleHover(
  //                                 "<div>direction: row</div><div>wrap: wrap</div>"
  //                               )
  //                             }
  //                           >
  //                             <span className="label-text-dir">
  //                               {" "}
  //                               <img
  //                                 src={wrapdownicon}
  //                                 className="wrap-item-icon"
  //                                 alt=""
  //                               />{" "}
  //                               Wrap down
  //                             </span>
  //                           </div>
  //                         ),
  //                         value: "wrap",
  //                       },
  //                       {
  //                         label: (
  //                           <div
  //                             onMouseEnter={() =>
  //                               handleHover(
  //                                 "<div>direction: row</div><div>wrap: wrap-reverse</div>"
  //                               )
  //                             }
  //                           >
  //                             <span className="label-text-dir">
  //                               <img
  //                                 src={wrapupicon}
  //                                 className="wrap-item-icon"
  //                                 alt=""
  //                               />
  //                               Wrap up
  //                             </span>
  //                           </div>
  //                         ),
  //                         value: "wrap-reverse",
  //                       },
  //                     ],
  //                   },
  //                   {
  //                     label: <span>Right to left</span>,
  //                     title: "Right to left",
  //                     options: [
  //                       {
  //                         label: (
  //                           <div
  //                             onMouseEnter={() =>
  //                               handleHover(
  //                                 "<div>direction: row-reverse</div><div>wrap: nowrap</div>"
  //                               )
  //                             }
  //                           >
  //                             <span className="label-text-dir">
  //                               <img
  //                                 src={singlerowicon}
  //                                 className="wrap-item-icon"
  //                                 alt=""
  //                               />
  //                               Single row
  //                             </span>
  //                           </div>
  //                         ),
  //                         value: "row-reverse",
  //                       },
  //                       {
  //                         label: (
  //                           <div
  //                             onMouseEnter={() =>
  //                               handleHover(
  //                                 "<div>direction: row-reverse</div><div>wrap: wrap</div>"
  //                               )
  //                             }
  //                           >
  //                             <span className="label-text-dir">
  //                               <img
  //                                 src={wrapdown2icon}
  //                                 className="wrap-item-icon"
  //                                 alt=""
  //                               />
  //                               Wrap down
  //                             </span>
  //                           </div>
  //                         ),
  //                         value: "row-reverse wrap",
  //                       },
  //                       {
  //                         label: (
  //                           <div
  //                             onMouseEnter={() =>
  //                               handleHover(
  //                                 "<div>direction: row-reverse</div><div>wrap: wrap-reverse</div>"
  //                               )
  //                             }
  //                           >
  //                             <span className="label-text-dir">
  //                               <img
  //                                 src={wrapup2icon}
  //                                 className="wrap-item-icon"
  //                                 alt=""
  //                               />
  //                               Wrap up
  //                             </span>
  //                           </div>
  //                         ),
  //                         value: "row-reverse wrap-reverse",
  //                       },
  //                     ],
  //                   },
  //                   {
  //                     label: <span>Top to bottom</span>,
  //                     title: "Top to bottom",
  //                     options: [
  //                       {
  //                         label: (
  //                           <div
  //                             onMouseEnter={() =>
  //                               handleHover(
  //                                 "<div>direction: column</div><div>wrap: wrap</div>"
  //                               )
  //                             }
  //                           >
  //                             <span className="label-text-dir">
  //                               <img
  //                                 src={wraprighticon}
  //                                 className="wrap-item-icon"
  //                                 alt=""
  //                               />
  //                               Wrap right
  //                             </span>
  //                           </div>
  //                         ),
  //                         value: "column wrap",
  //                       },
  //                       {
  //                         label: (
  //                           <div
  //                             onMouseEnter={() =>
  //                               handleHover(
  //                                 "<div>direction: column</div><div>wrap: wrap-reverse</div>"
  //                               )
  //                             }
  //                           >
  //                             <span className="label-text-dir">
  //                               <img
  //                                 src={wraplefticon}
  //                                 className="wrap-item-icon"
  //                                 alt=""
  //                               />
  //                               Wrap left
  //                             </span>
  //                           </div>
  //                         ),
  //                         value: "column wrap-reverse",
  //                       },
  //                     ],
  //                   },
  //                   {
  //                     label: <span>Bottom to top</span>,
  //                     title: "Bottom to top",
  //                     options: [
  //                       {
  //                         label: (
  //                           <div
  //                             onMouseEnter={() =>
  //                               handleHover(
  //                                 "<div>direction: column-reverse</div><div>wrap: nowrap</div>"
  //                               )
  //                             }
  //                           >
  //                             <span className="label-text-dir">
  //                               <img
  //                                 src={singlecolumnicon}
  //                                 className="wrap-item-icon"
  //                                 alt=""
  //                               />
  //                               Single column
  //                             </span>
  //                           </div>
  //                         ),
  //                         value: "column-reverse",
  //                       },
  //                       {
  //                         label: (
  //                           <div
  //                             onMouseEnter={() =>
  //                               handleHover(
  //                                 "<div>direction: column-reverse</div><div>wrap: wrap</div>"
  //                               )
  //                             }
  //                           >
  //                             <span className="label-text-dir">
  //                               <img
  //                                 src={wrapright2icon}
  //                                 className="wrap-item-icon"
  //                                 alt=""
  //                               />
  //                               Wrap right
  //                             </span>
  //                           </div>
  //                         ),
  //                         value: "column-reverse wrap",
  //                       },
  //                       {
  //                         label: (
  //                           <div
  //                             onMouseEnter={() =>
  //                               handleHover(
  //                                 "<div>direction: column-reverse</div><div>wrap: wrap-reverse</div>"
  //                               )
  //                             }
  //                           >
  //                             <span className="label-text-dir">
  //                               <img
  //                                 src={wrapleft2icon}
  //                                 className="wrap-item-icon"
  //                                 alt=""
  //                               />
  //                               Wrap left
  //                             </span>
  //                           </div>
  //                         ),
  //                         value: "column-reverse wrap-reverse",
  //                       },
  //                     ],
  //                   },
  //                   {
  //                     value: "unset",
  //                     label: "Unset",
  //                   },
  //                 ]}
  //               // tooltip={'Stack children left to right, wrap down'}
  //               />
  //             </div>
  //           </>

  //           <div className="align-flex-flow">
  //             <span class="flex-flow-align-label">Align</span>
  //             <div
  //               className={`flex-align-control ${flexFlow === "column wrap" || flexFlow === "column wrap-reverse"
  //                   ? "caf-reverse-me1"
  //                   : ""
  //                 }`}
  //             >
  //               <SelectMain
  //                 data={props.data}
  //                 indexes={props.indexes}
  //                 property={`${flexFlow === "column wrap" ||
  //                     flexFlow === "column wrap-reverse" ||
  //                     flexFlow === "column-reverse" ||
  //                     flexFlow === "column-reverse wrap" ||
  //                     flexFlow === "column-reverse wrap-reverse"
  //                     ? "alignItems"
  //                     : "justifyContent"
  //                   }`}
  //                 label={"X"}
  //                 defaultValue="flex-start"
  //                 onChangeStyle={onChangeStyle}
  //                 styleState={styleStateAl}
  //                 styleTab={(selectedCustomFieldMeta !== "container") ? selectedCustomFieldMeta : ""}
  //                 deviceSwitch={props.deviceSwitch}
  //                 class={"align-x-flex"}
  //                 options={opt1}
  //               />
  //               <SelectMain
  //                 data={props.data}
  //                 indexes={props.indexes}
  //                 property={`${flexFlow === "column wrap" ||
  //                     flexFlow === "column wrap-reverse" ||
  //                     flexFlow === "column-reverse" ||
  //                     flexFlow === "column-reverse wrap" ||
  //                     flexFlow === "column-reverse wrap-reverse"
  //                     ? "justifyContent"
  //                     : "alignItems"
  //                   }`}
  //                 label={"Y"}
  //                 defaultValue="flex-start"
  //                 onChangeStyle={onChangeStyle}
  //                 styleState={styleStateAl}
  //                 styleTab={(selectedCustomFieldMeta !== "container") ? selectedCustomFieldMeta : ""}
  //                 // styleState={false}
  //                 deviceSwitch={props.deviceSwitch}
  //                 class={"align-y-flex"}
  //                 options={opt2}
  //               />
  //             </div>
  //           </div>
  //           <div className="webflow-slider webflow-gap-slider">
  //             <SliderMain
  //               data={props.data}
  //               indexes={props.indexes}
  //               property="gap"
  //               label="Gap"
  //               defaultSuffix="px"
  //               defaultValue="0"
  //               onChangeStyle={onChangeStyle}
  //               styleState={styleStateAl}
  //               styleTab={(selectedCustomFieldMeta !== "container") ? selectedCustomFieldMeta : ""}
  //               deviceSwitch={props.deviceSwitch}
  //               isSlider={true}
  //             ></SliderMain>
  //           </div>
  //           <AlignMain
  //             data={props.data}
  //             indexes={props.indexes}
  //             property="float"
  //             label="Float"
  //             defaultValue="none"
  //             onChangeStyle={onChangeStyle}
  //             styleState={styleStateAl}
  //             styleTab={(selectedCustomFieldMeta !== "container") ? selectedCustomFieldMeta : ""}
  //             //  styleState={false}
  //             deviceSwitch={props.deviceSwitch}
  //             options={[
  //               {
  //                 value: "none",
  //                 label: "None",
  //               },
  //               {
  //                 value: "left",
  //                 label: "Left",
  //               },
  //               {
  //                 value: "right",
  //                 label: "Right",
  //               },
  //             ]}
  //             isNewTab={true}
  //           />
  //         </div>
  //       </>
  //     ),
  //   },



  // ];
  //console.log(props.selectedTab);
  return (
    <>
      <div className="caf-preview-setting-pop-content">
        {/* <div className="caf-preview-device-type">
          {deviceType === "desktop" && (
            <Tooltip title="Desktop">
              <span
                className={`caf-device-selector ${deviceType === "desktop" && "active"
                  }`}
              //onClick={() => handleDeviceType("desktop")}
              >
                <DesktopOutlined />
              </span>
            </Tooltip>
          )}
          {deviceType === "tablet" && (
            <Tooltip title="Tablet">
              <span
                className={`caf-device-selector ${deviceType === "tablet" && "active"
                  }`}
              //onClick={() => handleDeviceType("tablet")}
              >
                <TabletOutlined />
              </span>
            </Tooltip>
          )}
          {deviceType === "mobile" && (
            <Tooltip title="Mobile">
              <span
                className={`caf-device-selector ${deviceType === "mobile" && "active"
                  }`}
              // onClick={() => handleDeviceType("mobile")}
              >
                <MobileOutlined />
              </span>
            </Tooltip>
          )}
        </div> */}
        <div className="caf-preview-collapse-design">
          {props.selectedTab === "misc-layout" && (
            <Misc
              mainBuilderData={props.mainBuilderData}
              selectedModule={props.selectedModule}
              deviceSwitch={deviceType}
              style="style"
              miscPreviewStyle={upadtedPreviewStyle}
              selectedItemDnd = {props?.selectedItemDnd}
            />
          )}
          {props.selectedTab === "post-layout" && (
            <Post
              mainBuilderData={props.mainBuilderData}
              selectedModule={props.selectedModule}
              deviceSwitch={deviceType}
              style="style"
              postPreviewStyle={upadtedPreviewStyle}
            />
          )}
          {props.selectedTab === "filter-layout" && (
            <Filter
              mainBuilderData={props.mainBuilderData}
              selectedModule={props.selectedModule}
              deviceSwitch={deviceType}
              style="style"
              filterPreviewStyle={upadtedPreviewStyle}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Design;
