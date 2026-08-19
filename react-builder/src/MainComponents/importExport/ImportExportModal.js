import React, { useEffect, useMemo } from "react";
import { Button, Checkbox, Modal, Radio, Tabs, Upload, message } from "antd";
import ImportExportPickerIcon, {
  ImportExportLabel,
  ImportExportPreviewEyeIcon,
} from "./ImportExportPickerIcon";
import { useDispatch, useSelector } from "react-redux";
import {
  clearSelectedImportFile,
  closeImportExportModal,
  fetchLibraryTemplates,
  fetchLibraryTemplatePayload,
  setAvailableImportScopes,
  setExportScopeTab,
  setImportExportResultMessage,
  setFilterLibraryTab,
  setLayoutSettingsLibraryTab,
  setImportExportSection,
  setImportExportTab,
  setImportSourceTab,
  setLayoutSettingsCustomOptions,
  setLayoutSettingsExportMode,
  setImportStatus,
  setSelectedFileJson,
  setSelectedImportFile,
  setSelectedImportScope,
  setPreviewTemplate,
  setSelectedTemplate,
} from "../../store/importExportSlice";
import {
  FILTER_LIBRARY_TABS,
  LAYOUT_SETTINGS_LIBRARY_TABS,
  LIBRARY_PREVIEW_FALLBACK,
  normalizeLibraryTemplate,
  resolveLibraryDemoUrl,
} from "./libraryConfig";
import { canUseFeature } from "../../tier/capabilities";
import { sanitizeLayoutDocumentForTier } from "../../tier/sanitizeLayoutForTier";
import {
  getFilterLibraryTabLockMessage,
  getLayoutSettingsLibraryTabLockMessage,
  getLibraryTemplateLockMessage,
  getLibraryTemplateUpgradeUrl,
  isFilterLibraryTabLocked,
  isLayoutSettingsLibraryTabLocked,
  isLibraryTemplateLocked,
  shouldShowLibraryProUpsellCard,
} from "./importLibraryAccess";
import ImportLibraryProUpsellCard from "./ImportLibraryProUpsellCard";
import { pickCommonDataForScopedExport } from "./importExportScopes";

const scopeItems = [
  { key: "full_layout", label: "Full Layout" },
  { key: "filter_layout", label: "Filter Layout" },
  { key: "post_layout", label: "Post Layout" },
  { key: "layout_settings", label: "Layout Settings" },
];

const layoutSettingsModeOptions = [
  { key: "everything", label: "Everything" },
  { key: "custom", label: "Custom" },
];

const layoutSettingsCustomOptions = [
  {
    label: "Layout",
    options: [{ key: "layout_settings", label: "Layout Settings" }],
  },
  {
    label: "Misc Settings",
    options: [
      { key: "selected_filters", label: "Selected Filters" },
      { key: "sorting_data", label: "Sorting Data" },
      { key: "result_count", label: "Result Count" },
      { key: "pagination", label: "Pagination" },
    ],
  },
];

const sectionItems = [
  { key: "full_filter_layout", label: "Full Filter Layout" },
  { key: "filter", label: "Filter" },
  { key: "single_post_item", label: "Single Post Item" },
  { key: "layout_settings", label: "Layout Settings" },
];

const libraryInsertButtonLabels = {
  full_filter_layout: "Insert Filter",
  filter: "Insert Module",
  single_post_item: "Insert Item",
  layout_settings: "Insert Layout",
};

const libraryInsertButtonLoadingLabels = {
  full_filter_layout: "Inserting Filter...",
  filter: "Inserting Module...",
  single_post_item: "Inserting Item...",
  layout_settings: "Inserting Layout...",
};

const getLibraryInsertButtonLabel = (sectionKey, isLoading = false) => {
  if (isLoading) {
    return (
      libraryInsertButtonLoadingLabels[sectionKey] || "Inserting..."
    );
  }

  return libraryInsertButtonLabels[sectionKey] || "Insert";
};

const toImportTabClassSuffix = (key) =>
  String(key || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");

const buildImportLibraryGridWrapClassName = ({
  source,
  tabKey,
  filterLibraryTabKey,
  layoutSettingsLibraryTabKey,
} = {}) =>
  [
    "caf-import-library-grid-wrap",
    source && `caf-import-library-grid-wrap--source-${toImportTabClassSuffix(source)}`,
    tabKey && `caf-import-library-grid-wrap--tab-${toImportTabClassSuffix(tabKey)}`,
    filterLibraryTabKey &&
      `caf-import-library-grid-wrap--filter-tab-${toImportTabClassSuffix(
        filterLibraryTabKey
      )}`,
    layoutSettingsLibraryTabKey &&
      `caf-import-library-grid-wrap--layout-settings-tab-${toImportTabClassSuffix(
        layoutSettingsLibraryTabKey
      )}`,
  ]
    .filter(Boolean)
    .join(" ");

const buildImportLayoutShellClassName = ({
  source,
  tabKey,
  filterLibraryTabKey,
  layoutSettingsLibraryTabKey,
} = {}) =>
  [
    "caf-import-layout-shell",
    source && `caf-import-layout-shell--source-${toImportTabClassSuffix(source)}`,
    tabKey && `caf-import-layout-shell--tab-${toImportTabClassSuffix(tabKey)}`,
    filterLibraryTabKey &&
      `caf-import-layout-shell--filter-tab-${toImportTabClassSuffix(filterLibraryTabKey)}`,
    layoutSettingsLibraryTabKey &&
      `caf-import-layout-shell--layout-settings-tab-${toImportTabClassSuffix(
        layoutSettingsLibraryTabKey
      )}`,
  ]
    .filter(Boolean)
    .join(" ");

const detectAvailableScopes = (jsonData) => {
  if (!jsonData || typeof jsonData !== "object") return [];

  const hasCommon = !!jsonData.common_data;
  const hasFilter = !!jsonData.filter_layout_data;
  const hasPost = !!jsonData.post_layout_data;
  const hasLayoutSettings = Boolean(jsonData?.common_data?.preview_template_data);
  const scopes = [];

  if (hasCommon && hasFilter && hasPost) scopes.push("full_layout");
  if (hasFilter) scopes.push("filter_layout");
  if (hasPost) scopes.push("post_layout");
  if (hasLayoutSettings) scopes.push("layout_settings");

  return scopes;
};

const getScopeLabel = (scopeKey) =>
  scopeItems.find((item) => item.key === scopeKey)?.label || "Layout";

const cloneJson = (value) => JSON.parse(JSON.stringify(value || {}));

const getLayoutSettingsPayload = (
  safeData,
  layoutSettingsMode,
  selectedCustomOptions
) => {
  const previewTemplateData =
    safeData?.common_data?.preview_template_data || {};
  const miscPreviewData =
    previewTemplateData?.misc_preview_data || {};

  const legacySettingsMap = {
    selected_filters: "selected_filter",
    sorting_data: "sorting",
    result_count: "result_count",
    pagination: "pagination",
  };

  const dndKeyMap = {
    selected_filters: "selected",
    sorting_data: "sorting",
    result_count: "result_count",
    pagination: "pagination",
  };

  const dndColumns = Array.isArray(miscPreviewData.dnd_column_data)
    ? cloneJson(miscPreviewData.dnd_column_data)
    : [];

  if (layoutSettingsMode === "everything") {
    return cloneJson(previewTemplateData);
  }

  const selectedSet = new Set(
    Array.isArray(selectedCustomOptions) ? selectedCustomOptions : []
  );
  const payload = {};
  const selectedDndOptions = [
    "selected_filters",
    "sorting_data",
    "result_count",
    "pagination",
  ].filter((key) => selectedSet.has(key));

  if (selectedSet.has("layout_settings")) {
    payload.post_preview_data = cloneJson(previewTemplateData.post_preview_data || {});
    payload.filter_preview_data = cloneJson(
      previewTemplateData.filter_preview_data || {}
    );
    payload.misc_preview_data = {
      container: cloneJson(miscPreviewData.container || {}),
      meta: cloneJson(miscPreviewData.meta || {}),
    };
  }

  // Primary source for targeted exports: draggable misc items with placement data.
  if (dndColumns.length > 0 && selectedDndOptions.length > 0) {
    const selectedDndKeys = selectedDndOptions
      .map((option) => dndKeyMap[option])
      .filter(Boolean);

    const filteredColumns = dndColumns
      .map((column) => {
        const items = Array.isArray(column?.data) ? column.data : [];
        const filteredItems = items.filter((item) =>
          selectedDndKeys.includes(item?.key)
        );
        return { ...column, data: filteredItems };
      })
      .filter((column) => column.data.length > 0);

    payload.misc_preview_data = {
      ...(payload.misc_preview_data || {}),
      dnd_column_data: filteredColumns,
    };
  }

  // Fallback for older layout structures where misc items are top-level.
  if (selectedDndOptions.length > 0 && dndColumns.length === 0) {
    const legacyMiscData = {};
    selectedDndOptions.forEach((option) => {
      const legacyKey = legacySettingsMap[option];
      if (legacyKey) {
        legacyMiscData[legacyKey] = cloneJson(miscPreviewData[legacyKey] || {});
      }
    });
    if (Object.keys(legacyMiscData).length > 0) {
      payload.misc_preview_data = {
        ...(payload.misc_preview_data || {}),
        ...legacyMiscData,
      };
    }
  }

  return payload;
};

const buildExportPayload = (
  builderData,
  exportScope,
  layoutSettingsMode,
  selectedCustomOptions
) => {
  const safeData =
    builderData && typeof builderData === "object" ? builderData : {};
  const exportMeta = {
    version: "1.0.0",
    plugin: "category-ajax-filter-pro",
    exported_at: new Date().toISOString(),
    scope: exportScope,
    layout_settings_mode:
      exportScope === "layout_settings" ? layoutSettingsMode : null,
    layout_settings_option:
      exportScope === "layout_settings" ? layoutSettingsMode : null,
    layout_settings_custom_options:
      exportScope === "layout_settings" ? selectedCustomOptions : [],
  };

  if (exportScope === "filter_layout") {
    return sanitizeLayoutDocumentForTier({
      common_data: pickCommonDataForScopedExport(
        safeData.common_data,
        "filter_layout"
      ),
      filter_layout_data: { ...(safeData.filter_layout_data || {}) },
      _export_meta: exportMeta,
    });
  }

  if (exportScope === "post_layout") {
    return sanitizeLayoutDocumentForTier({
      common_data: pickCommonDataForScopedExport(
        safeData.common_data,
        "post_layout"
      ),
      post_layout_data: { ...(safeData.post_layout_data || {}) },
      _export_meta: exportMeta,
    });
  }

  if (exportScope === "layout_settings") {
    return sanitizeLayoutDocumentForTier({
      common_data: {
        preview_template_data: getLayoutSettingsPayload(
          safeData,
          layoutSettingsMode,
          selectedCustomOptions
        ),
      },
      _export_meta: exportMeta,
    });
  }

  return sanitizeLayoutDocumentForTier({
    common_data: { ...(safeData.common_data || {}) },
    filter_layout_data: { ...(safeData.filter_layout_data || {}) },
    post_layout_data: { ...(safeData.post_layout_data || {}) },
    _export_meta: exportMeta,
  });
};

function ImportExportModal({
  mainBuilderData,
  onImportFromFile,
  onImportSuccess = () => {},
}) {
  const dispatch = useDispatch();
  const {
    isOpen,
    activeTab,
    activeSection,
    activeFilterLibraryTab,
    activeLayoutSettingsLibraryTab,
    activeImportSource,
    activeExportScope,
    activeLayoutSettingsExportMode,
    activeLayoutSettingsCustomOptions,
  } = useSelector((state) => state.importExport.ui);
  const { selectedTemplateId, previewTemplateId } = useSelector(
    (state) => state.importExport.ui
  );
  const { selectedFile, selectedFileJson, availableImportScopes, selectedImportScope } =
    useSelector((state) => state.importExport.data);
  const importStatus = useSelector(
    (state) => state.importExport.jobs.importStatus
  );
  const libraryTemplates = useSelector(
    (state) => state.importExport.data.libraryTemplates
  );
  const loadingTemplates = useSelector(
    (state) => state.importExport.data.loadingTemplates
  );
  const templatesError = useSelector(
    (state) => state.importExport.data.templatesError
  );

  const isImporting = importStatus === "running";
  const canUseImportLibrary = canUseFeature("import_library");

  useEffect(() => {
    if (isOpen && !canUseImportLibrary && activeImportSource === "library") {
      dispatch(setImportSourceTab("file"));
    }
  }, [activeImportSource, canUseImportLibrary, dispatch, isOpen]);

  useEffect(() => {
    if (
      isOpen &&
      canUseImportLibrary &&
      activeImportSource === "library" &&
      !libraryTemplates.length &&
      !loadingTemplates &&
      !templatesError
    ) {
      dispatch(fetchLibraryTemplates());
    }
  }, [
    activeImportSource,
    canUseImportLibrary,
    dispatch,
    isOpen,
    libraryTemplates.length,
    loadingTemplates,
    templatesError,
  ]);

  useEffect(() => {
    if (
      isOpen &&
      activeSection === "filter" &&
      isFilterLibraryTabLocked(activeFilterLibraryTab)
    ) {
      dispatch(setFilterLibraryTab("full_filter"));
    }
  }, [activeFilterLibraryTab, activeSection, dispatch, isOpen]);

  useEffect(() => {
    if (
      isOpen &&
      activeSection === "layout_settings" &&
      isLayoutSettingsLibraryTabLocked(activeLayoutSettingsLibraryTab)
    ) {
      dispatch(setLayoutSettingsLibraryTab("pagination"));
    }
  }, [activeLayoutSettingsLibraryTab, activeSection, dispatch, isOpen]);

  const templates = useMemo(() => {
    const source = Array.isArray(libraryTemplates) ? libraryTemplates : [];

    return source
      .filter((item) => {
        if (item.section !== activeSection) {
          return false;
        }

        if (activeSection !== "filter") {
          return true;
        }

        const tabKey = item.filterLibraryTab || "full_filter";
        return tabKey === activeFilterLibraryTab;
      })
      .filter((item) => {
        if (activeSection !== "layout_settings") {
          return true;
        }

        const tabKey = item.layoutSettingsLibraryTab || "pagination";
        return tabKey === activeLayoutSettingsLibraryTab;
      })
      .map(normalizeLibraryTemplate);
  }, [
    libraryTemplates,
    activeSection,
    activeFilterLibraryTab,
    activeLayoutSettingsLibraryTab,
  ]);

  const previewTemplate =
    templates.find((item) => item.id === previewTemplateId) || null;

  const onClose = () => {
    dispatch(closeImportExportModal());
  };

  const handleJsonFileSelect = (file) => {
    const isJson =
      file.type === "application/json" || file.name.endsWith(".json");
    if (!isJson) {
      message.error("Only JSON files are supported.");
      return false;
    }

    dispatch(
      setSelectedImportFile({
        uid: file.uid,
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
      })
    );
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        const scopes = detectAvailableScopes(jsonData);
        dispatch(setSelectedFileJson(jsonData));
        dispatch(setAvailableImportScopes(scopes));
        if (scopes.length > 0) {
          if (!scopes.includes(selectedImportScope)) {
            message.warning(
              `${getScopeLabel(
                selectedImportScope
              )} is not available in this file. Please choose an available tab.`
            );
          }
          message.success(`${file.name} parsed successfully.`);
        } else {
          message.error("No compatible layout scopes found in this file.");
        }
      } catch (error) {
        dispatch(setSelectedFileJson(null));
        dispatch(setAvailableImportScopes([]));
        message.error("Could not parse JSON file.");
      }
    };
    reader.readAsText(file);
    return false;
  };

  const handleStartImport = async () => {
    if (!selectedFileJson) {
      message.error("Please select a valid JSON file.");
      return;
    }

    if (typeof onImportFromFile !== "function") {
      message.error("Import handler is not available.");
      return;
    }

    if (
      availableImportScopes.length > 0 &&
      !availableImportScopes.includes(selectedImportScope)
    ) {
      message.error(
        `Selected file does not support ${getScopeLabel(selectedImportScope)} import.`
      );
      return;
    }

    dispatch(setImportStatus("running"));
    dispatch(setImportExportResultMessage(""));
    try {
      await onImportFromFile({
        scope: selectedImportScope,
        importedJson: selectedFileJson,
      });
      dispatch(setImportStatus("success"));
      dispatch(setImportExportResultMessage("Import completed successfully."));
      dispatch(clearSelectedImportFile());
      dispatch(closeImportExportModal());
      onImportSuccess(selectedImportScope);
      message.success(`${getScopeLabel(selectedImportScope)} imported successfully.`);
    } catch (error) {
      const errorMessage = error?.message || "Import failed.";
      dispatch(setImportStatus("failed"));
      dispatch(setImportExportResultMessage(errorMessage));
      message.error(errorMessage);
    } finally {
      dispatch(setImportStatus("idle"));
    }
  };

  const handleExportDownload = () => {
    const payload = buildExportPayload(
      mainBuilderData,
      activeExportScope,
      activeLayoutSettingsExportMode,
      activeLayoutSettingsCustomOptions
    );
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    const layoutSettingsSuffix =
      activeExportScope === "layout_settings"
        ? activeLayoutSettingsExportMode === "custom"
          ? `-custom`
          : `-${activeLayoutSettingsExportMode}`
        : "";
    anchor.download = `caf-builder-${activeExportScope}${layoutSettingsSuffix}-${Date.now()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    message.success(`${getScopeLabel(activeExportScope)} exported successfully.`);
  };

  const handleLibraryImport = async (template) => {
    if (!template?.id || typeof onImportFromFile !== "function") {
      message.error("Template is not available.");
      return;
    }

    if (isLibraryTemplateLocked(template)) {
      message.warning(getLibraryTemplateLockMessage(template));
      return;
    }

    dispatch(setSelectedTemplate(template.id));
    dispatch(setImportStatus("running"));
    dispatch(setImportExportResultMessage(""));

    try {
      let resolvedTemplate = template;

      if (!resolvedTemplate?.payload) {
        resolvedTemplate = await fetchLibraryTemplatePayload(template.id);
      }

      if (!resolvedTemplate?.payload) {
        throw new Error("Template payload is not available.");
      }

      await onImportFromFile({
        scope: resolvedTemplate.scope,
        importedJson: resolvedTemplate.payload,
        mergeFilterModule:
          resolvedTemplate.section === "filter" &&
          resolvedTemplate.filterLibraryTab &&
          resolvedTemplate.filterLibraryTab !== "full_filter",
      });
      dispatch(setImportStatus("success"));
      dispatch(setImportExportResultMessage("Import completed successfully."));
      dispatch(setPreviewTemplate(null));
      dispatch(closeImportExportModal());
      onImportSuccess(resolvedTemplate.scope);
      message.success(`${resolvedTemplate.title} imported successfully.`);
    } catch (error) {
      const errorMessage = error?.message || "Import failed.";
      dispatch(setImportStatus("failed"));
      dispatch(setImportExportResultMessage(errorMessage));
      message.error(errorMessage);
    } finally {
      dispatch(setImportStatus("idle"));
    }
  };

  const importFileContent = (
    <div
      className={buildImportLayoutShellClassName({
        source: "file",
        tabKey: selectedImportScope,
      })}
    >
      <aside className="caf-import-sidebar caf-import-sidebar--source-file">
        {scopeItems.map((scope) => {
          const hasFile = Boolean(selectedFileJson);
          const isScopeAvailable =
            !hasFile || availableImportScopes.includes(scope.key);
          return (
          <button
            key={scope.key}
            type="button"
            className={`caf-import-sidebar-item caf-import-sidebar-item--${toImportTabClassSuffix(
              scope.key
            )} ${selectedImportScope === scope.key ? "active" : ""}`}
            disabled={!isScopeAvailable}
            onClick={() => {
              if (!isScopeAvailable) {
                message.error(
                  `${scope.label} is not available in the selected file.`
                );
                return;
              }
              dispatch(setSelectedImportScope(scope.key));
            }}
          >
            <ImportExportLabel iconKey={scope.key}>
              {scope.label}
            </ImportExportLabel>
          </button>
          );
        })}
      </aside>

      <section
        className={buildImportLibraryGridWrapClassName({
          source: "file",
          tabKey: selectedImportScope,
        })}
      >
        <h3 className="caf-import-section-title">
          Choose File
        </h3>
        <div className="caf-import-file-panel">
          <Upload
            beforeUpload={handleJsonFileSelect}
            onRemove={() => dispatch(clearSelectedImportFile())}
            fileList={selectedFile ? [selectedFile] : []}
            maxCount={1}
          >
            <Button>
              Select JSON File
            </Button>
          </Upload>

          <div className="caf-import-file-meta">
            {selectedFile ? (
              <p>
                Selected: <strong>{selectedFile.name}</strong>
              </p>
            ) : (
              <p>No file selected.</p>
            )}

            {availableImportScopes.length > 0 && (
              <p className="caf-import-scopes">
                Available in file: {availableImportScopes.join(", ")}
              </p>
            )}
          </div>

          <Button
            type="primary"
            disabled={!selectedFileJson}
            loading={isImporting}
            onClick={handleStartImport}
          >
            Start Import
          </Button>
        </div>
      </section>
    </div>
  );

  const importLibraryContent = (
    <div
      className={buildImportLayoutShellClassName({
        source: "library",
        tabKey: activeSection,
        filterLibraryTabKey:
          activeSection === "filter" ? activeFilterLibraryTab : undefined,
        layoutSettingsLibraryTabKey:
          activeSection === "layout_settings"
            ? activeLayoutSettingsLibraryTab
            : undefined,
      })}
    >
      <aside className="caf-import-sidebar caf-import-sidebar--source-library">
        {sectionItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`caf-import-sidebar-item caf-import-sidebar-item--${toImportTabClassSuffix(
              item.key
            )} ${activeSection === item.key ? "active" : ""}`}
            onClick={() => dispatch(setImportExportSection(item.key))}
          >
            <ImportExportLabel iconKey={item.key}>
              {item.label}
            </ImportExportLabel>
          </button>
        ))}
      </aside>

      <section
        className={buildImportLibraryGridWrapClassName({
          source: "library",
          tabKey: activeSection,
          filterLibraryTabKey:
            activeSection === "filter" ? activeFilterLibraryTab : undefined,
          layoutSettingsLibraryTabKey:
            activeSection === "layout_settings"
              ? activeLayoutSettingsLibraryTab
              : undefined,
        })}
      >
        <h3 className="caf-import-section-title">
          {sectionItems.find((item) => item.key === activeSection)?.label ||
            "Full Filter Layout"}
        </h3>

        {activeSection === "filter" && (
          <div className="caf-import-filter-library-tabs">
            {FILTER_LIBRARY_TABS.map((tab) => {
              const isTabLocked = isFilterLibraryTabLocked(tab.key);

              return (
              <button
                key={tab.key}
                type="button"
                className={`caf-import-filter-library-tab caf-import-filter-library-tab--${toImportTabClassSuffix(
                  tab.key
                )} ${activeFilterLibraryTab === tab.key ? "active" : ""}${
                  isTabLocked ? " caf-import-filter-library-tab--locked" : ""
                }`}
                disabled={isTabLocked}
                title={
                  isTabLocked ? getFilterLibraryTabLockMessage(tab) : undefined
                }
                onClick={() => {
                  if (isTabLocked) {
                    message.warning(getFilterLibraryTabLockMessage(tab));
                    return;
                  }
                  dispatch(setFilterLibraryTab(tab.key));
                }}
              >
                <ImportExportLabel iconKey={tab.key}>
                  {tab.label}
                  {isTabLocked ? " (Pro)" : ""}
                </ImportExportLabel>
              </button>
              );
            })}
          </div>
        )}

        {activeSection === "layout_settings" && (
          <div className="caf-import-filter-library-tabs caf-import-layout-settings-library-tabs">
            {LAYOUT_SETTINGS_LIBRARY_TABS.map((tab) => {
              const isTabLocked = isLayoutSettingsLibraryTabLocked(tab.key);

              return (
              <button
                key={tab.key}
                type="button"
                className={`caf-import-filter-library-tab caf-import-layout-settings-library-tab caf-import-layout-settings-library-tab--${toImportTabClassSuffix(
                  tab.key
                )} ${activeLayoutSettingsLibraryTab === tab.key ? "active" : ""}${
                  isTabLocked ? " caf-import-filter-library-tab--locked" : ""
                }`}
                disabled={isTabLocked}
                title={
                  isTabLocked
                    ? getLayoutSettingsLibraryTabLockMessage(tab)
                    : undefined
                }
                onClick={() => {
                  if (isTabLocked) {
                    message.warning(getLayoutSettingsLibraryTabLockMessage(tab));
                    return;
                  }
                  dispatch(setLayoutSettingsLibraryTab(tab.key));
                }}
              >
                <ImportExportLabel iconKey={tab.key}>
                  {tab.label}
                  {isTabLocked ? " (Pro)" : ""}
                </ImportExportLabel>
              </button>
              );
            })}
          </div>
        )}

        {loadingTemplates && <p>Loading templates...</p>}
        {!loadingTemplates && templatesError && (
          <p className="caf-import-library-error">{templatesError}</p>
        )}
        {!loadingTemplates && !templatesError && templates.length === 0 && (
          <p className="caf-import-library-empty">No templates in this category yet.</p>
        )}
        <div className="caf-import-library-grid">
          {templates.map((item) => {
            const isTemplateLocked = isLibraryTemplateLocked(item);

            return (
            <article
              className={`caf-import-template-card${
                item.previewImage || item.previewCardLayout
                  ? " caf-import-template-card--preview"
                  : ""
              }${
                item.previewCardLayout && !item.previewImage
                  ? " caf-import-template-card--no-image"
                  : ""
              }${item.libraryCardClass ? ` ${item.libraryCardClass}` : ""}${
                isTemplateLocked ? " caf-import-template-card--locked" : ""
              }`}
              key={item.id}
            >
              <div className="caf-import-template-thumb">
                {item.previewImage ? (
                  <img
                    className="caf-import-template-thumb-img"
                    src={item.previewImage}
                    alt={item.title}
                    onError={(event) => {
                      if (event.currentTarget.src !== LIBRARY_PREVIEW_FALLBACK) {
                        event.currentTarget.src = LIBRARY_PREVIEW_FALLBACK;
                      }
                    }}
                  />
                ) : item.previewCardLayout ? (
                  <span className="caf-import-template-thumb-placeholder">
                    {item.title}
                  </span>
                ) : (
                  item.title
                )}
                {item.tier === "pro" && (
                  <span className="caf-import-template-badge caf-import-template-badge--pro">
                    <span
                      className="caf-import-template-badge-icon"
                      aria-hidden="true"
                    />
                    Pro
                  </span>
                )}
                <div className="caf-import-template-actions">
                  <button
                    type="button"
                    className="preview"
                    onClick={() => {
                      const demoUrl = resolveLibraryDemoUrl(item);
                      if (demoUrl) {
                        window.open(demoUrl, "_blank", "noopener,noreferrer");
                        return;
                      }
                      dispatch(setPreviewTemplate(item.id));
                    }}
                  >
                    <ImportExportPreviewEyeIcon className="caf-import-template-preview-icon" />
                    Preview
                  </button>
                  <button
                    type="button"
                    className={isTemplateLocked ? "insert insert--locked" : "insert"}
                    onClick={() => handleLibraryImport(item)}
                    disabled={isImporting || isTemplateLocked}
                    title={
                      isTemplateLocked
                        ? getLibraryTemplateLockMessage(item)
                        : undefined
                    }
                  >
                    {isTemplateLocked
                      ? "Pro"
                      : selectedTemplateId === item.id && isImporting
                      ? getLibraryInsertButtonLabel(item.section, true)
                      : getLibraryInsertButtonLabel(item.section)}
                  </button>
                </div>
              </div>
              {(item.previewImage || item.previewCardLayout) && (
                <>
                  <p className="caf-import-template-caption">{item.title}</p>
                  {isTemplateLocked ? (
                    <p className="caf-import-template-lock-note">
                      <a
                        href={getLibraryTemplateUpgradeUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="caf-import-template-lock-note__link"
                      >
                        Upgrade to Pro
                      </a>{" "}
                      to import this template.
                    </p>
                  ) : null}
                </>
              )}
            </article>
            );
          })}
          {!loadingTemplates && shouldShowLibraryProUpsellCard() ? (
            <ImportLibraryProUpsellCard />
          ) : null}
        </div>
      </section>
    </div>
  );

  const isLayoutSettingsCustomInvalid =
    activeExportScope === "layout_settings" &&
    activeLayoutSettingsExportMode === "custom" &&
    activeLayoutSettingsCustomOptions.length === 0;

  return (
    <Modal
      title={null}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1080}
      className={`caf-import-export-modal caf-builder-modal caf-import-export-modal--${toImportTabClassSuffix(
        activeTab
      )}`}
      destroyOnHidden
    >
      <Tabs
        activeKey={activeTab}
        onChange={(key) => dispatch(setImportExportTab(key))}
        items={[
          {
            key: "export",
            label: "Export",
            children: (
              <div
                className={`caf-import-export-panel caf-import-export-panel--export caf-import-export-panel--scope-${toImportTabClassSuffix(
                  activeExportScope
                )}`}
              >
                <div className="caf-import-actions caf-import-actions--export">
                  {scopeItems.map((scope) => (
                    <Button
                      key={scope.key}
                      className={`caf-import-source-tab caf-import-source-tab--${toImportTabClassSuffix(
                        scope.key
                      )} ${activeExportScope === scope.key ? "active" : ""}`}
                      onClick={() => dispatch(setExportScopeTab(scope.key))}
                    >
                      <ImportExportLabel iconKey={scope.key}>
                        {scope.label}
                      </ImportExportLabel>
                    </Button>
                  ))}
                </div>

                <div className="caf-import-file-panel">
                  <p className="caf-import-scope-note">
                    Export selected scope as a JSON file.
                  </p>
                  {activeExportScope === "layout_settings" && (
                    <div className="caf-layout-settings-export-options">
                      <p className="caf-import-scope-note">
                        Select layout settings data to export:
                      </p>
                      <Radio.Group
                        className="caf-layout-settings-radio-group"
                        value={activeLayoutSettingsExportMode}
                        onChange={(event) =>
                          dispatch(
                            setLayoutSettingsExportMode(event.target.value)
                          )
                        }
                      >
                        {layoutSettingsModeOptions.map((option) => (
                          <Radio
                            className="caf-layout-settings-radio"
                            key={option.key}
                            value={option.key}
                          >
                            {option.label}
                          </Radio>
                        ))}
                      </Radio.Group>
                      {activeLayoutSettingsExportMode === "custom" && (
                        <Checkbox.Group
                          className="caf-layout-settings-checkbox-group"
                          value={activeLayoutSettingsCustomOptions}
                          onChange={(checkedValues) =>
                            dispatch(setLayoutSettingsCustomOptions(checkedValues))
                          }
                        >
                          {layoutSettingsCustomOptions.map((group) => (
                            <div
                              key={group.label}
                              className="caf-layout-settings-checkbox-group-section"
                            >
                              <p className="caf-layout-settings-checkbox-group-label">
                                {group.label}
                              </p>
                              {group.options.map((option) => (
                                <Checkbox
                                  className="caf-layout-settings-checkbox"
                                  key={option.key}
                                  value={option.key}
                                >
                                  {option.label}
                                </Checkbox>
                              ))}
                            </div>
                          ))}
                        </Checkbox.Group>
                      )}
                    </div>
                  )}
                  <Button
                    type="primary"
                   
                    disabled={isLayoutSettingsCustomInvalid}
                    onClick={handleExportDownload}
                  >
                    Export JSON
                  </Button>
                </div>
              </div>
            ),
          },
          {
            key: "import",
            label: "Import",
            children: (
              <div
                className={`caf-import-export-panel caf-import-export-panel--import caf-import-export-panel--source-${toImportTabClassSuffix(
                  activeImportSource
                )}`}
              >
                <div className="caf-import-actions caf-import-actions--import">
                  {canUseImportLibrary ? (
                    <Button
                      className={`caf-import-source-tab caf-import-source-tab--library ${
                        activeImportSource === "library" ? "active" : ""
                      }`}
                      onClick={() => dispatch(setImportSourceTab("library"))}
                    >
                      <ImportExportLabel iconKey="library">
                        Import From Library
                      </ImportExportLabel>
                    </Button>
                  ) : (
                    <Button
                      className="caf-import-source-tab caf-import-source-tab--library caf-import-source-tab--locked"
                      disabled
                      title="Template library is available in Category Ajax Filter Pro."
                    >
                      <ImportExportLabel iconKey="library">
                        Import From Library (Pro)
                      </ImportExportLabel>
                    </Button>
                  )}
                  <Button
                    className={`caf-import-source-tab caf-import-source-tab--file ${
                      activeImportSource === "file" ? "active" : ""
                    }`}
                    onClick={() => dispatch(setImportSourceTab("file"))}
                  >
                    <ImportExportLabel iconKey="file">Choose File</ImportExportLabel>
                  </Button>
                </div>

                {activeImportSource === "library" && canUseImportLibrary
                  ? importLibraryContent
                  : importFileContent}
              </div>
            ),
          },
        ]}
      />
      <Modal
        title={previewTemplate?.title || "Template Preview"}
        open={Boolean(previewTemplate)}
        onCancel={() => dispatch(setPreviewTemplate(null))}
        className="caf-import-export-template-preview-modal caf-builder-modal"
        footer={[
          <Button
            key="cancel"
            onClick={() => dispatch(setPreviewTemplate(null))}
          >
            Close
          </Button>,
          resolveLibraryDemoUrl(previewTemplate) ? (
            <Button
              key="demo"
              onClick={() => {
                window.open(
                  resolveLibraryDemoUrl(previewTemplate),
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
            >
              View Demo
            </Button>
          ) : null,
          <Button
            key="use"
            type="primary"
            loading={isImporting}
            disabled={previewTemplate ? isLibraryTemplateLocked(previewTemplate) : false}
            icon={
              <ImportExportPickerIcon
                iconKey="import"
                className="caf-import-export-btn-icon caf-import-export-btn-icon--on-primary"
              />
            }
            onClick={() => previewTemplate && handleLibraryImport(previewTemplate)}
          >
            {isImporting && selectedTemplateId === previewTemplate?.id
              ? getLibraryInsertButtonLabel(previewTemplate?.section, true)
              : getLibraryInsertButtonLabel(previewTemplate?.section)}
          </Button>,
        ]}
      >
        {previewTemplate ? (
          <div>
            <p>{previewTemplate.description || "Library template preview."}</p>
            <p>
              <strong>Scope:</strong> {getScopeLabel(previewTemplate.scope)}
            </p>
            <p>
              <strong>Post Type:</strong>{" "}
              {previewTemplate?.payload?.common_data?.post_type || "post"}
            </p>
            <p>
              <strong>Filter Rows:</strong>{" "}
              {Array.isArray(previewTemplate?.payload?.filter_layout_data?.initial_data)
                ? previewTemplate.payload.filter_layout_data.initial_data.length
                : 0}
            </p>
            <p>
              <strong>Post Rows:</strong>{" "}
              {Array.isArray(previewTemplate?.payload?.post_layout_data?.initial_data)
                ? previewTemplate.payload.post_layout_data.initial_data.length
                : 0}
            </p>
          </div>
        ) : null}
      </Modal>
    </Modal>
  );
}

export default ImportExportModal;
