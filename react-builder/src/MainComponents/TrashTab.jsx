import React from "react";
import { Button, Skeleton, Select, Input } from "antd";
import {
  UndoOutlined,
  LeftOutlined,
  DoubleLeftOutlined,
  RightOutlined,
  DoubleRightOutlined,
} from "@ant-design/icons";

import BuilderDeleteIcon from "./BuilderDeleteIcon";

const TrashTab = ({
  trashLoading,
  trashLayoutsList,
  filteredTrashLayoutList,
  searchTrashPostValue,
  handleSearchTrashPostChange,
  selectTrashAll,
  handleSelectTrashAllChange,
  selectedTrashItems,
  handleTrashCheckboxChange,
  handleLayoutRestore,
  handleDeletePermanent,
  filtersTrashBulkActionVal,
  setFiltersTrashBulkActionVal,
  handleTrashBulkActionsApply,
  trashCurrentPage,
  trashTotalPage,
  handleTrashPageChange,
  getSerialNumber,
  currentPage,
  perPage,
}) => {
  if (trashLoading) {
    return <Skeleton active />;
  }

  return (
    <>
      {/* {trashLayoutsList && trashLayoutsList.length > 0 && (
        <div className="caf-layouts-list-search-section trash-search">
          <Input
            placeholder="Search"
            className="caf-layouts-list-search-input"
            value={searchTrashPostValue}
            onChange={(e) => handleSearchTrashPostChange(e.target.value)}
          />
        </div>
      )} */}

      {filteredTrashLayoutList.length > 0 ? (
        <>
          <div className="caf-layouts-list-filter-tab-footer-container trash-footer">
            <div className="caf-layouts-list-filter-tab-footer-inner-section">
              <div className="caf-layouts-list-filter-tab-footer-left">
                <Select
                  style={{ width: "170px" }}
                  onChange={setFiltersTrashBulkActionVal}
                  options={[
                    {
                      label: "Bulk Actions",
                      value: "0",
                    },
                    {
                      label: "Restore",
                      value: "restore",
                    },
                    {
                      label: "Delete Permanently",
                      value: "delete",
                    },
                  ]}
                  value={filtersTrashBulkActionVal}
                />
                <div className="caf-add-new-btn-out caf-fiter-tab-bulk-apply">
                  <button
                    className="caf-add-new-btn caf-fiter-tab-bulk-apply-btn"
                    onClick={handleTrashBulkActionsApply}
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="caf-layouts-list-filter-tab-footer-right">
                <div className="caf-layouts-list-filter-tab-footer-pagination-prev-side">
                  <DoubleLeftOutlined
                    className={`pagination-icon-prev ${
                      trashCurrentPage !== 1 && "pagination-btn-active"
                    }`}
                    onClick={() => handleTrashPageChange(1, "prev")}
                  />
                  <LeftOutlined
                    className={`pagination-icon-prev ${
                      trashCurrentPage !== 1 && "pagination-btn-active"
                    }`}
                    onClick={() =>
                      handleTrashPageChange(trashCurrentPage - 1, "prev")
                    }
                  />
                </div>

                <div className="caf-layouts-list-filter-tab-footer-pagination-page-no-info">
                  <span className="caf-current-page">{trashCurrentPage}</span>{" "}
                  of{" "}
                  <span className="caf-total-page">{trashTotalPage}</span>
                </div>

                <div className="caf-layouts-list-filter-tab-footer-pagination-next-side">
                  <RightOutlined
                    className={`pagination-icon-next ${
                      trashCurrentPage !== trashTotalPage &&
                      "pagination-btn-active"
                    }`}
                    onClick={() =>
                      handleTrashPageChange(trashCurrentPage + 1, "next")
                    }
                  />
                  <DoubleRightOutlined
                    className={`pagination-icon-next ${
                      trashCurrentPage !== trashTotalPage &&
                      "pagination-btn-active"
                    }`}
                    onClick={() =>
                      handleTrashPageChange(trashTotalPage, "next")
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="caf-layouts-list-conatiner trash-layouts-list">
            <ul className="caf-layout-list-inner">
              <li className="caf-list-single-row-header">
                <div className="caf-multiple-select">
                  <input
                    type="checkbox"
                    className="filters-select-all-checkbox"
                    checked={selectTrashAll}
                    onChange={handleSelectTrashAllChange}
                  />
                </div>
                <div className="caf-sr-no">#</div>
                <div className="caf-filter-label">Title</div>
                <div className="caf-filter-actions">Actions</div>
              </li>

              {filteredTrashLayoutList.map((item, index) => {
                const itemId =
                  item?.layout_source === "Builder"
                    ? "bl_" + item?.list_index
                    : item.ID;

                return (
                  <li className="caf-list-single-row" key={itemId}>
                    <div className="caf-multiple-select">
                      <input
                        type="checkbox"
                        className="caf-latyout-list-multiple-select-check-box"
                        checked={selectedTrashItems.includes(itemId)}
                        onChange={() => handleTrashCheckboxChange(itemId)}
                      />
                    </div>

                    <div className="caf-sr-no">{getSerialNumber(index, currentPage, perPage)}.</div>
                    <div className="caf-filter-name">
                      <span className="caf-filter-name-text" title={item?.post_title}>{item?.post_title}</span>
                      <span className="caf-filter-name-text-separator">-</span>
                      <span
                        className={`caf-layout-tag ${item?.layout_source
                          ?.toLowerCase()
                          ?.replace(/\s+/g, "_")}`}
                      >
                        {item?.layout_source}
                      </span>
                      {(() => {
                        const listingSource = String(
                          item?.layout_data?.post_layout_data?.extra_data
                            ?.layout_source || "caf_builder"
                        );
                        if (listingSource === "main_query") {
                          return null;
                        }
                        return null;
                      })()}
                    </div>


                    <div className="caf-filter-actions">
                      <Button
                        title="Restore Filter"
                        icon={<UndoOutlined />}
                        type="default"
                        shape="default"
                        size="medium"
                        className="caf-layout-restore-filter-btn"
                        onClick={() =>
                          handleLayoutRestore(
                            item.ID,
                            item?.layout_source,
                            item.list_index
                          )
                        }
                      />

                      <Button
                        title="Delete Permanently"
                        icon={<BuilderDeleteIcon className="caf-layout-list-delete-icon" />}
                        type="default"
                        shape="default"
                        size="medium"
                        className="caf-layout-delete-permanently-filter-btn"
                        onClick={() =>
                          handleDeletePermanent(
                            item.ID,
                            item?.layout_source,
                            item.list_index
                          )
                        }
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="caf-layouts-list-filter-tab-footer-container trash-footer">
            <div className="caf-layouts-list-filter-tab-footer-inner-section">
              <div className="caf-layouts-list-filter-tab-footer-left">
                <Select
                  style={{ width: "170px" }}
                  onChange={setFiltersTrashBulkActionVal}
                  options={[
                    {
                      label: "Bulk Actions",
                      value: "0",
                    },
                    {
                      label: "Restore",
                      value: "restore",
                    },
                    {
                      label: "Delete Permanently",
                      value: "delete",
                    },
                  ]}
                  value={filtersTrashBulkActionVal}
                />
                <div className="caf-add-new-btn-out caf-fiter-tab-bulk-apply">
                  <button
                    className="caf-add-new-btn caf-fiter-tab-bulk-apply-btn"
                    onClick={handleTrashBulkActionsApply}
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="caf-layouts-list-filter-tab-footer-right">
                <div className="caf-layouts-list-filter-tab-footer-pagination-prev-side">
                  <DoubleLeftOutlined
                    className={`pagination-icon-prev ${
                      trashCurrentPage !== 1 && "pagination-btn-active"
                    }`}
                    onClick={() => handleTrashPageChange(1, "prev")}
                  />
                  <LeftOutlined
                    className={`pagination-icon-prev ${
                      trashCurrentPage !== 1 && "pagination-btn-active"
                    }`}
                    onClick={() =>
                      handleTrashPageChange(trashCurrentPage - 1, "prev")
                    }
                  />
                </div>

                <div className="caf-layouts-list-filter-tab-footer-pagination-page-no-info">
                  <span className="caf-current-page">{trashCurrentPage}</span>{" "}
                  of{" "}
                  <span className="caf-total-page">{trashTotalPage}</span>
                </div>

                <div className="caf-layouts-list-filter-tab-footer-pagination-next-side">
                  <RightOutlined
                    className={`pagination-icon-next ${
                      trashCurrentPage !== trashTotalPage &&
                      "pagination-btn-active"
                    }`}
                    onClick={() =>
                      handleTrashPageChange(trashCurrentPage + 1, "next")
                    }
                  />
                  <DoubleRightOutlined
                    className={`pagination-icon-next ${
                      trashCurrentPage !== trashTotalPage &&
                      "pagination-btn-active"
                    }`}
                    onClick={() =>
                      handleTrashPageChange(trashTotalPage, "next")
                    }
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

export default TrashTab;