import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setInData, setPostData, setSelectedPostId, setValue } from "../../store/builderSlice";
import { selectBuilderPostPreviewData } from "../../store/selectors";
import {
  resolvePostExtraDataFromBuilderData,
  resolvePostTypeFromBuilderData,
  resolveSinglePostFromBuilderData,
} from "../utils/builderDataAdapters";
import {
  resolveImportedPostTypeFromExport,
  sanitizeImportedPostModule,
  sanitizeImportedPostModulesInTree,
} from "../importExport/sanitizeImportedPostCustomFields";
import {
  applyGlobalFontToLayoutElement,
  getGlobalFontFamily,
  loadGoogleFontFamily,
} from "../utils/globalFontFamily";
import { clonePostLayoutData } from "./components/settingTabContent/ModuleContentData/postLayoutSnapshot";
import { columnStyle } from "./components/styleData";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faGear, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
// import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { LeftOutlined, RightOutlined, SettingOutlined, AndroidOutlined, AppleOutlined, CaretDownOutlined, CaretUpOutlined, PlusOutlined } from "@ant-design/icons";
import titleImg from "../images/post-title.png";
import descriptionImg from "../images/post-description.png";
import { Button, Dropdown, Skeleton, message, Modal } from "antd";
import EntityImportModal from "../EntityImportModal";
import newRow from "./components/newElementData/newRow";
import newColumnData from "./components/newElementData/newColumn";
import NewModulePopUp from "./components/NewModulePopUp";
import SettingPopUp from "./components/SettingPopUp";
import MainArea from "./MainArea";
import PostModulePickerIcon from "./components/PostModulePickerIcon";
import leftArrow from "../images/left-arrow.svg"
import rightArrow from "../images/right-arrow.svg"
import plus from "../images/plus.png";
import BuilderDeleteIcon from "../BuilderDeleteIcon";
import { sanitizePostModuleForTier } from "../../tier/sanitizeLayoutForTier";
import BuilderEditIcon from "../BuilderEditIcon";
import BuilderCopyIcon from "../BuilderCopyIcon";
import isEqual from "lodash/isEqual";
import { getDeviceVisibilityDisabledClass } from "../utils/builderVisibility";
import { resolveBuilderPreviewDevice } from "../utils/builderPreviewDevice";
import {
  getBuilderDropdownProps,
  getBuilderNewModuleDropdownProps,
} from "../shared/builderDropdownProps";
import apiClient from "../../api/client";
import { apiEndpoints } from "../../api/endpoints";

const hasProductPricePreviewData = (postData) => {
  const priceData = postData?.price_data;
  if (!priceData || typeof priceData !== "object") {
    return false;
  }
  return (
    priceData.regular_price !== undefined ||
    priceData.sale_price !== undefined ||
    Boolean(priceData.currency)
  );
};

const hasProductModulePreviewData = (postData) => {
  if (!hasProductPricePreviewData(postData)) {
    return false;
  }
  return Boolean(postData?.product && typeof postData.product === "object");
};

const PostBuilderContainer = (props) => {
  const SIDEBAR_CONTENT_REVEAL_DELAY = 220;
  // console.log(props);
  const dispatch = useDispatch();
  const builderPostPreviewData = useSelector(selectBuilderPostPreviewData);
  const resolvedPostExtraData = resolvePostExtraDataFromBuilderData(
    props.mainBuilderData
  );
  const extra_data = { ...resolvedPostExtraData };
  const [width, setWidth] = useState(300);
  const [rWidth, setRwidth] = useState(300);
  const [showLeftSidebarContent, setShowLeftSidebarContent] = useState(true);
  const [showRightSidebarContent, setShowRightSidebarContent] = useState(true);
  const [addSkelton, setAddSkelton] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(
    resolveBuilderPreviewDevice(props.mainBuilderData)
  );
  const [previewState, setPreviewState] = useState("1");
  const [initialdata, setInitialData] = useState(
    props.mainBuilderData.post_layout_data?.initial_data
  );
  //console.log(props.mainBuilderData.post_layout_data?.initial_data);
  const [showModulePopUp, setShowModulePopUp] = useState(false);
  // const [mainBuilderData,setMainBuilderData]=useState()
  const [indexes, setIndexes] = useState({
    rowindex: 0,
    columnindex: "",
    moduleindex: "",
    module: "",
    type: "row",
  });
  const [moduleIndexes, setModuleIndexes] = useState({});
  const [clicked, setClicked] = useState(false);
  const [points, setPoints] = useState({
    x: 0,
    y: 0,
  });
  const [popIndex, setPopIndex] = useState({
    rowIndex: "",
    columnIndex: "",
    moduleIndex: "",
  });
  const [isInside, setIsInside] = useState(false);
  const [moduleActionTarget, setModuleActionTarget] = useState(null);
  const [columnActionTarget, setColumnActionTarget] = useState(null);
  const [rowActionTarget, setRowActionTarget] = useState(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importDialogType, setImportDialogType] = useState("");
  const [selectedImportFileName, setSelectedImportFileName] = useState("");
  const [selectedImportJson, setSelectedImportJson] = useState(null);
  const skipPropInitialDataSyncRef = useRef(false);
  const commitBuilderPatch = (mutator) => {
    const nextBuilder = structuredClone(props.mainBuilderData || {});
    if (!nextBuilder.post_layout_data) {
      nextBuilder.post_layout_data = {};
    }
    mutator(nextBuilder.post_layout_data);
    skipPropInitialDataSyncRef.current = true;
    props.updatedBuilderData(nextBuilder);
    const rows = nextBuilder.post_layout_data.initial_data;
    if (Array.isArray(rows)) {
      dispatch(setInData(clonePostLayoutData(rows)));
    }
  };
  const syncedPostType =
    props.mainBuilderData?.common_data?.post_type ||
    resolvedPostExtraData?.post_type ||
    "post";
  const syncedSinglePostData = resolveSinglePostFromBuilderData(
    props.mainBuilderData
  );
  const effectiveSettingsPostPreview =
    builderPostPreviewData &&
    typeof builderPostPreviewData === "object" &&
    !Array.isArray(builderPostPreviewData) &&
    Object.keys(builderPostPreviewData).length > 0
      ? builderPostPreviewData
      : syncedSinglePostData;

  /** Deep clone for popups: design controls mutate `data` in place; must not use Redux-frozen objects. */
  const layoutDraft = useMemo(
    () => clonePostLayoutData(initialdata),
    [initialdata]
  );

  /** Mirror local layout to Redux (clone) so MainArea / selectors stay in sync without storing mutable refs in the store. */
  useEffect(() => {
    if (initialdata === undefined) return;
    dispatch(setInData(clonePostLayoutData(initialdata)));
  }, [initialdata, dispatch]);

  /** Sync Misc Settings (main builder source of truth) into Redux for module setting tabs. */
  useEffect(() => {
    dispatch(setValue(syncedPostType));
    dispatch(setPostData(syncedSinglePostData));
    dispatch(
      setSelectedPostId(
        syncedSinglePostData?.id || syncedSinglePostData?.value || ""
      )
    );
  }, [syncedPostType, syncedSinglePostData, dispatch]);

  /**
   * Product layouts saved before price_data existed (or imported without it)
   * leave the Product Price module blank in the post-item canvas. Refresh the
   * selected product payload so free/pro both get live Woo price fields.
   */
  useEffect(() => {
    let cancelled = false;
    const postId =
      syncedSinglePostData?.value ?? syncedSinglePostData?.id ?? "";
    if (syncedPostType !== "product" || !postId) {
      return undefined;
    }
    if (hasProductModulePreviewData(syncedSinglePostData)) {
      return undefined;
    }

    const refreshProductPreview = async () => {
      try {
        const { data } = await apiClient.get(
          apiEndpoints.getPostsList("product")
        );
        if (cancelled || data?.status !== "success") {
          return;
        }
        const match = (data.posts_list || []).find(
          (item) =>
            String(item?.value) === String(postId) ||
            String(item?.id) === String(postId)
        );
        if (!match || !hasProductModulePreviewData(match)) {
          return;
        }
        const nextBuilder = structuredClone(props.mainBuilderData || {});
        if (!nextBuilder.post_layout_data) {
          nextBuilder.post_layout_data = {};
        }
        if (!nextBuilder.post_layout_data.extra_data) {
          nextBuilder.post_layout_data.extra_data = {};
        }
        nextBuilder.post_layout_data.extra_data.single_post_data = match;
        skipPropInitialDataSyncRef.current = true;
        props.updatedBuilderData(nextBuilder);
        dispatch(setPostData(match));
      } catch (error) {
        // Keep the existing preview payload if the refresh fails.
      }
    };

    refreshProductPreview();
    return () => {
      cancelled = true;
    };
  }, [
    syncedPostType,
    syncedSinglePostData,
    props.mainBuilderData,
    props.updatedBuilderData,
    dispatch,
  ]);

  useEffect(() => {
    if (skipPropInitialDataSyncRef.current) {
      skipPropInitialDataSyncRef.current = false;
      return;
    }
    const fromProps = props.mainBuilderData?.post_layout_data?.initial_data;
    if (!Array.isArray(fromProps)) return;
    setInitialData((prev) =>
      isEqual(prev, fromProps) ? prev : clonePostLayoutData(fromProps)
    );
  }, [props.mainBuilderData]);

  useEffect(() => {
    if (initialdata !== undefined) {
      commitBuilderPatch((postLayout) => {
        postLayout.initial_data = initialdata;
      });
    }
  }, [initialdata]);

  useEffect(() => {
    if (previewState === "0") {
      setWidth(0);
      setRwidth(0);
      setShowModulePopUp(false);
    } else {
      setWidth(300);
      setRwidth(300);
      setShowModulePopUp(false);
    }
  }, [previewState]);

  useEffect(() => {
    let timer;
    if (width === 0) {
      setShowLeftSidebarContent(false);
    } else {
      timer = setTimeout(() => {
        setShowLeftSidebarContent(true);
      }, SIDEBAR_CONTENT_REVEAL_DELAY);
    }
    return () => clearTimeout(timer);
  }, [width]);

  useEffect(() => {
    let timer;
    if (rWidth === 0) {
      setShowRightSidebarContent(false);
    } else {
      timer = setTimeout(() => {
        setShowRightSidebarContent(true);
      }, SIDEBAR_CONTENT_REVEAL_DELAY);
    }
    return () => clearTimeout(timer);
  }, [rWidth]);

  useEffect(() => {
    setAddSkelton(true);
    setTimeout(() => {
      setAddSkelton(false);
    }, 300);
  }, [indexes?.moduleindex, indexes.columnindex, indexes.rowindex]);


  const handleSettingPopUp = (
    type,
    rowindex = "",
    columnindex = "",
    moduleindex = "",
    module = ""
  ) => {
    setIndexes((prevIndexes) => ({
      ...prevIndexes,
      type: type,
      rowindex: rowindex,
      columnindex: columnindex,
      moduleindex: moduleindex,
      module: module,
    }));
  };
  const removeArray = (arr, index) => [
    // part of the array before the specified index
    ...arr.slice(0, index),
    // part of the array after the specified index
    ...arr.slice(index + 1),
  ];

  const handleRemove = (type, rowindex, columnindex, moduleindex) => {
    if (type === "row" && initialdata?.length === 1) {
      message.warning("At least one row is required.");
      return;
    }

    const runRemove = () => {
      if (type === "row") {
        const layoutCopy = JSON.parse(JSON.stringify(initialdata));
        const d = removeArray(layoutCopy, rowindex);
        setInitialData([...d]);
      }
      if (type === "column") {
        const layoutCopy = JSON.parse(JSON.stringify(initialdata));
        layoutCopy[rowindex].data.splice(columnindex, 1);
        setInitialData([...layoutCopy]);
      }
      if (type === "module") {
        const layoutCopy = JSON.parse(JSON.stringify(initialdata));
        layoutCopy[rowindex].data[columnindex].data.splice(moduleindex, 1);
        setInitialData([...layoutCopy]);
      }
      setIndexes({
        rowindex: 0,
        columnindex: "",
        moduleindex: "",
        module: "",
        type: "row",
      });
    };

    const targetLabel =
      type === "row" ? "row" : type === "column" ? "column" : "module";
    Modal.confirm({
      title: `Delete this ${targetLabel}?`,
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      className: "caf-filter-delete-confirm-modal caf-builder-modal",
      onOk: runRemove,
    });
  };
  const checkModuleClick = (e, rowindex, columnindex, moduleindex) => {
    e.preventDefault();
    setClicked(!clicked);
    setPoints({
      x: e.pageX,
      y: e.pageY,
    });
    setPopIndex({
      rowIndex: rowindex,
      columnIndex: columnindex,
      moduleIndex: moduleindex,
    });
  };
  const onSelectModule = (item) => {
    const { rowindex, columnindex, moduleindex } = moduleIndexes;
    setShowModulePopUp(false);
    const layoutCopy = JSON.parse(JSON.stringify(initialdata));
    const moduleItem = sanitizePostModuleForTier(
      JSON.parse(JSON.stringify(item))
    );
    const globalFont = getGlobalFontFamily(props.mainBuilderData);
    applyGlobalFontToLayoutElement(moduleItem, globalFont, { force: true });
    loadGoogleFontFamily(globalFont);
    layoutCopy[rowindex].data[columnindex].data.push(moduleItem);
    setInitialData([...layoutCopy]);
    setIndexes(moduleIndexes);
    if (layoutCopy[rowindex].data[columnindex].data?.length === 1) {
      handleSettingPopUp("module", rowindex, columnindex, 0, moduleItem);
    } else {
      handleSettingPopUp(
        "module",
        rowindex,
        columnindex,
        moduleindex + 1,
        moduleItem
      );
    }
  };

  const handleAddModule = (rowindex, columnindex, moduleindex) => {
    moduleIndexes.rowindex = rowindex;
    moduleIndexes.columnindex = columnindex;
    moduleIndexes.moduleindex = moduleindex;
    setModuleIndexes(moduleIndexes);
    setShowModulePopUp(true);
  };
  const openImportWidgetDialog = (rowindex, columnindex, moduleindex) => {
    setModuleActionTarget({ rowindex, columnindex, moduleindex });
    setImportDialogType("widget");
    setSelectedImportFileName("");
    setSelectedImportJson(null);
    setImportDialogOpen(true);
  };
  const openImportColumnDialog = (rowindex, columnindex, addAfter = true) => {
    setColumnActionTarget({ rowindex, columnindex, addAfter });
    setImportDialogType("column");
    setSelectedImportFileName("");
    setSelectedImportJson(null);
    setImportDialogOpen(true);
  };
  const openImportRowDialog = (rowindex) => {
    setRowActionTarget({ rowindex });
    setImportDialogType("row");
    setSelectedImportFileName("");
    setSelectedImportJson(null);
    setImportDialogOpen(true);
  };
  const handleModuleActionMenuClick = (menuKey, rowindex, columnindex, moduleindex) => {
    if (menuKey === "new_widget") {
      handleAddModule(rowindex, columnindex, moduleindex);
      return;
    }
    if (menuKey === "import_widget") {
      openImportWidgetDialog(rowindex, columnindex, moduleindex);
    }
  };
  const handleColumnActionMenuClick = (menuKey, rowindex, columnindex, addAfter = true) => {
    if (menuKey === "new_column") {
      handleAddColumn(rowindex, columnindex, addAfter);
      return;
    }
    if (menuKey === "import_column") {
      openImportColumnDialog(rowindex, columnindex, addAfter);
    }
  };
  const handleRowActionMenuClick = (menuKey, rowindex) => {
    if (menuKey === "new_row") {
      handleAddRow(rowindex);
      return;
    }
    if (menuKey === "import_row") {
      openImportRowDialog(rowindex);
    }
  };
  const triggerChooseImportFile = () => {
    const input = document.getElementById("caf-post-entity-import-input");
    if (input) {
      input.value = "";
      input.click();
    }
  };
  const processImportFile = (file) => {
    if (!file) return;

    const isJson =
      file.type === "application/json" || file.name.toLowerCase().endsWith(".json");
    if (!isJson) {
      message.error("Only JSON files are supported.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result || "{}");
        setSelectedImportFileName(file.name);
        setSelectedImportJson(parsed);
      } catch (error) {
        setSelectedImportFileName("");
        setSelectedImportJson(null);
        message.error("Could not parse JSON file.");
      }
    };
    reader.readAsText(file);
  };
  const handleImportFileChange = (event) => {
    processImportFile(event?.target?.files?.[0]);
  };
  const closeImportDialog = () => {
    setImportDialogOpen(false);
    setImportDialogType("");
    setSelectedImportFileName("");
    setSelectedImportJson(null);
    setModuleActionTarget(null);
    setColumnActionTarget(null);
    setRowActionTarget(null);
  };
  const getPostEntityImportSanitizeOptions = (importJson) => ({
    currentPostType: resolvePostTypeFromBuilderData(props.mainBuilderData),
    importedPostType: resolveImportedPostTypeFromExport(importJson),
  });
  const applyWidgetImport = () => {
    if (!moduleActionTarget) throw new Error("No target selected for module import.");
    const importedScope = selectedImportJson?._export_meta?.scope;
    if (importedScope && importedScope !== "post_module") {
      throw new Error("Selected file is not a Post module export.");
    }
    const importedModule = selectedImportJson?.module_data || selectedImportJson;
    if (!importedModule || typeof importedModule !== "object") {
      throw new Error("Invalid module payload.");
    }
    if (importedModule.type !== "module") {
      throw new Error("Selected file is not a module export.");
    }
    if (!importedModule.key || !importedModule.settings || !importedModule.style) {
      throw new Error("Selected file has incomplete module data.");
    }

    const { rowindex, columnindex } = moduleActionTarget;
    const layoutCopy = JSON.parse(JSON.stringify(initialdata));
    const nextModule = sanitizeImportedPostModule(
      JSON.parse(JSON.stringify(importedModule)),
      getPostEntityImportSanitizeOptions(selectedImportJson)
    );
    layoutCopy[rowindex].data[columnindex].data.push(nextModule);
    setInitialData([...layoutCopy]);
    const insertedIndex = layoutCopy[rowindex].data[columnindex].data.length - 1;
    setIndexes({
      ...indexes,
      type: "module",
      rowindex,
      columnindex,
      moduleindex: insertedIndex,
      module: nextModule,
    });
    handleSettingPopUp("module", rowindex, columnindex, insertedIndex, nextModule);
  };
  const applyColumnImport = () => {
    if (!columnActionTarget) throw new Error("No target selected for column import.");
    const importedScope = selectedImportJson?._export_meta?.scope;
    if (importedScope && importedScope !== "post_column") {
      throw new Error("Selected file is not a Post Column export.");
    }
    const importedColumn = selectedImportJson?.column_data || selectedImportJson;
    if (!importedColumn || typeof importedColumn !== "object") {
      throw new Error("Invalid column payload.");
    }
    if (importedColumn.type !== "column") {
      throw new Error("Selected file is not a column export.");
    }
    if (!Array.isArray(importedColumn.data) || !importedColumn.style) {
      throw new Error("Selected file has incomplete column data.");
    }

    const { rowindex, columnindex, addAfter } = columnActionTarget;
    const insertIndex = addAfter ? Number(columnindex) + 1 : Number(columnindex);
    const layoutCopy = JSON.parse(JSON.stringify(initialdata));
    const nextColumn = sanitizeImportedPostModulesInTree(
      JSON.parse(JSON.stringify(importedColumn)),
      getPostEntityImportSanitizeOptions(selectedImportJson)
    );
    layoutCopy[rowindex].data.splice(insertIndex, 0, nextColumn);
    setInitialData([...layoutCopy]);
    setIndexes({
      ...indexes,
      type: "column",
      rowindex,
      columnindex: insertIndex,
      moduleindex: "",
      module: "",
    });
  };
  const applyRowImport = () => {
    if (!rowActionTarget) throw new Error("No target selected for row import.");
    const importedScope = selectedImportJson?._export_meta?.scope;
    if (importedScope && importedScope !== "post_row") {
      throw new Error("Selected file is not a Post Row export.");
    }
    const importedRow = selectedImportJson?.row_data || selectedImportJson;
    if (!importedRow || typeof importedRow !== "object") {
      throw new Error("Invalid row payload.");
    }
    if (importedRow.type !== "row") {
      throw new Error("Selected file is not a row export.");
    }
    if (!Array.isArray(importedRow.data) || !importedRow.style) {
      throw new Error("Selected file has incomplete row data.");
    }
    const { rowindex } = rowActionTarget;
    const insertIndex = Number(rowindex) + 1;
    const layoutCopy = JSON.parse(JSON.stringify(initialdata));
    const nextRow = sanitizeImportedPostModulesInTree(
      JSON.parse(JSON.stringify(importedRow)),
      getPostEntityImportSanitizeOptions(selectedImportJson)
    );
    layoutCopy.splice(insertIndex, 0, nextRow);
    setInitialData([...layoutCopy]);
    setIndexes({
      ...indexes,
      type: "row",
      rowindex: insertIndex,
      columnindex: "",
      moduleindex: "",
      module: "",
    });
  };
  const handleConfirmImport = () => {
    if (!selectedImportJson) {
      message.error("Please choose a JSON file first.");
      return;
    }
    try {
      if (importDialogType === "widget") {
        applyWidgetImport();
      } else if (importDialogType === "column") {
        applyColumnImport();
      } else if (importDialogType === "row") {
        applyRowImport();
      } else {
        throw new Error("Unknown import type.");
      }
      message.success("Imported successfully.");
      closeImportDialog();
    } catch (error) {
      message.error(error?.message || "Import failed.");
    }
  };
  const renderModuleActionDropdown = (rowindex, columnindex, moduleindex) => (
    <Dropdown
      {...getBuilderNewModuleDropdownProps()}
      menu={{
        items: [
          { key: "new_widget", label: "New Module" },
          { key: "import_widget", label: "Import Module" },
        ],
        onClick: ({ key }) =>
          handleModuleActionMenuClick(key, rowindex, columnindex, moduleindex),
      }}
    >
      <div className="caf-new-widget-main caf-module-action-dropdown-trigger">
        <i className="fas fa-plus"></i>
        <span className="caf-new-widget-label">New Module</span>
      </div>
    </Dropdown>
  );
  const renderColumnActionDropdown = (rowindex, columnindex, addAfter = true) => (
    <Dropdown
      {...getBuilderDropdownProps()}
      menu={{
        items: [
          { key: "new_column", label: "New Column" },
          { key: "import_column", label: "Import Column" },
        ],
        onClick: ({ key }) =>
          handleColumnActionMenuClick(key, rowindex, columnindex, addAfter),
      }}
    >
      <div className="caf-new-column-main">
        <i className="fas fa-plus"></i>
        <span className="caf-new-widget-label colm">New Column</span>
      </div>
    </Dropdown>
  );
  const renderRowActionDropdown = (rowindex) => (
    <Dropdown
      {...getBuilderDropdownProps()}
      menu={{
        items: [
          { key: "new_row", label: "New Row" },
          { key: "import_row", label: "Import Row" },
        ],
        onClick: ({ key }) => handleRowActionMenuClick(key, rowindex),
      }}
    >
      <div className="caf-new-row-main">
        <i className="fa fa-plus" aria-hidden="true"></i>
        <span className="caf-new-widget-label rowbtn">New Row</span>
      </div>
    </Dropdown>
  );

  const handleAddColumn = (rowindex, columnindex, addAfter = true) => {
    const layoutCopy = JSON.parse(JSON.stringify(initialdata));
    let index = addAfter ? columnindex + 1 : columnindex;

    let newCol = { ...newColumnData, data: [] };
    layoutCopy[rowindex].data.splice(index, 0, newCol);

    setInitialData([...layoutCopy]);

    indexes.rowindex = rowindex;
    indexes.columnindex = index;
    indexes.moduleindex = "";
    indexes.module = "";
    indexes.type = "column";
    setIndexes({ ...indexes });
  };

  const insert = (arr, index, newItem) => [
    // part of the array before the specified index
    ...arr.slice(0, index),
    // inserted item
    newItem,
    // part of the array after the specified index
    ...arr.slice(index),
  ];
  const handleAddRow = (rowindex) => {
    let newColData = [
      {
        type: "column",
        data: [],
        style: { ...columnStyle },
        settings: {
          background_image: "",
          bg_type: "color",
          collapse_status: "false",
          admin_label: "",
          custom_class: "",
          visibility: {
            mobile: "false",
            tablet: "false",
            desktop: "false"
          }
        },
      },
    ];
    let index = rowindex + 1;
    let newRowData = { ...newRow, data: newColData };
    const newData = insert(initialdata, index, newRowData);
    setInitialData([...newData]);
    indexes.rowindex = index;
    indexes.columnindex = "";
    indexes.moduleindex = "";
    indexes.module = "";
    indexes.type = "row";
    setIndexes({ ...indexes });
  };
  const handleCloneRow = (rowindex) => {
    const layoutCopy = JSON.parse(JSON.stringify(initialdata));
    const sourceRow = layoutCopy?.[rowindex];
    if (!sourceRow) {
      message.error("Row data is not available.");
      return;
    }
    const clonedRow = JSON.parse(JSON.stringify(sourceRow));
    const insertIndex = Number(rowindex) + 1;
    layoutCopy.splice(insertIndex, 0, clonedRow);
    setInitialData([...layoutCopy]);
    setIndexes({
      ...indexes,
      type: "row",
      rowindex: insertIndex,
      columnindex: "",
      moduleindex: "",
      module: "",
    });
    message.success("Row cloned successfully.");
  };
  const handleCloneColumn = (rowindex, columnindex) => {
    const layoutCopy = JSON.parse(JSON.stringify(initialdata));
    const sourceColumn = layoutCopy?.[rowindex]?.data?.[columnindex];
    if (!sourceColumn) {
      message.error("Column data is not available.");
      return;
    }
    const clonedColumn = JSON.parse(JSON.stringify(sourceColumn));
    const insertIndex = Number(columnindex) + 1;
    layoutCopy[rowindex].data.splice(insertIndex, 0, clonedColumn);
    setInitialData([...layoutCopy]);
    setIndexes({
      ...indexes,
      type: "column",
      rowindex,
      columnindex: insertIndex,
      moduleindex: "",
      module: "",
    });
    message.success("Column cloned successfully.");
  };
  const handleCloneModule = (rowindex, columnindex, moduleindex) => {
    const layoutCopy = JSON.parse(JSON.stringify(initialdata));
    const sourceModule = layoutCopy?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex];
    if (!sourceModule) {
      message.error("Module data is not available.");
      return;
    }
    const clonedModule = JSON.parse(JSON.stringify(sourceModule));
    const insertIndex = Number(moduleindex) + 1;
    layoutCopy[rowindex].data[columnindex].data.splice(insertIndex, 0, clonedModule);
    setInitialData([...layoutCopy]);
    setIndexes({
      ...indexes,
      type: "module",
      rowindex,
      columnindex,
      moduleindex: insertIndex,
      module: clonedModule,
    });
    message.success("Module cloned successfully.");
  };
  const closeNewModulePopUp = () => {
    setShowModulePopUp(false);
  };
  const handleDragDrop = (results) => {
    const { source, destination, type } = results;
    if (!destination) return;
    if (type === "row") {
      let mdata = initialdata;
      let sourceRowIndex = source.index;
      let destinationRowIndex = destination.index;
      let removedRowData = mdata.splice(sourceRowIndex, 1)[0];
      mdata.splice(destinationRowIndex, 0, removedRowData);
      setInitialData([...mdata]);
      indexes.type = "row";
      indexes.rowindex = destinationRowIndex;
      indexes.columnindex = 0;
      indexes.moduleindex = 0;
      indexes.module = "";
      setIndexes(indexes);
      return;
    }
    if (type == "column") {
      let SourceColumnIndex = source.index;
      let DestinationColumnIndex = destination.index;

      let SourceRowIndex = source.droppableId;
      let DestinationRowIndex = destination.droppableId;

      let SourceColumns = [...initialdata[SourceRowIndex].data];

      let DestinationColumns =
        SourceRowIndex !== DestinationRowIndex
          ? [...initialdata[DestinationRowIndex].data]
          : SourceColumns;
      let [deletedColumn] = SourceColumns.splice(SourceColumnIndex, 1);
      DestinationColumns.splice(DestinationColumnIndex, 0, deletedColumn);

      let mdata = [...initialdata];
      mdata[SourceRowIndex] = {
        ...initialdata[SourceRowIndex],
        data: SourceColumns,
      };
      mdata[DestinationRowIndex] = {
        ...initialdata[DestinationRowIndex],
        data: DestinationColumns,
      };
      setInitialData(mdata);
      indexes.type = "column";
      indexes.rowindex = DestinationRowIndex;
      indexes.columnindex = DestinationColumnIndex;
      indexes.moduleindex = 0;
      indexes.module = "";
      setIndexes(indexes);
      return;
    }
    if (type == "module") {
      let SourceModuleIndex = source.index;
      let DestinationModuleIndex = destination.index;

      let SourceDroppableData = source.droppableId.split(",");
      let DestinationDroppableData = destination.droppableId.split(",");

      let SourceColumnIndex = SourceDroppableData[1];
      let DestinationColumnIndex = DestinationDroppableData[1];

      let SourceRowIndex = SourceDroppableData[0];
      let DestinationRowIndex = DestinationDroppableData[0];

      let mdata = initialdata;
      let DeletedModuledata = mdata[SourceRowIndex].data[
        SourceColumnIndex
      ].data.splice(SourceModuleIndex, 1)[0];
      mdata[DestinationRowIndex].data[DestinationColumnIndex].data.splice(
        DestinationModuleIndex,
        0,
        DeletedModuledata
      );
      setInitialData([...mdata]);
      indexes.type = "module";
      indexes.rowindex = DestinationRowIndex;
      indexes.columnindex = DestinationColumnIndex;
      indexes.moduleindex = DestinationModuleIndex;
      indexes.module = DeletedModuledata;
      setIndexes(indexes);
      return;
    }
  };
  const collapseArrowLeftClick = () => {
    if (previewState == '1') {
      if (width == 0) {
        setWidth(300);
      } else {
        setWidth(0);
      }
      setShowModulePopUp(false);
    }
  };

  const collapseArrowRightClick = () => {
    if (previewState == '1') {
      if (rWidth == 0) {
        setRwidth(300);
      } else {
        setRwidth(0);
      }
    }
  };
  const onChangeStyle = (data) => {
    setInitialData([...data]);
  };
  const handleCollapse = (type, indexRow, indexCol) => {
    if (type === "row") {
      setInitialData((prevData) =>
        prevData.map((row, i) =>
          i === indexRow
            ? { ...row, settings: { ...row.settings, collapse_status: "true" } }
            : row
        )
      );
    } else {
      setInitialData((prevData) =>
        prevData.map((row, i) => {
          if (i === indexRow) {
            return {
              ...row,
              data: row.data.map((col, j) =>
                j === indexCol
                  ? {
                    ...col,
                    settings: { ...col.settings, collapse_status: "true" },
                  }
                  : col
              ),
            };
          }
          return row;
        })
      );
    }
  };
  const handleExpand = (type, indexRow, indexCol) => {
    if (type === "row") {
      setInitialData((prevData) =>
        prevData.map((row, i) =>
          i === indexRow
            ? {
              ...row,
              settings: { ...row.settings, collapse_status: "false" },
            }
            : row
        )
      );
    } else {
      setInitialData((prevData) =>
        prevData.map((row, i) => {
          if (i === indexRow) {
            return {
              ...row,
              data: row.data.map((col, j) =>
                j === indexCol
                  ? {
                    ...col,
                    settings: { ...col.settings, collapse_status: "false" },
                  }
                  : col
              ),
            };
          }
          return row;
        })
      );
    }
  };
  const selectModuleImage = (key) => {
    if (key === "title") {
      return titleImg;
    } else if (key === "excerpt") {
      return descriptionImg;
    } else {
      return descriptionImg;
    }
  };
  const getItemStyle = (isDragging, draggableStyle) => ({
    // Change background color if dragging
    background: isDragging ? "lightblue" : "",
    // styles we need to apply on draggables
    ...draggableStyle,
  });

  const getAdminLabel = (obj) => {
    const adminLabel = obj?.settings?.admin_label?.trim();
  
    if (adminLabel) {
      return adminLabel;
    }
  
    if (obj?.type === "row") {
      return "Row";
    }
  
    if (obj?.type === "column") {
      return "Column";
    }
  
    if (obj?.type === "module") {
      return obj?.title || "Module";
    }
  
    return "";
  };

  /*============================================== Start Font Family Linking =========================================================*/

  const loadFont = (fontFamily) => {
    if (!document.getElementById(fontFamily) && fontFamily) {
      const link = document.createElement("link");
      link.href = `https://fonts.googleapis.com/css?family=${fontFamily}:regular&display=swap`;
      link.async = true;
      link.id = fontFamily;
      link.type = "text/css";
      link.rel = "stylesheet";
      document.body.appendChild(link);
    }
  };
  {
    /* Start For Row */
    initialdata?.map((row, rowindex) => {
      if (row?.style?.desktop?.default?.fontFamily) {
        loadFont(row?.style?.desktop?.default?.fontFamily);
      }
      if (row?.style?.desktop?.hover?.fontFamily) {
        loadFont(row?.style?.desktop?.hover?.fontFamily);
      }
      if (row?.style?.tablet?.default?.fontFamily) {
        loadFont(row?.style?.tablet?.default?.fontFamily);
      }
      if (row?.style?.tablet?.hover?.fontFamily) {
        loadFont(row?.style?.tablet?.hover?.fontFamily);
      }
      if (row?.style?.mobile?.default?.fontFamily) {
        loadFont(row?.style?.mobile?.default?.fontFamily);
      }
      if (row?.style?.mobile?.hover?.fontFamily) {
        loadFont(row?.style?.mobile?.hover?.fontFamily);
      }
      /* Start For Column */
      row.data?.map((column, columnindex) => {

        if (column?.style?.desktop?.default?.fontFamily) {
          loadFont(column?.style?.desktop?.default?.fontFamily);
        }
        if (column?.style?.desktop?.hover?.fontFamily) {
          loadFont(column?.style?.desktop?.hover?.fontFamily);
        }
        if (column?.style?.tablet?.default?.fontFamily) {
          loadFont(column?.style?.tablet?.default?.fontFamily);
        }
        if (column?.style?.tablet?.hover?.fontFamily) {
          loadFont(column?.style?.tablet?.hover?.fontFamily);
        }
        if (column?.style?.mobile?.default?.fontFamily) {
          loadFont(column?.style?.mobile?.default?.fontFamily);
        }
        if (column?.style?.mobile?.hover?.fontFamily) {
          loadFont(column?.style?.mobile?.hover?.fontFamily);
        }
        /* Start For Module */
        column.data?.map((module, moduleindex) => {
          /*Start for container*/

          if (module?.style?.desktop?.default?.fontFamily) {
            loadFont(module?.style?.desktop?.default?.fontFamily);
          }
          if (module?.style?.desktop?.hover?.fontFamily) {
            loadFont(module?.style?.desktop?.hover?.fontFamily);
          }
          if (module?.style?.tablet?.default?.fontFamily) {
            loadFont(module?.style?.tablet?.default?.fontFamily);
          }
          if (module?.style?.tablet?.hover?.fontFamily) {
            loadFont(module?.style?.tablet?.hover?.fontFamily);
          }
          if (module?.style?.mobile?.default?.fontFamily) {
            loadFont(module?.style?.container?.mobile?.default?.fontFamily);
          }
          if (module?.style?.mobile?.hover?.fontFamily) {
            loadFont(module?.style?.container?.mobile?.hover?.fontFamily);
          }


          /* start for custom field label */

          if (module?.style?.label?.desktop?.default?.fontFamily) {
            loadFont(module?.style?.label?.desktop?.default?.fontFamily);
          }
          if (module?.style?.label?.desktop?.hover?.fontFamily) {
            loadFont(module?.style?.label?.desktop?.hover?.fontFamily);
          }
          if (module?.style?.label?.tablet?.default?.fontFamily) {
            loadFont(module?.style?.label?.tablet?.default?.fontFamily);
          }
          if (module?.style?.label?.tablet?.hover?.fontFamily) {
            loadFont(module?.style?.label?.tablet?.hover?.fontFamily);
          }
          if (module?.style?.label?.mobile?.default?.fontFamily) {
            loadFont(module?.style?.label?.mobile?.default?.fontFamily);
          }
          if (module?.style?.label?.mobile?.hover?.fontFamily) {
            loadFont(module?.style?.label?.mobile?.hover?.fontFamily);
          }

          /*start for custom field  meta*/

          if (module?.style?.meta?.desktop?.default?.fontFamily) {
            loadFont(module?.style?.meta?.desktop?.default?.fontFamily);
          }
          if (module?.style?.meta?.desktop?.hover?.fontFamily) {
            loadFont(module?.style?.meta?.desktop?.hover?.fontFamily);
          }
          if (module?.style?.meta?.tablet?.default?.fontFamily) {
            loadFont(module?.style?.meta?.tablet?.default?.fontFamily);
          }
          if (module?.style?.meta?.tablet?.hover?.fontFamily) {
            loadFont(module?.style?.meta?.tablet?.hover?.fontFamily);
          }
          if (module?.style?.meta?.mobile?.default?.fontFamily) {
            loadFont(module?.style?.meta?.mobile?.default?.fontFamily);
          }
          if (module?.style?.meta?.mobile?.hover?.fontFamily) {
            loadFont(module?.style?.meta?.mobile?.hover?.fontFamily);
          }
        });
      });
    }
    )
  };
  /*============================================== End Font Family Linking =========================================================*/
  return (
    <div className={`main-area-container-fix main-container-post ${
      isInside ? "inside-active" : "outside-active"
    }`} >
      <input
        id="caf-post-entity-import-input"
        type="file"
        accept=".json,application/json"
        style={{ display: "none" }}
        onChange={handleImportFileChange}
      />
      <EntityImportModal
        open={importDialogOpen}
        title={
          importDialogType === "widget"
            ? "Import Module"
            : importDialogType === "column"
              ? "Import Column"
              : "Import Row"
        }
        hintText={
          importDialogType === "widget"
            ? "Only module export JSON is allowed."
            : importDialogType === "column"
              ? "Only column export JSON is allowed."
              : "Only row export JSON is allowed."
        }
        selectedFileName={selectedImportFileName}
        onClose={closeImportDialog}
        onConfirm={handleConfirmImport}
        onChooseFile={triggerChooseImportFile}
        onFileSelected={processImportFile}
      />
      <div
        className="caf-collapse-left-sidebar"
        style={{ display: "flex", position: "relative" }}
        onMouseEnter={() => setIsInside(true)}
    onMouseLeave={() => setIsInside(false)}
      >
        {showModulePopUp ? (
          <NewModulePopUp
            closeNewModulePopup={closeNewModulePopUp}
            onSelectModule={onSelectModule}
            data={layoutDraft}
            indexes={indexes}
            animation="popup-content"
          />
        ) : null}
        <div
          className="caf-builder-sidebar caf-builder-post-sidebar"
          style={{
            width: `${width}px`,
            transition: "all 0.5s ease-out",
            visibility: width == 0 ? "hidden" : "visible",
          }}
        >
          <div
            className={`caf-sidebar-content-shell ${
              showLeftSidebarContent ? "is-visible" : "is-hidden"
            }`}
          >
          <div className="caf-builder-wrapper">
            <div className="caf-builder-wrapper-area wrapper">
              <DragDropContext onDragEnd={handleDragDrop}>
                <Droppable droppableId="ROOT" type="row">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                        {initialdata?.length == 0 ? (
                          <>
                            <Skeleton active />
                            <Skeleton active />
                            <Skeleton active />
                          </>
                        ) : (
                          ""
                        )}
                        {initialdata?.map((row, rowindex) => {
                          return (
                            <Draggable
                              draggableId={`${rowindex}`}
                              key={rowindex}
                              index={rowindex}
                            >
                              {(provided, snapshot) => (
                                <div
                                  index={rowindex}
                                  {...provided.dragHandleProps}
                                  {...provided.draggableProps}
                                  style={provided.draggableProps.style}
                                  ref={provided.innerRef}
                                >
                                  <div
                                    style={{
                                      backgroundColor: snapshot.isDragging
                                        ? "lightblue"
                                        : "",
                                    }}
                                    className={`${row.settings.collapse_status === "true"
                                        ? "caf-builder-row-wrapper-none"
                                        : "caf-builder-row-wrapper"
                                      } ${getDeviceVisibilityDisabledClass(
                                        row.settings,
                                        selectedDevice
                                      )} ${indexes.type == "row" &&
                                        indexes.rowindex == rowindex
                                        ? " active"
                                        : ""
                                      }`}
                                    key={rowindex}
                                  >
                                    <div
                                      className={`caf-builder-title-bar b-row ${indexes.type == "row" &&
                                          indexes.rowindex == rowindex
                                          ? " active"
                                          : ""
                                        }`}
                                    >
                                      <div className="caf-title-bar-left-side-row">
                                        <div className="caf-collapse-arrow">
                                          {row.settings.collapse_status ===
                                            "false" ? (
                                            <CaretUpOutlined
                                              color="#ffffff"
                                              size="1x"
                                              onClick={() =>
                                                handleCollapse("row", rowindex)
                                              }
                                            />
                                          ) : (
                                            <CaretDownOutlined
                                              color="#ffffff"
                                              size="1x"
                                              onClick={() =>
                                                handleExpand("row", rowindex)
                                              }
                                            />
                                          )}
                                        </div>
                                        <div className="caf-main-text">{getAdminLabel(row)}</div>
                                      </div>
                                      <div className="caf-title-bar-right-side-row">
                                        <div
                                          className="builder-setting-btn caf-right-module"
                                          onClick={() => handleCloneRow(rowindex)}
                                        >
                                          <BuilderCopyIcon />
                                        </div>
                                        <div
                                          className="builder-setting-btn caf-right-module"
                                          onClick={() =>
                                            handleSettingPopUp("row", rowindex)
                                          }
                                        >
                                          <BuilderEditIcon />
                                        </div>
                                        <div
                                          className="caf-main-text-close"
                                          onClick={() =>
                                            handleRemove("row", rowindex)
                                          }
                                        >
                                          <BuilderDeleteIcon />
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      className={`caf-builder-wrapper-area b-row ${row.settings.collapse_status === "false"
                                          ? ""
                                          : "caf-post-builder-col"
                                        }`}
                                    >
                                      <Droppable
                                        droppableId={`${rowindex}`}
                                        type="column"
                                      >
                                        {(provided) => (
                                          <div
                                            className={`caf-builder-col ${row?.data?.length == 0 ?
                                                "empty-row" : ""
                                              }`}
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                          >
                                            {row?.data?.map(
                                              (column, columnindex) => {
                                                return (
                                                  <Draggable
                                                    draggableId={`${rowindex},${columnindex}`}
                                                    index={columnindex}
                                                    key={columnindex}
                                                  >
                                                    {(provided, snapshot) => (
                                                      <div
                                                        index={columnindex}
                                                        {...provided.dragHandleProps}
                                                        {...provided.draggableProps}
                                                        style={getItemStyle(
                                                          snapshot.isDragging,
                                                          provided
                                                            .draggableProps
                                                            .style
                                                        )}
                                                        ref={provided.innerRef}
                                                        className={`${column.settings
                                                            .collapse_status ===
                                                            "true"
                                                            ? "caf-builder-column-wrapper-none"
                                                            : "caf-builder-column-wrapper"
                                                          } ${getDeviceVisibilityDisabledClass(
                                                            column.settings,
                                                            selectedDevice
                                                          )} ${columnindex > 0 ? 'draggable-col-wrapper' : ""} ${indexes.type ==
                                                            "column" &&
                                                            indexes.rowindex ==
                                                            rowindex &&
                                                            indexes.columnindex ==
                                                            columnindex
                                                            ? "active"
                                                            : ""
                                                          }`}
                                                      >
                                                        <div
                                                          className={`caf-builder-title-bar b-column ${indexes.type ==
                                                              "column" &&
                                                              indexes.rowindex ==
                                                              rowindex &&
                                                              indexes.columnindex ==
                                                              columnindex
                                                              ? "active"
                                                              : ""
                                                            }`}
                                                        >
                                                          <div className="caf-title-bar-left-side-row">
                                                            <div className="caf-collapse-arrow">
                                                              {column.settings
                                                                .collapse_status ===
                                                                "false" ? (
                                                                <CaretUpOutlined
                                                                  color="#ffffff"
                                                                  size="1x"
                                                                  onClick={() =>
                                                                    handleCollapse(
                                                                      "col",
                                                                      rowindex,
                                                                      columnindex
                                                                    )
                                                                  }
                                                                />
                                                              ) : (
                                                                <CaretDownOutlined
                                                                  color="#ffffff"
                                                                  size="1x"
                                                                  onClick={() =>
                                                                    handleExpand(
                                                                      "col",
                                                                      rowindex,
                                                                      columnindex
                                                                    )
                                                                  }
                                                                />
                                                              )}
                                                            </div>
                                                            <div className="caf-main-text">
                                                            {getAdminLabel(column)}
                                                            </div>
                                                          </div>
                                                          <div className="caf-title-bar-right-side-row">
                                                            <div
                                                              className="builder-setting-btn caf-right-module"
                                                              onClick={() =>
                                                                handleCloneColumn(
                                                                  rowindex,
                                                                  columnindex
                                                                )
                                                              }
                                                            >
                                                              <BuilderCopyIcon />
                                                            </div>
                                                            <div
                                                              className="builder-setting-btn caf-right-module"
                                                              onClick={() =>
                                                                handleSettingPopUp(
                                                                  "column",
                                                                  rowindex,
                                                                  columnindex
                                                                )
                                                              }
                                                            >
                                                              <BuilderEditIcon />
                                                            </div>
                                                            <div
                                                              className="caf-main-text-close"
                                                              onClick={() =>
                                                                handleRemove(
                                                                  "column",
                                                                  rowindex,
                                                                  columnindex
                                                                )
                                                              }
                                                            >
                                                              <BuilderDeleteIcon />
                                                            </div>
                                                          </div>
                                                        </div>
                                                        <div
                                                          className={`caf-builder-wrapper-area b-column ${column.settings
                                                              .collapse_status ===
                                                              "false"
                                                              ? ""
                                                              : "caf-post-builder-col"
                                                            } ${column.data
                                                              .length == 0 ?
                                                              "empty-col" : ""
                                                            }`}
                                                        >
                                                          <Droppable
                                                            droppableId={`${rowindex},${columnindex}`}
                                                            type="module"
                                                          >
                                                            {(provided) => (
                                                              <div
                                                                {...provided.droppableProps}
                                                                ref={
                                                                  provided.innerRef
                                                                }
                                                                className="drop-module"
                                                                
                                                              >
                                                                {column?.data?.map(
                                                                  (
                                                                    module,
                                                                    moduleindex
                                                                  ) => {
                                                                    return (
                                                                      <Draggable
                                                                        draggableId={`${rowindex},${columnindex},${moduleindex}`}
                                                                        index={
                                                                          moduleindex
                                                                        }
                                                                        key={
                                                                          moduleindex
                                                                        }
                                                                      >
                                                                        {(
                                                                          provided,
                                                                          snapshot
                                                                        ) => (
                                                                          <>
                                                                            <div
                                                                              {...provided.dragHandleProps}
                                                                              {...provided.draggableProps}
                                                                              style={
                                                                                provided
                                                                                  .draggableProps
                                                                                  .style
                                                                              }
                                                                              ref={
                                                                                provided.innerRef
                                                                              }
                                                                            >
                                                                              <div
                                                                                style={{
                                                                                  backgroundColor:
                                                                                    snapshot.isDragging
                                                                                      ? "lightblue"
                                                                                      : "",
                                                                                }}
                                                                                className={`caf-builder-module b-module ${getDeviceVisibilityDisabledClass(
                                                                                  module.settings,
                                                                                  selectedDevice
                                                                                )} ${indexes.type ==
                                                                                    "module" &&
                                                                                    indexes.rowindex ==
                                                                                    rowindex &&
                                                                                    indexes.columnindex ==
                                                                                    columnindex &&
                                                                                    indexes.moduleindex ==
                                                                                    moduleindex
                                                                                    ? "active"
                                                                                    : ""
                                                                                  } `}
                                                                                key={
                                                                                  moduleindex
                                                                                }
                                                                              // onContextMenu={() =>
                                                                              //   checkModuleClick(
                                                                              //     event,
                                                                              //     rowindex,
                                                                              //     columnindex,
                                                                              //     moduleindex
                                                                              //   )
                                                                              // }
                                                                              >
                                                                                <div className="caf-title-bar-left-side-row">
                                                                                  <div className="builder-setting-btn">
                                                                                    <PostModulePickerIcon
                                                                                      moduleKey={module.key}
                                                                                      className="caf-builder-sidebar-module-icon"
                                                                                    />
                                                                                  </div>
                                                                                  <div className="caf-main-text">
                                                                                  {getAdminLabel(module)}
                                                                                  </div>
                                                                                </div>
                                                                                <div className="caf-title-bar-right-side-row">
                                                                                  <div
                                                                                    className="builder-setting-btn caf-right-module"
                                                                                    onClick={() =>
                                                                                      handleCloneModule(
                                                                                        rowindex,
                                                                                        columnindex,
                                                                                        moduleindex
                                                                                      )
                                                                                    }
                                                                                  >
                                                                                    <BuilderCopyIcon />
                                                                                  </div>
                                                                                  <div
                                                                                    className="builder-setting-btn caf-right-module"
                                                                                    onClick={() =>
                                                                                      handleSettingPopUp(
                                                                                        "module",
                                                                                        rowindex,
                                                                                        columnindex,
                                                                                        moduleindex,
                                                                                        module
                                                                                      )
                                                                                    }
                                                                                  >
                                                                                    <BuilderEditIcon />
                                                                                  </div>
                                                                                  <div
                                                                                    className="caf-main-text-close"
                                                                                    onClick={() =>
                                                                                      handleRemove(
                                                                                        "module",
                                                                                        rowindex,
                                                                                        columnindex,
                                                                                        moduleindex
                                                                                      )
                                                                                    }
                                                                                  >
                                                                                    <BuilderDeleteIcon />
                                                                                  </div>
                                                                                </div>
                                                                              </div>
                                                                            </div>
                                                                             {moduleindex + 1 === column.data.length ? ( 
                                                                            <div className="caf-builder-row-add module">
                                                                              {renderModuleActionDropdown(
                                                                                rowindex,
                                                                                columnindex,
                                                                                moduleindex
                                                                              )}
                                                                            </div>
                                                                             ) : null} 
                                                                          </>
                                                                        )}
                                                                      </Draggable>
                                                                    );
                                                                  }
                                                                )}
                                                                {column.data
                                                                  .length ==
                                                                  0 ? (
                                                                  <div className="caf-builder-row-add module">
                                                                    {renderModuleActionDropdown(
                                                                      rowindex,
                                                                      columnindex,
                                                                      0
                                                                    )}
                                                                  </div>
                                                                ) : null}
                                                                <div className="caf-builder-row-add column">
                                                                  {renderColumnActionDropdown(
                                                                    rowindex,
                                                                    columnindex,
                                                                    true
                                                                  )}
                                                                </div>
                                                                {
                                                                  provided.placeholder
                                                                }
                                                              </div>
                                                            )}
                                                          </Droppable>
                                                        </div>
                                                      </div>
                                                    )}
                                                  </Draggable>
                                                );
                                              }
                                            )}
                                            {row?.data?.length == 0 && (
                                              <div className="caf-builder-row-add column add-new-col">
                                                {renderColumnActionDropdown(
                                                  rowindex,
                                                  0,
                                                  false
                                                )}
                                              </div>
                                            )}
                                            {provided.placeholder}
                                          </div>
                                        )}
                                      </Droppable>
                                      <div className="caf-builder-row-add">
                                        {/* <FontAwesomeIcon
                                          icon={faPlus}
                                          title="Add New Row"
                                          onClick={() => handleAddRow(rowindex)}
                                        /> */}

                                        {renderRowActionDropdown(rowindex)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
          </div>
        </div>
        <div
          className="caf-collapse-left-sidebar-btn"
          style={{ position: "absolute", top: "50%", left: "100%", zIndex:4}}
          onClick={collapseArrowLeftClick}
        >
          {/* <button> */}
          {/* {width <= 300 && width != 0 && <LeftOutlined />}
            {width == 0 && <RightOutlined />} */}
          {width <= 300 && width != 0 && <img className="caf-collapse-left-sidebar-arrow-btn" src={leftArrow} />}
          {width == 0 && <img className="caf-collapse-left-sidebar-arrow-btn" src={leftArrow} />}
          {/* </button> */}
        </div>
      </div>
      <MainArea
        className="mainarea"
        previewState={setPreviewState}
        selectType={props.selectType}
        setSelectType={props.setSelectType}
        currStep={props.currStep}
        setCurrStep={props.setCurrStep}
        mainBuilderData={props.mainBuilderData}
        updatedBuilderData={props.updatedBuilderData}
        setIndexes={setIndexes}
        setSelectedDevice={setSelectedDevice}
        indexes={indexes}
      ></MainArea>
      <div
        className="caf-collapse-right-sidebar"
        style={{ display: "flex", position: "relative" }}
      >
        <div
          className="caf-collapse-right-sidebar-btn"
          style={{ position: "absolute", top: "50%", right: "100%", zIndex: 1 }}
          onClick={collapseArrowRightClick}
        >
          {/* <button> */}
          {/* {rWidth <= 300 && rWidth != 0 && <RightOutlined />}
            {rWidth == 0 && <LeftOutlined />} */}
          {rWidth <= 300 && rWidth != 0 && <img className="caf-collapse-left-sidebar-arrow-btn" src={rightArrow} />}
          {rWidth == 0 && <img className="caf-collapse-left-sidebar-arrow-btn" src={rightArrow} />}
          {/* </button> */}
        </div>
        <div
          className="caf-builder-right-sidebar"
          style={{ width: `${rWidth}px`, transition: "all 0.5s ease-out" }}
        >
          <div
            className={`caf-sidebar-content-shell caf-sidebar-content-shell-right ${
              showRightSidebarContent ? "is-visible" : "is-hidden"
            }`}
          >
          {!addSkelton ? (
            <SettingPopUp
              addSkelton={addSkelton}
              data={layoutDraft}
              indexes={indexes}
              // closePopup={closeSettingPopUp}
              onChangeStyle={onChangeStyle}
              animation="popup-content"
              postData={effectiveSettingsPostPreview}
              selectedDevice={selectedDevice}
              exportPostType={resolvePostTypeFromBuilderData(props.mainBuilderData)}
              mainBuilderData={props.mainBuilderData}
            />
          ) : (
            <Skeleton active />
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostBuilderContainer;
