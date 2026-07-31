import React, { useState, useEffect, useRef, useCallback } from "react";
import { message, Modal, Tabs, Input, Skeleton } from "antd";
import AddNewPage from "./MainComponents/AddNewPage";
import BuilderErrorBoundary from "./components/BuilderErrorBoundary";
import ConnectionLostBanner from "./components/ConnectionLostBanner";
import MainLayoutContainer from "./MainComponents/MainLayoutContainer";
import { CopyOutlined } from "@ant-design/icons";
import BuilderCafWhiteOrangeLogoIcon from "./MainComponents/BuilderCafWhiteOrangeLogoIcon";
import GlobalSettingsDrawer from "./MainComponents/GlobalSettingsDrawer";
import emptyFilter from "./MainComponents/images/empty-filters.png";
import { builderLayoutData } from "./MainComponents/BuilderLayoutData";
import FiltersTab from "./MainComponents/FiltersTab";
import TrashTab from "./MainComponents/TrashTab";
import apiClient, { getSiteBaseUrl } from "./api/client";
import { apiEndpoints } from "./api/endpoints";
import { useDispatch, useSelector } from "react-redux";
import {
  setLayouts,
  setTrashLayouts,
  setPagination,
  setTrashPagination,
  setFiltersLoading,
  setTrashLoading,
  setSelectedItems,
  setSelectedTrashItems,
  setSelectAll,
  setSelectTrashAll,
  setFilteredLayouts,
  setFilteredTrashLayouts,
  setTotalFilters,
  setTotalTrashFilters,
  setSelectedTab,
  resetFilterSelection,
  resetTrashSelection,
} from "./store/layoutsSlice";
import { setFilterBuilderState } from "./store/filterBuilderSlice";
import { migrateLayoutDocument } from "./layoutSchema/migrateLayoutDocument";
import { canUseFeature } from "./tier/capabilities";

/** Applied to `document.body` while the filter builder is open (removed on list view / unmount / full refresh). */
const CAF_ADMIN_BODY_BUILDER_CLASS = "caf-filter-admin-builder-active";

const LayoutsList = () => {
  const site_url = getSiteBaseUrl();

  const dispatch = useDispatch();

  const {
    layoutsList,
    filteredLayoutList,
    trashLayoutsList,
    filteredTrashLayoutList,

    filtersLoading,
    trashLoading,

    currentPage,
    totalPage,
    trashCurrentPage,
    trashTotalPage,

    selectedItems,
    selectedTrashItems,

    selectAll,
    selectTrashAll,

    totalFilters,
    totalTrashFilters,

    selectedTab,
  } = useSelector((state) => state.layouts);

  const connectionLost = useSelector((state) => state.connection.lost);

  const [addNewPagePopup, setAddNewPagePopup] = useState(false);
  const [layoutContainer, setLayoutContainer] = useState(false);
  const [currCopied, setCurCopied] = useState("");
  const [deleteIndex, setDeleteIndex] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState("0");
  const [selectLoading, setSelectLoading] = useState(false);
  const [checkPostId, setCheckPostId] = useState("0");
  const [selectType, setSelectType] = useState("");
  const [searchPostValue, setSearchPostValue] = useState("");
  const [filtersBulkActionVal, setFiltersBulkActionVal] = useState("0");
  const [mainBuilderData, setMainBuilderData] = useState({
    ...builderLayoutData,
  });
  const inputRef = useRef(null);
  const [searchTrashPostValue, setSearchTrashPostValue] = useState("");
  const [filtersTrashBulkActionVal, setFiltersTrashBulkActionVal] = useState("0");
  const initialLoadDone = useRef(false);
  const [perPage ,setPerPage] = useState(10);
  const debounceRef = useRef(null);

  const [hasLoadedListsOnce, setHasLoadedListsOnce] = useState(false);
  const [hasAnyFilters, setHasAnyFilters] = useState(false);
  const [hasAnyTrash, setHasAnyTrash] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined" || !document.body) {
      return undefined;
    }
    if (layoutContainer) {
      document.body.classList.add(CAF_ADMIN_BODY_BUILDER_CLASS);
    } else {
      document.body.classList.remove(CAF_ADMIN_BODY_BUILDER_CLASS);
    }
    return () => {
      document.body.classList.remove(CAF_ADMIN_BODY_BUILDER_CLASS);
    };
  }, [layoutContainer]);
  
  useEffect(() => {
    const shouldSelectAll =
      filteredLayoutList.length > 0 &&
      selectedItems.length === filteredLayoutList.length;

    if (selectAll !== shouldSelectAll) {
      dispatch(setSelectAll(shouldSelectAll));
    }
  }, [selectedItems, filteredLayoutList, selectAll, dispatch]);

  useEffect(() => {
    const shouldSelectTrashAll =
      filteredTrashLayoutList.length > 0 &&
      selectedTrashItems.length === filteredTrashLayoutList.length;

    if (selectTrashAll !== shouldSelectTrashAll) {
      dispatch(setSelectTrashAll(shouldSelectTrashAll));
    }
    
  }, [
    selectedTrashItems,
    filteredTrashLayoutList,
    selectTrashAll,
    dispatch,
  ]);

  useEffect(()=>{
    setSearchPostValue("")
    setSearchTrashPostValue("")
    getLayouts(1,"");
    getTrashLayouts(1,"");
  },[selectedTab])

  const getLayouts = useCallback(
    async (page,keyword="") => {
      dispatch(setFiltersLoading(true));
      try {
        const { data } = await apiClient.get(apiEndpoints.getLayoutsList(page,keyword));
        if (data?.status === "success") {
          dispatch(setLayouts(data.layouts_list || []));
          dispatch(
            setPagination({
              currentPage: parseInt(data.current_page, 10) || 1,
              totalPage: parseInt(data.total_page, 10) || 1,
            })
          );
          if (data.total_filters !== undefined) {
            dispatch(setTotalFilters(data.total_filters));
          }

          if (keyword === "") {
            const total =
              data.total_filters ?? (data.layouts_list?.length || 0);
            setHasAnyFilters(total > 0);
          } else if ((data.total_filters ?? 0) > 0) {
            setHasAnyFilters(true);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        dispatch(setFiltersLoading(false));
      }
    },
    [dispatch]
  );

  const getTrashLayouts = useCallback(
    async (page,keyword = "") => {
      dispatch(setTrashLoading(true));

      try {
        const { data } = await apiClient.get(
          apiEndpoints.getTrashLayoutsList(page,keyword)
        );

        if (data?.status === "success") {
          dispatch(setTrashLayouts(data.layouts_list || []));
          dispatch(
            setTrashPagination({
              trashCurrentPage: parseInt(data.current_page, 10) || 1,
              trashTotalPage: parseInt(data.total_page, 10) || 1,
            })
          );
          if (data.total_trash_filters !== undefined) {
            dispatch(setTotalTrashFilters(data.total_trash_filters));
          }

          if (keyword === "") {
            const total =
              data.total_trash_filters ?? (data.layouts_list?.length || 0);
            setHasAnyTrash(total > 0);
          } else if ((data.total_trash_filters ?? 0) > 0) {
            setHasAnyTrash(true);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        dispatch(setTrashLoading(false));
      }
    },
    [dispatch]
  );

  const refreshAllLayouts = useCallback(async () => {
    await Promise.all([getLayouts(1,searchPostValue), getTrashLayouts(1,searchTrashPostValue)]);
  }, [getLayouts, getTrashLayouts]);

  useEffect(() => {
    const loadInitialData = async () => {
      await refreshAllLayouts();
      setHasLoadedListsOnce(true);
      initialLoadDone.current = true;
    };

    loadInitialData();
  }, [refreshAllLayouts]);

  const handleSearchPostChange = (val) => {
    const searchValue = val.toLowerCase();
    setSearchPostValue(val);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const runSearch = () => {
      getLayouts(1, searchValue);
      dispatch(resetFilterSelection());
    };

    if (searchValue === "") {
      runSearch();
      return;
    }

    debounceRef.current = setTimeout(runSearch, 1000);
  };

  const handleSearchTrashPostChange = (val) => {
    const searchValue = val.toLowerCase();
    setSearchTrashPostValue(val);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const runSearch = () => {
      getTrashLayouts(1, searchValue);
      dispatch(resetTrashSelection());
    };

    if (searchValue === "") {
      runSearch();
      return;
    }

    debounceRef.current = setTimeout(runSearch, 1000);
  };
    


  const handleCheckboxChange = (id) => {
    if (selectedItems.includes(id)) {
      dispatch(setSelectedItems(selectedItems.filter((itemId) => itemId !== id)));
    } else {
      dispatch(setSelectedItems([...selectedItems, id]));
    }
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    const allIds = checked
      ? filteredLayoutList.map((item) =>
        item?.layout_source === "Builder" ? "bl_" + item.list_index : item.ID
      )
      : [];

    dispatch(setSelectAll(checked));
    dispatch(setSelectedItems(allIds));
  };

  const handleSelectTrashAllChange = (e) => {
    const checked = e.target.checked;
    const allIds = checked
      ? filteredTrashLayoutList.map((item) =>
        item?.layout_source === "Builder" ? "bl_" + item.list_index : item.ID
      )
      : [];

    dispatch(setSelectTrashAll(checked));
    dispatch(setSelectedTrashItems(allIds));
  };

  const handleTrashCheckboxChange = (id) => {
    if (selectedTrashItems.includes(id)) {
      dispatch(
        setSelectedTrashItems(
          selectedTrashItems.filter((itemId) => itemId !== id)
        )
      );
    } else {
      dispatch(setSelectedTrashItems([...selectedTrashItems, id]));
    }
  };
  const handlePageChange = (val, type) => {
    const currentPageNumber = parseInt(currentPage, 10);
    const newPage = parseInt(val, 10);

    if (type === "prev") {
      if (newPage >= 1 && newPage !== currentPageNumber) {
        getLayouts(newPage,searchPostValue);
        dispatch(resetFilterSelection());
      }
    }

    if (type === "next") {
      if (newPage <= totalPage && newPage !== currentPageNumber) {
        getLayouts(newPage,searchPostValue);
        dispatch(resetFilterSelection());
      }
    }
  };

  const handleTrashPageChange = (val, type) => {
    const currentPageNumber = parseInt(trashCurrentPage, 10);
    const newPage = parseInt(val, 10);

    if (type === "prev") {
      if (newPage >= 1 && newPage !== currentPageNumber) {
        getTrashLayouts(newPage,searchTrashPostValue);
        dispatch(resetTrashSelection());
      }
    }

    if (type === "next") {
      if (newPage <= trashTotalPage && newPage !== currentPageNumber) {
        getTrashLayouts(newPage,searchTrashPostValue);
        dispatch(resetTrashSelection());
      }
    }
  };

  const handelAddNew = () => {
    setAddNewPagePopup(true);
    dispatch(setSelectedTab("filters"));
  };

  const handlePagePopupState = (res) => {
    setAddNewPagePopup(res);
  };

  const closeAllPopUps = async (val) => {
    setAddNewPagePopup(val);
    setLayoutContainer(val);
    await refreshAllLayouts();
    dispatch(
      setFilterBuilderState({
        activeClass: "caf-filter-inactive",
        layoutIndex: "",
        layoutTitle: "",
        layoutKey: "",
        clickHeaderSettingIcon: false,
        updatedInitialData: [],
        extra_data: {},
      })
    );
    setSelectedPage("0");
    setCheckPostId("0");
    setSelectType("");
    dispatch(resetFilterSelection());
    dispatch(resetTrashSelection());
    dispatch(setSelectedTab("filters"));
  };

  const handleLayoutContainer = (res) => {
    setLayoutContainer(res);
  };

  const updatedBuilderData = (data) => {
    setMainBuilderData(data);
  };

  const handleCopy = (index, e) => {
    setCurCopied(index);
    const inputValue = e.currentTarget.querySelector("input")?.value;

    if (inputValue) {
      navigator.clipboard
        .writeText(inputValue)
        .then(() => {
          message.open({
            type: "info",
            content: "Shortcode Copied!",
            icon: <CopyOutlined />,
          });
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    }

    setTimeout(() => {
      setCurCopied("");
    }, 3000);
  };

  const handleBulkActionsApply = async () => {
    if (filtersBulkActionVal !== "0" && selectedItems.length > 0) {
      dispatch(setFiltersLoading(true));
  
      const postedData = {
        post_ids: JSON.stringify(selectedItems),
      };
  
      try {
        const response = await apiClient.post(
          apiEndpoints.moveToTrash,
          postedData
        );
  
        if (response?.data?.status === "success") {
          await refreshAllLayouts();
          setFiltersBulkActionVal("0");
          dispatch(resetFilterSelection());
        }
      } catch (error) {
        console.error(error);
      } finally {
        dispatch(setFiltersLoading(false));
      }
    }
  };

  const handleTrashBulkActionsApply = async () => {
    if (filtersTrashBulkActionVal !== "0" && selectedTrashItems.length > 0) {
      dispatch(setTrashLoading(true));
  
      const postedData = {
        post_ids: JSON.stringify(selectedTrashItems),
      };
  
      try {
        let response;
  
        if (filtersTrashBulkActionVal === "restore") {
          response = await apiClient.post(
            apiEndpoints.bulkLayoutsRestore,
            postedData
          );
        }
  
        if (filtersTrashBulkActionVal === "delete") {
          response = await apiClient.post(
            apiEndpoints.bulkLayoutsDeletePermanent,
            postedData
          );
        }
  
        if (response?.data?.status === "success") {
          await refreshAllLayouts();
          setFiltersTrashBulkActionVal("0");
          dispatch(resetTrashSelection());
        }
      } catch (error) {
        console.error(error);
      } finally {
        dispatch(setTrashLoading(false));
      }
    }
  };

  const handleLayoutEdit = (postId, source) => {
    if (source === "Old Panel") {
      window.location.href =
        site_url + "/wp-admin/post.php?post=" + postId + "&action=edit";
      return;
    }
    const postedData = {
      layout_key: postId,
    };
    apiClient
      .post(apiEndpoints.getLayoutData, postedData)
      .then((response) => {
        if (response.data.status === "success") {
          setMainBuilderData(migrateLayoutDocument(response.data.layout_data).doc);
          setLayoutContainer(true);
        } else {
          alert(response.data.message);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleLayoutDelete = (postId, source, index) => {
    setDeleteIndex({
      id: postId,
      source,
      index,
    });
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedTab === "filters") {
      dispatch(setFiltersLoading(true));
    } else {
      dispatch(setTrashLoading(true));
    }
  
    try {
      let response;
  
      if (deleteIndex?.source === "Old Panel") {
        const layout_detail = {
          post_id: deleteIndex.id,
        };
  
        response = await apiClient.post(
          apiEndpoints.deleteLayout,
          layout_detail
        );
      } else {
        response = await apiClient.get(
          apiEndpoints.deleteBuilderLayout(deleteIndex.index)
        );
      }
  
      if (response?.data?.status === "success") {
        await refreshAllLayouts();
        dispatch(resetFilterSelection());
        dispatch(resetTrashSelection());
      } else {
        alert(response?.data?.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (selectedTab === "filters") {
        dispatch(setFiltersLoading(false));
      } else {
        dispatch(setTrashLoading(false));
      }
  
      setIsModalOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsModalOpen(false);
  };

  const handleLayoutRestore = async (postId, source, index) => {
    dispatch(setTrashLoading(true));
  
    try {
      let response;
  
      if (source === "Old Panel") {
        const layout_detail = {
          post_id: postId,
        };
  
        response = await apiClient.post(
          apiEndpoints.restoreLayout,
          layout_detail
        );
      } else {
        response = await apiClient.get(
          apiEndpoints.restoreBuilderLayout(index)
        );
      }
  
      if (response?.data?.status === "success") {
        await refreshAllLayouts();
        dispatch(resetFilterSelection());
        dispatch(resetTrashSelection());
      } else {
        alert(response?.data?.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(setTrashLoading(false));
    }
  };

  const handleDeletePermanent = async (postId, source, index) => {
    dispatch(setTrashLoading(true));
  
    try {
      let response;
  
      if (source === "Old Panel") {
        const layout_detail = {
          post_id: postId,
        };
  
        response = await apiClient.post(
          apiEndpoints.deleteLayoutPermanent,
          layout_detail
        );
      } else {
        response = await apiClient.get(
          apiEndpoints.deleteBuilderLayoutPermanent(index)
        );
      }
  
      if (response?.data?.status === "success") {
        await refreshAllLayouts();
        dispatch(resetFilterSelection());
        dispatch(resetTrashSelection());
      } else {
        alert(response?.data?.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(setTrashLoading(false));
    }
  };

  const handelCloneFilter = async (postId, source, index) => {
    dispatch(setFiltersLoading(true));
  
    try {
      let response;
  
      if (source === "Old Panel") {
        const layout_detail = {
          post_id: postId,
        };
  
        response = await apiClient.post(apiEndpoints.cloneLayout, layout_detail);
      } else {
        response = await apiClient.get(
          apiEndpoints.cloneBuilderLayout(index)
        );
      }
  
      if (response?.data?.status === "success") {
        await refreshAllLayouts();
        dispatch(resetFilterSelection());
        dispatch(resetTrashSelection());
      } else {
        alert(response?.data?.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(setFiltersLoading(false));
    }
  };

  const handelExportFilter = (postId, source, index) => {
    dispatch(setFiltersLoading(true));

    if (source === "Old Panel") {
      const layout_detail = {
        post_id: postId,
      };

      apiClient({
        url: apiEndpoints.exportDefaultLayout,
        method: "POST",
        data: layout_detail,
        responseType: "blob",
      })
        .then((response) => {
          const blob = new Blob([response.data], {
            type: "application/json",
          });
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.setAttribute("download", `caf-${postId}.json`);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
          URL.revokeObjectURL(downloadUrl);
        })
        .catch((error) => {
          console.error("There was an error downloading the file:", error);
        })
        .finally(() => {
          dispatch(setFiltersLoading(false));
        });
    } else {
      const layout_detail = {
        index,
      };

      apiClient({
        url: apiEndpoints.exportBuilderLayout,
        method: "POST",
        data: layout_detail,
        responseType: "blob",
      })
        .then((response) => {
          const blob = new Blob([response.data], {
            type: "application/json",
          });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", postId + ".json");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((error) => {
          console.error("Error downloading the file:", error);
        })
        .finally(() => {
          dispatch(setFiltersLoading(false));
        });
    }
  };

  const handelSettingsClick = (event) => {
    event.preventDefault();
    const license_url =
      site_url +
      "/wp-admin/edit.php?post_type=caf_posts&page=category-ajax-filter-pro";
    window.location.href = license_url;
  };

  const showLicenseKey = canUseFeature("license_key");

  const getPostsList = async (postType, postid) => {
    const { data } = await apiClient.get(apiEndpoints.getPostsList(postType));

    if (data && data.status === "success") {
      const obj = data.posts_list.find((item) => item.value == postid);
      return obj || {};
    }

    return {};
  };

  const handleSelectedPageChange = async (val, postId) => {
    if (val === "0") {
      return;
    }
    setSelectLoading(true);
    setCheckPostId(postId);
    setSelectedPage(val);
    const postedData = {
      layout_key: postId,
    };
    try {
      const response = await apiClient.post(
        apiEndpoints.getLayoutData,
        postedData
      );
      if (response.data.status === "success") {
        const mainData = response.data.layout_data;
        const newPostObj = await getPostsList(
          mainData?.common_data?.post_type,
          mainData?.post_layout_data?.extra_data?.single_post_data?.value
        );
        const newBuilderData = {
          ...mainData,
          post_layout_data: {
            ...mainData.post_layout_data,
            extra_data: {
              ...mainData.post_layout_data.extra_data,
              single_post_data: newPostObj,
            },
          },
        };
        const filterBuilderState =
          mainData.filter_layout_data.breadcrumb_data.select_builder;
        const postBuilderState =
          mainData.post_layout_data.breadcrumb_data.select_builder;

        const normalizedBuilder = migrateLayoutDocument(newBuilderData).doc;
        if (val === "post-settings") {
          if (filterBuilderState === "true") {
            setMainBuilderData(normalizedBuilder);
            setSelectType(val);
            setLayoutContainer(true);
          } else {
            alert("Not allowed to Jump this page");
          }
        } else if (val === "preview-settings") {
          if (
            filterBuilderState === "true" &&
            postBuilderState === "true"
          ) {
            setMainBuilderData(normalizedBuilder);
            setSelectType(val);
            setLayoutContainer(true);
          } else {
            alert("Not allowed to Jump this page");
          }
        } else {
          setMainBuilderData(normalizedBuilder);
          setSelectType(val);
          setLayoutContainer(true);
        }
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSelectLoading(false);
    }
  };

  const TabItems = [
    {
      key: "filters",
      label: `Filters (${totalFilters ?? 0})`,
    },
    {
      key: "trash",
      label: `Trash (${totalTrashFilters ?? 0})`,
    },
  ];

  const onChangeTab = (tab) => {
    dispatch(setSelectedTab(tab));
  };

  const getSerialNumber = (index, currentPage, perPage) => {
    const page = parseInt(currentPage, 10) || 1;
    const limit = parseInt(perPage, 10) || 10;
    const i = parseInt(index, 10) || 0;
  
    return (page - 1) * limit + i + 1;
  };

  return (
    <>
      <div className="caf-layouts-list-main-container">
        <Modal
          open={isModalOpen}
          onOk={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          className="caf-layouts-list-delete-modal caf-builder-modal"
        >
          <p>Are you sure, want to delete this post layout</p>
        </Modal>

        <div className="caf-layouts-list-header-container">
          <div className="caf-layouts-list-header-inner-section">
            <div className="caf-layouts-list-header-left">
              <div className="caf-logo-main">
                <BuilderCafWhiteOrangeLogoIcon className="caf-logo" alt="CAF Logo" />
              </div>
              {/* <div className="caf-header-title-desc-main">
                <h2 className="caf-header-title">All Filters</h2>
                <div className="caf-header-desc">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod
                </div>
              </div> */}
            </div>

            <div className="caf-layouts-list-header-right">
              <div className="caf-layouts-list-header-right-inner">
                <div className="caf-add-new-btn-out">
                  <button className="caf-add-new-btn" onClick={handelAddNew}>
                    Create New Filter
                  </button>
                </div>
                {showLicenseKey ? (
                  <div className="caf-header-btn-warpper">
                    <a
                      href="#"
                      className="caf-header-btn lic-key-btn"
                      onClick={handelSettingsClick}
                    >
                      License Key
                    </a>
                  </div>
                ) : null}
                <div className="caf-header-btn-warpper">
                  <a href="#" className="caf-header-btn video--btn" >
                  Videos
                  </a>
                </div>
                <div className="caf-header-btn-warpper">
                  <a href="#" className="caf-header-btn support-btn">
                  Support
                  </a>
                </div>
                <GlobalSettingsDrawer />
              </div>
            </div>
          </div>
        </div>
        <ConnectionLostBanner />
        <BuilderErrorBoundary section="layouts-list">
        {!hasLoadedListsOnce ? (
          <Skeleton active />
        ) : (
        <div className="caf-layouts-list-content-wrapper">
        {!hasAnyFilters &&
        !hasAnyTrash &&
        layoutsList.length === 0 &&
        trashLayoutsList.length === 0 &&
        !connectionLost ? (
        <div className="caf-empty-filters-wrapper">
        <div className="caf-header-title-desc-main">
        <h2 className="caf-header-title">Hi there!</h2>
        <div className="caf-header-desc">
        It looks like you haven’t created any filter yet.
        </div>
        <div className="caf-sub-desc">
        Start by creating a filter to display posts based on categories, tags, or custom fields
        </div>
        </div>
        <div className="caf-empty-filters-img-wrapper">
        <img
          src={emptyFilter}
          className="caf-empty-filters-icon"
          alt="Fiilter"
        />
        </div>
        <div className="caf-empty-filters-footer-warpper">
        <div className="caf-add-new-btn-out">
          <button
            className="caf-add-new-btn"
            onClick={handelAddNew}
          >
            Create a new Filter
          </button>
        </div>
        <div className="caf-empty-filters-links-wrapper">
        <div className="caf-empty-footer-msg">
        Need some help? Check out our  <a href="#" className="caf-empty-footer-guide-link">Documentation.</a>
        </div>
        </div>
        </div>
        </div>
        ) : hasAnyFilters || hasAnyTrash ? (
        <>
        <div className="caf-header-title-desc-main">
        <h2 className="caf-header-title">All Filters</h2>
        </div>
      <div className="caf-layouts-list-tabs-serach-wrapper">
        <div className="caf-layouts-list-tabs-main">
          <Tabs
            activeKey={selectedTab}
            items={TabItems}
            onChange={onChangeTab}
          />
        </div>
      {hasAnyFilters && selectedTab === "filters" && (
        <div className="caf-layouts-list-search-section">
          <Input
            placeholder="Search"
            className="caf-layouts-list-search-input"
            value={searchPostValue}
            onChange={(e) => handleSearchPostChange(e.target.value)}
          />
        </div>
      )}
      {hasAnyTrash && selectedTab === "trash" && (
        <div className="caf-layouts-list-search-section trash-search">
          <Input
            placeholder="Search"
            className="caf-layouts-list-search-input"
            value={searchTrashPostValue}
            onChange={(e) => handleSearchTrashPostChange(e.target.value)}
          />
        </div>
      )}
      </div>
      {selectedTab === "filters" ? (
        <FiltersTab
          filtersLoading={filtersLoading}
          layoutsList={layoutsList}
          filteredLayoutList={filteredLayoutList}
          searchPostValue={searchPostValue}
          handleSearchPostChange={handleSearchPostChange}
          selectAll={selectAll}
          handleSelectAllChange={handleSelectAllChange}
          selectedItems={selectedItems}
          handleCheckboxChange={handleCheckboxChange}
          handleCopy={handleCopy}
          currCopied={currCopied}
          inputRef={inputRef}
          checkPostId={checkPostId}
          selectLoading={selectLoading}
          handleSelectedPageChange={handleSelectedPageChange}
          selectedPage={selectedPage}
          handleLayoutEdit={handleLayoutEdit}
          handelExportFilter={handelExportFilter}
          handelCloneFilter={handelCloneFilter}
          handleLayoutDelete={handleLayoutDelete}
          filtersBulkActionVal={filtersBulkActionVal}
          setFiltersBulkActionVal={setFiltersBulkActionVal}
          handleBulkActionsApply={handleBulkActionsApply}
          currentPage={currentPage}
          totalPage={totalPage}
          handlePageChange={handlePageChange}
          getSerialNumber={getSerialNumber}
          perPage={perPage}
        />
      ) : (
        <TrashTab
          trashLoading={trashLoading}
          trashLayoutsList={trashLayoutsList}
          filteredTrashLayoutList={filteredTrashLayoutList}
          searchTrashPostValue={searchTrashPostValue}
          handleSearchTrashPostChange={handleSearchTrashPostChange}
          selectTrashAll={selectTrashAll}
          handleSelectTrashAllChange={handleSelectTrashAllChange}
          selectedTrashItems={selectedTrashItems}
          handleTrashCheckboxChange={handleTrashCheckboxChange}
          handleLayoutRestore={handleLayoutRestore}
          handleDeletePermanent={handleDeletePermanent}
          filtersTrashBulkActionVal={filtersTrashBulkActionVal}
          setFiltersTrashBulkActionVal={setFiltersTrashBulkActionVal}
          handleTrashBulkActionsApply={handleTrashBulkActionsApply}
          trashCurrentPage={trashCurrentPage}
          trashTotalPage={trashTotalPage}
          handleTrashPageChange={handleTrashPageChange}
          getSerialNumber={getSerialNumber}
          perPage={perPage}
        />
      )}
      </>
      ) : null}
      </div>
      )}
        </BuilderErrorBoundary>

        {addNewPagePopup && (
          <AddNewPage
            pagePopupState={handlePagePopupState}
            handleLayoutContainer={handleLayoutContainer}
            updatedBuilderData={updatedBuilderData}
            mainBuilderData={builderLayoutData}
          />
        )}
      </div>

      {layoutContainer && (
        <MainLayoutContainer
          mainBuilderData={mainBuilderData}
          closeAllPopUps={closeAllPopUps}
          selectType={selectType}
        />
      )}
    </>
  );
};

export default LayoutsList;