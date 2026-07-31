import React, { useEffect, useState } from "react";
import { Input, Segmented, Tooltip } from "antd";
import { commitPostModuleSettingsPatch } from "../postLayoutSnapshot";
import {
  BADGE_BEST_SELLER_MIN_SALE_DEFAULT,
  BADGE_BEST_SELLER_MIN_SALE_MODE_OPTIONS,
  BADGE_DEFAULT_TEXT,
  BADGE_TEXT_SOURCE_OPTIONS,
  getBadgeTypeSettings,
  normalizeBadgeBestSellerMinSale,
  normalizeBadgeBestSellerMinSaleMode,
  normalizeBadgeTextSource,
} from "../../../woocommerce/badgeTypeOptions";

const BEST_SELLER_BADGE_TYPE = "best_seller";

function BestSellerBadgeSettings(props) {
  const { data, indexes, onSettingChange } = props;
  const { rowindex, columnindex, moduleindex } = indexes || {};
  const modSettings =
    data?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex]?.settings || {};
  const bestSellerSettings = getBadgeTypeSettings(
    modSettings,
    BEST_SELLER_BADGE_TYPE,
  );

  const [textSource, setTextSource] = useState(
    normalizeBadgeTextSource(bestSellerSettings?.text_source),
  );
  const [customText, setCustomText] = useState(
    String(bestSellerSettings?.custom_text ?? "").trim() ||
      BADGE_DEFAULT_TEXT.best_seller,
  );
  const [minSaleMode, setMinSaleMode] = useState(
    normalizeBadgeBestSellerMinSaleMode(bestSellerSettings?.min_sale),
  );
  const [minSaleCount, setMinSaleCount] = useState(
    String(normalizeBadgeBestSellerMinSale(bestSellerSettings?.min_sale_count)),
  );

  useEffect(() => {
    const nextSettings = getBadgeTypeSettings(
      modSettings,
      BEST_SELLER_BADGE_TYPE,
    );
    setTextSource(normalizeBadgeTextSource(nextSettings?.text_source));
    setCustomText(
      String(nextSettings?.custom_text ?? "").trim() ||
        BADGE_DEFAULT_TEXT.best_seller,
    );
    setMinSaleMode(normalizeBadgeBestSellerMinSaleMode(nextSettings?.min_sale));
    setMinSaleCount(
      String(normalizeBadgeBestSellerMinSale(nextSettings?.min_sale_count)),
    );
  }, [data, rowindex, columnindex, moduleindex]);

  const patchBestSellerSettings = (patchFn) => {
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
        const currentBestSellerSettings =
          currentBadgeSettings[BEST_SELLER_BADGE_TYPE] &&
          typeof currentBadgeSettings[BEST_SELLER_BADGE_TYPE] === "object"
            ? { ...currentBadgeSettings[BEST_SELLER_BADGE_TYPE] }
            : {};

        patchFn(currentBestSellerSettings);

        settings.badge_settings = {
          ...currentBadgeSettings,
          [BEST_SELLER_BADGE_TYPE]: currentBestSellerSettings,
        };
      },
    });
  };

  const handleTextSourceChange = (value) => {
    const nextSource = normalizeBadgeTextSource(value);
    setTextSource(nextSource);
    patchBestSellerSettings((bestSeller) => {
      bestSeller.text_source = nextSource;
    });
  };

  const handleCustomTextChange = (event) => {
    const value = event.target.value;
    setCustomText(value);
    patchBestSellerSettings((bestSeller) => {
      bestSeller.custom_text = value;
    });
  };

  const handleCustomTextBlur = (event) => {
    const normalized =
      String(event.target.value ?? "").trim() ||
      BADGE_DEFAULT_TEXT.best_seller;
    setCustomText(normalized);
    patchBestSellerSettings((bestSeller) => {
      bestSeller.custom_text = normalized;
    });
  };

  const handleMinSaleModeChange = (value) => {
    const nextMode = normalizeBadgeBestSellerMinSaleMode(value);
    setMinSaleMode(nextMode);
    patchBestSellerSettings((bestSeller) => {
      bestSeller.min_sale = nextMode;
      if (
        nextMode === "custom" &&
        (bestSeller.min_sale_count === undefined ||
          bestSeller.min_sale_count === null ||
          bestSeller.min_sale_count === "")
      ) {
        bestSeller.min_sale_count = BADGE_BEST_SELLER_MIN_SALE_DEFAULT;
      }
    });
  };

  const handleMinSaleCountChange = (event) => {
    const value = event.target.value;
    setMinSaleCount(value);
    const parsed = Number.parseInt(String(value ?? "").trim(), 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
      return;
    }
    patchBestSellerSettings((bestSeller) => {
      bestSeller.min_sale_count = parsed;
    });
  };

  const handleMinSaleCountBlur = (event) => {
    const normalized = normalizeBadgeBestSellerMinSale(event.target.value);
    setMinSaleCount(String(normalized));
    patchBestSellerSettings((bestSeller) => {
      bestSeller.min_sale_count = normalized;
    });
  };

  return (
    <div className="setting-manage-f-label">
      <hr className="setting-hr-main"></hr>
      <label className="setting-label-main">Best Seller Settings</label>
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title="Choose whether to use the default best seller label or your own custom text."
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
            title="Custom label shown on the best seller badge."
          >
            <label>Text</label>
          </Tooltip>
          <Input
            value={customText}
            onChange={handleCustomTextChange}
            onBlur={handleCustomTextBlur}
            placeholder={BADGE_DEFAULT_TEXT.best_seller}
          />
        </div>
      )}
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title="Default shows the badge when the product has at least 1 sale. Custom lets you set a higher minimum sales count."
        >
          <label>Min Sale</label>
        </Tooltip>
        <Segmented
          value={minSaleMode}
          onChange={handleMinSaleModeChange}
          className="hoverTabCaf"
          options={BADGE_BEST_SELLER_MIN_SALE_MODE_OPTIONS}
        />
      </div>
      {minSaleMode === "custom" && (
        <div className="module-content-tab-row caf-design-two-half">
          <Tooltip
            classNames={{ root: "caf-builder-tooltip" }}
            placement="topLeft"
            title="Show this badge only when the product total sales are equal to or greater than this number."
          >
            <label>Min Sale Count</label>
          </Tooltip>
          <Input
            type="number"
            min={1}
            value={minSaleCount}
            onChange={handleMinSaleCountChange}
            onBlur={handleMinSaleCountBlur}
            placeholder={String(BADGE_BEST_SELLER_MIN_SALE_DEFAULT)}
          />
        </div>
      )}
    </div>
  );
}

export default BestSellerBadgeSettings;
