import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import NewModulePopUp from "./components/NewModulePopUp";
import SettingPopUp from "./components/SettingPopUp";
import { LeftOutlined, RightOutlined, SettingOutlined, AndroidOutlined, AppleOutlined, CaretDownOutlined, CaretUpOutlined, PlusOutlined } from "@ant-design/icons";
import newColumnData from "./components/newElementData/newColumn";
import newRow from "./components/newElementData/newRow";
import { Button, Dropdown, Skeleton, Tabs, Select, message, Modal } from "antd";
import EntityImportModal from "../EntityImportModal";
import { WarningOutlined } from "@ant-design/icons";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import OutputArea from "./OutputArea";
import { fColumnStyle } from "../../MainComponents/FilterComponents/styleData";
import BuilderDeleteIcon from "../BuilderDeleteIcon";
import BuilderEditIcon from "../BuilderEditIcon";
import BuilderCopyIcon from "../BuilderCopyIcon";
import FilterModulePickerIcon from "./components/FilterModulePickerIcon";
import leftArrow from "../images/left-arrow.svg"
import rightArrow from "../images/right-arrow.svg"
import plus from "../images/plus.png";
import titleImg from "../images/post-title.png";
import elementIcon from "../images/element-icon.svg";
import {
  selectFilterExtraData,
} from "../../store/selectors";
import { setExtraData as setFilterBuilderExtraData } from "../../store/filterBuilderSlice";
import isEqual from "lodash/isEqual";
import apiClient from "../../api/client";
import { apiEndpoints } from "../../api/endpoints";
import { resolvePostTypeFromBuilderData } from "../utils/builderDataAdapters";
import {
  applyGlobalFontToLayoutElement,
  getGlobalFontFamily,
  loadGoogleFontFamily,
} from "../utils/globalFontFamily";
import {
  sanitizeImportedFilterModulesInTree,
} from "../importExport/sanitizeImportedFilterTerms";
import {
  layoutIndexEquals,
  normalizeLayoutIndexes,
} from "../utils/layoutIndexes";
import { resolveBuilderPreviewDevice } from "../utils/builderPreviewDevice";
import {
  getBuilderDropdownProps,
  getBuilderNewModuleDropdownProps,
} from "../shared/builderDropdownProps";
import { isModuleLocked, canUseFeature, isProTier, getUpgradeUrl } from "../../tier/capabilities";
import { TierLockedWrap } from "../../tier/TierLockedWrap";
import QueryRestrictionSettings from "./components/QueryRestrictionSettings";
import {
  enforceSingleInstanceFilterModulesInLayout,
  getSingleInstanceFilterModuleLimitMessage,
  getSingleInstanceFilterModuleLimitMessageWithUpgrade,
  isSingleInstanceFilterModuleForTier,
  wouldExceedSingleInstanceFilterModuleLimit,
} from "./utils/filterLayoutSearchRules";
function FilterBuilderContainer(props) {
  const SIDEBAR_CONTENT_REVEAL_DELAY = 220;
  const dispatch = useDispatch();
  const reduxExtraData = useSelector(selectFilterExtraData);
  const [initialdata, setInitialData] = useState(
    () =>
      enforceSingleInstanceFilterModulesInLayout(
        props.mainBuilderData.filter_layout_data.initial_data
      )
  );
  let extraData =
    Object.keys(reduxExtraData || {}).length > 0
      ? { ...reduxExtraData }
      : { ...props.mainBuilderData.filter_layout_data.extra_data };
  const [moduleIndexes, setModuleIndexes] = useState({});
  const [selectedDevice, setSelectedDevice] = useState(
    resolveBuilderPreviewDevice(props.mainBuilderData)
  )
  const [addSkelton, setAddSkelton] = useState(false);
  const [showModulePopUp, setShowModulePopUp] = useState(false);
  const [elementTab, setElementTab] = useState('elements');
  const [taxoRelation, setTaxoRelation] = useState(extraData?.taxonomy_relation ?? "OR");
  const [metaRelation, setMetaRelation] = useState(extraData?.meta_relation ?? "IN");
  const [queryRestriction, setQueryRestriction] = useState(
    () =>
      extraData?.query_restriction || {
        enabled: "false",
        include: { by: "", taxonomy: "", term_data: [] },
        exclude: { by: "", taxonomy: "", term_data: [], post_data: [] },
      }
  );
  const [width, setWidth] = useState(300);
  const [indexes, setIndexes] = useState({
    rowindex: 0,
    columnindex: "",
    moduleindex: "",
    module: "",
    type: "row",
  });
  const [rWidth, setRwidth] = useState(300);
  const [showLeftSidebarContent, setShowLeftSidebarContent] = useState(true);
  const [showRightSidebarContent, setShowRightSidebarContent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isInside, setIsInside] = useState(false);
  const [moduleActionTarget, setModuleActionTarget] = useState(null);
  const [columnActionTarget, setColumnActionTarget] = useState(null);
  const [rowActionTarget, setRowActionTarget] = useState(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importDialogType, setImportDialogType] = useState("");
  const [selectedImportFileName, setSelectedImportFileName] = useState("");
  const [selectedImportJson, setSelectedImportJson] = useState(null);
  /**
   * After we push filter layout changes up, the next render can still see the *previous*
   * `props.mainBuilderData` in the prop-sync effect (parent has not committed yet). That
   * effect was overwriting `initialdata` with stale `initial_data`, then the `[initialdata]`
   * effect committed the reverted tree — terms never reached the document for save.
   */
  const skipPropInitialDataSyncRef = useRef(false);
  const commitBuilderPatch = (mutator) => {
    const nextBuilder = structuredClone(props.mainBuilderData || {});
    if (!nextBuilder.filter_layout_data) {
      nextBuilder.filter_layout_data = {};
    }
    mutator(nextBuilder.filter_layout_data);
    skipPropInitialDataSyncRef.current = true;
    props.updatedBuilderData(nextBuilder);
    /** Only mirror `extra_data` — dispatching `initial_data` here loops with `useEffect([reduxInitialData])` → `setInitialData` → `useEffect([initialdata])` → `commitBuilderPatch`. */
    const fd = nextBuilder.filter_layout_data;
    if (fd.extra_data && typeof fd.extra_data === "object") {
      dispatch(setFilterBuilderExtraData(structuredClone(fd.extra_data)));
    }
  };

  /** Preview must read live `initialdata`; props lag until parent echoes `updatedBuilderData`. */
  const previewMainBuilderData = useMemo(
    () => ({
      ...props.mainBuilderData,
      filter_layout_data: {
        ...props.mainBuilderData.filter_layout_data,
        initial_data: initialdata,
      },
    }),
    [props.mainBuilderData, initialdata]
  );

  /**
   * Keep local `initialdata` in sync when the layout document updates from outside this
   * container (e.g. Misc Settings post-type reset, import). Otherwise `previewMainBuilderData`
   * keeps stale module rows and term picks never match the saved document.
   */
  useEffect(() => {
    if (skipPropInitialDataSyncRef.current) {
      skipPropInitialDataSyncRef.current = false;
      return;
    }
    const fromProps = props.mainBuilderData?.filter_layout_data?.initial_data;
    if (!Array.isArray(fromProps)) return;
    setInitialData((prev) =>
      isEqual(prev, fromProps) ? prev : structuredClone(fromProps)
    );
  }, [props.mainBuilderData]);

  useEffect(() => {
    if (initialdata !== undefined) {
      commitBuilderPatch((filterLayout) => {
        filterLayout.initial_data = initialdata;
      });
    }
  }, [initialdata]);

  useEffect(() => {
    if (reduxExtraData && Object.keys(reduxExtraData).length > 0) {
      setTaxoRelation(reduxExtraData?.taxonomy_relation ?? "OR");
      setMetaRelation(reduxExtraData?.meta_relation ?? "IN");
      setQueryRestriction(
        reduxExtraData?.query_restriction || {
          enabled: "false",
          include: { by: "", taxonomy: "", term_data: [] },
          exclude: { by: "", taxonomy: "", term_data: [], post_data: [] },
        }
      );
    }
  }, [reduxExtraData]);

  useEffect(() => {
    if (props.previewVal === "0") {
      setWidth(0);
      setRwidth(0);
      setShowModulePopUp(false);
    } else {
      setWidth(300);
      setRwidth(300);
      setShowModulePopUp(false);
    }
  }, [props.previewVal])

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
    setIndexes((prevIndexes) =>
      normalizeLayoutIndexes({
        ...prevIndexes,
        type,
        rowindex,
        columnindex,
        moduleindex,
        module,
      })
    );
  };

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
      setAddSkelton(true);
      setTimeout(() => {
        setAddSkelton(false);
      }, 300);
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
  const removeArray = (arr, index) => [
    // part of the array before the specified index
    ...arr.slice(0, index),
    // part of the array after the specified index
    ...arr.slice(index + 1),
  ];
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
        settings: {
          collapse_status: "false",
          custom_class: "",
          admin_label: "",
          visibility: {
            mobile: "false",
            tablet: "false",
            desktop: "false"
          }
        },
        data: [],
        style: { ...fColumnStyle },
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
  const canCopyFilterModule = (module) =>
    !isSingleInstanceFilterModuleForTier(module?.key);

  const showFilterModuleLimitNotice = (entityToAdd) => {
    const limitMessage = getSingleInstanceFilterModuleLimitMessage(
      initialdata,
      entityToAdd
    );
    message.open({
      type: "info",
      content: isProTier() ? (
        <span>{limitMessage}</span>
      ) : (
        <span>
          {limitMessage}{" "}
          <a
            href={getUpgradeUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="caf-builder-tier-locked-section__upgrade-link"
          >
            Upgrade to Pro
          </a>{" "}
          to add more.
        </span>
      ),
      icon: <WarningOutlined />,
    });
  };

  const handleCloneRow = (rowindex) => {
    const layoutCopy = JSON.parse(JSON.stringify(initialdata));
    const sourceRow = layoutCopy?.[rowindex];
    if (!sourceRow) {
      message.error("Row data is not available.");
      return;
    }
    if (wouldExceedSingleInstanceFilterModuleLimit(initialdata, sourceRow)) {
      showFilterModuleLimitNotice(sourceRow);
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
    if (wouldExceedSingleInstanceFilterModuleLimit(initialdata, sourceColumn)) {
      showFilterModuleLimitNotice(sourceColumn);
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
    if (wouldExceedSingleInstanceFilterModuleLimit(initialdata, sourceModule)) {
      showFilterModuleLimitNotice(sourceModule);
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
  const handleAddModule = (rowindex, columnindex, moduleindex) => {
    moduleIndexes.rowindex = rowindex;
    moduleIndexes.columnindex = columnindex;
    moduleIndexes.moduleindex = moduleindex;
    setModuleIndexes(moduleIndexes);
    setShowModulePopUp(true);
  };
  const openImportColumnPicker = (rowindex, columnindex, addAfter = true) => {
    setColumnActionTarget({ rowindex, columnindex, addAfter });
    setImportDialogType("column");
    setSelectedImportFileName("");
    setSelectedImportJson(null);
    setImportDialogOpen(true);
  };
  const openImportRowPicker = (rowindex) => {
    setRowActionTarget({ rowindex });
    setImportDialogType("row");
    setSelectedImportFileName("");
    setSelectedImportJson(null);
    setImportDialogOpen(true);
  };
  const openImportWidgetPicker = (rowindex, columnindex, moduleindex) => {
    setModuleActionTarget({ rowindex, columnindex, moduleindex });
    setImportDialogType("widget");
    setSelectedImportFileName("");
    setSelectedImportJson(null);
    setImportDialogOpen(true);
  };
  const triggerChooseImportFile = () => {
    const input = document.getElementById("caf-filter-entity-import-input");
    if (input) {
      input.value = "";
      input.click();
    }
  };
  const handleModuleActionMenuClick = (menuKey, rowindex, columnindex, moduleindex) => {
    if (menuKey === "new_widget") {
      handleAddModule(rowindex, columnindex, moduleindex);
      return;
    }
    if (menuKey === "import_widget") {
      openImportWidgetPicker(rowindex, columnindex, moduleindex);
    }
  };
  const handleColumnActionMenuClick = (menuKey, rowindex, columnindex, addAfter = true) => {
    if (menuKey === "new_column") {
      handleAddColumn(rowindex, columnindex, addAfter);
      return;
    }
    if (menuKey === "import_column") {
      openImportColumnPicker(rowindex, columnindex, addAfter);
    }
  };
  const handleRowActionMenuClick = (menuKey, rowindex) => {
    if (menuKey === "new_row") {
      handleAddRow(rowindex);
      return;
    }
    if (menuKey === "import_row") {
      openImportRowPicker(rowindex);
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
        setSelectedImportJson(null);
        setSelectedImportFileName("");
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
  const getWidgetImportSanitizeOptions = (importedModule) => ({
    apiClient,
    apiEndpoints,
    currentPostType: resolvePostTypeFromBuilderData(props.mainBuilderData),
    importedPostType: importedModule?.settings?.post_type || "",
  });

  const applyWidgetImport = async () => {
    if (!moduleActionTarget) throw new Error("No target selected for module import.");
    const importedScope = selectedImportJson?._export_meta?.scope;
    if (importedScope && importedScope !== "filter_module") {
      throw new Error("Selected file is not a Filter module export.");
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
    if (wouldExceedSingleInstanceFilterModuleLimit(initialdata, importedModule)) {
      throw new Error(
        getSingleInstanceFilterModuleLimitMessageWithUpgrade(
          initialdata,
          importedModule
        )
      );
    }
    const { rowindex, columnindex } = moduleActionTarget;
    const layoutCopy = JSON.parse(JSON.stringify(initialdata));
    const nextModule = await sanitizeImportedFilterModule(
      JSON.parse(JSON.stringify(importedModule)),
      getWidgetImportSanitizeOptions(importedModule)
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
  const applyColumnImport = async () => {
    if (!columnActionTarget) throw new Error("No target selected for column import.");
    const importedScope = selectedImportJson?._export_meta?.scope;
    if (importedScope && importedScope !== "filter_column") {
      throw new Error("Selected file is not a Filter Column export.");
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
    if (wouldExceedSingleInstanceFilterModuleLimit(initialdata, importedColumn)) {
      throw new Error(
        getSingleInstanceFilterModuleLimitMessageWithUpgrade(
          initialdata,
          importedColumn
        )
      );
    }
    const { rowindex, columnindex, addAfter } = columnActionTarget;
    const insertIndex = addAfter ? Number(columnindex) + 1 : Number(columnindex);
    const layoutCopy = JSON.parse(JSON.stringify(initialdata));
    const nextColumn = await sanitizeImportedFilterModulesInTree(
      JSON.parse(JSON.stringify(importedColumn)),
      getWidgetImportSanitizeOptions(importedColumn?.data?.[0])
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
  const applyRowImport = async () => {
    if (!rowActionTarget) throw new Error("No target selected for row import.");
    const importedScope = selectedImportJson?._export_meta?.scope;
    if (importedScope && importedScope !== "filter_row") {
      throw new Error("Selected file is not a Filter Row export.");
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
    if (wouldExceedSingleInstanceFilterModuleLimit(initialdata, importedRow)) {
      throw new Error(
        getSingleInstanceFilterModuleLimitMessageWithUpgrade(initialdata, importedRow)
      );
    }
    const { rowindex } = rowActionTarget;
    const insertIndex = Number(rowindex) + 1;
    const layoutCopy = JSON.parse(JSON.stringify(initialdata));
    const nextRow = await sanitizeImportedFilterModulesInTree(
      JSON.parse(JSON.stringify(importedRow)),
      getWidgetImportSanitizeOptions()
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
  const handleConfirmImport = async () => {
    if (!selectedImportJson) {
      message.error("Please choose a JSON file first.");
      return;
    }
    try {
      if (importDialogType === "widget") {
        await applyWidgetImport();
      } else if (importDialogType === "column") {
        await applyColumnImport();
      } else if (importDialogType === "row") {
        await applyRowImport();
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
      setIndexes(
        normalizeLayoutIndexes({
          type: "row",
          rowindex: destinationRowIndex,
          columnindex: "",
          moduleindex: "",
          module: "",
        })
      );
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
      setIndexes(
        normalizeLayoutIndexes({
          type: "column",
          rowindex: DestinationRowIndex,
          columnindex: DestinationColumnIndex,
          moduleindex: "",
          module: "",
        })
      );
      return;
    }

    if (type === "module") {
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
      setIndexes(
        normalizeLayoutIndexes({
          type: "module",
          rowindex: DestinationRowIndex,
          columnindex: DestinationColumnIndex,
          moduleindex: DestinationModuleIndex,
          module: DeletedModuledata,
        })
      );
      return;
    }
  };
  const onSelectModule = (item) => {
    if (isModuleLocked(item.key, "filter")) {
      return;
    }
    // console.log(item.key);
    // return false;
    if (wouldExceedSingleInstanceFilterModuleLimit(initialdata, item)) {
      showFilterModuleLimitNotice(item);
      return;
    }
    const layoutCopy = JSON.parse(JSON.stringify(initialdata));
    const { rowindex, columnindex, moduleindex } = moduleIndexes;
    setShowModulePopUp(false);
    const moduleItem = JSON.parse(JSON.stringify(item));
    const globalFont = getGlobalFontFamily(props.mainBuilderData);
    applyGlobalFontToLayoutElement(moduleItem, globalFont, { force: true });
    loadGoogleFontFamily(globalFont);
    layoutCopy[rowindex].data[columnindex].data.push(moduleItem);
    setInitialData([...layoutCopy]);
    setIndexes(moduleIndexes);
    if (layoutCopy[rowindex].data[columnindex].data?.length == 1) {
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
  const onChangeStyle = (style) => {
    setInitialData([...style]);
    // props.newData([...style])
  };
  const closeNewModulePopUp = () => {
    setShowModulePopUp(false);
  };
  const collapseArrowLeftClick = () => {
    if (props.previewVal === "1") {
      if (width === 0) {
        setWidth(300);
      } else {
        setWidth(0);
      }
      setShowModulePopUp(false);
    }
  };
  const collapseArrowRightClick = () => {
    if (props.previewVal === "1") {
      if (rWidth === 0) {
        setRwidth(300);
      } else {
        setRwidth(0);
      }
    }
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
  const getItemStyle = (isDragging, draggableStyle) => ({
    // Change background color if dragging
    background: isDragging ? "lightblue" : "",
    // styles we need to apply on draggables
    ...draggableStyle,
  });

  const elementItems = [
    {
      label: (
        <span className="caf-filter-elememts-tab-icon caf-element-icon">
          <img src={elementIcon} />
          Elements
        </span>
      ),
      key: "elements",
    },
    {
      label: (
        <span className="caf-filter-elememts-tab-icon caf-el-setting-icon">
          <SettingOutlined />
          Settings
        </span>
      ),
      key: "settings",
    }
  ];

  const RelationalOpt = [
    {
      label: "OR",
      value: "OR",
    },
    {
      label: "AND",
      value: "AND",
    },
  ];
  const MetaRelOpt = [
    {
      label: "OR",
      value: "OR",
    },
    // {
    //   label: "IN",
    //   value: "IN",
    // },
    // {
    //   label: "NOT IN",
    //   value: "NOT IN",
    // },
    {
      label: "AND",
      value: "AND",
    },
    // {
    //   label: "EXISTS",
    //   value: "EXISTS",
    // },
    // {
    //   label: "NOT EXISTS",
    //   value: "NOT EXISTS",
    // },
  ];
  const onChangeElement = (val) => {
    setElementTab(val);
  }
  const handleChangeTaxoRel = (val) => {
    setTaxoRelation(val);
    commitBuilderPatch((filterLayout) => {
      if (!filterLayout.extra_data) {
        filterLayout.extra_data = {};
      }
      filterLayout.extra_data.taxonomy_relation = val;
    });
  }
  const handleChangeMetaRel = (val) => {
    if (!canUseFeature("meta_relation")) {
      return;
    }
    setMetaRelation(val);
    commitBuilderPatch((filterLayout) => {
      if (!filterLayout.extra_data) {
        filterLayout.extra_data = {};
      }
      filterLayout.extra_data.meta_relation = val;
    });
  }
  const handleChangeQueryRestriction = (nextRestriction) => {
    if (!canUseFeature("query_restriction")) {
      return;
    }
    setQueryRestriction(nextRestriction);
    commitBuilderPatch((filterLayout) => {
      if (!filterLayout.extra_data) {
        filterLayout.extra_data = {};
      }
      filterLayout.extra_data.query_restriction = nextRestriction;
    });
  };
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

          if (module?.style?.container?.desktop?.default?.fontFamily) {
            loadFont(module?.style?.container?.desktop?.default?.fontFamily);
          }
          if (module?.style?.container?.desktop?.hover?.fontFamily) {
            loadFont(module?.style?.container?.desktop?.hover?.fontFamily);
          }
          if (module?.style?.container?.tablet?.default?.fontFamily) {
            loadFont(module?.style?.container?.tablet?.default?.fontFamily);
          }
          if (module?.style?.container?.tablet?.hover?.fontFamily) {
            loadFont(module?.style?.container?.tablet?.hover?.fontFamily);
          }
          if (module?.style?.container?.mobile?.default?.fontFamily) {
            loadFont(module?.style?.container?.mobile?.default?.fontFamily);
          }
          if (module?.style?.container?.mobile?.hover?.fontFamily) {
            loadFont(module?.style?.container?.mobile?.hover?.fontFamily);
          }
          /* start for header*/

          if (module?.style?.header?.desktop?.default?.fontFamily) {
            loadFont(module?.style?.header?.desktop?.default?.fontFamily);
          }
          if (module?.style?.header?.desktop?.hover?.fontFamily) {
            loadFont(module?.style?.header?.desktop?.hover?.fontFamily);
          }
          if (module?.style?.header?.tablet?.default?.fontFamily) {
            loadFont(module?.style?.header?.tablet?.default?.fontFamily);
          }
          if (module?.style?.header?.tablet?.hover?.fontFamily) {
            loadFont(module?.style?.header?.tablet?.hover?.fontFamily);
          }
          if (module?.style?.header?.mobile?.default?.fontFamily) {
            loadFont(module?.style?.header?.mobile?.default?.fontFamily);
          }
          if (module?.style?.header?.mobile?.hover?.fontFamily) {
            loadFont(module?.style?.header?.mobile?.hover?.fontFamily);
          }

          /* start for meta*/

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

          /* start for input */

          if (module?.style?.input?.desktop?.default?.fontFamily) {
            loadFont(module?.style?.input?.desktop?.default?.fontFamily);
          }
          if (module?.style?.input?.desktop?.hover?.fontFamily) {
            loadFont(module?.style?.input?.desktop?.hover?.fontFamily);
          }
          if (module?.style?.input?.tablet?.default?.fontFamily) {
            loadFont(module?.style?.input?.tablet?.default?.fontFamily);
          }
          if (module?.style?.input?.tablet?.hover?.fontFamily) {
            loadFont(module?.style?.input?.tablet?.hover?.fontFamily);
          }
          if (module?.style?.input?.mobile?.default?.fontFamily) {
            loadFont(module?.style?.input?.mobile?.default?.fontFamily);
          }
          if (module?.style?.input?.mobile?.hover?.fontFamily) {
            loadFont(module?.style?.input?.mobile?.hover?.fontFamily);
          }
        });
      });
    }
    )
  };
  /*============================================== End Font Family Linking =========================================================*/
  return (
    <div className={`main-area-container-fix main-container-filter ${isInside ? "inside-active" : "outside-active"
      }`}
      onMouseEnter={() => setIsInside(true)}
      onMouseLeave={() => setIsInside(false)}
    >
      <input
        id="caf-filter-entity-import-input"
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
            ? "Only widget export JSON is allowed."
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
      >
        {showModulePopUp ? (
          <NewModulePopUp
            closeNewModulePopup={closeNewModulePopUp}
            onSelectModule={onSelectModule}
            data={initialdata}
            indexes={indexes}
            animation="popup-content"
          />
        ) : null}
        <div
          className="caf-builder-sidebar caf-builder-filter-sidebar"
          style={{
            width: `${width}px`,
            transition: "all 0.5s ease-out",
            visibility: width === 0 ? "hidden" : "visible",
          }}
        >
          <div
            className={`caf-sidebar-content-shell ${showLeftSidebarContent ? "is-visible" : "is-hidden"
              }`}
          >
            <Tabs defaultActiveKey="elements" items={elementItems} onChange={onChangeElement} className="caf-filter-buider-element-tabs" />
            {elementTab === "elements" ? (
              <div className="caf-builder-wrapper">
                <div className="caf-builder-wrapper-area wrapper">
                  <DragDropContext onDragEnd={handleDragDrop}>
                    <Droppable droppableId="ROOT" type="row">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                          {initialdata?.length === 0 ? (
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
                                    className={`${rowindex > 0 ? 'draggable-row-wrapper' : ""}`}
                                  >
                                    <div
                                      // style={{
                                      //   backgroundColor: snapshot.isDragging
                                      //     ? "lightblue":"" 
                                      // }}
                                      className={`${row.settings.collapse_status === "true"
                                          ? "caf-builder-row-wrapper-none" : "caf-builder-row-wrapper"} ${indexes.type === "row" &&
                                          layoutIndexEquals(indexes.rowindex, rowindex)
                                          ? "active"
                                          : ""}`}
                                      key={rowindex}
                                    >
                                      <div
                                        className={`${indexes.type === "row" &&
                                            layoutIndexEquals(indexes.rowindex, rowindex)
                                            ? "active"
                                            : ""
                                          } caf-builder-title-bar b-row`}
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
                                            onClick={() => handleCloneRow(rowindex)}
                                            className="builder-setting-bar caf-right-module"
                                          >
                                            <BuilderCopyIcon />
                                          </div>
                                          <div
                                            onClick={() =>
                                              handleSettingPopUp("row", rowindex)
                                            }
                                            className="builder-setting-bar caf-right-module"
                                          >
                                            <BuilderEditIcon />
                                          </div>
                                          <div
                                            onClick={() =>
                                              handleRemove("row", rowindex)
                                            }
                                            className="caf-main-text-close"
                                          >
                                            <BuilderDeleteIcon />
                                          </div>
                                        </div>
                                      </div>
                                      <div
                                        className={`caf-builder-wrapper-area b-row ${row.settings.collapse_status === "false"
                                            ? ""
                                            : "caf-filter-builder-col"
                                          }`}
                                        style={{
                                          backgroundColor: snapshot.isDragging
                                            ? "lightblue" : ""
                                        }}
                                      >
                                        <Droppable
                                          droppableId={`${rowindex}`}
                                          type="column"
                                        >
                                          {(provided) => (
                                            <div
                                              className={`caf-builder-col ${row?.data?.length === 0 ?
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
                                                              : "caf-builder-column-wrapper"} ${columnindex > 0 ? 'draggable-col-wrapper' : ""} ${indexes.type ===
                                                              "column" &&
                                                              layoutIndexEquals(indexes.rowindex, rowindex) &&
                                                              layoutIndexEquals(indexes.columnindex, columnindex)
                                                              ? "active"
                                                              : ""
                                                            }`}
                                                        >
                                                          <div
                                                            className={`${indexes.type ===
                                                                "column" &&
                                                                layoutIndexEquals(indexes.rowindex, rowindex) &&
                                                                layoutIndexEquals(indexes.columnindex, columnindex)
                                                                ? "active"
                                                                : ""
                                                              } caf-builder-title-bar b-column`}
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
                                                                onClick={() =>
                                                                  handleCloneColumn(
                                                                    rowindex,
                                                                    columnindex
                                                                  )
                                                                }
                                                                className="builder-setting-bar caf-right-module"
                                                              >
                                                                <BuilderCopyIcon />
                                                              </div>
                                                              <div
                                                                onClick={() =>
                                                                  handleSettingPopUp(
                                                                    "column",
                                                                    rowindex,
                                                                    columnindex
                                                                  )
                                                                }
                                                                className="builder-setting-bar caf-right-module"
                                                              >
                                                                <BuilderEditIcon />
                                                              </div>
                                                              <div
                                                                onClick={() =>
                                                                  handleRemove(
                                                                    "column",
                                                                    rowindex,
                                                                    columnindex
                                                                  )
                                                                }
                                                                className="caf-main-text-close"
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
                                                                : "caf-filter-builder-col"
                                                              } ${column.data
                                                                .length === 0 ?
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
                                                                                  className={`${indexes.type ===
                                                                                      "module" &&
                                                                                      layoutIndexEquals(indexes.rowindex, rowindex) &&
                                                                                      layoutIndexEquals(indexes.columnindex, columnindex) &&
                                                                                      layoutIndexEquals(indexes.moduleindex, moduleindex)
                                                                                      ? "active"
                                                                                      : ""
                                                                                    } caf-builder-module b-module`}
                                                                                  key={
                                                                                    moduleindex
                                                                                  }
                                                                                >
                                                                                  <div className="caf-title-bar-left-side-row">
                                                                                    <div className="builder-setting-bar">
                                                                                      <FilterModulePickerIcon
                                                                                        moduleKey={module.key}
                                                                                        className="caf-builder-sidebar-module-icon"
                                                                                      />
                                                                                    </div>
                                                                                    <div className="caf-main-text">
                                                                                      {getAdminLabel(module)}
                                                                                    </div>
                                                                                  </div>
                                                                                  <div className="caf-title-bar-right-side-row">
                                                                                    {canCopyFilterModule(module) ? (
                                                                                      <div
                                                                                        onClick={() =>
                                                                                          handleCloneModule(
                                                                                            rowindex,
                                                                                            columnindex,
                                                                                            moduleindex
                                                                                          )
                                                                                        }
                                                                                        className="builder-setting-bar caf-right-module"
                                                                                      >
                                                                                        <BuilderCopyIcon />
                                                                                      </div>
                                                                                    ) : null}
                                                                                    <div
                                                                                      onClick={() =>
                                                                                        handleSettingPopUp(
                                                                                          "module",
                                                                                          rowindex,
                                                                                          columnindex,
                                                                                          moduleindex,
                                                                                          module
                                                                                        )
                                                                                      }
                                                                                      className="builder-setting-bar caf-right-module"
                                                                                    >
                                                                                      <BuilderEditIcon />
                                                                                    </div>
                                                                                    <div
                                                                                      onClick={() =>
                                                                                        handleRemove(
                                                                                          "module",
                                                                                          rowindex,
                                                                                          columnindex,
                                                                                          moduleindex
                                                                                        )
                                                                                      }
                                                                                      className="caf-main-text-close"
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
                                                                    .length ===
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
                                              {row?.data?.length === 0 && (
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
            ) : (
              <div className="caf-builder-filter-setting-element-tab-content-section">
                <div className="caf-main-setting-page data-field">
                  <label className="caf-main-setting-page label">Select Taxonomy Relation</label>
                  <Select
                    defaultValue={taxoRelation}
                    style={{
                      width: "100%",
                    }}
                    onChange={handleChangeTaxoRel}
                    options={[...RelationalOpt]}
                    value={taxoRelation}
                  />
                </div>
                <TierLockedWrap
                  locked={!canUseFeature("meta_relation")}
                  showProBadge
                  className="caf-builder-tier-locked-meta-relation"
                  upgradeMessage="Meta relation controls how custom field filters combine. Available in Category Ajax Filter Pro."
                >
                  <div className="caf-main-setting-page data-field">
                    <label className="caf-main-setting-page label">Select Meta Relation</label>
                    <Select
                      defaultValue={metaRelation}
                      style={{
                        width: "100%",
                      }}
                      onChange={handleChangeMetaRel}
                      options={[...MetaRelOpt]}
                      value={metaRelation}
                    />
                  </div>
                </TierLockedWrap>
                <TierLockedWrap
                  locked={!canUseFeature("query_restriction")}
                  showProBadge
                  className="caf-builder-tier-locked-query-restriction"
                  upgradeMessage="Query restriction is available in Category Ajax Filter Pro."
                >
                  <QueryRestrictionSettings
                    value={queryRestriction}
                    postType={resolvePostTypeFromBuilderData(props.mainBuilderData)}
                    onChange={handleChangeQueryRestriction}
                  />
                </TierLockedWrap>
              </div>
            )}
          </div>
        </div>
        <div
          className="caf-collapse-left-sidebar-btn"
          style={{ position: "absolute", top: "50%", left: "100%", zIndex: 4, cursor: "pointer" }}
          onClick={collapseArrowLeftClick}
        >
          {/* <button> */}
          {width <= 300 && width !== 0 && <img className="caf-collapse-left-sidebar-arrow-btn" src={leftArrow} />}
          {width === 0 && <img className="caf-collapse-left-sidebar-arrow-btn" src={leftArrow} />}
          {/* </button> */}
        </div>
      </div>
      <OutputArea
        mainBuilderData={previewMainBuilderData}
        updatedBuilderData={props.updatedBuilderData}
        isDragDisabled={false}
        setIndexes={setIndexes}
        setSelectedDevice={setSelectedDevice}
        previewState={props.previewState}
        setSelectType={props.setSelectType}
        setCurrStep={props.setCurrStep}
        selectType={props.selectType}
        currStep={props.currStep}
        indexes={indexes}
      ></OutputArea>

      <div
        className="caf-collapse-right-sidebar"
        style={{ display: "flex", position: "relative" }}
      >
        <div
          className="caf-collapse-right-sidebar-btn"
          style={{ position: "absolute", top: "50%", right: "100%", zIndex: 1, cursor: "pointer" }}
          onClick={collapseArrowRightClick}
        >
          {/* <button> */}
          {rWidth <= 300 && rWidth !== 0 && <img className="caf-collapse-left-sidebar-arrow-btn" src={rightArrow} />}
          {rWidth === 0 && <img className="caf-collapse-left-sidebar-arrow-btn" src={rightArrow} />}
          {/* </button> */}
        </div>
        <div
          className="caf-builder-right-sidebar"
          style={{ width: `${rWidth}px`, transition: "all 0.5s ease-out" }}
        >
          <div
            className={`caf-sidebar-content-shell caf-sidebar-content-shell-right ${showRightSidebarContent ? "is-visible" : "is-hidden"
              }`}
          >
            <SettingPopUp
              addSkelton={addSkelton}
              extraData={extraData}
              mainBuilderData={props.mainBuilderData}
              data={initialdata}
              indexes={indexes}
              // closePopup={closeSettingPopUp}
              onChangeStyle={onChangeStyle}
              animation="popup-content"
              postData={""}
              selectedDevice={selectedDevice}
              updatedBuilderData={props.updatedBuilderData}
            // updatedExtraData={props.updatedExtraData}
            // openBuilderSetting={openBuilderSetting}
            // setSaveLayoutClick={props.setSaveLayoutClick}
            // saveLayoutClick={props.saveLayoutClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterBuilderContainer;
