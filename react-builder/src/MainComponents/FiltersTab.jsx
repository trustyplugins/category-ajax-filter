import React from "react";
import { Button, Skeleton, Select, Input } from "antd";
import {
  CheckOutlined,
  SyncOutlined,
  LeftOutlined,
  DoubleLeftOutlined,
  RightOutlined,
  DoubleRightOutlined,
  ExportOutlined,
} from "@ant-design/icons";

import BuilderCopyIcon from "./BuilderCopyIcon";
import BuilderEditIcon from "./BuilderEditIcon";
import BuilderDeleteIcon from "./BuilderDeleteIcon";

const FiltersTab = ({
  filtersLoading,
  layoutsList,
  filteredLayoutList,
  searchPostValue,
  handleSearchPostChange,
  selectAll,
  handleSelectAllChange,
  selectedItems,
  handleCheckboxChange,
  handleCopy,
  currCopied,
  inputRef,
  checkPostId,
  selectLoading,
  handleSelectedPageChange,
  selectedPage,
  handleLayoutEdit,
  handelExportFilter,
  handelCloneFilter,
  handleLayoutDelete,
  filtersBulkActionVal,
  setFiltersBulkActionVal,
  handleBulkActionsApply,
  currentPage,
  totalPage,
  handlePageChange,
  getSerialNumber,
  perPage,
}) => {
  if (filtersLoading) {
    return <Skeleton active />;
  }

  const getSelectBuilderValue = (obj = {}) => {
    const value = obj?.select_builder;
  
    if (value === "true") {
      return false;
    }
  
    if (value === "false") {
      return true;
    }
  
    return true;
  };
  return (
    <>
      {/* {layoutsList && layoutsList.length > 0 && (
        <div className="caf-layouts-list-search-section">
          <Input
            placeholder="Search"
            className="caf-layouts-list-search-input"
            value={searchPostValue}
            onChange={(e) => handleSearchPostChange(e.target.value)}
          />
        </div>
      )} */}

      {filteredLayoutList && filteredLayoutList.length > 0 ? (
        <>
          <div className="caf-layouts-list-filter-tab-footer-container">
            <div className="caf-layouts-list-filter-tab-footer-inner-section">
              <div className="caf-layouts-list-filter-tab-footer-left">
                <Select
                  style={{ width: "150px" }}
                  onChange={setFiltersBulkActionVal}
                  options={[
                    {
                      label: "Bulk Actions",
                      value: "0",
                    },
                    {
                      label: "Move To Trash",
                      value: "move-to-trash",
                    },
                  ]}
                  value={filtersBulkActionVal}
                />
                <div className="caf-add-new-btn-out caf-filter-tab-bulk-apply">
                  <button
                    className="caf-add-new-btn caf-fitler-tab-bulk-apply-btn"
                    onClick={handleBulkActionsApply}
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="caf-layouts-list-filter-tab-footer-right">
                <div className="caf-layouts-list-filter-tab-footer-pagination-prev-side">
                  <DoubleLeftOutlined
                    className={`pagination-icon-prev ${
                      currentPage !== 1 && "pagination-btn-active"
                    }`}
                    onClick={() => handlePageChange(1, "prev")}
                  />
                  <LeftOutlined
                    className={`pagination-icon-prev ${
                      currentPage !== 1 && "pagination-btn-active"
                    }`}
                    onClick={() => handlePageChange(currentPage - 1, "prev")}
                  />
                </div>

                <div className="caf-layouts-list-filter-tab-footer-pagination-page-no-info">
                  <span className="caf-current-page">{currentPage}</span> of{" "}
                  <span className="caf-total-page">{totalPage}</span>
                </div>

                <div className="caf-layouts-list-filter-tab-footer-pagination-next-side">
                  <RightOutlined
                    className={`pagination-icon-next ${
                      currentPage !== totalPage && "pagination-btn-active"
                    }`}
                    onClick={() => handlePageChange(currentPage + 1, "next")}
                  />
                  <DoubleRightOutlined
                    className={`pagination-icon-next ${
                      currentPage !== totalPage && "pagination-btn-active"
                    }`}
                    onClick={() => handlePageChange(totalPage, "next")}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="caf-layouts-list-conatiner">
            <ul className="caf-layout-list-inner">
              <li className="caf-list-single-row-header">
                <div className="caf-multiple-select">
                  <input
                    type="checkbox"
                    className="filters-select-all-checkbox"
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                  />
                </div>
                <div className="caf-sr-no">#</div>
                <div className="caf-filter-label">Title</div>
                <div className="caf-filter-shortcode">Shortcode</div>
                <div className="caf-filter-navigation">Navigation</div>
                {/* <div className="caf-filter-status">Status</div> */}
                <div className="caf-filter-actions">Actions</div>
              </li>

              {filteredLayoutList.map((item, index) => {
                const itemId =
                  item?.layout_source === "Builder"
                    ? "bl_" + item?.list_index
                    : item.ID;
                const listingSource = String(
                  item?.layout_data?.post_layout_data?.extra_data
                    ?.layout_source || "caf_builder"
                );
                const listingBadge = "";
                const isCafPostLayout = listingSource === "caf_builder";
                const filterStepLocked = getSelectBuilderValue(
                  item?.layout_data?.filter_layout_data?.breadcrumb_data
                );
                const postStepLocked =
                  !isCafPostLayout ||
                  getSelectBuilderValue(
                    item?.layout_data?.post_layout_data?.breadcrumb_data
                  );

                return (
                  <li className="caf-list-single-row" key={itemId}>
                    <div className="caf-multiple-select">
                      <input
                        type="checkbox"
                        className="caf-latyout-list-multiple-select-check-box"
                        checked={selectedItems.includes(itemId)}
                        onChange={() => handleCheckboxChange(itemId)}
                      />
                    </div>

                    <div className="caf-sr-no">
                    {getSerialNumber(index, currentPage, perPage)}.
                    </div>

                    <div
                      className={`caf-filter-name${
                        item?.layout_source === "Builder" ||
                        item?.layout_source === "Old Panel"
                          ? " caf-filter-name-clickable"
                          : ""
                      }`}
                      onClick={() => {
                        if (item?.layout_source === "Builder") {
                          handleSelectedPageChange("main-settings", item?.ID);
                          return;
                        }
                        if (item?.layout_source === "Old Panel") {
                          handleLayoutEdit(item.ID, item?.layout_source);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (!(e.key === "Enter" || e.key === " ")) {
                          return;
                        }
                        if (item?.layout_source === "Builder") {
                          e.preventDefault();
                          handleSelectedPageChange("main-settings", item?.ID);
                          return;
                        }
                        if (item?.layout_source === "Old Panel") {
                          e.preventDefault();
                          handleLayoutEdit(item.ID, item?.layout_source);
                        }
                      }}
                      role={
                        item?.layout_source === "Builder" ||
                        item?.layout_source === "Old Panel"
                          ? "button"
                          : undefined
                      }
                      tabIndex={
                        item?.layout_source === "Builder" ||
                        item?.layout_source === "Old Panel"
                          ? 0
                          : undefined
                      }
                    >
                      <span className="caf-filter-name-text" title={item?.post_title}>{item?.post_title}</span>
                      <span className="caf-filter-name-text-separator">-</span>
                      <span
                        className={`caf-layout-tag ${item?.layout_source
                          ?.toLowerCase()
                          ?.replace(/\s+/g, "_")}`}
                      >
                        {item?.layout_source}
                      </span>
                      {listingBadge ? (
                        <>
                          <span className="caf-filter-name-text-separator">·</span>
                          <span
                            className={`caf-layout-tag ${listingSource}`}
                            title="Filters the theme / shop product grid"
                          >
                            {listingBadge}
                          </span>
                        </>
                      ) : null}
                    </div>

                    <div
                      onClick={(event) => handleCopy(index, event)}
                      className="caf-filter-shortcode"
                    >
                      <input
                        type="text"
                        value={item.shortcode}
                        readOnly
                        className="caf-shortcode-input"
                        disabled
                        ref={inputRef}
                      />
                      <span
                        className={`caf-copy-button${
                          currCopied === index ? " is-copied" : ""
                        }`}
                      >
                        <BuilderCopyIcon
                          className="caf-layout-list-copy-icon"
                          alt={
                            currCopied === index
                              ? "Shortcode copied"
                              : "Copy shortcode"
                          }
                        />
                      </span>
                    </div>

                    <div className="caf-filter-navigation">
                      {item?.layout_source === "Builder" ? (
                        <Select
                          popupMatchSelectWidth={180}
                          style={{ width: "150px" }}
                          loading={checkPostId === item?.ID && selectLoading}
                          onChange={(value) =>
                            handleSelectedPageChange(value, item?.ID)
                          }
                          options={[
                            {
                              label: "Select Nav",
                              value: "0",
                            },
                            {
                              label: "Home",
                              value: "main-settings",
                            },
                            {
                              label: "Query & Filters Builder",
                              value: "filter-settings",
                            },
                            {
                              label: "Post Item Template",
                              value: "post-settings",
                              disabled: filterStepLocked || !isCafPostLayout,
                            },
                            {
                              label: "Layout Settings",
                              value: "preview-settings",
                              disabled: postStepLocked,
                            },
                          ]}
                          value={checkPostId === item?.ID ? selectedPage : "0"}
                          className="caf-nevigation-dropdown"
                        />
                      ) : (
                        <span
                          onClick={() =>
                            handleLayoutEdit(item.ID, item?.layout_source)
                          }
                        >
                          <BuilderEditIcon
                            className="caf-layout-list-edit-icon"
                            alt="Edit filter"
                          />
                        </span>
                      )}
                    </div>

                    {/* <div className="caf-filter-status">
                      <Button
                        title={
                          item?.post_status === "false" ||
                          item?.post_status === "auto-draft" ||
                          item?.post_status === "draft"
                            ? "Draft"
                            : "Publish"
                        }
                        type="default"
                        shape="default"
                        size="medium"
                        className="caf-layout-available-btn"
                        icon={
                          item?.post_status === "false" ||
                          item?.post_status === "auto-draft" ||
                          item?.post_status === "draft" ? (
                            <SyncOutlined />
                          ) : (
                            <CheckOutlined />
                          )
                        }
                      />
                    </div> */}

                    <div className="caf-filter-actions">
                      {/* <Button
                        title="Export Filter"
                        icon={<ExportOutlined />}
                        type="default"
                        shape="default"
                        size="medium"
                        className="caf-layout-export-filter-btn"
                        onClick={() =>
                          handelExportFilter(
                            item.ID,
                            item?.layout_source,
                            item.list_index
                          )
                        }
                      /> */}

                      <Button
                        title="Clone Filter"
                        icon={<BuilderCopyIcon className="caf-layout-list-clone-icon" />}
                        type="default"
                        shape="default"
                        size="medium"
                        className="caf-layout-clone-filter-btn"
                        onClick={() =>
                          handelCloneFilter(
                            item.ID,
                            item?.layout_source,
                            item.list_index
                          )
                        }
                      />

                      <span
                        onClick={() =>
                          handleLayoutDelete(
                            item.ID,
                            item?.layout_source,
                            item.list_index
                          )
                        }
                        className="caf-layout-delete-layout-btn"
                        title="Delete Filter"
                      >
                        <BuilderDeleteIcon className="caf-layout-list-delete-icon" />
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="caf-layouts-list-filter-tab-footer-container">
            <div className="caf-layouts-list-filter-tab-footer-inner-section">
              <div className="caf-layouts-list-filter-tab-footer-left">
                <Select
                  style={{ width: "150px" }}
                  onChange={setFiltersBulkActionVal}
                  options={[
                    {
                      label: "Bulk Actions",
                      value: "0",
                    },
                    {
                      label: "Move To Trash",
                      value: "move-to-trash",
                    },
                  ]}
                  value={filtersBulkActionVal}
                />
                <div className="caf-add-new-btn-out caf-filter-tab-bulk-apply">
                  <button
                    className="caf-add-new-btn caf-fitler-tab-bulk-apply-btn"
                    onClick={handleBulkActionsApply}
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="caf-layouts-list-filter-tab-footer-right">
                <div className="caf-layouts-list-filter-tab-footer-pagination-prev-side">
                  <DoubleLeftOutlined
                    className={`pagination-icon-prev ${
                      currentPage !== 1 && "pagination-btn-active"
                    }`}
                    onClick={() => handlePageChange(1, "prev")}
                  />
                  <LeftOutlined
                    className={`pagination-icon-prev ${
                      currentPage !== 1 && "pagination-btn-active"
                    }`}
                    onClick={() => handlePageChange(currentPage - 1, "prev")}
                  />
                </div>

                <div className="caf-layouts-list-filter-tab-footer-pagination-page-no-info">
                  <span className="caf-current-page">{currentPage}</span> of{" "}
                  <span className="caf-total-page">{totalPage}</span>
                </div>

                <div className="caf-layouts-list-filter-tab-footer-pagination-next-side">
                  <RightOutlined
                    className={`pagination-icon-next ${
                      currentPage !== totalPage && "pagination-btn-active"
                    }`}
                    onClick={() => handlePageChange(currentPage + 1, "next")}
                  />
                  <DoubleRightOutlined
                    className={`pagination-icon-next ${
                      currentPage !== totalPage && "pagination-btn-active"
                    }`}
                    onClick={() => handlePageChange(totalPage, "next")}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="caf-layout-list-error-message">No Filter Found...</p>
      )}
    </>
  );
};

export default FiltersTab;