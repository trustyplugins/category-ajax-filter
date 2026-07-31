import React, { useEffect, useState } from "react";
import { Input, Switch, Tooltip } from "antd";
import { commitPostModuleSettingsPatch } from "../postLayoutSnapshot";
import {
  BADGE_STOCK_QUANTITY_THRESHOLD_DEFAULT,
  getBadgeTypeSettings,
  normalizeBadgeStockQuantityThreshold,
  isBadgeSettingEnabled,
} from "../../../woocommerce/badgeTypeOptions";

const STOCK_QUANTITY_BADGE_TYPE = "stock_quantity";

function StockQuantityBadgeSettings(props) {
  const { data, indexes, onSettingChange } = props;
  const { rowindex, columnindex, moduleindex } = indexes || {};
  const modSettings =
    data?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex]?.settings || {};
  const quantitySettings = getBadgeTypeSettings(
    modSettings,
    STOCK_QUANTITY_BADGE_TYPE,
  );

  const [thresholdEnabled, setThresholdEnabled] = useState(
    isBadgeSettingEnabled(quantitySettings?.low_stock_threshold_enable),
  );
  const [showWhenQuantity, setShowWhenQuantity] = useState(
    String(
      normalizeBadgeStockQuantityThreshold(
        quantitySettings?.show_when_quantity,
      ),
    ),
  );

  useEffect(() => {
    const nextSettings = getBadgeTypeSettings(
      modSettings,
      STOCK_QUANTITY_BADGE_TYPE,
    );
    setThresholdEnabled(
      isBadgeSettingEnabled(nextSettings?.low_stock_threshold_enable),
    );
    setShowWhenQuantity(
      String(
        normalizeBadgeStockQuantityThreshold(nextSettings?.show_when_quantity),
      ),
    );
  }, [data, rowindex, columnindex, moduleindex]);

  const patchQuantitySettings = (patchFn) => {
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
        const currentQuantitySettings =
          currentBadgeSettings[STOCK_QUANTITY_BADGE_TYPE] &&
          typeof currentBadgeSettings[STOCK_QUANTITY_BADGE_TYPE] === "object"
            ? { ...currentBadgeSettings[STOCK_QUANTITY_BADGE_TYPE] }
            : {};

        patchFn(currentQuantitySettings);

        settings.badge_settings = {
          ...currentBadgeSettings,
          [STOCK_QUANTITY_BADGE_TYPE]: currentQuantitySettings,
        };
      },
    });
  };

  const handleThresholdEnableChange = (checked) => {
    setThresholdEnabled(checked);
    patchQuantitySettings((quantity) => {
      quantity.low_stock_threshold_enable = checked ? "true" : "false";
      if (
        checked &&
        (quantity.show_when_quantity === undefined ||
          quantity.show_when_quantity === null ||
          quantity.show_when_quantity === "")
      ) {
        quantity.show_when_quantity = BADGE_STOCK_QUANTITY_THRESHOLD_DEFAULT;
      }
    });
  };

  const handleShowWhenQuantityChange = (event) => {
    const value = event.target.value;
    setShowWhenQuantity(value);
    const parsed = Number.parseInt(String(value ?? "").trim(), 10);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return;
    }
    patchQuantitySettings((quantity) => {
      quantity.show_when_quantity = parsed;
    });
  };

  const handleShowWhenQuantityBlur = (event) => {
    const normalized = normalizeBadgeStockQuantityThreshold(event.target.value);
    setShowWhenQuantity(String(normalized));
    patchQuantitySettings((quantity) => {
      quantity.show_when_quantity = normalized;
    });
  };

  return (
    <div className="setting-manage-f-label">
      <hr className="setting-hr-main"></hr>
      <label className="setting-label-main">Low Stock Threshold</label>
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title="Enable to show the quantity badge only when stock is at or below a set amount."
        >
          <label>Enable</label>
        </Tooltip>
        <Switch
          checked={thresholdEnabled}
          onChange={handleThresholdEnableChange}
        />
      </div>
      {thresholdEnabled && (
        <div className="module-content-tab-row caf-design-two-half">
          <Tooltip
            classNames={{ root: "caf-builder-tooltip" }}
            placement="topLeft"
            title="Show this badge only when the product stock quantity is equal to or less than this number. Use Prefix or Suffix for text like “Left” or “Only”."
          >
            <label>Show When Quantity</label>
          </Tooltip>
          <Input
            type="number"
            min={0}
            value={showWhenQuantity}
            onChange={handleShowWhenQuantityChange}
            onBlur={handleShowWhenQuantityBlur}
            placeholder={String(BADGE_STOCK_QUANTITY_THRESHOLD_DEFAULT)}
          />
        </div>
      )}
    </div>
  );
}

export default StockQuantityBadgeSettings;
