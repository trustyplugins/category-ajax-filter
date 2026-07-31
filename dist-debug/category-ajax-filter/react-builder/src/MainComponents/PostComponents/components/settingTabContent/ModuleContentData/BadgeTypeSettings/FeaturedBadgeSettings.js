import React, { useEffect, useState } from "react";
import { Input, Segmented, Tooltip } from "antd";
import { commitPostModuleSettingsPatch } from "../postLayoutSnapshot";
import {
  BADGE_DEFAULT_TEXT,
  BADGE_TEXT_SOURCE_OPTIONS,
  getBadgeTypeSettings,
  normalizeBadgeTextSource,
} from "../../../woocommerce/badgeTypeOptions";

const FEATURED_BADGE_TYPE = "featured";

function FeaturedBadgeSettings(props) {
  const { data, indexes, onSettingChange } = props;
  const { rowindex, columnindex, moduleindex } = indexes || {};
  const modSettings =
    data?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex]?.settings || {};
  const featuredSettings = getBadgeTypeSettings(
    modSettings,
    FEATURED_BADGE_TYPE,
  );

  const [textSource, setTextSource] = useState(
    normalizeBadgeTextSource(featuredSettings?.text_source),
  );
  const [customText, setCustomText] = useState(
    String(featuredSettings?.custom_text ?? "").trim() ||
      BADGE_DEFAULT_TEXT.featured,
  );

  useEffect(() => {
    const nextFeaturedSettings = getBadgeTypeSettings(
      modSettings,
      FEATURED_BADGE_TYPE,
    );
    setTextSource(normalizeBadgeTextSource(nextFeaturedSettings?.text_source));
    setCustomText(
      String(nextFeaturedSettings?.custom_text ?? "").trim() ||
        BADGE_DEFAULT_TEXT.featured,
    );
  }, [data, rowindex, columnindex, moduleindex]);

  const patchFeaturedSettings = (patchFn) => {
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
        const currentFeaturedSettings =
          currentBadgeSettings[FEATURED_BADGE_TYPE] &&
          typeof currentBadgeSettings[FEATURED_BADGE_TYPE] === "object"
            ? { ...currentBadgeSettings[FEATURED_BADGE_TYPE] }
            : {};

        patchFn(currentFeaturedSettings);

        settings.badge_settings = {
          ...currentBadgeSettings,
          [FEATURED_BADGE_TYPE]: currentFeaturedSettings,
        };
      },
    });
  };

  const handleTextSourceChange = (value) => {
    const nextSource = normalizeBadgeTextSource(value);
    setTextSource(nextSource);
    patchFeaturedSettings((featured) => {
      featured.text_source = nextSource;
    });
  };

  const handleCustomTextChange = (event) => {
    const value = event.target.value;
    setCustomText(value);
    patchFeaturedSettings((featured) => {
      featured.custom_text = value;
    });
  };

  const handleCustomTextBlur = (event) => {
    const normalized =
      String(event.target.value ?? "").trim() || BADGE_DEFAULT_TEXT.featured;
    setCustomText(normalized);
    patchFeaturedSettings((featured) => {
      featured.custom_text = normalized;
    });
  };

  return (
    <div className="setting-manage-f-label">
      <hr className="setting-hr-main"></hr>
      <label className="setting-label-main">Featured Settings</label>
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title="Choose whether to use the default featured label or your own custom text."
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
            title="Custom label shown on the featured badge."
          >
            <label>Text</label>
          </Tooltip>
          <Input
            value={customText}
            onChange={handleCustomTextChange}
            onBlur={handleCustomTextBlur}
            placeholder={BADGE_DEFAULT_TEXT.featured}
          />
        </div>
      )}
    </div>
  );
}

export default FeaturedBadgeSettings;
