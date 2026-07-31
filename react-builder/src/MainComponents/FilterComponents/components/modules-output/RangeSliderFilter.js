import React, { useEffect, useMemo, useRef, useState } from "react";
import { generateFilterCSS, generateFilterLabelCSS, generateFilterLabelInnerCSS } from "../../../utils/functions";
import { resolvePreviewTemplateDataFromBuilderData } from "../../../utils/builderDataAdapters";
import {
  computeHasValidRangeSliderCustomDefaults,
  previewRangeSliderResetMatchesModule,
  syncPreviewSelectedTags,
} from "../../../PreviewComponents/postPreview/previewRangeSliderTagUtils";
import { decodeHtmlEntities } from "../woocommerce/wooPriceSlider";
import { resolveRangeSliderSettingsForOutput } from "../settingTabContent/ModuleContentData/shared/filterModuleTier";

/** Keep only background-related declarations from merged meta2 CSS (active fill uses track styles). */
function filterMeta2TrackBackgroundCss(css) {
  if (!css || typeof css !== "string") return "";
  const rules = css
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((rule) => {
      const prop = (rule.split(":")[0] || "").trim().toLowerCase();
      return prop === "background" || prop.startsWith("background-");
    });
  return rules.length ? `${rules.join("; ")}; ` : "";
}

const RangeSliderFilter = ({
  settings: rawSettings,
  styleDefault,
  module,
  rowindex,
  columnindex,
  moduleindex,
  selectedDevice,
  setIndexes,
  indexes,
  mainBuilderData
}) => {
  const settings = useMemo(
    () => resolveRangeSliderSettingsForOutput(rawSettings) || rawSettings,
    [rawSettings]
  );
  const sliderRef = useRef(null);
  const [value, setValue] = useState([0, 100]);
  const [enableToggle, setEnableToggle] = useState(settings?.enable_toggle);
  const [closeToggle, setCloseToggle] = useState(settings?.close_toggle);

  const min = useMemo(() => Number(settings?.range_slider?.min ?? 0), [settings?.range_slider?.min]);
  const max = useMemo(() => Number(settings?.range_slider?.max ?? 100), [settings?.range_slider?.max]);
  const step = useMemo(() => Number(settings?.range_slider?.step ?? 1), [settings?.range_slider?.step]);
  const sliderType = useMemo(() => String(settings?.range_slider?.type || "double"), [settings?.range_slider?.type]);
  const startMinSetting = useMemo(
    () => settings?.range_slider?.start_min,
    [settings?.range_slider?.start_min]
  );
  const startMaxSetting = useMemo(
    () => settings?.range_slider?.start_max,
    [settings?.range_slider?.start_max]
  );
  const sliderPlacement = useMemo(
    () => String(settings?.range_slider?.placement || "horizontal"),
    [settings?.range_slider?.placement]
  );
  const prefixEnabled = useMemo(
    () => settings?.range_slider?.prefix?.is_enable === "true",
    [settings?.range_slider?.prefix?.is_enable]
  );
  const suffixEnabled = useMemo(
    () => settings?.range_slider?.suffix?.is_enable === "true",
    [settings?.range_slider?.suffix?.is_enable]
  );
  const prefixText = useMemo(
    () => decodeHtmlEntities(settings?.range_slider?.prefix?.value || ""),
    [settings?.range_slider?.prefix?.value]
  );
  const suffixText = useMemo(
    () => decodeHtmlEntities(settings?.range_slider?.suffix?.value || ""),
    [settings?.range_slider?.suffix?.value]
  );
  const customDefaultsEnabled = useMemo(() => {
    const dv = settings?.range_slider?.default_values;
    if (!dv || typeof dv !== "object") return true;
    if (dv.is_enable === undefined || dv.is_enable === null) return true;
    return dv.is_enable === "true";
  }, [settings?.range_slider?.default_values]);

  const rangeBounds = useMemo(() => {
    const safeMin = Number.isFinite(min) ? min : 0;
    const safeMax = Number.isFinite(max) ? max : 100;
    const startMinParsed = !customDefaultsEnabled
      ? safeMin
      : startMinSetting === "" || typeof startMinSetting === "undefined"
        ? safeMin
        : Number(startMinSetting);
    const startMaxParsed = !customDefaultsEnabled
      ? safeMax
      : startMaxSetting === "" || typeof startMaxSetting === "undefined"
        ? safeMax
        : Number(startMaxSetting);
    const startMinSafe = Number.isFinite(startMinParsed)
      ? Math.max(safeMin, Math.min(startMinParsed, safeMax))
      : safeMin;
    const startMaxSafe = Number.isFinite(startMaxParsed)
      ? Math.max(safeMin, Math.min(startMaxParsed, safeMax))
      : safeMax;
    return { safeMin, safeMax, startMinSafe, startMaxSafe };
  }, [min, max, startMinSetting, startMaxSetting, customDefaultsEnabled]);

  const hasValidCustomDefaults = useMemo(
    () =>
      computeHasValidRangeSliderCustomDefaults({
        defaultsEnabled: customDefaultsEnabled,
        isSingle: sliderType === "single",
        ...rangeBounds,
      }),
    [customDefaultsEnabled, sliderType, rangeBounds]
  );

  const formatValue = (v) => `${prefixEnabled ? prefixText : ""}${v}${suffixEnabled ? suffixText : ""}`;
  const defaultSliderDisplayValue = useMemo(() => {
    if (sliderType === "single") {
      return formatValue(rangeBounds.startMaxSafe);
    }
    return `${formatValue(rangeBounds.startMinSafe)}-${formatValue(rangeBounds.startMaxSafe)}`;
  }, [
    sliderType,
    rangeBounds.startMinSafe,
    rangeBounds.startMaxSafe,
    prefixEnabled,
    suffixEnabled,
    prefixText,
    suffixText,
  ]);

  const meta2TrackCss = useMemo(() => {
    if (!styleDefault?.meta2) {
      return { default: "", hover: "", defaultHasGradient: false, activeRange: "", activeRangeHasGradient: false };
    }
    const defaultCss = generateFilterCSS("meta2", "default", selectedDevice, styleDefault);
    const hoverCss = generateFilterCSS("meta2", "hover", selectedDevice, styleDefault);
    const activeRaw = generateFilterCSS("meta2", "active", selectedDevice, styleDefault);
    const activeRange = filterMeta2TrackBackgroundCss(activeRaw);
    const activeRangeHasGradient =
      /background-image\s*:/.test(activeRaw) || /background:\s*[^;]*gradient\s*\(/i.test(activeRaw);

    return {
      default: defaultCss,
      hover: hoverCss,
      defaultHasGradient: /background-image\s*:/.test(defaultCss),
      activeRange,
      activeRangeHasGradient,
    };
  }, [styleDefault, selectedDevice]);

  const meta3ThumbCss = useMemo(() => {
    if (!styleDefault?.meta3) {
      return { default: "", hover: "" };
    }
    const defaultCss = generateFilterCSS("meta3", "default", selectedDevice, styleDefault);
    const hoverCss = generateFilterCSS("meta3", "hover", selectedDevice, styleDefault);
    return {
      default: defaultCss,
      hover: hoverCss,
      defaultHasGradient: /background-image\s*:/.test(defaultCss),
    };
  }, [styleDefault, selectedDevice]);

  useEffect(() => {
    let isCancelled = false;
    const node = sliderRef.current;
    if (!node) return undefined;

    const ownerDocument = node.ownerDocument;
    const ownerWindow = ownerDocument?.defaultView || window;

    const ensureSliderLibrary = async () => {
      const ensureScript = async (id, src) => {
        if (ownerDocument.getElementById(id)) {
          await new Promise((resolve) => setTimeout(resolve, 50));
          return;
        }
        await new Promise((resolve, reject) => {
          const script = ownerDocument.createElement("script");
          script.id = id;
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          ownerDocument.head.appendChild(script);
        }).catch(() => null);
      };

      let jq = ownerWindow.jQuery || ownerWindow.$;
      if (!jq) {
        await ensureScript("caf-preview-jquery-script", "https://code.jquery.com/jquery-3.7.1.min.js");
        jq = ownerWindow.jQuery || ownerWindow.$;
      }

      if (!jq) {
        return null;
      }

      if (!(jq.fn && typeof jq.fn.slider === "function")) {
        await ensureScript("caf-preview-jquery-ui-script", "https://code.jquery.com/ui/1.12.1/jquery-ui.js");
        jq = ownerWindow.jQuery || ownerWindow.$ || jq;
      }

      return jq && jq.fn && typeof jq.fn.slider === "function" ? jq : null;
    };

    const initSlider = async () => {
      const $ = await ensureSliderLibrary();
      if (isCancelled || !$ || !$.fn || !$.fn.slider || !node) {
        return;
      }

      const { safeMin, safeMax, startMinSafe, startMaxSafe } = rangeBounds;
      const safeStep = Number.isFinite(step) && step > 0 ? step : 1;
      const isSingle = sliderType === "single";
      const $slider = $(node);
      const moduleRoot = node.closest(".caf-builder-module-main");
      const isUserNeutral =
        $slider.attr("data-user-neutral") === "true" ||
        moduleRoot?.getAttribute("data-user-neutral") === "true";
      const initMin = isUserNeutral ? safeMin : startMinSafe;
      const initMax = isUserNeutral ? safeMax : startMaxSafe;
      const startValues = [initMin, initMax];
      const displayValues = isSingle
        ? (isUserNeutral ? [safeMax, safeMax] : [startMaxSafe, safeMax])
        : startValues;
      setValue(displayValues);

      if ($slider.hasClass("ui-slider")) {
        $slider.slider("destroy");
      }
      $slider.removeAttr("style");
      $slider.removeClass("ui-slider ui-slider-horizontal ui-slider-vertical ui-widget ui-widget-content ui-corner-all");
      $slider.empty();

      const customFieldGroup = Array.isArray(settings?.custom_field_data)
        ? settings.custom_field_data[0]
        : settings?.custom_field_data;
      const metaKey = customFieldGroup?.custom_field_key || "";
      const metaCompare = customFieldGroup?.compare_operator || "BETWEEN";
      const metaType = customFieldGroup?.meta_type || "NUMERIC";
      $slider.attr("data-meta-key", metaKey);
      $slider.attr("data-meta-compare", metaCompare);
      $slider.attr("data-meta-type", metaType);
      $slider.attr("data-range-type", isSingle ? "single" : "double");
      $slider.attr("data-min", String(safeMin));
      $slider.attr("data-max", String(safeMax));
      $slider.attr("data-step", String(safeStep));
      $slider.attr("data-start-min", String(startMinSafe));
      $slider.attr("data-start-max", String(startMaxSafe));
      $slider.attr("data-placement", sliderPlacement);
      $slider.attr("data-current-min", String(isSingle ? safeMin : initMin));
      $slider.attr("data-current-max", String(initMax));
      $slider.attr("data-prefix-enable", prefixEnabled ? "true" : "false");
      $slider.attr("data-prefix-text", prefixEnabled ? prefixText : "");
      $slider.attr("data-suffix-enable", suffixEnabled ? "true" : "false");
      $slider.attr("data-suffix-text", suffixEnabled ? suffixText : "");
      $slider.attr(
        "data-default-values-enabled",
        customDefaultsEnabled ? "true" : "false"
      );
      $slider.attr(
        "data-has-valid-defaults",
        hasValidCustomDefaults ? "true" : "false"
      );

      $slider.slider({
        range: isSingle ? "min" : true,
        min: safeMin,
        max: safeMax,
        step: safeStep,
        orientation: sliderPlacement === "vertical" ? "vertical" : "horizontal",
        ...(isSingle ? { value: initMax } : { values: startValues }),
        create() {
          const $handles = $slider.find(".ui-slider-handle");
          $handles.removeClass("caf-ui-slider-left caf-ui-slider-right");
          if (isSingle) {
            $handles.first().addClass("caf-ui-slider-left");
          } else {
            $handles.eq(0).addClass("caf-ui-slider-left");
            if ($handles.length > 1) {
              $handles.eq(1).addClass("caf-ui-slider-right");
            }
          }
        },
        slide: (_event, ui) => {
          $slider.attr("data-user-neutral", "false");
          moduleRoot?.setAttribute("data-user-neutral", "false");
          if (isSingle) {
            $slider.attr("data-current-min", String(safeMin));
            $slider.attr("data-current-max", String(ui.value));
            setValue([ui.value, safeMax]);
          } else {
            $slider.attr("data-current-min", String(ui.values[0]));
            $slider.attr("data-current-max", String(ui.values[1]));
            setValue([ui.values[0], ui.values[1]]);
          }
        },
        stop: () => {
          $slider.trigger("cafRangeSliderChanged");
          try {
            const win = node.ownerDocument?.defaultView || window;
            if (node && typeof node.dispatchEvent === "function" && win?.CustomEvent) {
              node.dispatchEvent(new win.CustomEvent("cafRangeSliderChanged", { bubbles: true }));
            }
          } catch (_e) {
            /* ignore */
          }
        },
      });
    };

    initSlider();

    return () => {
      isCancelled = true;
      const jq = ownerWindow.jQuery || ownerWindow.$ || window.jQuery || window?.parent?.jQuery;
      if (!jq || !node) return;
      const $slider = jq(node);
      if ($slider.hasClass("ui-slider")) {
        $slider.slider("destroy");
      }
    };
  }, [
    min,
    max,
    step,
    sliderType,
    sliderPlacement,
    settings?.custom_field_data,
    rangeBounds,
    customDefaultsEnabled,
    hasValidCustomDefaults,
    prefixEnabled,
    suffixEnabled,
    prefixText,
    suffixText,
  ]);

  const previewTemplateData = resolvePreviewTemplateDataFromBuilderData(
    mainBuilderData
  );
  const selectedTagData = [
    ...(previewTemplateData?.misc_preview_data?.dnd_column_data || []),
  ]
    .flatMap((col) => col.data || [])
    .find((item) => item.key === "selected");

  // Layout preview: Reset Filter / selected-tag close — defaults (single) or full span (double).
  useEffect(() => {
    const scopeDocument = sliderRef.current?.ownerDocument || document;

    const syncValuesElementDom = (displayValues) => {
      const node = sliderRef.current;
      if (!node) {
        return;
      }
      const isSingle = sliderType === "single";
      const valuesEl = node
        .closest(".caf-range-slider-output")
        ?.querySelector(".caf-range-slider-values");
      if (!valuesEl) {
        return;
      }
      const displayStr = isSingle
        ? formatValue(displayValues[0])
        : `${formatValue(displayValues[0])}-${formatValue(displayValues[1])}`;
      valuesEl.setAttribute("slider-value", displayStr);
      const minSpan = valuesEl.querySelector(".caf-range-slider-min");
      const maxSpan = valuesEl.querySelector(".caf-range-slider-max");
      if (minSpan) {
        minSpan.textContent = formatValue(displayValues[0]);
      }
      if (!isSingle && maxSpan) {
        maxSpan.textContent = formatValue(displayValues[1]);
      }
    };

    const applySliderPosition = (resetMin, resetMax, displayValues) => {
      const node = sliderRef.current;
      if (!node) {
        return;
      }

      const isSingle = sliderType === "single";
      setValue(displayValues);
      syncValuesElementDom(displayValues);

      const ownerWindow = scopeDocument.defaultView || window;
      const jq = ownerWindow.jQuery || ownerWindow.$;
      if (!jq) {
        return;
      }
      const $slider = jq(node);
      $slider.attr("data-current-min", String(isSingle ? rangeBounds.safeMin : resetMin));
      $slider.attr("data-current-max", String(resetMax));
      if ($slider.hasClass("ui-slider") && typeof $slider.slider === "function") {
        if (isSingle) {
          $slider.slider("value", resetMax);
        } else {
          $slider.slider("values", [resetMin, resetMax]);
        }
      }
    };

    const resetSliderToNeutral = () => {
      const { safeMin, safeMax } = rangeBounds;
      const isSingle = sliderType === "single";
      const resetMin = safeMin;
      const resetMax = safeMax;
      const displayValues = isSingle ? [safeMax, safeMax] : [safeMin, safeMax];
      const node = sliderRef.current;
      if (node) {
        node.setAttribute("data-user-neutral", "true");
        node.closest(".caf-builder-module-main")?.setAttribute("data-user-neutral", "true");
      }
      applySliderPosition(resetMin, resetMax, displayValues);
    };

    const handlePreviewResetRangeSlider = (event) => {
      const detail = event?.detail || {};
      if (!previewRangeSliderResetMatchesModule(detail, rowindex, columnindex, moduleindex)) {
        return;
      }
      resetSliderToNeutral();
      syncPreviewSelectedTags(scopeDocument, selectedTagData);
      window.requestAnimationFrame(() => {
        syncPreviewSelectedTags(scopeDocument, selectedTagData);
      });
    };

    const handleSmartApplyRangeSlider = (event) => {
      const detail = event?.detail || {};
      if (!previewRangeSliderResetMatchesModule(detail, rowindex, columnindex, moduleindex)) {
        return;
      }
      const newMin = Number(detail.min);
      const newMax = Number(detail.max);
      if (!Number.isFinite(newMin) || !Number.isFinite(newMax)) {
        return;
      }
      const isSingle = String(detail.sliderType || sliderType) === "single";
      const displayValues = isSingle ? [newMax, newMax] : [newMin, newMax];
      applySliderPosition(newMin, newMax, displayValues);
      const node = sliderRef.current;
      if (node) {
        node.dispatchEvent(new CustomEvent("cafRangeSliderChanged", { bubbles: true }));
      }
    };

    const handleSmartSearchClear = () => {
      resetSliderToNeutral();
    };

    scopeDocument.addEventListener(
      "caf-preview-reset-range-slider",
      handlePreviewResetRangeSlider
    );
    scopeDocument.addEventListener(
      "caf-preview-smart-apply-range-slider",
      handleSmartApplyRangeSlider
    );
    scopeDocument.addEventListener(
      "caf-preview-smart-search-clear",
      handleSmartSearchClear
    );
    return () => {
      scopeDocument.removeEventListener(
        "caf-preview-reset-range-slider",
        handlePreviewResetRangeSlider
      );
      scopeDocument.removeEventListener(
        "caf-preview-smart-apply-range-slider",
        handleSmartApplyRangeSlider
      );
      scopeDocument.removeEventListener(
        "caf-preview-smart-search-clear",
        handleSmartSearchClear
      );
    };
  }, [
    rangeBounds,
    sliderType,
    rowindex,
    columnindex,
    moduleindex,
    selectedTagData?.settings?.is_enable,
    selectedTagData?.settings?.close_button,
    prefixEnabled,
    suffixEnabled,
    prefixText,
    suffixText,
  ]);

  const AddSelectedTags = () => {
    const scopeDocument = sliderRef.current?.ownerDocument || document;
    syncPreviewSelectedTags(scopeDocument, selectedTagData);
  };

  useEffect(() => {
    AddSelectedTags();
  }, [value, selectedTagData?.settings?.close_button, selectedTagData?.settings?.is_enable]);

  const customClass = settings?.custom_class || "";
  const visibility = settings?.visibility || {};
  const hideClass = visibility?.[selectedDevice] === "true" ? "caf-hide-element" : "";
  useEffect(() => {
    if (settings?.enable_toggle) {
      setEnableToggle(settings.enable_toggle);
    }
    if (settings?.close_toggle) {
      setCloseToggle(settings.close_toggle);
    }
  }, [settings?.close_toggle, settings?.enable_toggle]);

  const handleToggle = () => {
    if (enableToggle === "true") {
      if (closeToggle === "false") {
        setCloseToggle("true");
      } else {
        setCloseToggle("false");
      }
    }
  };

  const hasZeroCustomFieldKey = settings?.custom_field_data.some(
    (item) => item.custom_field_key === 0 || item.custom_field_key === "0"
  );
  return (
    <div
      onClick={() =>
        setIndexes &&
        setIndexes({
          type: "module",
          rowindex,
          columnindex,
          moduleindex,
          module,
        })
      }
      className={`caf-builder-module-main caf-module-filter caf_module_${module.key} caf-module-${moduleindex} ${customClass} ${
        indexes?.type === "module" &&
        indexes?.rowindex === rowindex &&
        indexes?.columnindex === columnindex &&
        indexes?.moduleindex === moduleindex
          ? "active"
          : ""
      } ${hideClass}`}
    >
      {settings?.label?.is_label === "true" && (
        <div className="caf-filter-label-common label-header" onClick={() => handleToggle()}>
          {enableToggle === "true" && settings?.toggle_position === "left" && (
            <div className="caf-builder-filter-toggle-icon">
              {closeToggle === "false" ? (
                <span className="label-icon-common">
                  <i className="fas fa-chevron-up"></i>
                </span>
              ) : (
                <span className="label-icon-common">
                  <i className="fas fa-chevron-down"></i>
                </span>
              )}
            </div>
          )}
          <div className="caf-builder-filter-label-wrapper">
            {settings.label?.icons && settings.label?.icons?.icon !== "" ? (
              <>
                {settings.label?.icons?.type === "icon" && (
                  <>
                    {settings.label?.icons.position == "before-label" &&
                      settings.label?.icons.visibility === true && (
                        <span
                          className={`caf-builder-before-label before-common ${settings.label?.icons.icon}`}
                        ></span>
                      )}

                    {settings.label?.icons.position == "after-label" &&
                      settings.label?.icons.visibility === true && (
                        <span
                          className={`caf-builder-after-label after-common ${settings.label?.icons.icon}`}
                        ></span>
                      )}
                  </>
                )}
                {settings.label?.icons?.type === "svg" && (
                  <>
                    {settings.label?.icons.position == "before-label" &&
                      settings.label?.icons.visibility === true && (
                        <img
                          src={settings.label?.icons?.icon?.url}
                          className="caf-inline-svg-icon caf-builder-before-label before-common"
                          alt=""
                        />
                      )}
                    {settings.label?.icons.position == "after-label" &&
                      settings.label?.icons.visibility === true && (
                        <img
                          src={settings.label?.icons?.icon?.url}
                          className="caf-inline-svg-icon caf-builder-after-label after-common"
                          alt=""
                        />
                      )}
                  </>
                )}
              </>
            ) : (
              ""
            )}
            <span className="caf-builder-filter-label">{settings?.label?.value || "Label"}</span>
          </div>
          {enableToggle === "true" && settings?.toggle_position === "right" && (
            <div className="caf-builder-filter-toggle-icon">
              {closeToggle === "false" ? (
                <span className="label-icon-common">
                  <i className="fas fa-chevron-up"></i>
                </span>
              ) : (
                <span className="label-icon-common">
                  <i className="fas fa-chevron-down"></i>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Keep jQuery UI slider mounted while collapsed */}
      <div
        className={`caf-range-slider-output${
          closeToggle === "true" ? " toggle_closed caf-hide-element" : ""
        }`}
        style={closeToggle === "true" ? { display: "none" } : undefined}
      >
        <div
          className={`caf-range-slider-values${
            sliderType === "single" ? " caf-range-slider-values-single" : ""
          }`}
          slider-type ={ sliderType === "single" ? "1" : sliderType === "double" ? "2" : ""}
          slider-value={
            sliderType === "single"
              ? formatValue(value[0])
              : `${formatValue(value[0])}-${formatValue(value[1])}`
          }
          slider-default-value={defaultSliderDisplayValue}
          slider-default-values-enabled={customDefaultsEnabled ? "true" : "false"}
          slider-has-valid-defaults={hasValidCustomDefaults ? "true" : "false"}
          slider-row-id={rowindex}
          slider-column-id={columnindex}
          slider-module-id={moduleindex}
          slider-min ={min}
          slider-max ={max}
        >
          <span className="caf-range-slider-min">{formatValue(value[0])}</span>
          {sliderType !== "single" && (
            <>
              <span className="caf-range-slider-sep">-</span>
              <span className="caf-range-slider-max">{formatValue(value[1])}</span>
            </>
          )}
        </div>
        <div
          className={`caf-range-slider-ui-wrapper ${
            sliderPlacement === "vertical"
              ? "caf-range-slider-placement-vertical"
              : "caf-range-slider-placement-horizontal"
          }`}
        >
          <div ref={sliderRef} className="caf-range-slider-ui" />
        </div>
        {hasZeroCustomFieldKey && (
          <div className="caf-range-slider-cf-error-msg">
            Error: Custom field key is not set
          </div>
        )}
      </div>
      <style>
        {`
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}{
            ${generateFilterCSS("container", "default", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}:hover{
            ${generateFilterCSS("container", "hover", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-label-common.label-header{
            ${generateFilterLabelCSS("header", "default", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-label-common.label-header:hover{
            ${generateFilterLabelCSS("header", "hover", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-label-common.label-header .caf-builder-filter-label-wrapper{
            ${generateFilterLabelInnerCSS("header", "default", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-label-common.label-header .caf-builder-filter-label-wrapper:hover{
            ${generateFilterLabelInnerCSS("header", "hover", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-range-slider-output{
            ${generateFilterCSS("meta", "default", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-range-slider-output:hover{
            ${generateFilterCSS("meta", "hover", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-range-slider-values{
            
            ${generateFilterLabelCSS("meta1", "default", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-range-slider-values:hover{
            ${generateFilterLabelCSS("meta1", "hover", selectedDevice, styleDefault)}
          }
          
          ${sliderPlacement === "vertical" ? `
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-range-slider-ui-wrapper.caf-range-slider-placement-vertical .caf-range-slider-ui{
            ${meta2TrackCss.default}
            ${!meta2TrackCss.defaultHasGradient ? "background-image: none;" : ""}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-range-slider-ui-wrapper.caf-range-slider-placement-vertical .caf-range-slider-ui:hover{
            ${meta2TrackCss.hover}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-range-slider-ui-wrapper.caf-range-slider-placement-vertical .caf-range-slider-ui .ui-slider-range{
            width: 100%;
            position: absolute;
          }
          /* jQuery UI only sets height for vertical range min/max; theme CSS anchors with bottom/top — missing in preview without jquery-ui.css */
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-range-slider-ui-wrapper.caf-range-slider-placement-vertical .caf-range-slider-ui.ui-slider-vertical .ui-slider-range-min{
            bottom: 0;
            top: auto;
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-range-slider-ui-wrapper.caf-range-slider-placement-vertical .caf-range-slider-ui.ui-slider-vertical .ui-slider-range-max{
            top: 0;
            bottom: auto;
          }
          ` : `
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-range-slider-ui-wrapper.caf-range-slider-placement-horizontal .caf-range-slider-ui{
            ${meta2TrackCss.default}
            ${!meta2TrackCss.defaultHasGradient ? "background-image: none;" : ""}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-range-slider-ui-wrapper.caf-range-slider-placement-horizontal .caf-range-slider-ui:hover{
            ${meta2TrackCss.hover}
          }
          `}
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-range-slider-ui-wrapper .ui-slider-range.ui-corner-all.ui-widget-header{
            ${meta2TrackCss.activeRange}
            ${meta2TrackCss.activeRange.trim() && !meta2TrackCss.activeRangeHasGradient ? "background-image: none;" : ""}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-range-slider-ui .ui-slider-handle{
            ${meta3ThumbCss.default || "position:absolute;box-sizing:border-box;width:14px;height:14px;border-radius:50%;border:2px solid #1677ff;background:#fff;cursor:pointer;"}
            ${!meta3ThumbCss.defaultHasGradient ? "background-image: none;" : ""}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-range-slider-ui .ui-slider-handle:hover{
            ${meta3ThumbCss.hover || ""}
          }
          
        `}
      </style>
    </div>
  );
};

export default RangeSliderFilter;
