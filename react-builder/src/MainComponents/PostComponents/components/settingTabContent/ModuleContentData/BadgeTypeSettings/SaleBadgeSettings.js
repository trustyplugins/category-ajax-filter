import React, { useEffect, useState } from "react";
import { Input, Segmented, Tooltip } from "antd";
import { commitPostModuleSettingsPatch } from "../postLayoutSnapshot";
import {
  BADGE_DEFAULT_TEXT,
  BADGE_TEXT_SOURCE_OPTIONS,
  getBadgeTypeSettings,
  normalizeBadgeTextSource,
} from "../../../woocommerce/badgeTypeOptions";

const SALE_BADGE_TYPE = "sale";

function SaleBadgeSettings(props) {
  const { data, indexes, onSettingChange } = props;
  const { rowindex, columnindex, moduleindex } = indexes || {};
  const modSettings =
    data?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex]?.settings || {};
  const saleSettings = getBadgeTypeSettings(modSettings, SALE_BADGE_TYPE);

  const [textSource, setTextSource] = useState(
    normalizeBadgeTextSource(saleSettings?.text_source),
  );
  const [customText, setCustomText] = useState(
    String(saleSettings?.custom_text ?? "").trim() || BADGE_DEFAULT_TEXT.sale,
  );

  useEffect(() => {
    const nextSaleSettings = getBadgeTypeSettings(modSettings, SALE_BADGE_TYPE);
    setTextSource(normalizeBadgeTextSource(nextSaleSettings?.text_source));
    setCustomText(
      String(nextSaleSettings?.custom_text ?? "").trim() ||
        BADGE_DEFAULT_TEXT.sale,
    );
  }, [data, rowindex, columnindex, moduleindex]);

  const patchSaleSettings = (patchFn) => {
    commitPostModuleSettingsPatch({
      data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange,
      patch: (settings) => {
        const currentBadgeSettings =
          settings.badge_settings && typeof settings.badge_settings === "object"
            ? { ...settings.badge_settings }
            : {};
        const currentSaleSettings =
          currentBadgeSettings[SALE_BADGE_TYPE] &&
          typeof currentBadgeSettings[SALE_BADGE_TYPE] === "object"
            ? { ...currentBadgeSettings[SALE_BADGE_TYPE] }
            : {};

        patchFn(currentSaleSettings);

        settings.badge_settings = {
          ...currentBadgeSettings,
          [SALE_BADGE_TYPE]: currentSaleSettings,
        };
      },
    });
  };

  const handleTextSourceChange = (value) => {
    const nextSource = normalizeBadgeTextSource(value);
    setTextSource(nextSource);
    patchSaleSettings((sale) => {
      sale.text_source = nextSource;
    });
  };

  const handleCustomTextChange = (event) => {
    const value = event.target.value;
    setCustomText(value);
    patchSaleSettings((sale) => {
      sale.custom_text = value;
    });
  };

  const handleCustomTextBlur = (event) => {
    const normalized =
      String(event.target.value ?? "").trim() || BADGE_DEFAULT_TEXT.sale;
    setCustomText(normalized);
    patchSaleSettings((sale) => {
      sale.custom_text = normalized;
    });
  };

  return (
    <div className="setting-manage-f-label">
      <hr className="setting-hr-main"></hr>
      <label className="setting-label-main">Sale Settings</label>
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title="Choose whether to use the default sale label or your own custom text."
        >
          <label>Text Source</label>
        </Tooltip>
        <Segmented
          value={textSource}
          onChange={handleTextSourceChange}
          className="hoverTabCaf"
          options={BADGE_TEXT_SOURCE_OPTIONS}
        />
      </div>
      {textSource === "custom_text" && (
        <div className="module-content-tab-row caf-design-two-half">
          <Tooltip
            classNames={{ root: "caf-builder-tooltip" }}
            placement="topLeft"
            title="Custom label shown on the sale badge."
          >
            <label>Text</label>
          </Tooltip>
          <Input
            value={customText}
            onChange={handleCustomTextChange}
            onBlur={handleCustomTextBlur}
            placeholder={BADGE_DEFAULT_TEXT.sale}
          />
        </div>
      )}
    </div>
  );
}

export default SaleBadgeSettings;
