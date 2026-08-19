import React, { useState, useEffect } from "react";
import { Tooltip, Switch } from 'antd';
import BuilderMiscPreviewItemIcon from "../../../BuilderMiscPreviewItemIcon";
import {
  SettingOutlined,
  EditOutlined,
  CaretDownOutlined,
  CaretUpOutlined
} from "@ant-design/icons";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createPortal } from "react-dom";
//import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";

//import {restrictToParentElement,restrictToFirstScrollableAncestor,restrictToWindowEdges,snapCenterToCursor} from '@dnd-kit/modifiers';
import { createSnapModifier } from '@dnd-kit/modifiers';
import { snapCenterToCursor } from "./snapCenterToCursor";
import {
  resolveFilterTypeFromBuilderData,
  resolvePreviewTemplateDataFromBuilderData,
} from "../../../utils/builderDataAdapters";
import { TierLockedWrap } from "../../../../tier/TierLockedWrap";
import {
  getDndMiscItemUpgradeMessage,
  getDndColumnDraggableItemKeys,
  getDndColumnsForLayoutControlsDisplay,
  getDefaultLayoutControlsSelectedItem,
  isDndColumnDragDropDisabled,
  isDndColumnSettingsDisabled,
  isDndMiscItemLocked,
  resolveDndMiscItemEnabled,
} from "../shared/previewSettingsTier";
// --------------------
// Default Layout 
// --------------------
const defaultLayout = [
  {
    key: "filter_top",
    label: "Filter Top",
    settings: {
      custom_class: "",
      visibility: {
        mobile: "false",
        tablet: "false",
        desktop: "false"
      }
    },
    style: {
      desktop: {
        default: {
          boxShadow: "0px 0px 0px 0px  #333333",
          top: "auto",
          right: "auto",
          left: "auto",
          bottom: "auto",
          width: "100%",
          height: "auto",
          paddingTop: "0px",
          paddingBottom: "0px",
          paddingRight: "0px",
          paddingLeft: "0px"
        },
        hover: {}
      },
      tablet: {
        default: {},
        hover: {}
      },
      mobile: {
        default: {},
        hover: {}
      }
    },
    data: []
  },
  {
    key: "filter_bottom",
    label: "Filter Bottom",
    settings: {
      custom_class: "",
      visibility: {
        mobile: "false",
        tablet: "false",
        desktop: "false"
      }
    },
    style: {
      desktop: {
        default: {},
        hover: {}
      },
      tablet: {
        default: {},
        hover: {}
      },
      mobile: {
        default: {},
        hover: {}
      }
    },
    data: []
  },
  {
    key: "post_top",
    label: "Post Layout Top",
    settings: {
      custom_class: "",
      visibility: {
        mobile: "false",
        tablet: "false",
        desktop: "false"
      }
    },
    style: {
      desktop: {
        default: {
          boxShadow: "0px 0px 0px 0px  #333333",
          top: "auto",
          right: "auto",
          bottom: "auto",
          left: "auto",
          width: "100%",
          height: "auto",
          paddingTop: "0px",
          paddingBottom: "0px",
          paddingLeft: "0px",
          paddingRight: "0px",
          display: "flex",
          flexFlow: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "15px"
        },
        hover: {}
      },
      tablet: {
        default: {
          flexFlow: "column",
          gap: "6px"
        },
        hover: {}
      },
      mobile: {
        default: {
          flexFlow: "column",
          gap: "10px"
        },
        hover: {}
      }
    },
    data: [
      {
        key: "selected",
        label: "Selected",
        style: {
          container: {
            desktop: {
              default: {
                display: "flex",
                width: "auto",
                boxShadow: "0px 0px 0px 0px  #333333",
                top: "auto",
                right: "auto",
                bottom: "auto",
                left: "auto",
                height: "auto",
                paddingTop: "0px",
                paddingBottom: "0px",
                paddingLeft: "0px",
                paddingRight: "0px",
                flexFlow: "row",
                alignItems: "center",
                float: "none",
                gap: "6px",
                marginTop: "0px",
                marginBottom: "0px"
              },
              hover: {},
              selected: {},
              placeholder: {}
            },
            tablet: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            },
            mobile: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            }
          },
          meta: {
            desktop: {
              default: {
                boxShadow: "0px 0px 0px 0px  #333333",
                width: "auto",
                height: "auto",
                paddingTop: "8px",
                paddingBottom: "8px",
                paddingLeft: "10px",
                paddingRight: "10px",
                display: "flex",
                flexFlow: "row-reverse",
                alignItems: "center",
                gap: "3px",
                borderTopWidth: "1px",
                borderRightWidth: "1px",
                borderBottomWidth: "1px",
                borderLeftWidth: "1px",
                borderTopColor: "rgb(221,221,221)",
                borderRightColor: "rgb(221,221,221)",
                borderBottomColor: "rgb(221,221,221)",
                borderLeftColor: "rgb(221,221,221)",
                borderTopStyle: "solid",
                borderRightStyle: "solid",
                borderBottomStyle: "solid",
                borderLeftStyle: "solid",
                borderTopLeftRadius: "5px",
                borderTopRightRadius: "5px",
                borderBottomLeftRadius: "5px",
                borderBottomRightRadius: "5px",
                backgroundColor: "rgb(255,255,255)",
                fontFamily: "DM Sans"
              },
              hover: {},
              selected: {},
              placeholder: {}
            },
            tablet: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            },
            mobile: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            }
          },
          meta1: {
            desktop: {
              default: {
                color: "rgb(163,163,163)",
                fontFamily: "DM Sans"
              },
              hover: {},
              selected: {},
              placeholder: {}
            },
            tablet: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            },
            mobile: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            }
          }
        },
        settings: {
          is_enable: "true",
          close_button: "true",
          custom_class: "",
          visibility: {
            mobile: "false",
            tablet: "false",
            desktop: "false"
          }
        },
        data: []
      },
      {
        key: "result_count",
        label: "Result Count",
        settings: {
          is_enable: "true",
          custom_class: "",
          prefix: {
            is_enable: "true",
            value: "Showing"
          },
          suffix: {
            is_enable: "true",
            value: "Results"
          },
          visibility: {
            mobile: "false",
            tablet: "false",
            desktop: "false"
          }
        },
        style: {
          container: {
            desktop: {
              default: {
                display: "flex",
                width: "auto",
                boxShadow: "0px 0px 0px 0px  #333333",
                top: "auto",
                right: "auto",
                bottom: "auto",
                left: "auto",
                paddingTop: "0px",
                paddingBottom: "0px",
                paddingLeft: "0px",
                paddingRight: "0px",
                height: "auto",
                flexFlow: "row",
                gap: "5px",
                alignItems: "center",
                float: "none",
                fontFamily: "DM Sans",
                fontWeight: "800",
                fontSize: "18px",
                color: "rgb(0,0,0)",
                fontStyle: "normal",
                textTransform: "inherit",
                textDecoration: "inherit"
              },
              hover: {},
              selected: {},
              placeholder: {}
            },
            tablet: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            },
            mobile: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            }
          },
          meta: {
            desktop: {
              default: {
                boxShadow: "0px 0px 0px 0px  #333333",
                paddingTop: "0px",
                paddingBottom: "0px",
                paddingLeft: "0px",
                paddingRight: "0px",
                width: "auto",
                height: "auto",
                fontFamily: "DM Sans",
                fontSize: "15px",
                fontWeight: "300",
                color: "rgb(96,96,96)"
              },
              hover: {},
              selected: {},
              placeholder: {}
            },
            tablet: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            },
            mobile: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            }
          },
          meta1: {
            desktop: {
              default: {
                boxShadow: "0px 0px 0px 0px  #333333",
                paddingTop: "0px",
                paddingBottom: "0px",
                paddingLeft: "0px",
                paddingRight: "0px",
                width: "auto",
                height: "auto",
                fontFamily: "DM Sans",
                fontWeight: "300",
                fontSize: "15px",
                color: "rgb(96,96,96)"
              },
              hover: {},
              selected: {},
              placeholder: {}
            },
            tablet: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            },
            mobile: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            }
          }
        },
        data: []
      },
      {
        key: "sorting",
        label: "Sorting",
        style: {
          container: {
            desktop: {
              default: {
                display: "flex",
                width: "auto",
                boxShadow: "0px 0px 0px 0px  #333333",
                top: "auto",
                right: "auto",
                bottom: "auto",
                left: "auto",
                height: "auto",
                paddingTop: "0px",
                paddingBottom: "0px",
                paddingLeft: "0px",
                paddingRight: "0px",
                flexFlow: "row",
                float: "none",
                gap: "10px",
                marginBottom: "0px"
              },
              hover: {},
              selected: {},
              placeholder: {}
            },
            tablet: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            },
            mobile: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            }
          },
          meta: {
            desktop: {
              default: {
                width: "130px",
                display: "flex",
                justifyContent: "space-between",
                flexFlow: "row",
                height: "35px",
                paddingTop: "0px",
                paddingBottom: "0px",
                paddingLeft: "10px",
                paddingRight: "10px",
                borderTopWidth: "1px",
                borderRightWidth: "1px",
                borderBottomWidth: "1px",
                borderLeftWidth: "1px",
                borderTopColor: "rgb(221,221,221)",
                borderRightColor: "rgb(221,221,221)",
                borderBottomColor: "rgb(221,221,221)",
                borderLeftColor: "rgb(221,221,221)",
                borderTopStyle: "solid",
                borderRightStyle: "solid",
                borderBottomStyle: "solid",
                borderLeftStyle: "solid",
                borderTopLeftRadius: "5px",
                borderTopRightRadius: "5px",
                borderBottomLeftRadius: "5px",
                borderBottomRightRadius: "5px",
                alignItems: "center",
                backgroundColor: "rgb(255,255,255)",
                fontFamily: "DM Sans"
              },
              hover: {},
              selected: {},
              placeholder: {}
            },
            tablet: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            },
            mobile: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            }
          },
          meta1: {
            desktop: {
              default: {
                boxShadow: "0px 0px 0px 0px  #333333",
                width: "100%",
                height: "auto",
                backgroundColor: "rgb(255,255,255)",
                paddingLeft: "10px",
                paddingRight: "10px",
                paddingTop: "8px",
                paddingBottom: "8px",
                borderTopWidth: "0px",
                borderRightWidth: "0px",
                borderBottomWidth: "1px",
                borderLeftWidth: "0px",
                borderTopColor: "rgb(221,221,221)",
                borderRightColor: "rgb(221,221,221)",
                borderBottomColor: "rgb(245,245,245)",
                borderLeftColor: "rgb(221,221,221)",
                borderTopStyle: "solid",
                borderRightStyle: "solid",
                borderBottomStyle: "solid",
                borderLeftStyle: "solid",
                fontFamily: "DM Sans"
              },
              hover: {
                backgroundColor: "rgb(246,247,251)"
              },
              selected: {
                backgroundColor: "rgb(246,247,251)"
              },
              placeholder: {}
            },
            tablet: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            },
            mobile: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            }
          },
          meta2: {
            desktop: {
              default: {
                width: "100%",
                height: "auto"
              },
              hover: {},
              selected: {},
              placeholder: {}
            },
            tablet: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            },
            mobile: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            }
          },
          meta3: {
            desktop: {
              default: {
                width: "100%",
                height: "auto"
              },
              hover: {},
              selected: {},
              placeholder: {}
            },
            tablet: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            },
            mobile: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            }
          },
          meta4: {
            desktop: {
              default: {
                paddingTop: "0px",
                paddingBottom: "0px",
                paddingLeft: "0px",
                paddingRight: "0px",
                boxShadow: "0px 0px 0px 0px  #333333",
                width: "100%",
                height: "auto",
                borderTopWidth: "1px",
                borderRightWidth: "1px",
                borderBottomWidth: "1px",
                borderLeftWidth: "1px",
                borderTopColor: "rgb(235,230,231)",
                borderRightColor: "rgb(235,230,231)",
                borderBottomColor: "rgb(235,230,231)",
                borderLeftColor: "rgb(235,230,231)",
                borderTopStyle: "solid",
                borderRightStyle: "solid",
                borderBottomStyle: "solid",
                borderLeftStyle: "solid",
                marginTop: "5px",
                borderTopLeftRadius: "6px",
                borderTopRightRadius: "6px",
                borderBottomLeftRadius: "6px",
                borderBottomRightRadius: "6px"
              },
              hover: {},
              selected: {},
              placeholder: {}
            }
          },
          meta5: {
            desktop: {
              default: {
                width: "130px",
                display: "flex",
                height: "35px",
                paddingTop: "0px",
                paddingBottom: "0px",
                paddingLeft: "10px",
                paddingRight: "10px"
              },
              hover: {},
              selected: {},
              placeholder: {}
            },
            tablet: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            },
            mobile: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            }
          },
        },
        settings:{
          is_enable: "true",
          order: {
            is_enable: "true",
            values: [
              "DESC",
              "ASC"
            ],
            placeholder: "Order",
            icon_position: "right"
          },
          order_by: {
            is_enable: "true",
            values: [
              "ID",
              "date",
              "rand",
              "title"
            ],
            placeholder: "Order By",
            icon_position: "right"
          },
          custom_class: "",
          label: {
            is_label: "false",
            label_text: "Sorting",
            style: {
              desktop: {
                default: {
                  fontSize: "14px",
                  lineHeight: "normal"
                },
                hover: {}
              },
              tablet: {
                default: {},
                hover: {}
              },
              mobile: {
                default: {},
                hover: {}
              }
            }
          },
          visibility: {
            mobile: "false",
            tablet: "false",
            desktop: "false"
          }
        }
      },
    ]
  },
  {
    key: "post_bottom",
    label: "Post Layout Bottom",
    settings: {
      custom_class: "",
      visibility: {
        mobile: "false",
        tablet: "false",
        desktop: "false"
      }
    },
    style: {
      desktop: {
        default: {
          boxShadow: "0px 0px 0px 0px  #333333",
          top: "auto",
          right: "auto",
          bottom: "auto",
          left: "auto",
          width: "100%",
          height: "auto",
          paddingTop: "0px",
          paddingBottom: "0px",
          paddingRight: "0px",
          paddingLeft: "0px"
        },
        hover: {}
      },
      tablet: {
        default: {},
        hover: {}
      },
      mobile: {
        default: {},
        hover: {}
      }
    },
    data: [
      {
        key: "pagination",
        label: "Pagination",
        settings: {
          is_enable: "true",
          custom_class: "",
          posts_per_page: "9",
          pagination_type: "number2",
          ellipsis: {
            is_enable: "true",
            value: "..."
          },
          load_more: {
            text: "Load More",
            icon_enable: "true",
            icons: {
              visibility: true,
              icon: "fas fa-arrow-right",
              type: "icon"
            }
          },
          prev: {
            text: "Previous",
            type: "icon",
            icons: {
              visibility: true,
              icon: "fas fa-long-arrow-alt-left",
              type: "icon"
            }
          },
          next: {
            text: "Next",
            type: "icon",
            icons: {
              visibility: true,
              icon: "fas fa-long-arrow-alt-right",
              type: "icon"
            }
          },
          visibility: {
            mobile: "false",
            tablet: "false",
            desktop: "false"
          }
        },
        style: {
          container: {
            desktop: {
              default: {
                display: "flex",
                width: "100%",
                boxShadow: "0px 0px 0px 0px  #333333",
                top: "auto",
                right: "auto",
                bottom: "auto",
                left: "auto",
                flexFlow: "row",
                justifyContent: "center",
                gap: "10px",
                height: "auto",
                paddingTop: "0px",
                paddingBottom: "0px",
                paddingLeft: "0px",
                paddingRight: "0px",
                marginTop: "30px"
              },
              hover: {},
              selected: {},
              placeholder: {}
            },
            tablet: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            },
            mobile: {
              default: {},
              hover: {},
              selected: {},
              placeholder: {}
            }
          },
          meta: {
            desktop: {
              default: {
                boxShadow: "0px 0px 0px 0px  #333333",
                fontFamily: "DM Sans",
                height: "48px",
                width: "48px",
                paddingTop: "0px",
                paddingBottom: "0px",
                paddingLeft: "0px",
                paddingRight: "0px",
                borderTopWidth: "1px",
                borderRightWidth: "1px",
                borderBottomWidth: "1px",
                borderLeftWidth: "1px",
                borderTopColor: "rgb(221,221,221)",
                borderRightColor: "rgb(221,221,221)",
                borderBottomColor: "rgb(221,221,221)",
                borderLeftColor: "rgb(221,221,221)",
                borderTopStyle: "solid",
                borderRightStyle: "solid",
                borderBottomStyle: "solid",
                borderLeftStyle: "solid",
                fontSize: "16px",
                borderTopLeftRadius: "5px",
                borderTopRightRadius: "5px",
                borderBottomLeftRadius: "5px",
                borderBottomRightRadius: "5px",
                backgroundColor: "rgb(255,255,255)"
              },
              hover: {
                backgroundColor: "rgb(246,247,251)"
              },
              selected: {},
              placeholder: {}
            }
          },
          meta1: {
            desktop: {
              default: {
                boxShadow: "0px 0px 0px 0px  #333333",
                fontFamily: "DM Sans",
                width: "48px",
                height: "48px",
                paddingTop: "0px",
                paddingBottom: "0px",
                paddingLeft: "0px",
                paddingRight: "0px",
                borderTopWidth: "1px",
                borderRightWidth: "1px",
                borderBottomWidth: "1px",
                borderLeftWidth: "1px",
                borderTopColor: "rgb(221,221,221)",
                borderRightColor: "rgb(221,221,221)",
                borderBottomColor: "rgb(221,221,221)",
                borderLeftColor: "rgb(221,221,221)",
                borderTopStyle: "solid",
                borderRightStyle: "solid",
                borderBottomStyle: "solid",
                borderLeftStyle: "solid",
                fontSize: "16px",
                borderTopLeftRadius: "5px",
                borderTopRightRadius: "5px",
                borderBottomLeftRadius: "5px",
                borderBottomRightRadius: "5px",
                backgroundColor: "rgb(255,255,255)"
              },
              hover: {
                backgroundColor: "rgb(246,247,251)"
              },
              selected: {
                backgroundColor: "rgb(96,96,96)",
                color: "rgb(255,255,255)"
              },
              placeholder: {}
            }
          },
          meta2: {
            desktop: {
              default: {
                display: "flex",
                flexFlow: "row",
                gap: "10px",
                justifyContent: "center",
                alignItems: "center"
              },
              hover: {},
              selected: {},
              placeholder: {}
            }
          }
        },
        data: []
      }
    ]
  }
];
// --------------------
// Locked misc item (no drag-and-drop)
// --------------------
function LockedMiscItem({
  item,
  columnKey,
  selectedItem,
  columnIndex,
  itemIndex,
  handleItemStatus,
}) {
  const isSettingActive =
    selectedItem?.type === "item" && selectedItem?.itemKey === item.key;

  return (
    <TierLockedWrap
      locked
      showProBadge
      className="caf-builder-tier-locked-dnd-item"
      upgradeMessage={getDndMiscItemUpgradeMessage(item.key)}
    >
      <div
        className={`caf-dnd-misc-item-wrapper caf-dnd-misc-item-wrapper--locked${
          isSettingActive ? " active" : ""
        }`}
      >
        <div className="caf-dnd-misc-item-left-wrapper">
          <BuilderMiscPreviewItemIcon
            itemKey={item?.key}
            className="caf-dnd-misc-item-logo"
          />
          <span className="caf-dnd-misc-item-label">{item.label}</span>
        </div>
        <div className="caf-dnd-misc-item-btn-wrapper">
          <Switch
            onChange={(checked) =>
              handleItemStatus(
                checked,
                columnIndex,
                itemIndex,
                columnKey,
                item.key,
                item
              )
            }
            checked={false}
            disabled
            style={{ minWidth: "40px" }}
          />
        </div>
      </div>
    </TierLockedWrap>
  );
}

// --------------------
// Sortable Item
// --------------------
function SortableItem({ item, columnKey, handleSettings, selectedItem, columnIndex, itemIndex, handleItemStatus, }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.key });

  const isSettingActive =
    selectedItem?.type === "item" && selectedItem?.itemKey === item.key;
  const checkedStatus = resolveDndMiscItemEnabled(item);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`caf-dnd-misc-item-wrapper${
        isSettingActive ? " active" : ""
      }`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div className="caf-dnd-misc-item-left-wrapper">
        <BuilderMiscPreviewItemIcon
          itemKey={item?.key}
          className="caf-dnd-misc-item-logo"
        />
        <span className="caf-dnd-misc-item-label">{item.label}</span>
      </div>
      <div className="caf-dnd-misc-item-btn-wrapper">
        {checkedStatus && (
          <SettingOutlined
            className="caf-dnd-misc-setting-item"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() =>
              handleSettings(
                "item",
                columnKey,
                item.key,
                item,
                columnIndex,
                itemIndex
              )
            }
          />
        )}
        <Switch
          onChange={(checked) =>
            handleItemStatus(
              checked,
              columnIndex,
              itemIndex,
              columnKey,
              item.key,
              item
            )
          }
          checked={checkedStatus}
          style={{ minWidth: "40px" }}
        />
      </div>
    </div>
  );
}

// --------------------
// Column
// --------------------
function Column({ column, handleSettings, selectedItem, columnIndex, handleItemStatus ,filterStatus}) {
  const [isOpen, setIsOpen] = useState(true); // default open
  const draggableItemKeys = getDndColumnDraggableItemKeys(column);
  const isColumnDragDropDisabled = isDndColumnDragDropDisabled(column);
  const isColumnSettingsDisabled = isDndColumnSettingsDisabled(column?.key);
  const { setNodeRef } = useDroppable({
    id: column.key,
    disabled: isColumnDragDropDisabled,
  });

  const { over } = useDndContext();
  const isSelected = selectedItem?.columnKey === column.key;
  // Check if drag is inside this column
  const isOverColumn =
    !isColumnDragDropDisabled &&
    over &&
    (over.id === column.key ||
      column.data.some((item) => item.key === over.id));
  //console.log(over,isOverColumn);
  //console.log("filterStatus",filterStatus);
  return (
    <div
      ref={setNodeRef}
      style={{
        width: "280px",
        background: isOverColumn ? "#e0f2fe" : "#f1f5f9",
        // padding: "12px",
        borderRadius: "8px",
        // marginBottom: "15px",
        minHeight: isOpen ? "120px" : 0,
        transition: "0.2s ease",
        border: (isSelected) ? "1px solid #ff5e16" : ""
      }}
      className={`divdrg-caf${
        isColumnDragDropDisabled ? " caf-dnd-column--drag-disabled" : ""
      }`}
    >
      <h3 className={"caf-cl-label-wrapper"} style={{
        borderBottomLeftRadius: !isOpen ? "8px" : 0,
        borderBottomRightRadius: !isOpen ? "8px" : 0,
      }}>
        <div className="caf-left-cl">
          {/* Toggle Icon */}
          <span
            style={{ cursor: "pointer" }}
            onClick={() => setIsOpen(!isOpen)}
            className="caf-toggle-col-icon"
          >
            {isOpen ? <CaretUpOutlined /> : <CaretDownOutlined />}
          </span>
          <span className="caf-cl-label">{column.label}</span>
        </div>
        <div className="caf-right-cl">
          <span
            className={`caf-cl-label-edit-icon${
              isColumnSettingsDisabled ? " caf-cl-label-edit-icon--disabled" : ""
            }`}
          >
            <EditOutlined
              onClick={() => {
                if (isColumnSettingsDisabled) {
                  return;
                }
                handleSettings("column", column?.key, "", "", columnIndex, null);
              }}
            />
          </span>
        </div>
      </h3>
      {isOpen && (
        <div className="caf-dragable-content-wrapper">
          {draggableItemKeys.length > 0 ? (
            <SortableContext
              items={draggableItemKeys}
              strategy={verticalListSortingStrategy}
            >
              {column.data.map((item, itemIndex) => {
                if (filterStatus === "false" && item.key === "selected") {
                  return null;
                }

                if (isDndMiscItemLocked(item.key)) {
                  return (
                    <LockedMiscItem
                      key={item.key}
                      item={item}
                      columnKey={column.key}
                      selectedItem={selectedItem}
                      columnIndex={columnIndex}
                      itemIndex={itemIndex}
                      handleItemStatus={handleItemStatus}
                    />
                  );
                }

                return (
                  <SortableItem
                    key={item.key}
                    item={item}
                    columnKey={column.key}
                    handleSettings={handleSettings}
                    selectedItem={selectedItem}
                    columnIndex={columnIndex}
                    itemIndex={itemIndex}
                    handleItemStatus={handleItemStatus}
                  />
                );
              })}
            </SortableContext>
          ) : (
            column.data.map((item, itemIndex) => {
              if (filterStatus === "false" && item.key === "selected") {
                return null;
              }

              if (!isDndMiscItemLocked(item.key)) {
                return null;
              }

              return (
                <LockedMiscItem
                  key={item.key}
                  item={item}
                  columnKey={column.key}
                  selectedItem={selectedItem}
                  columnIndex={columnIndex}
                  itemIndex={itemIndex}
                  handleItemStatus={handleItemStatus}
                />
              );
            })
          )}

          {column.data.length === 0 && !isColumnDragDropDisabled && (
            <div
              style={{
                height: "40px",
                border: "1px dashed #bbb",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                color: "#888",
                width: "100%",
              }}
            >
              Drop Here
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --------------------
// Main Component
// --------------------
export default function MultiColumnDnd(props) {
  const previewTemplateData = resolvePreviewTemplateDataFromBuilderData(
    props.mainBuilderData
  );
  const filterStatus = resolveFilterTypeFromBuilderData(props.mainBuilderData);
  const commitPreviewPatch = (mutator) => {
    const nextBuilder = structuredClone(props.mainBuilderData || {});
    if (!nextBuilder.common_data) {
      nextBuilder.common_data = {};
    }
    if (!nextBuilder.common_data.preview_template_data) {
      nextBuilder.common_data.preview_template_data = {};
    }
    if (!nextBuilder.common_data.preview_template_data.misc_preview_data) {
      nextBuilder.common_data.preview_template_data.misc_preview_data = {};
    }
    mutator(nextBuilder.common_data.preview_template_data.misc_preview_data);
    props.updatedBuilderData(nextBuilder);
  };
  const containerRef = React.useRef(null);
  const initialDndLayout =
    previewTemplateData?.misc_preview_data?.dnd_column_data?.length
      ? previewTemplateData.misc_preview_data.dnd_column_data
      : defaultLayout;
  const [selectedItem, setSelectedItem] = useState(() =>
    getDefaultLayoutControlsSelectedItem(initialDndLayout, filterStatus)
  );

  const handleSettings = (
    type = "column",
    columnKey,
    itemKey = null,
    itemData = null,
    column_index = 0,
    item_index = null
  ) => {
    if (type === "item" && itemKey && isDndMiscItemLocked(itemKey)) {
      return;
    }

    if (type === "column" && isDndColumnSettingsDisabled(columnKey)) {
      return;
    }

    const payload = {
      type,
      columnKey,
      itemKey,
      itemData,
      column_index,
      item_index

    };

    //console.log(payload);
    setSelectedItem(payload)
    props?.setSelectedItem(payload);
  };

  // const handleItemStatus=(checked ,ColIndex,ItemIndex)=>{
  //   let value = "false"
  //   if(checked === true){
  //     value = "true";
  //   }
  //   if(checked === false){
  //     value = "false";
  //   }
  //   let updatedLayout = [...layout];
  //   updatedLayout[ColIndex].data[ItemIndex].settings.is_enable = value ;
  //   setLayout(updatedLayout);
  //   updateMainData(updatedLayout);
  // }


  const handleItemStatus = (checked, colIndex, itemIndex ,columnKey ,itemKey ,itemData) => {
    if (itemKey && isDndMiscItemLocked(itemKey)) {
      return;
    }
    const value = checked ? "true" : "false";
      if(itemKey === "selected" && (filterStatus === false || filterStatus === "false")){
        return ;
      }
    const updatedLayout = structuredClone(layout);
    //console.log(updatedLayout)
    updatedLayout[colIndex].data[itemIndex].settings.is_enable = value;
    let updatedSelectedItem = {};
      if(value === "true"){
      updatedSelectedItem = {
        type: "item",
        columnKey: columnKey,
        itemKey: itemKey,
        itemData: {
          ...itemData,
          settings: {
            ...itemData.settings,
            is_enable: value
          }
        },
        column_index: colIndex,
        item_index: itemIndex
      };
    }else{
      updatedSelectedItem = {
        type :"column",
        columnKey:columnKey,
        itemKey:null,
        itemData:null,
        column_index : colIndex,
        item_index :null
      };
    }

    setSelectedItem(updatedSelectedItem);
    props?.setSelectedItem(updatedSelectedItem);
    //setLayout(updatedLayout);
    //console.log(updatedLayout)
    //updateMainData(updatedLayout);
      commitPreviewPatch((miscPreview) => {
    miscPreview.dnd_column_data = updatedLayout;
  });
  };

  const handleFilterMove = (dnd_column_data, filterStatus) => {
  //console.log("dnd_column_data",dnd_column_data);
  if (filterStatus !== "false") return dnd_column_data;

  // Deep copy (important React safety)
  let updatedData = JSON.parse(JSON.stringify(dnd_column_data));

  let filterTop = updatedData[0];
  let filterBottom = updatedData[1];
  let postTop = updatedData.find(item => item.key === "post_top");
  let postBottom = updatedData.find(item => item.key === "post_bottom");

  // Helper function to move items
  const moveItems = (items = []) => {
    items.forEach(item => {
      if (!item?.key) return;

      // pagination → post_bottom
      if (item.key === "pagination") {
        postBottom.data.push(item);
      }

      // sorting, selected, result_count → post_top
      else if (
        ["sorting", "selected", "result_count"].includes(item.key)
      ) {
        if (item.key === "selected") {
          item.settings = item.settings || {};
          item.settings.is_enable = "false"; // better
        }
        postTop.data.push(item);
      }
    });
  };

  // Move items from both filter sections
  moveItems(filterTop?.data);
  moveItems(filterBottom?.data);

    // Disable already existing selected items in post sections
    [postTop, postBottom].forEach((section) => {
      section?.data?.forEach((item) => {
        if (item?.key === "selected") {
          item.settings = item.settings || {};
          item.settings.is_enable = "false";
        }
      });
    });
  

  // Empty filter sections
  filterTop.data = [];
  filterBottom.data = [];
    commitPreviewPatch((miscPreview) => {
      miscPreview.dnd_column_data = updatedData;
    });
  return updatedData;
};

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  const collisionDetectionStrategy = (args) => {
    // Pehle pointer check karega
    const pointerCollisions = pointerWithin(args);

    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }

    // Agar pointer detect na kare to fallback
    return closestCenter(args);
  };
  //let savedLayout = props?.mainBuilderData.common_data.preview_template_data?.misc_preview_data?.dnd_column_data;
  const savedLayout = React.useMemo(() => {
    return previewTemplateData?.misc_preview_data?.dnd_column_data;
  }, [props.mainBuilderData]);

  //console.log(savedLayout)

  const [layout, setLayout] = useState(
    savedLayout && savedLayout.length ? savedLayout : defaultLayout
  );

  // useEffect(()=>{
  // setLayout(savedLayout)
  // },[savedLayout])


  useEffect(() => {
    if (savedLayout && savedLayout.length) {
      //setLayout(structuredClone(savedLayout));
      // console.log(filterStatus)
      setLayout(handleFilterMove(structuredClone(savedLayout),filterStatus))
    }
  }, [JSON.stringify(savedLayout)]);

  const [activeItem, setActiveItem] = useState(null);
  const displayColumns = React.useMemo(
    () => getDndColumnsForLayoutControlsDisplay(layout, filterStatus),
    [layout, filterStatus]
  );

  useEffect(() => {
    const defaultItem = getDefaultLayoutControlsSelectedItem(layout, filterStatus);
    setSelectedItem(defaultItem);
    props?.setSelectedItem?.(defaultItem);
  }, []);
  const findColumn = (itemKey) => {
    return layout.find((col) =>
      col.data.some((item) => item.key === itemKey)
    );
  };


  const handleDragEnd = ({ active, over }) => {
    if (!over) return;

    const activeKey = active.id;
    if (isDndMiscItemLocked(activeKey)) {
      return;
    }

    const overKey = over.id;
    if (isDndMiscItemLocked(overKey)) {
      return;
    }

    const targetColumn =
      layout.find((col) => col.key === overKey) || findColumn(overKey);
    if (targetColumn && isDndColumnDragDropDisabled(targetColumn)) {
      return;
    }

    //  Get all valid droppable IDs (columns + items)
    const validIds = layout.flatMap((col) => [
      col.key,
      ...col.data.map((item) => item.key),
    ]);

    //  If dropped outside popup layout
    if (!validIds.includes(over.id)) {
      return;
    }
    const activeColumn = findColumn(activeKey);
    const overColumn =
      layout.find((col) => col.key === overKey) ||
      findColumn(overKey);
    if (!activeColumn || !overColumn) return;
    const updatedLayout = structuredClone(layout);
    const activeColIndex = updatedLayout.findIndex(
      (col) => col.key === activeColumn.key
    );

    const overColIndex = updatedLayout.findIndex(
      (col) => col.key === overColumn.key
    );

    const activeItemIndex = updatedLayout[
      activeColIndex
    ].data.findIndex((item) => item.key === activeKey);

    // SAME COLUMN REORDER (NO SPLICE HERE)
    if (activeColumn.key === overColumn.key) {
      const overItemIndex = updatedLayout[
        overColIndex
      ].data.findIndex((item) => item.key === overKey);

      if (overItemIndex === -1) return;

      updatedLayout[activeColIndex].data = arrayMove(
        updatedLayout[activeColIndex].data,
        activeItemIndex,
        overItemIndex
      );
      const activeItem = updatedLayout[activeColIndex].data[overItemIndex];
      let clKey = updatedLayout[overColIndex].key;
      setSelectedItem({ type: 'item', columnKey: clKey, itemKey: activeItem?.key, itemData: activeItem, column_index: overColIndex, item_index: overItemIndex });
      props?.setSelectedItem({ type: 'item', columnKey: clKey, itemKey: activeItem?.key, itemData: activeItem, column_index: overColIndex, item_index: overItemIndex });
    } else {

      //  DIFFERENT COLUMN MOVE
      const activeItem =
        updatedLayout[activeColIndex].data[activeItemIndex];

      // Remove from old column
      updatedLayout[activeColIndex].data.splice(activeItemIndex, 1);

      // Check if dropped over item or column
      const overItemIndex = updatedLayout[
        overColIndex
      ].data.findIndex((item) => item.key === overKey);

      if (overItemIndex !== -1) {
        // Insert at exact position
        updatedLayout[overColIndex].data.splice(
          overItemIndex,
          0,
          activeItem
        );
        let clKey = updatedLayout[overColIndex].key;
        setSelectedItem({ type: 'item', columnKey: clKey, itemKey: activeItem?.key, itemData: activeItem, column_index: overColIndex, item_index: overItemIndex });
        props?.setSelectedItem({ type: 'item', columnKey: clKey, itemKey: activeItem?.key, itemData: activeItem, column_index: overColIndex, item_index: overItemIndex });
      } else {
        // Dropped on empty space or column → add at end
        updatedLayout[overColIndex].data.push(activeItem);
        let clKey = updatedLayout[overColIndex].key;
        let itemLastIndex = updatedLayout[overColIndex].data.length - 1;
        setSelectedItem({ type: 'item', columnKey: clKey, itemKey: activeItem?.key, itemData: activeItem, column_index: overColIndex, item_index: itemLastIndex });
        props?.setSelectedItem({ type: 'item', columnKey: clKey, itemKey: activeItem?.key, itemData: activeItem, column_index: overColIndex, item_index: itemLastIndex });
      }
      //console.log(overColIndex,overItemIndex)
    }
    setLayout(updatedLayout);
    updateMainData(updatedLayout);
    //console.log("Saved Layout:", updatedLayout);
  };
  //console.log(selectedItem)
  const updateMainData = (updatedLayout) => {
    commitPreviewPatch((miscPreview) => {
      miscPreview.dnd_column_data = updatedLayout;
    });
  };
  const restrictToPopup = React.useCallback(
    ({ transform, activeNodeRect }) => {
      if (!containerRef.current || !activeNodeRect) {
        return transform;
      }

      const containerRect =
        containerRef.current.getBoundingClientRect();

      let newX = transform.x;
      let newY = transform.y;

      const leftLimit =
        containerRect.left - activeNodeRect.left;
      const rightLimit =
        containerRect.right - activeNodeRect.right;

      const topLimit =
        containerRect.top - activeNodeRect.top;
      const bottomLimit =
        containerRect.bottom - activeNodeRect.bottom;

      if (transform.x < leftLimit) newX = leftLimit;
      if (transform.x > rightLimit) newX = rightLimit;
      if (transform.y < topLimit) newY = topLimit;
      if (transform.y > bottomLimit) newY = bottomLimit;

      return {
        ...transform,
        x: newX,
        y: newY,
      };
    },
    []
  );
  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;

    const activeColumn = layout.find(col =>
      col.data.some(item => item.key === active.id)
    );

    const overColumn = layout.find(col =>
      col.key === over.id ||
      col.data.some(item => item.key === over.id)
    );

    if (!activeColumn || !overColumn) return;

    if (activeColumn.key !== overColumn.key) {
      setLayout(prev => {
        const newLayout = structuredClone(prev);

        const sourceCol = newLayout.find(c => c.key === activeColumn.key);
        const targetCol = newLayout.find(c => c.key === overColumn.key);

        const itemIndex = sourceCol.data.findIndex(i => i.key === active.id);
        const [movedItem] = sourceCol.data.splice(itemIndex, 1);

        targetCol.data.push(movedItem); // temporarily move

        return newLayout;
      });
    }
  }
  //console.log(containerRef);
  return (
    // <DndContext
    //   sensors={sensors}
    //   collisionDetection={closestCorners}
    //   onDragEnd={handleDragEnd}
    // >
    //   <div style={{ display: "flex" ,alignItems: "center" ,flexFlow: "column" }}>
    //     {layout?.map((column) => (
    //       <Column key={column.key} column={column} />
    //     ))}
    //   </div>
    // </DndContext>

    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      modifiers={[restrictToPopup]}
      //onDragOver={handleDragOver}
      onDragStart={({ active }) => {
        if (isDndMiscItemLocked(active.id)) {
          return;
        }

        const col = layout.find((c) =>
          c.data.some((item) => item.key === active.id)
        );

        const item = col?.data.find((i) => i.key === active.id);
        setActiveItem(item);
      }}

      onDragEnd={(event) => {
        handleDragEnd(event);
        setActiveItem(null);
      }}
      onDragCancel={() => setActiveItem(null)}
    >
      <div
        ref={containerRef}
        style={{
          display: "flex",
          alignItems: "center",
          flexFlow: "column",
          rowGap: "25px",
          position: "relative"
        }}
        className="caf-dragged-area-fix"
      >
        {displayColumns.map((column) => {
          const index = layout.findIndex((col) => col.key === column.key);
          if (index < 0) {
            return null;
          }

          return (
            <Column
              key={column.key}
              column={column}
              handleSettings={handleSettings}
              selectedItem={selectedItem}
              columnIndex={index}
              handleItemStatus={handleItemStatus}
              filterStatus={filterStatus}
            />
          );
        })}

        <DragOverlay
          container={containerRef.current || undefined}
          dropAnimation={null}
          adjustScale={false}
          wrapperElement="ul"
          modifiers={[snapCenterToCursor]}
        >
          {activeItem ? (
            <div
              style={{
                padding: "10px",
                background: "#dbeafe",
                border: "1px solid #3b82f6",
                borderRadius: "6px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                boxSizing: "border-box",
                position: "relative",
                // transform: "translate(0%, -130%)"
              }}
            >
              {activeItem.label}
            </div>
          ) : null}
        </DragOverlay>
      </div>


    </DndContext>
  );
}
