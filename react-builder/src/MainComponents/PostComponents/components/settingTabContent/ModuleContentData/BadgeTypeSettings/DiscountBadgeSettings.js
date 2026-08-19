import React, { useEffect, useState } from "react";
import { Segmented, Tooltip } from "antd";
import { commitPostModuleSettingsPatch } from "../postLayoutSnapshot";
import {
  BADGE_DISCOUNT_TYPE_OPTIONS,
  getBadgeTypeSettings,
  normalizeBadgeDiscountType,
} from "../../../woocommerce/badgeTypeOptions";

const DISCOUNT_BADGE_TYPE = "discount";

function DiscountBadgeSettings(props) {
  const { data, indexes, onSettingChange } = props;
  const { rowindex, columnindex, moduleindex } = indexes || {};
  const modSettings =
    data?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex]?.settings || {};
  const discountSettings = getBadgeTypeSettings(
    modSettings,
    DISCOUNT_BADGE_TYPE,
  );

  const [discountType, setDiscountType] = useState(
    normalizeBadgeDiscountType(discountSettings?.discount_type),
  );

  useEffect(() => {
    const nextSettings = getBadgeTypeSettings(
      modSettings,
      DISCOUNT_BADGE_TYPE,
    );
    setDiscountType(normalizeBadgeDiscountType(nextSettings?.discount_type));
  }, [data, rowindex, columnindex, moduleindex]);

  const patchDiscountSettings = (patchFn) => {
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
        const currentDiscountSettings =
          currentBadgeSettings[DISCOUNT_BADGE_TYPE] &&
          typeof currentBadgeSettings[DISCOUNT_BADGE_TYPE] === "object"
            ? { ...currentBadgeSettings[DISCOUNT_BADGE_TYPE] }
            : {};

        patchFn(currentDiscountSettings);

        settings.badge_settings = {
          ...currentBadgeSettings,
          [DISCOUNT_BADGE_TYPE]: currentDiscountSettings,
        };
      },
    });
  };

  const handleDiscountTypeChange = (value) => {
    const nextType = normalizeBadgeDiscountType(value);
    setDiscountType(nextType);
    patchDiscountSettings((discount) => {
      discount.discount_type = nextType;
    });
  };

  return (
    <div className="setting-manage-f-label">
      <hr className="setting-hr-main"></hr>
      <label className="setting-label-main">Discount Settings</label>
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title="Show the discount as a percentage (e.g. 20%) or as a saved amount (e.g. $5). Only products with a sale price lower than the regular price will display this badge. Use Suffix for labels like “Off”."
        >
          <label>Type</label>
        </Tooltip>
        <Segmented
          value={discountType}
          onChange={handleDiscountTypeChange}
          className="hoverTabCaf"
          options={BADGE_DISCOUNT_TYPE_OPTIONS}
        />
      </div>
    </div>
  );
}

export default DiscountBadgeSettings;
