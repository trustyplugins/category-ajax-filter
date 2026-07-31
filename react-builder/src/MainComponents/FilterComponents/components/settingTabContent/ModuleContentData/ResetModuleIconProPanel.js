import React, { useEffect, useState } from "react";
import { Switch, Tooltip } from "antd";
import apiClient from "../../../../../api/client";
import ContentIcons1 from "./ContentComponents/ContentIcons1";
import { commitFilterModuleSettingsPatch } from "./filterSettingsSnapshot";
import {
  FILTER_RESET_DEFAULT_ICON,
  isEmptyIconValue,
} from "../../../filterModuleDefaults";

export default function ResetModuleIconProPanel(props) {
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const settings =
    props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings || {};
  const [enabled, setEnabled] = useState(settings?.icons?.visibility ?? false);
  const [icons, setIcons] = useState("");

  useEffect(() => {
    apiClient
      .get(`${tc_caf_ajax.plugin_path}admin/fa-icons/fontawesome-5.json`)
      .then((response) => setIcons(response.data || ""))
      .catch((error) => console.error("Error ", error));
  }, []);

  const onChange = (checked) => {
    setEnabled(checked);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (nextSettings) => {
        const nextIcons = { ...(nextSettings.icons || {}), visibility: checked };
        if (checked && isEmptyIconValue(nextIcons.icon)) {
          nextIcons.icon = FILTER_RESET_DEFAULT_ICON;
          nextIcons.type = nextIcons.type || "icon";
        }
        nextSettings.icons = nextIcons;
      },
    });
  };

  return (
    <div className="module-content-tab-row caf-pad-20">
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title="Enable or disable reset icon."
        >
          <label>Show Icon</label>
        </Tooltip>
        <Switch onChange={onChange} checked={enabled} />
      </div>
      {enabled && (
        <div className="module-content-tab-row caf-pad-10">
          {icons ? (
            <ContentIcons1
              title="Icons"
              data={props.data}
              indexes={props.indexes}
              iconsArray={icons}
              onSettingChange={props.onSettingChange}
              tab="reset_icon"
              type=""
            />
          ) : (
            <div className="caf-reset-icon-locked-placeholder">
              <i className="fas fa-undo" aria-hidden="true" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
