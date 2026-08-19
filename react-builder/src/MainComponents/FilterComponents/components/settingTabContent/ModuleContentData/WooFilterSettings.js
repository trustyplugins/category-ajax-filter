import React, { useEffect, useState } from "react";
import { Input, Switch, Tooltip } from "antd";
import { canUseFeature } from "../../../../../tier/capabilities";
import FilterModuleLockedPanel from "./shared/FilterModuleLockedPanel";
import SwitchMain from "./ContentComponents/SwitchMain";
import SelectMain from "./ContentComponents/SelectMain";
import ContentIcons1 from "./ContentComponents/ContentIcons1";
import {
  FilterLabelShowIconLockedSection,
  FilterLabelCollapseLockedSection,
  canUseLabelShowIcon,
  canUseFilterLabelCollapse,
  applyFilterLabelCollapseTierToSettings,
  resolveFilterLabelCollapseToggleState,
} from "./shared/filterModuleTier";
import {
  commitFilterModuleReplaceSettings,
  commitFilterModuleSettingsPatch,
} from "./filterSettingsSnapshot";
import {
  RATING_COMPARE_OPTIONS,
  RATING_DISPLAY_PICKER,
  RATING_DISPLAY_STARS,
  WOO_RATING_STAR_COUNT_DEFAULT,
  WOO_RATING_STAR_COUNT_MAX,
  WOO_RATING_STAR_COUNT_MIN,
  applyWooRatingDisplayStyleDefaults,
  clampWooRatingStarCount,
  getRatingCompare,
  getRatingDefaultValue,
  getWooRatingStarCount,
  isRatingDisplayPicker,
  isWooFilterModuleKey,
  normalizeRatingCompare,
  normalizeRatingDefaultValue,
} from "../../woocommerce/wooFilterModuleTemplates";

const WooFilterSettings = ({ data, indexes, onSettingChange, selectedDevice }) => {
  const { rowindex, columnindex, moduleindex, module } = indexes;
  const moduleKey = module?.key || "";

  if (moduleKey === "woo_rating_filter" && !canUseFeature("woo_rating_filter")) {
    return (
      <FilterModuleLockedPanel
        title="Star Rating Filter"
        upgradeMessage="Star rating filter is available in Category Ajax Filter Pro."
      />
    );
  }

  if (!isWooFilterModuleKey(moduleKey)) {
    return null;
  }

  const settingData =
    data?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex]?.settings || {};

  const [checkLabel, setCheckLabel] = useState(
    settingData?.label?.is_label === "false" ? false : true
  );
  const [labelInput, setLabelInput] = useState(settingData?.label?.value || "Star rating");
  const [labelIconSwitch, setLabelIconSwitch] = useState(
    canUseLabelShowIcon() ? Boolean(settingData?.label?.icons?.visibility) : false
  );
  const [toggle, setToggle] = useState(() =>
    resolveFilterLabelCollapseToggleState(settingData)
  );
  const [iconsArray, setIconsArray] = useState(null);
  const starCount = getWooRatingStarCount(settingData);

  useEffect(() => {
    setCheckLabel(settingData?.label?.is_label === "false" ? false : true);
    setLabelInput(settingData?.label?.value || "Star rating");
    setLabelIconSwitch(
      canUseLabelShowIcon() ? Boolean(settingData?.label?.icons?.visibility) : false
    );
    setToggle(resolveFilterLabelCollapseToggleState(settingData));
  }, [
    settingData?.label?.is_label,
    settingData?.label?.value,
    settingData?.label?.icons?.visibility,
    settingData?.enable_toggle,
    settingData?.close_toggle,
  ]);

  useEffect(() => {
    const path_url = tc_caf_ajax?.plugin_path;
    if (!path_url) return;
    fetch(`${path_url}admin/fa-icons/fontawesome-5.json`)
      .then((res) => res.json())
      .then((json) => setIconsArray(json))
      .catch(() => setIconsArray(null));
  }, []);

  const commitSettings = (nextSettings) => {
    commitFilterModuleReplaceSettings({
      data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType: "product",
      onSettingChange,
      nextSettings: applyFilterLabelCollapseTierToSettings(nextSettings),
    });
  };

  const changeInitialData = (next) => {
    const nextSettings = applyFilterLabelCollapseTierToSettings({ ...next });
    setCheckLabel(nextSettings?.label?.is_label === "false" ? false : true);
    setToggle(resolveFilterLabelCollapseToggleState(nextSettings));
    if (nextSettings?.label?.is_label === "false") {
      nextSettings.enable_toggle = "false";
      nextSettings.close_toggle = "false";
    }
    commitSettings(nextSettings);
  };

  const handleLabel = (value) => {
    setLabelInput(value);
    commitFilterModuleSettingsPatch({
      data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType: "product",
      onSettingChange,
      patch: (s) => {
        if (!s.label || typeof s.label !== "object") {
          s.label = { is_label: "true", value: "", icons: {} };
        }
        s.label.value = value;
      },
    });
  };

  const onLabelIconSwitch = (checked) => {
    if (!canUseLabelShowIcon()) return;
    setLabelIconSwitch(checked);
    commitFilterModuleSettingsPatch({
      data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType: "product",
      onSettingChange,
      patch: (s) => {
        if (!s.label || typeof s.label !== "object") {
          s.label = { is_label: "true", value: "Star rating", icons: {} };
        }
        const icons = { ...(s.label.icons || {}) };
        if (checked === false) {
          icons.icon = "";
          icons.type = "icon";
          icons.position = "before-label";
        }
        icons.visibility = checked;
        s.label.icons = icons;
      },
    });
  };

  const handleStarCountChange = (value) => {
    const nextCount = clampWooRatingStarCount(
      value === null || value === undefined || value === ""
        ? WOO_RATING_STAR_COUNT_DEFAULT
        : value
    );
    changeInitialData({
      ...settingData,
      star_count: String(nextCount),
      default_value: normalizeRatingDefaultValue(
        settingData?.default_value,
        nextCount
      ),
    });
  };

  const handleDefaultValueChange = (value) => {
    changeInitialData({
      ...settingData,
      default_value: normalizeRatingDefaultValue(value, starCount),
    });
  };

  const isStarPicker = isRatingDisplayPicker(settingData);
  const ratingCompare = getRatingCompare(settingData);
  const defaultValue = getRatingDefaultValue(settingData);

  const handleDisplayAsChange = (next) => {
    const mode = String(next?.rating_display || RATING_DISPLAY_STARS);
    const isPicker = mode === RATING_DISPLAY_PICKER;
    const patched = applyFilterLabelCollapseTierToSettings({
      ...settingData,
      ...next,
      rating_display: isPicker ? RATING_DISPLAY_PICKER : RATING_DISPLAY_STARS,
      show_checkbox: "false",
      star_count: String(getWooRatingStarCount(settingData)),
      ...(isPicker ? { multiple_term: "false" } : {}),
    });

    // Only sync Items Container direction — do not reapply checkbox layout styles.
    const freshItems = JSON.parse(JSON.stringify(data || []));
    const moduleRef =
      freshItems?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex];
    if (!moduleRef || typeof onSettingChange !== "function") {
      return;
    }

    if (patched?.label?.is_label === "false") {
      patched.enable_toggle = "false";
      patched.close_toggle = "false";
    }
    setCheckLabel(patched?.label?.is_label === "false" ? false : true);
    setToggle(resolveFilterLabelCollapseToggleState(patched));
    moduleRef.settings = patched;

    if (!moduleRef.style) {
      moduleRef.style = {};
    }
    applyWooRatingDisplayStyleDefaults(
      moduleRef.style,
      isPicker ? RATING_DISPLAY_PICKER : RATING_DISPLAY_STARS
    );

    onSettingChange(freshItems);
  };

  return (
    <div className="module-content-tab-row no-pad-0">
      <div className="module-content-tab-row no-pad-0">
        <label className="setting-label-main">Star Settings</label>
        <SelectMain
          label="Display As"
          property="rating_display"
          classn="caf-design-two-half"
          options={[
            { value: RATING_DISPLAY_STARS, label: "Stars List" },
            { value: RATING_DISPLAY_PICKER, label: "Star Picker" },
          ]}
          onSettingChange={handleDisplayAsChange}
          data={{
            ...settingData,
            rating_display: isStarPicker ? RATING_DISPLAY_PICKER : RATING_DISPLAY_STARS,
          }}
        />
        <div className="module-content-tab-row caf-design-two-half">
          <Tooltip
            classNames={{ root: "caf-builder-tooltip" }}
            placement="topLeft"
            title={`Maximum stars to display (${WOO_RATING_STAR_COUNT_MIN}–${WOO_RATING_STAR_COUNT_MAX}).`}
          >
            <label>Max Stars</label>
          </Tooltip>
          <Input
            type="number"
            min={WOO_RATING_STAR_COUNT_MIN}
            max={WOO_RATING_STAR_COUNT_MAX}
            value={starCount}
            onChange={(e) => handleStarCountChange(e.target.value)}
          />
        </div>
        <SelectMain
          label="Operator"
          property="rating_compare"
          classn="caf-design-two-half"
          options={RATING_COMPARE_OPTIONS}
          onSettingChange={(next) =>
            changeInitialData({
              ...settingData,
              ...next,
              rating_compare: normalizeRatingCompare(next?.rating_compare),
            })
          }
          data={{
            ...settingData,
            rating_compare: ratingCompare,
          }}
          labelTooltip="How the selected rating is compared against product average ratings."
        />
        <div className="module-content-tab-row caf-design-two-half">
          <Tooltip
            classNames={{ root: "caf-builder-tooltip" }}
            placement="topLeft"
            title={`Optional. Leave empty for no default. Allowed range: 1–${starCount}.`}
          >
            <label>Default</label>
          </Tooltip>
          <Input
            type="number"
            min={1}
            max={starCount}
            value={defaultValue}
            onChange={(e) => handleDefaultValueChange(e.target.value)}
            placeholder="None"
          />
        </div>
        <hr className="setting-hr-main" />
      </div>

      {!isStarPicker && (
        <div className="module-content-tab-row no-pad-0">
          <label className="setting-label-main">Allow Multiple Selection</label>
          <div className="module-content-tab-row caf-design-two-half">
            <SwitchMain
              label="Enable"
              property="multiple_term"
              onSettingChange={changeInitialData}
              data={settingData}
              currValue={settingData?.multiple_term ?? "false"}
              labelTooltip="When enabled, the highest selected rating is used as the comparison threshold."
            />
          </div>
          <hr className="setting-hr-main" />
        </div>
      )}

      <div className="module-content-tab-row no-pad-0">
        <label className="setting-label-main">Filter Label</label>
        <div className="module-content-tab-row caf-design-two-half">
          <SwitchMain
            label="Enable"
            property="label"
            property2="is_label"
            onSettingChange={changeInitialData}
            data={settingData}
            currValue={settingData?.label?.is_label ?? "true"}
          />
        </div>
        {checkLabel && (
          <>
            <div className="caf-filter-label-inner-row">
              <div className="module-content-tab-row caf-design-two-half">
                <Tooltip
                  classNames={{ root: "caf-builder-tooltip" }}
                  placement="topLeft"
                  title="Set filter label text."
                >
                  <label>Label Text</label>
                </Tooltip>
                <Input
                  onChange={(e) => handleLabel(e.target.value)}
                  value={labelInput}
                />
              </div>
              {iconsArray && (
                <FilterLabelShowIconLockedSection className="module-content-tab-row caf-builder-show-label-icon">
                  <div className="module-content-tab-row caf-builder-show-label-icon">
                    <div className="module-content-tab-row caf-design-two-half">
                      <Tooltip
                        classNames={{ root: "caf-builder-tooltip" }}
                        placement="topLeft"
                        title="Enable label icon settings."
                      >
                        <label>Show Icon</label>
                      </Tooltip>
                      <div className="module-content-icon-switch">
                        <Switch
                          onChange={onLabelIconSwitch}
                          checked={canUseLabelShowIcon() ? labelIconSwitch : false}
                          disabled={!canUseLabelShowIcon()}
                        />
                      </div>
                    </div>
                    {canUseLabelShowIcon() && labelIconSwitch && (
                      <ContentIcons1
                        title="Icons"
                        data={data}
                        indexes={indexes}
                        iconsArray={iconsArray}
                        onSettingChange={onSettingChange}
                        tab="label"
                        type=""
                      />
                    )}
                  </div>
                </FilterLabelShowIconLockedSection>
              )}
            </div>
            <FilterLabelCollapseLockedSection>
              <div className="module-content-tab-row caf-design-two-half">
                <SwitchMain
                  label="Enable Collapse"
                  property="enable_toggle"
                  onSettingChange={changeInitialData}
                  data={settingData}
                  currValue={
                    canUseFilterLabelCollapse()
                      ? settingData?.enable_toggle
                      : "false"
                  }
                />
              </div>
              {canUseFilterLabelCollapse() && toggle.enable && (
                <>
                  <SelectMain
                    label="Toggle Icon Position"
                    property="toggle_position"
                    classn="caf-design-two-half"
                    options={[
                      { label: "Left", value: "left" },
                      { label: "Right", value: "right" },
                    ]}
                    onSettingChange={changeInitialData}
                    data={settingData}
                  />
                  <div className="module-content-tab-row caf-design-two-half">
                    <SwitchMain
                      label="Default Collapsed"
                      property="close_toggle"
                      onSettingChange={changeInitialData}
                      data={settingData}
                      currValue={settingData?.close_toggle}
                    />
                  </div>
                </>
              )}
            </FilterLabelCollapseLockedSection>
          </>
        )}
      </div>
    </div>
  );
};

export default WooFilterSettings;
