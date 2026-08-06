import { useCallback, useState } from "react";
import { message, Tooltip } from "antd";
import {
  CloudDownloadOutlined,
  LoadingOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import apiClient from "../../../../api/client";
import { apiEndpoints } from "../../../../api/endpoints";
import {
  buildColorTermIcons,
  canUseColorSwatchFeatures,
  isTermVisualColor,
  termHasColorSwatch,
} from "../settingTabContent/ModuleContentData/termVisualUtils";
import {
  createFilterModuleSettingsSnapshot,
  commitFilterModuleTaxonomyData,
} from "../settingTabContent/ModuleContentData/filterSettingsSnapshot";

export const isWooProductAttributeTaxonomy = (taxonomy) =>
  String(taxonomy || "").trim().startsWith("pa_");

const resolveTermKey = (term) => {
  const key = term?.key ?? term?.id;
  return key != null && key !== "" ? String(key) : "";
};

export async function fetchWooAttributeTermVisuals(taxonomy) {
  const slug = String(taxonomy || "").trim();
  if (!isWooProductAttributeTaxonomy(slug)) {
    return null;
  }

  try {
    const response = await apiClient.get(
      apiEndpoints.getWooAttributeTermVisuals(slug)
    );
    const payload = response?.data;
    if (!payload || payload.status !== "success") {
      return null;
    }
    return payload;
  } catch (error) {
    return null;
  }
}

const applyWooColorsToTermTree = (
  terms,
  wooTerms,
  stats,
  replaceAll = false
) => {
  if (!Array.isArray(terms)) {
    return terms;
  }

  return terms.map((term) => {
    const next = { ...term };
    const termKey = resolveTermKey(next);
    const wooVisual = termKey ? wooTerms?.[termKey] : null;

    if (wooVisual?.type === "color" && wooVisual?.value) {
      if (replaceAll || !termHasColorSwatch(next.icons)) {
        next.icons = buildColorTermIcons(
          next.icons,
          wooVisual.value,
          next.icons?.position || "before"
        );
        stats.imported += 1;
      } else {
        stats.skippedExisting += 1;
      }
    } else if (wooVisual?.type === "image") {
      stats.skippedImage += 1;
    }

    if (Array.isArray(next.children_data) && next.children_data.length > 0) {
      next.children_data = applyWooColorsToTermTree(
        next.children_data,
        wooTerms,
        stats,
        replaceAll
      );
    }

    return next;
  });
};

const resetSavedColorsInTermTree = (terms, stats) => {
  if (!Array.isArray(terms)) {
    return terms;
  }

  return terms.map((term) => {
    const next = { ...term };

    if (termHasColorSwatch(next.icons)) {
      next.icons = {};
      stats.reset += 1;
    }

    if (Array.isArray(next.children_data) && next.children_data.length > 0) {
      next.children_data = resetSavedColorsInTermTree(next.children_data, stats);
    }

    return next;
  });
};

export async function importWooColorsIntoTaxonomyData(
  taxonomyData,
  { replaceAll = false } = {}
) {
  const stats = {
    imported: 0,
    skippedExisting: 0,
    skippedImage: 0,
    errors: [],
    taxonomies: 0,
  };

  if (!Array.isArray(taxonomyData)) {
    return { nextTaxonomyData: taxonomyData, stats };
  }

  const nextTaxonomyData = [];

  for (const group of taxonomyData) {
    const taxonomy = String(group?.key || "").trim();
    if (!isWooProductAttributeTaxonomy(taxonomy)) {
      nextTaxonomyData.push(group);
      continue;
    }

    const payload = await fetchWooAttributeTermVisuals(taxonomy);
    if (!payload) {
      stats.errors.push(taxonomy);
      nextTaxonomyData.push(group);
      continue;
    }

    stats.taxonomies += 1;
    nextTaxonomyData.push({
      ...group,
      term_data: applyWooColorsToTermTree(
        group?.term_data || [],
        payload.terms || {},
        stats,
        replaceAll
      ),
    });
  }

  return { nextTaxonomyData, stats };
}

export function resetSavedColorsInTaxonomyData(taxonomyData) {
  const stats = { reset: 0 };

  if (!Array.isArray(taxonomyData)) {
    return { nextTaxonomyData: taxonomyData, stats };
  }

  const nextTaxonomyData = taxonomyData.map((group) => ({
    ...group,
    term_data: resetSavedColorsInTermTree(group?.term_data || [], stats),
  }));

  return { nextTaxonomyData, stats };
}

export const canShowWooAttributeColorActions = (
  settings,
  postType,
  dataSource
) => {
  if (dataSource !== "taxonomy") {
    return false;
  }
  if (!canUseColorSwatchFeatures(postType)) {
    return false;
  }
  if (settings?.show_icon !== "true") {
    return false;
  }
  if (
    !isTermVisualColor({
      ...settings,
      post_type: postType,
    })
  ) {
    return false;
  }

  return (
    Array.isArray(settings?.taxonomy_data) &&
    settings.taxonomy_data.some(
      (group) =>
        Array.isArray(group?.term_data) && group.term_data.length > 0
    )
  );
};

/** @deprecated Use canShowWooAttributeColorActions */
export const canShowWooAttributeColorImport = canShowWooAttributeColorActions;

const commitTaxonomyColorChange = ({
  data,
  rowindex,
  columnindex,
  moduleindex,
  resolvedPostType,
  onSettingChange,
  onAfterCommit,
  nextTaxonomyData,
}) => {
  const { freshItems, settingsRef } = createFilterModuleSettingsSnapshot({
    data,
    rowindex,
    columnindex,
    moduleindex,
    resolvedPostType,
  });

  commitFilterModuleTaxonomyData({
    freshItems,
    rowindex,
    columnindex,
    moduleindex,
    settingsRef,
    nexttaxonomyData: nextTaxonomyData,
    onSettingChange,
    onAfterCommit,
  });
};

export function useWooAttributeColorActions({
  data,
  rowindex,
  columnindex,
  moduleindex,
  resolvedPostType,
  onSettingChange,
  onAfterCommit,
}) {
  const [importLoading, setImportLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleImport = useCallback(async () => {
    setImportLoading(true);
    try {
      const { freshItems, settingsRef } = createFilterModuleSettingsSnapshot({
        data,
        rowindex,
        columnindex,
        moduleindex,
        resolvedPostType,
      });

      const { nextTaxonomyData, stats } = await importWooColorsIntoTaxonomyData(
        settingsRef.taxonomy_data
      );

      if (stats.errors.length > 0 && stats.imported === 0) {
        message.error("Could not import colors from WooCommerce.");
        return;
      }

      if (stats.imported === 0) {
        if (stats.skippedExisting > 0) {
          message.info(
            "All filter terms already have colors. Use Reset Colors first, then import again."
          );
        } else if (stats.skippedImage > 0) {
          message.info(
            "WooCommerce image swatches are not imported yet. Use hex color swatches in Woo."
          );
        } else {
          message.info(
            "No WooCommerce colors found. Set colors under Products → Attributes."
          );
        }
        return;
      }

      commitFilterModuleTaxonomyData({
        freshItems,
        rowindex,
        columnindex,
        moduleindex,
        settingsRef,
        nexttaxonomyData: nextTaxonomyData,
        onSettingChange,
        onAfterCommit,
      });

      let successText = `Imported ${stats.imported} color${
        stats.imported === 1 ? "" : "s"
      } from WooCommerce.`;
      if (stats.skippedExisting > 0) {
        successText += ` ${stats.skippedExisting} existing custom color${
          stats.skippedExisting === 1 ? "" : "s"
        } kept.`;
      }
      message.success(successText);
    } finally {
      setImportLoading(false);
    }
  }, [
    columnindex,
    data,
    moduleindex,
    onAfterCommit,
    onSettingChange,
    resolvedPostType,
    rowindex,
  ]);

  const handleReset = useCallback(() => {
    setResetLoading(true);
    try {
      const { settingsRef } = createFilterModuleSettingsSnapshot({
        data,
        rowindex,
        columnindex,
        moduleindex,
        resolvedPostType,
      });

      const { nextTaxonomyData, stats } = resetSavedColorsInTaxonomyData(
        settingsRef.taxonomy_data
      );

      if (stats.reset === 0) {
        message.info("No saved swatch colors to reset on selected terms.");
        return;
      }

      commitTaxonomyColorChange({
        data,
        rowindex,
        columnindex,
        moduleindex,
        resolvedPostType,
        onSettingChange,
        onAfterCommit,
        nextTaxonomyData,
      });

      message.success(
        `Reset ${stats.reset} saved color${stats.reset === 1 ? "" : "s"}.`
      );
    } finally {
      setResetLoading(false);
    }
  }, [
    columnindex,
    data,
    moduleindex,
    onAfterCommit,
    onSettingChange,
    resolvedPostType,
    rowindex,
  ]);

  return { importLoading, resetLoading, handleImport, handleReset };
}

/** @deprecated Use useWooAttributeColorActions */
export function useWooAttributeColorImport(props) {
  const { importLoading, handleImport } = useWooAttributeColorActions(props);
  return { loading: importLoading, handleImport };
}

export function WooAttributeColorActions({
  visible = false,
  importLoading = false,
  resetLoading = false,
  onImport,
  onReset,
  /** "default" = labeled rows (filters). "icons" = compact toolbar (Attribute Swatch Values). */
  variant = "default",
}) {
  if (!visible) {
    return null;
  }

  const busy = importLoading || resetLoading;
  const importTitle =
    "Import colors from WooCommerce product attributes. Only terms without a saved color are updated.";
  const resetTitle =
    "Clear saved swatch colors from all terms listed below.";

  if (variant === "icons") {
    return (
      <div
        className="caf-attr-swatch-values-actions"
        role="group"
        aria-label="Color swatch actions"
        onClick={(event) => event.stopPropagation()}
      >
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="top"
          title={importTitle}
        >
          <button
            type="button"
            className="caf-attr-swatch-values-action-btn"
            onClick={(event) => {
              event.stopPropagation();
              onImport?.();
            }}
            disabled={busy}
            aria-label="Import colors from WooCommerce"
          >
            {importLoading ? <LoadingOutlined spin /> : <CloudDownloadOutlined />}
          </button>
        </Tooltip>
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="top"
          title={resetTitle}
        >
          <button
            type="button"
            className="caf-attr-swatch-values-action-btn"
            onClick={(event) => {
              event.stopPropagation();
              onReset?.();
            }}
            disabled={busy}
            aria-label="Reset saved swatch colors"
          >
            {resetLoading ? <LoadingOutlined spin /> : <ReloadOutlined />}
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <>
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title={importTitle}
        >
          <label>Import Colors</label>
        </Tooltip>
        <button
          type="button"
          className="caf-woo-import-attribute-colors-btn"
          onClick={onImport}
          disabled={busy}
        >
          {importLoading ? "Importing..." : "Import from Woo"}
        </button>
      </div>
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title="Clear saved swatch colors from all selected terms in this filter."
        >
          <label>Reset Colors</label>
        </Tooltip>
        <button
          type="button"
          className="caf-woo-reset-attribute-colors-btn"
          onClick={onReset}
          disabled={busy}
        >
          {resetLoading ? "Resetting..." : "Reset all"}
        </button>
      </div>
    </>
  );
}

/** @deprecated Use WooAttributeColorActions */
export function WooAttributeColorImportButton({
  visible = false,
  loading = false,
  onImport,
}) {
  return (
    <WooAttributeColorActions
      visible={visible}
      importLoading={loading}
      onImport={onImport}
      onReset={() => {}}
    />
  );
}
