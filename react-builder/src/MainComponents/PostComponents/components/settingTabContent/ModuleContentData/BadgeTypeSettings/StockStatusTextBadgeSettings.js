import React, { useEffect, useState } from "react";
import { Input, Segmented, Select, Tooltip } from "antd";
import { commitPostModuleSettingsPatch } from "../postLayoutSnapshot";
import {
  BADGE_DEFAULT_TEXT,
  BADGE_STOCK_STATUS_DISPLAY_OPTIONS,
  BADGE_TEXT_SOURCE_OPTIONS,
  getBadgeTypeSettings,
  normalizeBadgeStockStatusDisplay,
  normalizeBadgeTextSource,
} from "../../../woocommerce/badgeTypeOptions";
import {
  getFreeformLabelTextForUi,
  normalizeFreeformLabelText,
} from "../shared/freeformLabelTextUtils";

const STOCK_STATUS_BADGE_TYPE = "stock_status_text";

function StockStatusTextBadgeSettings(props) {
  const { data, indexes, onSettingChange } = props;
  const { rowindex, columnindex, moduleindex } = indexes || {};
  const modSettings =
    data?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex]?.settings || {};
  const stockSettings = getBadgeTypeSettings(
    modSettings,
    STOCK_STATUS_BADGE_TYPE,
  );

  const [display, setDisplay] = useState(
    normalizeBadgeStockStatusDisplay(stockSettings?.display),
  );
  const [textSource, setTextSource] = useState(
    normalizeBadgeTextSource(stockSettings?.text_source),
  );
  const [customText, setCustomText] = useState(
    getFreeformLabelTextForUi(
      stockSettings?.custom_text,
      BADGE_DEFAULT_TEXT.stock_status_text,
    ),
  );

  useEffect(() => {
    const nextSettings = getBadgeTypeSettings(
      modSettings,
      STOCK_STATUS_BADGE_TYPE,
    );
    setDisplay(normalizeBadgeStockStatusDisplay(nextSettings?.display));
    setTextSource(normalizeBadgeTextSource(nextSettings?.text_source));
    setCustomText(
      getFreeformLabelTextForUi(
        nextSettings?.custom_text,
        BADGE_DEFAULT_TEXT.stock_status_text,
      ),
    );
  }, [data, rowindex, columnindex, moduleindex]);

  const patchStockSettings = (patchFn) => {
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
        const currentStockSettings =
          currentBadgeSettings[STOCK_STATUS_BADGE_TYPE] &&
          typeof currentBadgeSettings[STOCK_STATUS_BADGE_TYPE] === "object"
            ? { ...currentBadgeSettings[STOCK_STATUS_BADGE_TYPE] }
            : {};

        patchFn(currentStockSettings);

        settings.badge_settings = {
          ...currentBadgeSettings,
          [STOCK_STATUS_BADGE_TYPE]: currentStockSettings,
        };
      },
    });
  };

  const handleDisplayChange = (value) => {
    const nextDisplay = normalizeBadgeStockStatusDisplay(value);
    setDisplay(nextDisplay);
    patchStockSettings((stock) => {
      stock.display = nextDisplay;
    });
  };

  const handleTextSourceChange = (value) => {
    const nextSource = normalizeBadgeTextSource(value);
    setTextSource(nextSource);
    patchStockSettings((stock) => {
      stock.text_source = nextSource;
    });
  };

  const handleCustomTextChange = (event) => {
    const value = event.target.value;
    setCustomText(value);
    patchStockSettings((stock) => {
      stock.custom_text = value;
    });
  };

  const handleCustomTextBlur = (event) => {
    const normalized = normalizeFreeformLabelText(
      event.target.value,
      BADGE_DEFAULT_TEXT.stock_status_text,
    );
    setCustomText(normalized);
    patchStockSettings((stock) => {
      stock.custom_text = normalized;
    });
  };

  return (
    <div className="setting-manage-f-label">
      <hr className="setting-hr-main"></hr>
      <label className="setting-label-main">Stock Status Settings</label>
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title="Choose which stock statuses should show this badge."
        >
          <label>Display</label>
        </Tooltip>
        <Select
          value={display}
          onChange={handleDisplayChange}
          options={BADGE_STOCK_STATUS_DISPLAY_OPTIONS}
          popupMatchSelectWidth={false}
          style={{ width: "100%" }}
        />
      </div>
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title="Choose whether to use the default stock status label or your own custom text."
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
            title="Custom label shown on the stock status badge."
          >
            <label>Text</label>
          </Tooltip>
          <Input
            value={customText}
            onChange={handleCustomTextChange}
            onBlur={handleCustomTextBlur}
            placeholder={BADGE_DEFAULT_TEXT.stock_status_text}
          />
        </div>
      )}
    </div>
  );
}

export default StockStatusTextBadgeSettings;
