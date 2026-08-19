import React, { useState } from 'react'
import { Button, Collapse, Col, Row, Switch,Input, message } from "antd";
import SliderMain from "../design-components/common-component/SliderMain";
import SelectMain from "../design-components/common-component/SelectMain";
import { CaretDownOutlined } from "@ant-design/icons";
import InputMain from "../design-components/common-component/InputMain";
import { clonePostLayoutData } from "./ModuleContentData/postLayoutSnapshot";
import { collapseMainContentClass } from "../../../utils/collapseMainContentClass";
import { sanitizeEntityExportPayloadForTier } from "../../../../tier/sanitizeLayoutForTier";
const AdvancedTab = (props) => {
  const { type, rowindex, columnindex, moduleindex, module } = props.indexes;
  const [hoverSwitchPosition, setHoverSwitchPosition] = useState(false);
  const [labelStatus, setLabelStatus] = useState(module.settings?.label?.is_label === "true" ? true : false);
  const [visibility, setVisibility] = useState([]);
  const items = clonePostLayoutData(props.data);
  let item = "";
  if (type == 'row') {
    item = { ...items[rowindex]?.settings };
  }
  if (type == 'column') {
    item = { ...items[rowindex]?.data[columnindex]?.settings };
  }
  if (type == 'module') {
    item = { ...items[rowindex]?.data[columnindex]?.data[moduleindex]?.settings };
  }

  const commitSettings = (updater) => {
    const next = clonePostLayoutData(props.data);
    let target = null;
    if (type === "row") {
      target = next[rowindex];
    } else if (type === "column") {
      target = next[rowindex]?.data?.[columnindex];
    } else if (type === "module") {
      target = next[rowindex]?.data?.[columnindex]?.data?.[moduleindex];
    }
    if (!target) return;
    const nextSettings = { ...(target.settings || {}) };
    updater(nextSettings);
    target.settings = nextSettings;
    props.onChangeData(next);
  };
  const [value, setValue] = useState(item?.custom_class ?? "");
  const [adminLabel, setAdminLabel] = useState(item?.admin_label ?? "");
  const handleChange = (val) => {
    setValue(val);
    commitSettings((s) => {
      s.custom_class = val;
    });
  }
  const handleAdminLabel = (val) => {
    setAdminLabel(val);
    commitSettings((s) => {
      s.admin_label = val;
    });
  }
  const onHoverSwitchPosition = (checked) => {
    setHoverSwitchPosition((checked) => !checked);
  };
  let styleStatePosition = "default";
  if (hoverSwitchPosition) {
    styleStatePosition = "hover";
  }
  const onChangeStyle = (style) => {
    // console.log(style);
    props.onChangeStyle(style);
  };
  const buildAdvancedEntityExportPayload = () => {
    const exportPostType =
      typeof props.exportPostType === "string" ? props.exportPostType.trim() : "";
    const exportMetaBase = {
      version: "1.0.0",
      plugin: "category-ajax-filter-pro",
      exported_at: new Date().toISOString(),
      ...(exportPostType ? { post_type: exportPostType } : {}),
    };

    if (type === "row") {
      const rowData = items?.[rowindex];
      if (!rowData) return null;
      return {
        payload: {
          row_data: clonePostLayoutData(rowData),
          _export_meta: {
            ...exportMetaBase,
            scope: "post_row",
          },
        },
        fileNamePart: "post-row",
        successText: "Row exported successfully.",
      };
    }

    if (type === "column") {
      const columnData = items?.[rowindex]?.data?.[columnindex];
      if (!columnData) return null;
      return {
        payload: {
          column_data: clonePostLayoutData(columnData),
          _export_meta: {
            ...exportMetaBase,
            scope: "post_column",
          },
        },
        fileNamePart: "post-column",
        successText: "Column exported successfully.",
      };
    }

    if (type === "module") {
      const moduleData = items?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex];
      if (!moduleData) return null;
      return {
        payload: {
          module_data: clonePostLayoutData(moduleData),
          _export_meta: {
            ...exportMetaBase,
            scope: "post_module",
            module_key: moduleData?.key || "",
            module_title: moduleData?.title || "",
          },
        },
        fileNamePart: moduleData?.key || "post-module",
        successText: "Module exported successfully.",
      };
    }
    return null;
  };
  const handleEntityExport = () => {
    const exportData = buildAdvancedEntityExportPayload();
    if (!exportData) {
      message.error("Export data is not available.");
      return;
    }
    const tierSafePayload = sanitizeEntityExportPayloadForTier(
      exportData.payload,
      "post"
    );
    if (!tierSafePayload) {
      message.error(
        "Cannot export: this entity only contains Pro-only modules."
      );
      return;
    }
    const blob = new Blob([JSON.stringify(tierSafePayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `caf-${exportData.fileNamePart}-${Date.now()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    message.success(exportData.successText);
  };
  const visibilityUpdate = (checked, device) => {
    const value  = checked === true ? "true" : "false";
      item.visibility[device] = value;
      // Update parent data
      if (type === 'row') {
        items[rowindex]["settings"] = item;
      } else if (type === 'column') {
        items[rowindex].data[columnindex]["settings"] = item;
      } else if (type === 'module') {
        items[rowindex].data[columnindex].data[moduleindex]["settings"] = item;
      }

      // Push update to parent builder
      props.onChangeStyle(items);
      //console.log(items)
  };


  let styleItems = [
    //1:positioning
    {
      key: "1",
      label: "Positioning",
      children: (
        <div className={collapseMainContentClass("positioning")}>
          <SelectMain
            data={props.data}
            indexes={props.indexes}
            onChangeStyle={onChangeStyle}
            property="position"
            defaultValue="relative"
            label="Position"
            styleState={styleStatePosition}
            deviceSwitch={props.deviceSwitch}
            options={[
              {
                value: "static",
                label: "Static",
              },
              {
                value: "relative",
                label: "Relative",
              },
              {
                value: "absolute",
                label: "Absolute",
              },
              {
                value: "inherit",
                label: "Inherit",
              },
            ]}
          />
          <InputMain
            data={props.data}
            indexes={props.indexes}
            onChangeStyle={onChangeStyle}
            property="zIndex"
            defaultValue="999"
            label="Z Index"
            styleState={styleStatePosition}
            deviceSwitch={props.deviceSwitch}
          />
          <div className='caf-position-spacing-look'>
          <Row>
            <Col span={12}>
              <SliderMain
                data={props.data}
                indexes={props.indexes}
                property="top"
                label="Top"
                defaultSuffix="px"
                defaultValue="0"
                styleState={styleStatePosition}
                onChangeStyle={onChangeStyle}
                extraClass="colm2"
                deviceSwitch={props.deviceSwitch}
              />
            </Col>
            <Col span={12}>
              <SliderMain
                data={props.data}
                indexes={props.indexes}
                property="right"
                label="Right"
                defaultSuffix="px"
                defaultValue="0"
                styleState={styleStatePosition}
                onChangeStyle={onChangeStyle}
                extraClass="colm2"
                deviceSwitch={props.deviceSwitch}
              />
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <SliderMain
                data={props.data}
                indexes={props.indexes}
                property="bottom"
                label="Bottom"
                defaultSuffix="px"
                defaultValue="0"
                styleState={styleStatePosition}
                onChangeStyle={onChangeStyle}
                extraClass="colm2"
                deviceSwitch={props.deviceSwitch}
              />
            </Col>
            <Col span={12}>
              <SliderMain
                data={props.data}
                indexes={props.indexes}
                property="left"
                label="Left"
                defaultSuffix="px"
                defaultValue="0"
                styleState={styleStatePosition}
                onChangeStyle={onChangeStyle}
                extraClass="colm2"
                deviceSwitch={props.deviceSwitch}
              />
            </Col>
          </Row>
          </div>
          <SelectMain
            data={props.data}
            indexes={props.indexes}
            onChangeStyle={onChangeStyle}
            property="overflow"
            defaultValue="inherit"
            label="Overflow"
            styleState={styleStatePosition}
            deviceSwitch={props.deviceSwitch}
            options={[
              {
                value: "auto",
                label: "Auto",
              },
              {
                value: "clip",
                label: "Clip",
              },
              {
                value: "hidden",
                label: "Hidden",
              },
              {
                value: "overlay",
                label: "Overlay",
              },
              {
                value: "scroll",
                label: "Scroll",
              },
              {
                value: "visible",
                label: "Visible",
              },
              {
                value: "inherit",
                label: "Inherit",
              },
              {
                value: "inherit",
                label: "Inherit",
              },
            ]}
          />
        </div>
      ),
    },
    {
      key: "2",
      label: "Visibility",
      children: (
        <div className={collapseMainContentClass("visibility")}>
          <div className='caf-builder-setting-row-label'>
            <label>Disable on</label>
            <div className='caf-builder-disable-on-control'>
              <div className='module-content-tab-row caf-design-two-half'>
                <label>Phone </label>
                <Switch
                  //defaultChecked={false}
                  onChange={(checked) => visibilityUpdate(checked, 'mobile')}
                  checked={item?.visibility?.mobile === "true" ? true : false}
                />
              </div>
              <div className='module-content-tab-row caf-design-two-half'>
                <label>Tablet </label>
                <Switch
                 // defaultChecked={false}
                  onChange={(checked) => visibilityUpdate(checked, 'tablet')}
                  checked={item?.visibility?.tablet === "true" ? true : false}
                />
              </div>
              <div className='module-content-tab-row caf-design-two-half'>
                <label>Desktop </label>
                <Switch
                  //defaultChecked={false}
                  onChange={(checked) => visibilityUpdate(checked, 'desktop')}
                  checked={item?.visibility?.desktop === "true" ? true : false}
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "3",
      label: "Custom Class",
      children: (
        <div className={collapseMainContentClass("custom-class")}>
          <div className='caf-builder-setting-row-label'>
            <label>Add Custom Class</label>
            <Input onChange={(e) => handleChange(e.target.value)} value={value} placeholder='Add Custom Class' />
          </div>
        </div>
      ),
    },
    {
      key: "4",
      label: "Admin label",
      children: (
        <div className={collapseMainContentClass("admin-label")}>
          <div className='caf-builder-setting-row-label'>
            <label>Add Admin Label</label>
            <Input onChange={(e) => handleAdminLabel(e.target.value)} value={adminLabel} placeholder='Add Admin Label' />
          </div>
        </div>
      ),
    },

  ];
  if (type === "module" || type === "row" || type === "column") {
    const exportLabel =
      type === "module"
        ? "Export current module"
        : type === "column"
        ? "Export current column"
        : "Export current row";
    const exportButtonText =
      type === "module"
        ? "Export Module JSON"
        : type === "column"
        ? "Export Column JSON"
        : "Export Row JSON";

    styleItems.push({
      key: "export",
      label: "Export",
      children: (
        <div className={collapseMainContentClass("export")}>
          <div className='caf-builder-setting-row-label'>
            <label>{exportLabel}</label>
            <Button type="primary" onClick={handleEntityExport}>
              {exportButtonText}
            </Button>
          </div>
        </div>
      ),
    });
  }
  return (
    <div className="row-design-tab-data">
      <Collapse
        //defaultActiveKey={["1"]}
        expandIconPlacement="end"
        accordion={true}
        expandIcon={({ isActive }) => (
          <CaretDownOutlined rotate={isActive ? 180 : 0} />
        )}
        items={
          (() => {
            return styleItems;
          })()
        }
      />

    </div>

  )
}

export default AdvancedTab