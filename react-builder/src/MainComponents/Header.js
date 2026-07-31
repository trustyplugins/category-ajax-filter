import React, { useEffect, useState, useRef } from "react";
import BuilderEditIcon from "./BuilderEditIcon";
import BuilderHomeIcon from "./BuilderHomeIcon";
import BuilderNextArrowIcon from "./BuilderNextArrowIcon";
import BuilderSettingIcon from "./BuilderSettingIcon";
import BuilderCrossCircleIcon from "./BuilderCrossCircleIcon";
import BuilderImportExportNewIcon from "./BuilderImportExportNewIcon";
import BuilderRevisionsIcon from "./BuilderRevisionsIcon";
import BuilderRevisionsPanel from "./BuilderRevisionsPanel";
import BuilderCafLogoIcon from "./BuilderCafLogoIcon";
import MiscSettingDrawer from "./MiscSettingDrawer";
import { useDispatch } from "react-redux";
import ImportExportModal from "./importExport/ImportExportModal";
import { openImportExportModal } from "../store/importExportSlice";
import {
  Button,
  notification,
  Modal,
  Input,
  message,
  Drawer,
} from "antd";
import cloneDeep from "lodash/cloneDeep";
import apiClient from "../api/client";
import { apiEndpoints } from "../api/endpoints";
import {
  resolveLayoutIndexFromBuilderData,
  resolveLayoutKeyFromBuilderData,
  resolveLayoutNameFromBuilderData,
  resolveLayoutPublishFromBuilderData,
  resolvePostExtraDataFromBuilderData,
  resolvePostTypeFromBuilderData,
  resolveGlobalFontFamilyFromBuilderData,
  isBuilderLayoutDocument,
} from "./utils/builderDataAdapters";
import { migrateLayoutDocument } from "../layoutSchema/migrateLayoutDocument";
import { stampLayoutSchemaVersion } from "../layoutSchema/stampLayoutSchemaVersion";
import { sanitizeFilterLayoutTermData } from "./importExport/sanitizeImportedFilterTerms";
import { clearImportedPostLayoutCustomFields } from "./importExport/sanitizeImportedPostCustomFields";
import { mergeFilterModulesIntoLayout } from "./importExport/mergeImportedFilterLayout";
import { mergeScopedCommonDataOnImport } from "./importExport/importExportScopes";
import { shouldMergeImportedCommonData } from "./importExport/importExportScopes";
import { loadGoogleFontFamily, preloadGoogleFontsCatalog } from "./utils/globalFontFamily";
import {
  resolveBuilderPreviewDevice,
  stripBuilderPreviewDeviceForSave,
  withSessionPreviewDevice,
} from "./utils/builderPreviewDevice";
import { sanitizeLayoutDocumentForTier } from "../tier/sanitizeLayoutForTier";

function Header(props) {
  const dispatch = useDispatch();
  const [mainBuilderData, setMainBuilderData] = useState(() =>
    migrateLayoutDocument(props.mainBuilderData).doc
  );
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [modalPopUp, setModalPopUp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const currentLayoutName = resolveLayoutNameFromBuilderData(
    props.mainBuilderData
  );
  const prevMainBuilderData = useRef(
    cloneDeep(migrateLayoutDocument(props.mainBuilderData).doc)
  );
  const [builderTitle, setBuilderTitle] = useState(currentLayoutName);
  const [builderLabel, setBuilderLabel] = useState(currentLayoutName);
  const [layoutRenamePopup, setLayoutRenamePopup] = useState(false);
  const [open, setOpen] = useState(false);
  const [revisionDrawerOpen, setRevisionDrawerOpen] = useState(false);
  const getFallbackLayoutIndexFromKey = (layoutKey) => {
    if (typeof layoutKey !== "string") return "";
    const parts = layoutKey.split("_");
    const lastPart = parts[parts.length - 1];
    return /^\d+$/.test(lastPart) ? lastPart : "";
  };
  const commitBuilderPatch = (mutator) => {
    const nextBuilder = structuredClone(mainBuilderData || {});
    if (!nextBuilder.common_data) {
      nextBuilder.common_data = {};
    }
    mutator(nextBuilder);
    const { doc } = migrateLayoutDocument(nextBuilder);
    setMainBuilderData(doc);
    props.updatedBuilderData(doc);
    return doc;
  };

  useEffect(() => {
    preloadGoogleFontsCatalog();
    const { doc } = migrateLayoutDocument(props.mainBuilderData);
    setMainBuilderData(doc);
    loadGoogleFontFamily(resolveGlobalFontFamilyFromBuilderData(doc));
  }, [props.mainBuilderData]);

  useEffect(() => {
    const layoutName = resolveLayoutNameFromBuilderData(props.mainBuilderData);
    setBuilderTitle(layoutName);
    setBuilderLabel(layoutName);
  }, [props.mainBuilderData]);

  const extraData = resolvePostExtraDataFromBuilderData(mainBuilderData);

  const isDirty = () => {
    try {
      return (
        JSON.stringify(prevMainBuilderData.current) !==
        JSON.stringify(mainBuilderData)
      );
    } catch (error) {
      return true;
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isDirty()) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [mainBuilderData]);

  const handleMiscSettingPage = () => {};

  const openNotification = (flag = false, didPublish = false) => {
    const handleButtonClick = () => {
      props.setSelectType("");
      props.setCurrStep("1");
    };

    const successTitle = didPublish ? "Layout Published!" : "Layout Saved!";

    const messageWithButton = (
      <>
        {props.selectType === "filter" &&
        mainBuilderData?.post_layout_data?.breadcrumb_data?.select_builder ===
          "false" ? (
          <div>
            {successTitle} Now you can go for
            {flag === false ? (
              <Button type="link" onClick={handleButtonClick}>
                Post Layout!
              </Button>
            ) : (
              " Post Layout!"
            )}
          </div>
        ) : (
          <div>{successTitle}</div>
        )}
      </>
    );

    notification.open({
      title: messageWithButton,
      className: "layout-saved-note",
      duration: flag === false ? 3 : 1,
    });
  };

  const onHandleSaveLayout = async (flag = false) => {
    if (isSaving) return false;
    setIsSaving(true);
    try {
      const sessionPreviewDevice = resolveBuilderPreviewDevice(mainBuilderData);
      let newData = stripBuilderPreviewDeviceForSave(mainBuilderData);
      const wasDraft =
        resolveLayoutPublishFromBuilderData(mainBuilderData) === "draft";

      if (props.selectType === "filter") {
        newData.filter_layout_data.breadcrumb_data.select_builder = "true";
      } else if (props.selectType !== "") {
        newData.post_layout_data.breadcrumb_data.select_builder = "true";
      }

      // First header action on a draft always publishes (any step).
      if (wasDraft) {
        newData.common_data.layout_publish = "publish";
      }

      if (!newData.common_data.layout_key) {
        return false;
      }
      const safeLayoutIndex =
        newData.common_data.layout_index !== undefined &&
        newData.common_data.layout_index !== null &&
        String(newData.common_data.layout_index).trim() !== ""
          ? String(newData.common_data.layout_index)
          : getFallbackLayoutIndexFromKey(newData.common_data.layout_key);

      if (!safeLayoutIndex) {
        message.error("Layout index missing. Please reload and try again.");
        return false;
      }

      newData.common_data.layout_index = safeLayoutIndex;

      // Enforce free-tier module/setting limits before persist (defense-in-depth with PHP).
      newData = sanitizeLayoutDocumentForTier(newData);
      stampLayoutSchemaVersion(newData);

      const response = await apiClient.post(apiEndpoints.updateBuilderLayout, {
        layout_data: JSON.stringify(newData),
        layout_key: newData.common_data.layout_key,
        layout_index: safeLayoutIndex,
      });

      if (response?.data?.status === "success") {
        const { doc } = migrateLayoutDocument(response.data.layout_data);
        const docWithSessionDevice = withSessionPreviewDevice(
          doc,
          sessionPreviewDevice
        );
        prevMainBuilderData.current = cloneDeep(docWithSessionDevice);
        setMainBuilderData(docWithSessionDevice);
        props.updatedBuilderData(docWithSessionDevice);

        openNotification(flag, wasDraft);
        return true;
      } else {
        message.error(response?.data?.message || "Failed to save layout");
        return false;
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to save layout");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updatedBuilderData = (data) => {
    if (!isBuilderLayoutDocument(data)) {
      if (typeof console !== "undefined" && console.error) {
        console.error(
          "[CAF Builder] Ignored invalid layout update (expected full layout document)."
        );
      }
      return;
    }
    const { doc } = migrateLayoutDocument(data);
    setMainBuilderData(doc);
    props.updatedBuilderData(doc);
  };

  const completePendingNavigation = () => {
    const navigation = pendingNavigation;
    setPendingNavigation(null);

    if (!navigation) {
      return;
    }

    if (navigation.type === "close") {
      props.setCurrStep("2");
      props.closeAllPopUps(false);
      return;
    }

    if (navigation.type === "tab") {
      runTabChange(navigation.step, navigation.tabType || "");
    }
  };

  const requestNavigation = (navigation) => {
    if (!isDirty()) {
      if (navigation.type === "close") {
        props.setCurrStep("2");
        props.closeAllPopUps(false);
        return;
      }
      if (navigation.type === "tab") {
        runTabChange(navigation.step, navigation.tabType || "");
      }
      return;
    }

    setPendingNavigation(navigation);
    setModalPopUp(true);
  };

  const handleCancel = () => {
    requestNavigation({ type: "close" });
  };

  const runTabChange = (step, type = "") => {
    if (step === 0) {
      // console.log('one')
      // if (props.selectType === "post" || props.selectType === "post-preview") {
      //   console.log('two')
      //   props.setSelectType("filter");
      //   props.setCurrStep("2");
      // } else {
        //console.log('3rd')
        props.setSelectType("");
        props.setCurrStep("0");
      //}
    }
      if (step === 1 ) {
        props.setSelectType("filter");
        props.setCurrStep("1");
      }

    if (step === 2 && type !== "filter") {
      props.setSelectType("post");
      props.setCurrStep("2");
    }

    if (step === 3) {
      props.setSelectType("post-preview");
      props.setCurrStep("3");
    }
  };

  const changeTab = (step, type = "") => {
    runTabChange(step, type);
  };

  const normalizeLayoutLabel = (label) =>
    String(label ?? "").trim().replace(/\s+/g, " ");

  const isLayoutLabelValid = normalizeLayoutLabel(builderLabel).length > 0;

  const handleUpdateLayoutTitle = async () => {
    const value = normalizeLayoutLabel(builderLabel);
    if (!value) {
      message.warning("Filter label cannot be empty.");
      return false;
    }

    try {
      const str = resolveLayoutKeyFromBuilderData(mainBuilderData);
      const arr = str.split("_");
      const key = arr[arr.length - 1];

      const response = await apiClient.post(
        apiEndpoints.renameBuilderLayoutLabel,
        {
          label: value,
          index: key,
        }
      );

      if (response?.data?.status === "success") {
        setBuilderLabel(response.data.label);
        setBuilderTitle(response.data.label);
        setLayoutRenamePopup(false);

        notification.open({
          title: "Filter label updated.",
        });

        const updatedBuilder = commitBuilderPatch((nextBuilder) => {
          nextBuilder.common_data.layout_name = response.data.label;
        });
        prevMainBuilderData.current = cloneDeep(updatedBuilder);
      }
    } catch (error) {
      console.error(error);
      message.error("Rename failed");
    }
  };

  const handleCancelLayoutRename = () => {
    setLayoutRenamePopup(false);
    setBuilderLabel(builderTitle);
  };

  const onChangeBuilderLabel = (e) => {
    setBuilderLabel(e.target.value);
  };

  const editTitle = () => {
    setLayoutRenamePopup(true);
  };

  const handlePopUpSave = async () => {
    const saved = await onHandleSaveLayout(true);
    if (!saved) {
      return;
    }

    setModalPopUp(false);
    completePendingNavigation();
  };

  const handlePopUpDiscard = () => {
    props.updatedBuilderData(prevMainBuilderData.current);
    setMainBuilderData(cloneDeep(prevMainBuilderData.current));
    setModalPopUp(false);
    completePendingNavigation();
  };

  const handlePopUpDismiss = () => {
    setPendingNavigation(null);
    setModalPopUp(false);
  };

  const handelImportClick = () => {
    dispatch(openImportExportModal());
  };

  const onClose = () => {
    setOpen(false);
  };
  const onCloseRevisions = () => {
    setRevisionDrawerOpen(false);
  };

  const handleImportFromFile = async ({
    scope,
    importedJson,
    mergeFilterModule = false,
  }) => {
    if (!importedJson || typeof importedJson !== "object") {
      throw new Error("Invalid import payload.");
    }

    const currentLayoutKey = resolveLayoutKeyFromBuilderData(mainBuilderData);
    const currentLayoutName = resolveLayoutNameFromBuilderData(mainBuilderData);
    const currentLayoutIndex = resolveLayoutIndexFromBuilderData(mainBuilderData);
    const currentLayoutPublish = resolveLayoutPublishFromBuilderData(mainBuilderData);

    if (!currentLayoutKey) {
      throw new Error("Current layout key is missing.");
    }

    const importedDoc = migrateLayoutDocument(cloneDeep(importedJson)).doc;
    const nextBuilder = cloneDeep(mainBuilderData);
    const importedMeta = importedJson?._export_meta || {};
    const currentPostType = resolvePostTypeFromBuilderData(mainBuilderData);
    const importedPostType =
      importedDoc?.common_data?.post_type ||
      importedDoc?.filter_layout_data?.extra_data?.post_type ||
      importedDoc?.post_layout_data?.extra_data?.post_type ||
      "";
    const shouldClearImportedTermSelections =
      Boolean(currentPostType) &&
      Boolean(importedPostType) &&
      currentPostType !== importedPostType;

    const scopeIncludesFilterLayout =
      scope === "filter_layout" ||
      scope === "full_layout" ||
      (scope !== "post_layout" &&
        scope !== "layout_settings" &&
        Boolean(importedDoc.filter_layout_data));

    const scopeIncludesPostLayout =
      scope === "post_layout" ||
      scope === "full_layout" ||
      (scope !== "filter_layout" &&
        scope !== "layout_settings" &&
        Boolean(importedDoc.post_layout_data));

    const applyCurrentPostTypeToFilterModules = () => {
      const nextRows = nextBuilder?.filter_layout_data?.initial_data || [];
      if (!Array.isArray(nextRows)) return;
      nextRows.forEach((row) => {
        (row?.data || []).forEach((col) => {
          (col?.data || []).forEach((module) => {
            if (!module?.settings || typeof module.settings !== "object") return;
            if (
              module.key === "checkbox_filter" ||
              module.key === "dropdown_filter" ||
              module.settings?.data_source === "taxonomy"
            ) {
              module.settings.post_type = currentPostType;
            }
          });
        });
      });
    };

    const ensurePreviewTemplateData = (doc) => {
      if (!doc.common_data) doc.common_data = {};
      if (!doc.common_data.preview_template_data) {
        doc.common_data.preview_template_data = {};
      }
      return doc.common_data.preview_template_data;
    };

    const ensureMiscPreviewData = (doc) => {
      const previewTemplateData = ensurePreviewTemplateData(doc);
      if (!doc.common_data.preview_template_data.misc_preview_data) {
        doc.common_data.preview_template_data.misc_preview_data = {};
      }
      return previewTemplateData.misc_preview_data;
    };

    const mergeDndColumnsByKeys = (currentColumns, importedColumns, targetKeys) => {
      const keysToReplace = new Set(
        Array.isArray(targetKeys) ? targetKeys.filter(Boolean) : []
      );
      if (keysToReplace.size === 0) return cloneDeep(currentColumns || []);

      const safeCurrent = Array.isArray(currentColumns) ? cloneDeep(currentColumns) : [];
      const safeImported = Array.isArray(importedColumns) ? cloneDeep(importedColumns) : [];

      const cleanedCurrent = safeCurrent.map((column) => {
        const currentItems = Array.isArray(column?.data) ? column.data : [];
        return {
          ...column,
          data: currentItems.filter((item) => !keysToReplace.has(item?.key)),
        };
      });

      safeImported.forEach((importedColumn) => {
        const importedItems = Array.isArray(importedColumn?.data)
          ? importedColumn.data.filter((item) => keysToReplace.has(item?.key))
          : [];
        if (importedItems.length === 0) return;

        const existingIndex = cleanedCurrent.findIndex(
          (column) => column?.key === importedColumn?.key
        );
        if (existingIndex >= 0) {
          cleanedCurrent[existingIndex].data = [
            ...(cleanedCurrent[existingIndex].data || []),
            ...cloneDeep(importedItems),
          ];
          return;
        }

        cleanedCurrent.push({
          ...cloneDeep(importedColumn),
          data: cloneDeep(importedItems),
        });
      });

      return cleanedCurrent;
    };

    if (scope === "filter_layout") {
      if (!importedDoc.filter_layout_data) {
        throw new Error("Selected file does not contain filter layout data.");
      }

      if (mergeFilterModule) {
        nextBuilder.filter_layout_data = await mergeFilterModulesIntoLayout(
          nextBuilder.filter_layout_data,
          importedDoc.filter_layout_data,
          {
            apiClient,
            apiEndpoints,
            currentPostType,
            importedPostType,
          }
        );
      } else {
        nextBuilder.filter_layout_data = cloneDeep(importedDoc.filter_layout_data);
        if (importedDoc.common_data) {
          nextBuilder.common_data = mergeScopedCommonDataOnImport(
            nextBuilder.common_data,
            importedDoc.common_data,
            "filter_layout"
          );
        }
      }
    } else if (scope === "post_layout") {
      if (!importedDoc.post_layout_data) {
        throw new Error("Selected file does not contain post layout data.");
      }
      nextBuilder.post_layout_data = cloneDeep(importedDoc.post_layout_data);
      if (importedDoc.common_data) {
        nextBuilder.common_data = mergeScopedCommonDataOnImport(
          nextBuilder.common_data,
          importedDoc.common_data,
          "post_layout"
        );
      }
    } else if (scope === "layout_settings") {
      const importedPreviewTemplateData =
        importedDoc?.common_data?.preview_template_data;
      if (!importedPreviewTemplateData || typeof importedPreviewTemplateData !== "object") {
        throw new Error("Selected file does not contain layout settings data.");
      }

      const importMode =
        importedMeta?.layout_settings_mode || importedMeta?.layout_settings_option;
      const importOption = importMode || "everything";
      const customOptionsRaw = importedMeta?.layout_settings_custom_options;
      const customOptions = Array.isArray(customOptionsRaw)
        ? customOptionsRaw
        : importOption !== "everything"
        ? [importOption]
        : [];
      const nextPreviewTemplateData = ensurePreviewTemplateData(nextBuilder);
      const nextMiscPreviewData = ensureMiscPreviewData(nextBuilder);
      const importedMiscPreviewData =
        importedPreviewTemplateData?.misc_preview_data || {};

      if (importOption === "everything") {
        nextBuilder.common_data.preview_template_data = cloneDeep(
          importedPreviewTemplateData
        );
      } else {
        const dndKeyMap = {
          selected_filters: "selected",
          sorting_data: "sorting",
          result_count: "result_count",
          pagination: "pagination",
        };
        const targetDndKeys = customOptions
          .map((option) => dndKeyMap[option])
          .filter(Boolean);

        if (targetDndKeys.length > 0) {
          nextMiscPreviewData.dnd_column_data = mergeDndColumnsByKeys(
            nextMiscPreviewData.dnd_column_data,
            importedMiscPreviewData.dnd_column_data,
            targetDndKeys
          );
        } else if (Array.isArray(importedMiscPreviewData.dnd_column_data)) {
          const inferredKeys = importedMiscPreviewData.dnd_column_data.flatMap((column) =>
            (Array.isArray(column?.data) ? column.data : [])
              .map((item) => item?.key)
              .filter(Boolean)
          );
          nextMiscPreviewData.dnd_column_data = mergeDndColumnsByKeys(
            nextMiscPreviewData.dnd_column_data,
            importedMiscPreviewData.dnd_column_data,
            inferredKeys
          );
        }

        if (customOptions.includes("layout_settings")) {
          if (importedPreviewTemplateData?.post_preview_data) {
            nextPreviewTemplateData.post_preview_data = cloneDeep(
              importedPreviewTemplateData.post_preview_data
            );
          }
          if (importedPreviewTemplateData?.filter_preview_data) {
            nextPreviewTemplateData.filter_preview_data = cloneDeep(
              importedPreviewTemplateData.filter_preview_data
            );
          }
          nextPreviewTemplateData.misc_preview_data = {
            ...nextPreviewTemplateData.misc_preview_data,
            ...(importedMiscPreviewData?.container
              ? { container: cloneDeep(importedMiscPreviewData.container) }
              : {}),
            ...(importedMiscPreviewData?.meta
              ? { meta: cloneDeep(importedMiscPreviewData.meta) }
              : {}),
          };
        }

        // Merge non-dnd legacy targeted keys defensively.
        const legacyMiscKeyMap = {
          selected_filters: "selected_filter",
          sorting_data: "sorting",
          result_count: "result_count",
          pagination: "pagination",
        };
        const legacyPatch = {};
        customOptions.forEach((option) => {
          const legacyKey = legacyMiscKeyMap[option];
          if (legacyKey && importedMiscPreviewData?.[legacyKey]) {
            legacyPatch[legacyKey] = cloneDeep(importedMiscPreviewData[legacyKey]);
          }
        });
        if (Object.keys(legacyPatch).length > 0) {
          nextPreviewTemplateData.misc_preview_data = {
            ...nextPreviewTemplateData.misc_preview_data,
            ...legacyPatch,
          };
        }
      }
    } else {
      if (
        !importedDoc.common_data ||
        !importedDoc.filter_layout_data ||
        !importedDoc.post_layout_data
      ) {
        throw new Error("Selected file does not contain full layout data.");
      }
      nextBuilder.common_data = cloneDeep(importedDoc.common_data);
      nextBuilder.filter_layout_data = cloneDeep(importedDoc.filter_layout_data);
      nextBuilder.post_layout_data = cloneDeep(importedDoc.post_layout_data);
    }

    if (shouldClearImportedTermSelections) {
      if (!nextBuilder.common_data) nextBuilder.common_data = {};
      nextBuilder.common_data.post_type = currentPostType;

      if (!nextBuilder.post_layout_data) nextBuilder.post_layout_data = {};
      if (!nextBuilder.post_layout_data.extra_data) {
        nextBuilder.post_layout_data.extra_data = {};
      }
      nextBuilder.post_layout_data.extra_data.post_type = currentPostType;
      nextBuilder.post_layout_data.extra_data.single_post_data = cloneDeep(
        mainBuilderData?.post_layout_data?.extra_data?.single_post_data || {}
      );

      if (!nextBuilder.filter_layout_data) nextBuilder.filter_layout_data = {};
      if (!nextBuilder.filter_layout_data.extra_data) {
        nextBuilder.filter_layout_data.extra_data = {};
      }
      nextBuilder.filter_layout_data.extra_data.post_type = currentPostType;
      applyCurrentPostTypeToFilterModules();
    }

    if (scopeIncludesFilterLayout && nextBuilder.filter_layout_data) {
      nextBuilder.filter_layout_data = await sanitizeFilterLayoutTermData(
        nextBuilder.filter_layout_data,
        {
          apiClient,
          apiEndpoints,
          clearAllTermSelections: shouldClearImportedTermSelections,
        }
      );
    }

    if (
      shouldClearImportedTermSelections &&
      scopeIncludesPostLayout &&
      nextBuilder.post_layout_data
    ) {
      nextBuilder.post_layout_data = clearImportedPostLayoutCustomFields(
        nextBuilder.post_layout_data
      );
    }

    nextBuilder.common_data.layout_key = currentLayoutKey;
    nextBuilder.common_data.layout_name = currentLayoutName;
    nextBuilder.common_data.layout_index = currentLayoutIndex;
    nextBuilder.common_data.layout_publish = currentLayoutPublish;

    stampLayoutSchemaVersion(nextBuilder);
    const { doc } = migrateLayoutDocument(
      sanitizeLayoutDocumentForTier(nextBuilder)
    );
    setMainBuilderData(doc);
    props.updatedBuilderData(doc);
    return doc;
  };

  const handleImportSuccess = () => {
    // Keep user on the same builder screen after import.
    // Import should refresh data only, not force navigation to another step.
    props.setSelectType(props.selectType || "");
    props.setCurrStep(props.currStep || "1");
  };

  const hasChanges = isDirty();
  const isDraftLayout =
    resolveLayoutPublishFromBuilderData(mainBuilderData) === "draft";
  // Draft layouts can be published from any step even with no local edits
  // (e.g. user just created the layout and wants it live).
  const canPublishDraftWithoutChanges = isDraftLayout;
  const isSaveActionEnabled =
    !isSaving && (hasChanges || canPublishDraftWithoutChanges);
  const saveActionLabel = isDraftLayout ? "Publish" : "Save";
  const saveActionBusyLabel = isDraftLayout ? "Publishing..." : "Saving...";

  const isBuilderSelected = (mainBuilderData, screen) => {
    if (screen === 1) {
      return (
        mainBuilderData?.filter_layout_data?.breadcrumb_data?.select_builder ===
        "true"
      );
    }
    if (screen === 2) {
      const filterBuilder =
        mainBuilderData?.filter_layout_data?.breadcrumb_data?.select_builder ===
        "true";
      const postBuilder =
        mainBuilderData?.post_layout_data?.breadcrumb_data?.select_builder ===
        "true";

      return filterBuilder && postBuilder;
    }

    return false;
  };

  const isSelectScreen = props.selectType === "";
  const isFilterScreen = props.selectType === "filter";
  const isPostScreen = props.selectType === "post";
  const isPreviewScreen = props.selectType === "post-preview";
  const canAccessPostStep = isBuilderSelected(props.mainBuilderData, 1);
  const canAccessPreviewStep = isBuilderSelected(props.mainBuilderData, 2);
  const usesCafPostLayout = extraData?.layout_source === "caf_builder";
  const showLayoutSettingsCrumb = usesCafPostLayout;


  return (
    <div className="caf-builder-layout-header-container">
      <div className="caf-builder-layout-rename-main">
        <BuilderCafLogoIcon alt="CAF Builder" />
        <div className="caf-builder-layout-title">
          <span>{builderTitle}</span>
          <span onClick={editTitle}>
            <BuilderEditIcon alt="Edit layout name" />
          </span>
        </div>
      </div>

      <div className="caf-builder-layout-header-breadcrumb">
        <span
          onClick={() => changeTab(0)}
          className={`caf-text ${isSelectScreen ? "active" : ""}`}
        >
          <BuilderHomeIcon alt="Home" />
        </span>
          <>
          <BuilderNextArrowIcon className="caf-builder-breadcrumb-arrow" />
          <span
            onClick={() => changeTab(1, "filter")}
            className={`caf-text ${isFilterScreen ? "active" : ""}`}
          >
            Query & Filters Builder
          </span>

              {usesCafPostLayout && (
                <>
                  <BuilderNextArrowIcon className="caf-builder-breadcrumb-arrow" />
                  <span
                    onClick={() =>
                      canAccessPostStep ? changeTab(2) : undefined
                    }
                    className={`caf-text ${isPostScreen ? "active" : ""} ${
                      !canAccessPostStep && !isPostScreen
                        ? "caf-brcb-disabled"
                        : ""
                    }`}
                  >
                    Post Item Template
                  </span>
                </>
              )}
              {showLayoutSettingsCrumb && (
                <>
                  <BuilderNextArrowIcon className="caf-builder-breadcrumb-arrow" />
                  <span
                    onClick={() =>
                      canAccessPreviewStep ? changeTab(3) : undefined
                    }
                    className={`caf-text ${isPreviewScreen ? "active" : ""} ${
                      !canAccessPreviewStep && !isPreviewScreen
                        ? "caf-brcb-disabled"
                        : ""
                    }`}
                  >
                    Layout Settings
                  </span>
                </>
              )}
          </>
      </div>

      <div className="caf-builder-layout-header-global-save-section">
        <span
          onClick={() => setRevisionDrawerOpen(true)}
          title="Revisions"
        >
          <BuilderRevisionsIcon alt="Revisions" />
        </span>
        <span onClick={handelImportClick} title="Import/Export">
          <BuilderImportExportNewIcon alt="Import/Export" />
        </span>

        <span onClick={() => setOpen(true)}>
          <BuilderSettingIcon alt="Main settings" />
        </span>

        {(parseInt(props.currStep, 10) >= 1 ||
          props?.mainBuilderData?.filter_layout_data?.breadcrumb_data
            ?.select_builder === "true") && (
          <span
            className={`caf-save-btn ${
              isSaveActionEnabled ? "active" : "deactive"
            }`}
            onClick={
              isSaveActionEnabled ? () => onHandleSaveLayout() : undefined
            }
          >
            {isSaving ? saveActionBusyLabel : saveActionLabel}
          </span>
        )}

        <span onClick={handleCancel}>
          <BuilderCrossCircleIcon alt="Close builder" />
        </span>
      </div>

      <Drawer
        title="Settings"
        placement="right"
        closable={false}
        onClose={onClose}
        open={open}
        rootClassName="caf-builder-main-settings-drawer"
      >
        <MiscSettingDrawer
          handleMiscSettingPage={handleMiscSettingPage}
          mainBuilderData={mainBuilderData}
          updatedBuilderData={updatedBuilderData}
        />
      </Drawer>
      <Drawer
        title={null}
        placement="right"
        closable={false}
        onClose={onCloseRevisions}
        open={revisionDrawerOpen}
        width={420}
        rootClassName="caf-builder-revisions-drawer"
      >
        <BuilderRevisionsPanel
          revisionHistory={props.revisionHistory}
          currentRevisionId={props.currentRevisionId}
          onRestoreRevision={props.onRestoreRevision}
        />
      </Drawer>

      <Modal
        title="Enter New Layout Label"
        open={layoutRenamePopup}
        onOk={handleUpdateLayoutTitle}
        onCancel={handleCancelLayoutRename}
        className="caf-builder-layout-label-modal caf-builder-modal"
        footer={[
          <Button key="back" onClick={handleCancelLayoutRename}>
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            disabled={!isLayoutLabelValid}
            onClick={handleUpdateLayoutTitle}
          >
            Save
          </Button>,
        ]}
      >
        <Input
          className="caf-builder-rename-input"
          value={builderLabel}
          onChange={onChangeBuilderLabel}
          onPressEnter={handleUpdateLayoutTitle}
          status={!isLayoutLabelValid ? "error" : undefined}
          placeholder="Enter filter label"
        />
      </Modal>

      <Modal
        title="Unsaved changes"
        open={modalPopUp}
        onCancel={handlePopUpDismiss}
        maskClosable={false}
        closable={!isSaving}
        className="caf-builder-save-confirm caf-builder-modal"
        footer={[
          <Button key="stay" onClick={handlePopUpDismiss} disabled={isSaving}>
            Cancel
          </Button>,
          <Button key="discard" onClick={handlePopUpDiscard} disabled={isSaving}>
            Discard
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={isSaving}
            onClick={handlePopUpSave}
          >
            {saveActionLabel}
          </Button>,
        ]}
      >
        {isDraftLayout
          ? "You have unsaved changes. Publish them before leaving this layout?"
          : "You have unsaved changes. Save them before leaving this layout?"}
      </Modal>

      <ImportExportModal
        mainBuilderData={mainBuilderData}
        onImportFromFile={handleImportFromFile}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}

export default Header;