import React, { useState } from "react";
import { Input, Tooltip } from "antd";
import { fModuleStyle } from "../styleData";
import { FILTER_RESET_DEFAULT_ICONS } from "../filterModuleDefaults";
import { CloseCircleOutlined } from "@ant-design/icons";
import FilterModulePickerIcon from "./FilterModulePickerIcon";
import { getUpgradeUrl, isModuleLocked, canUseProductPostType } from "../../../tier/capabilities";
import { WOO_RATING_STAR_COUNT_DEFAULT, RATING_COMPARE_DEFAULT, getWooRatingIconStyleDefaults } from "./woocommerce/wooFilterModuleTemplates";

const MODULE_SECTION_LABEL_STYLE = {
  flex: "0 0 100%",
  width: "100%",
  margin: 0,
  padding: "2px 2px 0",
  listStyle: "none",
  fontSize: "13px",
  fontWeight: 600,
  color: "#4c5866",
  cursor: "default",
  background: "transparent",
  height: "auto",
  border: "none",
  display: "block",
  boxSizing: "border-box",
};

const isWooPickerModule = (moduleKey) => moduleKey === "woo_rating_filter";

const NewModulePopUp = (props) => {
  const initialModules = [
    {
      type: "module",
      title: "Checkbox Filter",
      style: {
        ...fModuleStyle,
        container: {
          ...fModuleStyle.container,
          desktop: {
            ...fModuleStyle.container.desktop,
            default: {
              ...fModuleStyle.container.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              paddingTop: "10px",
              paddingRight: "0",
              paddingBottom: "0",
              paddingLeft: "0",
              marginTop: "0",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "rgb(255,255,255)",
              color: "#4c5866",
              fontFamily: "Open Sans",
              fontSize: "14px",
              display: "flex",
              flexFlow: "column",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              gap: "0px",
              float: "none",
              boxShadow: "0px 0px 0px 0px  #333333",
              top: "auto",
              right: "auto",
              bottom: "auto",
              left: "auto",
            },
          },
        },
        header: {
          ...fModuleStyle.header,
          desktop: {
            ...fModuleStyle.header.desktop,
            default: {
              ...fModuleStyle.header.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              top: "0",
              bottom: "0",
              left: "0",
              right: "0",
              paddingTop: "0px",
              paddingRight: "0",
              paddingBottom: "10px",
              paddingLeft: "0",
              marginTop: "0",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "rgba(255,255,255,0)",
              color: "#000",
              fontFamily: "DM Sans",
              fontWeight: "400",
              fontSize: "20px",
              boxShadow: "0px 0px 0px 0px  #333333",
              display: "flex",
            },
          },
        },
        input: {
          ...fModuleStyle.input,
          desktop: {
            ...fModuleStyle.input.desktop,
            default: {
              ...fModuleStyle.input.desktop.default,
              width: "18px",
              height: "18px",
              position: "relative",
              paddingTop: "0px",
              paddingRight: "0",
              paddingBottom: "0px",
              paddingLeft: "0",
              marginTop: "0",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff",
              color: "rgb(255,255,255)",
              fontFamily: "Montserrat",
              fontWeight: "700",
              fontSize: "22px",
              borderTopWidth: "2px",
              borderRightWidth: "2px",
              borderBottomWidth: "2px",
              borderLeftWidth: "2px",
              borderTopColor: "rgb(209,213,220)",
              borderRightColor: "rgb(209,213,220)",
              borderBottomColor: "rgb(209,213,220)",
              borderLeftColor: "rgb(209,213,220)",
              borderTopStyle: "solid",
              borderRightStyle: "solid",
              borderBottomStyle: "solid",
              borderLeftStyle: "solid",
              borderTopLeftRadius: "4px",
              borderTopRightRadius: "4px",
              borderBottomLeftRadius: "4px",
              borderBottomRightRadius: "4px",
            },
            selected: {
              ...fModuleStyle.input.desktop.selected,
              backgroundColor: "rgb(0,0,0)",
              borderTopWidth: "2px",
              borderRightWidth: "2px",
              borderBottomWidth: "2px",
              borderLeftWidth: "2px",
              borderTopColor: "rgb(3,3,3)",
              borderRightColor: "rgb(3,3,3)",
              borderBottomColor: "rgb(3,3,3)",
              borderLeftColor: "rgb(3,3,3)",
              borderTopStyle: "solid",
              borderRightStyle: "solid",
              borderBottomStyle: "solid",
              borderLeftStyle: "solid"
            }
          },
        },
        meta: {
          ...fModuleStyle.meta,
          desktop: {
            ...fModuleStyle.meta.desktop,
            default: {
              ...fModuleStyle.meta.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              paddingTop: "0px",
              paddingRight: "0",
              paddingBottom: "0",
              paddingLeft: "0",
              marginTop: "0",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "rgba(255,255,255,0)",
              fontFamily: "Open Sans",
              textTransform: "capitalize",
              fontSize: "16px",
              color: "#dd3333",
              display: "flex",
              flexFlow: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "10px",
              float: "none",
              flexWrap: "wrap",
              boxShadow: "0px 0px 0px 0px  #333333"
            },
          },
        },
        mainmeta: {
          ...fModuleStyle.mainmeta,
          desktop: {
            ...fModuleStyle.mainmeta.desktop,
            default: {
              ...fModuleStyle.mainmeta.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              paddingTop: "10px",
              paddingRight: "0",
              paddingBottom: "0",
              paddingLeft: "0",
              marginTop: "0",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff",
              fontFamily: "Open Sans",
              textTransform: "capitalize",
              fontSize: "16px",
              color: "#dd3333",
              display: "flex",
              flexFlow: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "15px",
              float: "none",
              flexWrap: "wrap"
            },
          },
        },
        selectmeta: {
          ...fModuleStyle.selectmeta,
          desktop: {
            ...fModuleStyle.selectmeta.desktop,
            default: {
              ...fModuleStyle.selectmeta.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              paddingTop: "10px",
              paddingRight: "10px",
              paddingBottom: "10px",
              paddingLeft: "10px",
              marginTop: "0px",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff",
              fontFamily: "Open Sans",
              textTransform: "capitalize",
              fontSize: "16px",
              color: "#dd3333",
              display: "flex",
              flexFlow: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0px",
              float: "none",
              borderTopLeftRadius: "6px",
              borderTopRightRadius: "6px",
              borderBottomLeftRadius: "6px",
              borderBottomRightRadius: "6px",
              borderTopColor: "#c6bdbd",
              borderRightColor: "#c6bdbd",
              borderBottomColor: "#c6bdbd",
              borderLeftColor: "#c6bdbd",
              borderTopWidth: "1px",
              borderRightWidth: "1px",
              borderBottomWidth: "1px",
              borderLeftWidth: "1px",
              borderTopStyle: "solid",
              borderRightStyle: "solid",
              borderBottomStyle: "solid",
              borderLeftStyle: "solid"
            },
          },
        },
        meta1: {
          ...fModuleStyle.meta1,
          desktop: {
            ...fModuleStyle.meta1.desktop,
            default: {
              ...fModuleStyle.meta1.desktop.default,
              width: "auto",
              height: "auto",
              position: "relative",
              paddingTop: "12px",
              paddingRight: "20px",
              paddingBottom: "12px",
              paddingLeft: "20px",
              marginTop: "0px",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff",
              fontFamily: "DM Sans",
              textTransform: "capitalize",
              fontSize: "16px",
              color: "rgb(3,3,3)",
              display: "flex",
              flexFlow: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "5px",
              float: "none",
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px",
              borderBottomLeftRadius: "8px",
              borderBottomRightRadius: "8px",
              borderTopColor: "rgb(235,230,231)",
              borderRightColor: "rgb(235,230,231)",
              borderBottomColor: "rgb(235,230,231)",
              borderLeftColor: "rgb(235,230,231)",
              borderTopWidth: "1px",
              borderRightWidth: "1px",
              borderBottomWidth: "1px",
              borderLeftWidth: "1px",
              borderTopStyle: "solid",
              borderRightStyle: "solid",
              borderBottomStyle: "solid",
              borderLeftStyle: "solid",
              fontStyle: "normal",
              textDecoration: "inherit",
              boxShadow: "0px 0px 0px 0px  #333333"
            },
            hover: {
              ...fModuleStyle.meta1.desktop.hover,
              backgroundColor : "rgb(246,247,251)"
            },
            selected: {
              ...fModuleStyle.meta1.desktop.selected,
              backgroundColor : "rgb(246,247,251)"
            },
          },
        },
        meta2: {
          ...fModuleStyle.meta2,
          desktop: {
            ...fModuleStyle.meta2.desktop,
            default: {
              ...fModuleStyle.meta2.desktop.default,
              display: "flex",
              flexFlow: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "0px",
              float: "none"
            },
          },
        },
        meta3: {
          ...fModuleStyle.meta3,
          desktop: {
            ...fModuleStyle.meta3.desktop,
            default: {
              ...fModuleStyle.meta3.desktop.default,
              display: "flex",
              flexFlow: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "5px",
              float: "none"
            },
          },
        },
        meta4: {
          ...fModuleStyle.meta4,
          desktop: {
            ...fModuleStyle.meta4.desktop,
            default: {
              ...fModuleStyle.meta4.desktop.default,
              display: "flex",
              flexFlow: "row",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              gap: "3px",
              float: "none"
            },
          },
        },
        icon: {
          ...fModuleStyle.icon,
          desktop: {
            ...fModuleStyle.icon.desktop,
            default: {
              ...fModuleStyle.icon.desktop.default,
              fontSize: "18px",
              color: "rgb(0,0,0)"
            },
          },
        },
        icon2: {
          ...fModuleStyle.icon2,
          desktop: {
            ...fModuleStyle.icon2.desktop,
            default: {
              ...fModuleStyle.icon2.desktop.default,
              fontSize: "16px",
              color: "#dd3333"
            },
          },
        },
        icon3: {
          ...fModuleStyle.icon3,
          desktop: {
            ...fModuleStyle.icon3.desktop,
            default: {
              ...fModuleStyle.icon3.desktop.default,
              fontSize: "16px",
              color: "#dd3333"
            },
          },
        },
        selecticon: {
          ...fModuleStyle.selecticon,
          desktop: {
            ...fModuleStyle.selecticon.desktop,
            default: {
              ...fModuleStyle.selecticon.desktop.default,
              fontSize: "16px",
              color: "#dd3333"
            },
          },
        },
        count: {
          ...fModuleStyle.count,
          desktop: {
            ...fModuleStyle.count.desktop,
            default: {
              ...fModuleStyle.count.desktop.default,
              width: "auto",
              height: "auto",
              paddingTop: "0px",
              paddingRight: "0px",
              paddingBottom: "0px",
              paddingLeft: "0px",
              marginTop: "0px",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff00",
              fontFamily: "Open Sans",
              textTransform: "capitalize",
              fontSize: "16px",
              color: "rgb(96,96,96)",
              fontWeight: "300"
            },
          },
        },
        showmore: {
          ...fModuleStyle.showmore,
        },
      },
      key: "checkbox_filter",
      settings: {
        taxonomy_data: [],
        taxonomy_relation: "OR",
        category_relation: "OR",
        meta_relation: "IN",
        custom_class: "",
        admin_label: "",
        predefined_terms: [],
        cf_predefined_terms: [],
        label: {
          is_label: "true",
          value: "Label",
          icons: {
            visibility: false,
            icon: "",
            position: "before-label",
            type: "icon"
          }
        },
        multiple_term: "false",
        show_checkbox: "true",
        show_icon: "false",
        term_visual: "icon",
        hide_term_label: "false",
        term_label_display: "show",
        show_count: "false",
        count_separator: "brackets",
        term_show_more: "false",
        term_visible_limit: "10",
        show_more_label: "Show more",
        show_less_label: "Show less",
        show_more_count: "true",
        show_more_count_separator: "brackets",
        show_more_count_prefix: "",
        show_more_count_suffix: "",
        enable_toggle: "false",
        toggle_position: "right",
        close_toggle: "false",
        data_source: "taxonomy",
        custom_field_data: [],
        visibility: {
          mobile: "false",
          tablet: "false",
          desktop: "false"
        }
      },
    },
    {
      type: "module",
      title: "Dropdown Filter",
      style: {
        ...fModuleStyle,
        container: {
          ...fModuleStyle.container,
          desktop: {
            ...fModuleStyle.container.desktop,
            default: {
              ...fModuleStyle.container.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              paddingTop: "10px",
              paddingRight: "0",
              paddingBottom: "0",
              paddingLeft: "0",
              marginTop: "0",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "rgb(255,255,255)",
              color: "#4c5866",
              fontFamily: "Open Sans",
              fontSize: "14px",
              display: "flex",
              flexFlow: "column",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              gap: "0px",
              float: "none",
              boxShadow: "0px 0px 0px 0px  #333333",
              top: "auto",
              right: "auto",
              bottom: "auto",
              left: "auto"
            },
          },
        },
        header: {
          ...fModuleStyle.header,
          desktop: {
            ...fModuleStyle.header.desktop,
            default: {
              ...fModuleStyle.header.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              top: "0",
              bottom: "0",
              left: "0",
              right: "0",
              paddingTop: "0px",
              paddingRight: "0",
              paddingBottom: "10px",
              paddingLeft: "0",
              marginTop: "0",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "rgba(255,255,255,0)",
              color: "#000",
              fontFamily: "DM Sans",
              fontWeight: "400",
              fontSize: "20px",
              display: "flex",
              boxShadow: "0px 0px 0px 0px  #333333"
            },
          },
        },
        input: {
          ...fModuleStyle.input,
          desktop: {
            ...fModuleStyle.input.desktop,
            default: {
              ...fModuleStyle.input.desktop.default,
              width: "18px",
              height: "18px",
              position: "relative",
              paddingTop: "0px",
              paddingRight: "0",
              paddingBottom: "0px",
              paddingLeft: "0",
              marginTop: "0",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff",
              color: "#000",
              fontFamily: "Montserrat",
              fontWeight: "700",
              fontSize: "22px",
            },
          },
        },
        meta: {
          ...fModuleStyle.meta,
          desktop: {
            ...fModuleStyle.meta.desktop,
            default: {
              ...fModuleStyle.meta.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              paddingTop: "0px",
              paddingRight: "0",
              paddingBottom: "0",
              paddingLeft: "0",
              marginTop: "0",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "rgba(255,255,255,0)",
              fontFamily: "Open Sans",
              textTransform: "capitalize",
              fontSize: "16px",
              color: "#dd3333",
              display: "flex",
              flexFlow: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "15px",
              float: "none",
              flexWrap: "wrap",
              boxShadow: "0px 0px 0px 0px  #333333"
            },
          },
        },
        mainmeta: {
          ...fModuleStyle.mainmeta,
          desktop: {
            ...fModuleStyle.mainmeta.desktop,
            default: {
              ...fModuleStyle.mainmeta.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              paddingTop: "0px",
              paddingRight: "0",
              paddingBottom: "0",
              paddingLeft: "0",
              marginTop: "10px",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff",
              fontFamily: "Open Sans",
              textTransform: "capitalize",
              fontSize: "16px",
              color: "#dd3333",
              display: "flex",
              flexFlow: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "0px",
              float: "none",
              flexWrap: "wrap",
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
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px",
              borderBottomLeftRadius: "8px",
              borderBottomRightRadius: "8px",
              boxShadow: "0px 5px 4px 0px  rgb(218,218,218)"
            },
          },
        },
        selectmeta: {
          ...fModuleStyle.selectmeta,
          desktop: {
            ...fModuleStyle.selectmeta.desktop,
            default: {
              ...fModuleStyle.selectmeta.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              paddingTop: "15px",
              paddingRight: "10px",
              paddingBottom: "15px",
              paddingLeft: "10px",
              marginTop: "0px",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "rgb(246,247,251)",
              fontFamily: "Open Sans",
              textTransform: "capitalize",
              fontSize: "16px",
              color: "rgb(0,0,0)",
              display: "flex",
              flexFlow: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0px",
              float: "none",
              borderTopLeftRadius: "6px",
              borderTopRightRadius: "6px",
              borderBottomLeftRadius: "6px",
              borderBottomRightRadius: "6px",
              borderTopColor: "rgb(235,230,231)",
              borderRightColor: "rgb(235,230,231)",
              borderBottomColor: "rgb(235,230,231)",
              borderLeftColor: "rgb(235,230,231)",
              borderTopWidth: "1px",
              borderRightWidth: "1px",
              borderBottomWidth: "1px",
              borderLeftWidth: "1px",
              borderTopStyle: "solid",
              borderRightStyle: "solid",
              borderBottomStyle: "solid",
              borderLeftStyle: "solid",
              boxShadow: "0px 0px 0px 0px  #333333"
            },
          },
        },
        meta1: {
          ...fModuleStyle.meta1,
          desktop: {
            ...fModuleStyle.meta1.desktop,
            default: {
              ...fModuleStyle.meta1.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              paddingTop: "15px",
              paddingRight: "10px",
              paddingBottom: "15px",
              paddingLeft: "10px",
              marginTop: "0px",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "rgba(255,255,255,0)",
              fontFamily: "Open Sans",
              textTransform: "inherit",
              fontSize: "16px",
              color: "rgb(96,96,96)",
              display: "flex",
              flexFlow: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "5px",
              float: "none",
              borderTopLeftRadius: "0px",
              borderTopRightRadius: "0px",
              borderBottomLeftRadius: "0px",
              borderBottomRightRadius: "0px",
              borderTopColor: "#c6bdbd",
              borderRightColor: "#c6bdbd",
              borderBottomColor: "#c6bdbd",
              borderLeftColor: "#c6bdbd",
              borderTopWidth: "0px",
              borderRightWidth: "0px",
              borderBottomWidth: "0px",
              borderLeftWidth: "0px",
              borderTopStyle: "solid",
              borderRightStyle: "solid",
              borderBottomStyle: "solid",
              borderLeftStyle: "solid",
              fontStyle: "normal",
              textDecoration: "inherit",
              boxShadow: "0px 0px 0px 0px  #333333"
            },
            hover: {
              ...fModuleStyle.meta1.desktop.hover,
              backgroundColor: "rgb(246,247,251)",
            },
            selected: {
              ...fModuleStyle.meta1.desktop.selected,
              backgroundColor: "rgb(246,247,251)",
            }
          },
        },
        meta2: {
          ...fModuleStyle.meta2,
          desktop: {
            ...fModuleStyle.meta2.desktop,
            default: {
              ...fModuleStyle.meta2.desktop.default,
              display: "flex",
              flexFlow: "column",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              gap: "0px",
              float: "none"
            },
          },
        },
        meta3: {
          ...fModuleStyle.meta3,
          desktop: {
            ...fModuleStyle.meta3.desktop,
            default: {
              ...fModuleStyle.meta3.desktop.default,
              display: "flex",
              flexFlow: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "5px",
              float: "none"
            },
          },
        },
        meta4: {
          ...fModuleStyle.meta4,
          desktop: {
            ...fModuleStyle.meta4.desktop,
            default: {
              ...fModuleStyle.meta4.desktop.default,
              display: "flex",
              flexFlow: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "5px",
              float: "none"
            },
          },
        },
        icon: {
          ...fModuleStyle.icon,
          desktop: {
            ...fModuleStyle.icon.desktop,
            default: {
              ...fModuleStyle.icon.desktop.default,
              fontSize: "16px",
              color: "rgb(6,6,6)",
              paddingBottom: "0px",
              paddingRight: "0px",
              paddingLeft: "0px",
              paddingTop: "0px"
            },
          },
        },
        icon2: {
          ...fModuleStyle.icon2,
          desktop: {
            ...fModuleStyle.icon2.desktop,
            default: {
              ...fModuleStyle.icon2.desktop.default,
              fontSize: "16px",
              color: "#dd3333",
            },
          },
        },
        icon3: {
          ...fModuleStyle.icon3,
          desktop: {
            ...fModuleStyle.icon3.desktop,
            default: {
              ...fModuleStyle.icon3.desktop.default,
              fontSize: "16px",
              color: "#dd3333",
            },
          },
        },
        selecticon: {
          ...fModuleStyle.selecticon,
          desktop: {
            ...fModuleStyle.selecticon.desktop,
            default: {
              ...fModuleStyle.selecticon.desktop.default,
              fontSize: "16px",
              color: "rgb(2,2,2)",
              paddingBottom: "0px",
              paddingTop: "0px",
              paddingRight: "0px",
              paddingLeft: "0px"
            },
          },
        },
        count: {
          ...fModuleStyle.count,
          desktop: {
            ...fModuleStyle.count.desktop,
            default: {
              ...fModuleStyle.count.desktop.default,
              width: "auto",
              height: "auto",
              paddingTop: "0px",
              paddingRight: "0px",
              paddingBottom: "0px",
              paddingLeft: "0px",
              marginTop: "0px",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff00",
              fontFamily: "Open Sans",
              textTransform: "capitalize",
              fontSize: "16px",
            },
          },
        },
        showmore: {
          ...fModuleStyle.showmore,
        },
      },
      key: "dropdown_filter",
      settings: {
        dropdown_data: {
          icons: {
            icon_switch: true,
            active_icon: "fas fa-arrow-up",
            inactive_icon: "",
            active_type: "icon",
            inactive_type: "icon",
            position: "right"
          },
          all_option: {
            value: "All",
            is_enable: "false",
            icons: {
              visibility: false,
              icon: "",
              type: "icon"
            }
          }
        },
        taxonomy_data:[],
        taxonomy_relation: "OR",
        category_relation: "OR",
        meta_relation: "IN",
        custom_class: "",
        admin_label: "",
        predefined_terms: [],
        cf_predefined_terms: [],
        label: {
          is_label: "true",
          value: "Label",
          icons: {
            visibility: false,
            icon: "",
            position: "before-label",
            type: "icon"
          }
        },
        multiple_term: "false",
        show_icon: "false",
        term_visual: "icon",
        hide_term_label: "false",
        term_label_display: "show",
        show_count: "false",
        enable_toggle: "false",
        toggle_position: "right",
        close_toggle: "false",
        count_separator: "brackets",
        term_show_more: "false",
        term_visible_limit: "10",
        show_more_label: "Show more",
        show_less_label: "Show less",
        show_more_count: "true",
        show_more_count_separator: "brackets",
        show_more_count_prefix: "",
        show_more_count_suffix: "",
        data_source: "taxonomy",
        custom_field_data: [],
        visibility: {
          mobile: "false",
          tablet: "false",
          desktop: "false"
        }
      },
    },
    {
      type: "module",
      title: "Reset",
      style: {
        ...fModuleStyle,
        container: {
          ...fModuleStyle.container,
          desktop: {
            ...fModuleStyle.container.desktop,
            default: {
              ...fModuleStyle.container.desktop.default,
              width: "auto",
              height: "auto",
              position: "relative",
              paddingTop: "10px",
              paddingRight: "0",
              paddingBottom: "10px",
              paddingLeft: "0",
              marginTop: "10px",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "rgba(231,26,26,0)",
              color: "rgb(0,0,0)",
              fontFamily: "Open Sans",
              fontSize: "16px",
              display: "flex",
              flexFlow: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "5px",
              float: "none",
              fontStyle: "normal",
              textTransform: "inherit",
              textDecoration: "inherit",
              boxShadow: "0px 0px 0px 0px  #333333",
              top: "auto",
              right: "auto",
              bottom: "auto",
              left: "auto",
            },
            hover: {
              ...fModuleStyle.container.desktop.hover,
              backgroundColor: "rgba(3,3,3,0)"
            }
          },
        },
        header: {
          ...fModuleStyle.header,
          desktop: {
            ...fModuleStyle.header.desktop,
            default: {
              ...fModuleStyle.header.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              top: "0",
              bottom: "0",
              left: "0",
              right: "0",
              paddingTop: "10px",
              paddingRight: "0",
              paddingBottom: "10px",
              paddingLeft: "0",
              marginTop: "0",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff",
              color: "#000",
              fontFamily: "Montserrat",
              fontWeight: "700",
              fontSize: "22px",
            },
          },
        },
        input: {
          ...fModuleStyle.input,
          desktop: {
            ...fModuleStyle.input.desktop,
            default: {
              ...fModuleStyle.input.desktop.default,
              width: "18px",
              height: "18px",
              position: "relative",
              paddingTop: "0px",
              paddingRight: "0",
              paddingBottom: "0px",
              paddingLeft: "0",
              marginTop: "0",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff",
              color: "#000",
              fontFamily: "Montserrat",
              fontWeight: "700",
              fontSize: "22px",
            },
          },
        },
        meta: {
          ...fModuleStyle.meta,
          desktop: {
            ...fModuleStyle.meta.desktop,
            default: {
              ...fModuleStyle.meta.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              paddingTop: "10px",
              paddingRight: "0",
              paddingBottom: "0",
              paddingLeft: "0",
              marginTop: "0",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff",
              fontFamily: "Open Sans",
              textTransform: "capitalize",
              fontSize: "16px",
              color: "#dd3333",
              display: "flex",
              flexFlow: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "15px",
              float: "none",
              flexWrap: "wrap"
            },
          },
        },
        mainmeta: {
          ...fModuleStyle.mainmeta,
          desktop: {
            ...fModuleStyle.mainmeta.desktop,
            default: {
              ...fModuleStyle.mainmeta.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              paddingTop: "10px",
              paddingRight: "0",
              paddingBottom: "0",
              paddingLeft: "0",
              marginTop: "0",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff",
              fontFamily: "Open Sans",
              textTransform: "capitalize",
              fontSize: "16px",
              color: "#dd3333",
              display: "flex",
              flexFlow: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "15px",
              float: "none",
              flexWrap: "wrap"
            },
          },
        },
        selectmeta: {
          ...fModuleStyle.selectmeta,
          desktop: {
            ...fModuleStyle.selectmeta.desktop,
            default: {
              ...fModuleStyle.selectmeta.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              paddingTop: "10px",
              paddingRight: "10px",
              paddingBottom: "10px",
              paddingLeft: "10px",
              marginTop: "0px",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff",
              fontFamily: "Open Sans",
              textTransform: "capitalize",
              fontSize: "16px",
              color: "#dd3333",
              display: "flex",
              flexFlow: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0px",
              float: "none",
              borderTopLeftRadius: "6px",
              borderTopRightRadius: "6px",
              borderBottomLeftRadius: "6px",
              borderBottomRightRadius: "6px",
              borderTopColor: "#c6bdbd",
              borderRightColor: "#c6bdbd",
              borderBottomColor: "#c6bdbd",
              borderLeftColor: "#c6bdbd",
              borderTopWidth: "1px",
              borderRightWidth: "1px",
              borderBottomWidth: "1px",
              borderLeftWidth: "1px",
              borderTopStyle: "solid",
              borderRightStyle: "solid",
              borderBottomStyle: "solid",
              borderLeftStyle: "solid"
            },
          },
        },
        meta1: {
          ...fModuleStyle.meta1,
          desktop: {
            ...fModuleStyle.meta1.desktop,
            default: {
              ...fModuleStyle.meta1.desktop.default,
              width: "auto",
              height: "auto",
              position: "relative",
              paddingTop: "10px",
              paddingRight: "10px",
              paddingBottom: "10px",
              paddingLeft: "10px",
              marginTop: "0px",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff",
              fontFamily: "Open Sans",
              textTransform: "capitalize",
              fontSize: "16px",
              color: "#dd3333",
              display: "flex",
              flexFlow: "row",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              gap: "0px",
              float: "none",
              borderTopLeftRadius: "6px",
              borderTopRightRadius: "6px",
              borderBottomLeftRadius: "6px",
              borderBottomRightRadius: "6px",
              borderTopColor: "#c6bdbd",
              borderRightColor: "#c6bdbd",
              borderBottomColor: "#c6bdbd",
              borderLeftColor: "#c6bdbd",
              borderTopWidth: "1px",
              borderRightWidth: "1px",
              borderBottomWidth: "1px",
              borderLeftWidth: "1px",
              borderTopStyle: "solid",
              borderRightStyle: "solid",
              borderBottomStyle: "solid",
              borderLeftStyle: "solid"
            },
          },
        },
        meta2: {
          ...fModuleStyle.meta2,
          desktop: {
            ...fModuleStyle.meta2.desktop,
            default: {
              ...fModuleStyle.meta2.desktop.default,
              display: "flex",
              flexFlow: "column",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              gap: "0px",
              float: "none"
            },
          },
        },
        meta3: {
          ...fModuleStyle.meta3,
          desktop: {
            ...fModuleStyle.meta3.desktop,
            default: {
              ...fModuleStyle.meta3.desktop.default,
              display: "flex",
              flexFlow: "row",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              gap: "3px",
              float: "none"
            },
          },
        },
        meta4: {
          ...fModuleStyle.meta4,
          desktop: {
            ...fModuleStyle.meta4.desktop,
            default: {
              ...fModuleStyle.meta4.desktop.default,
              display: "flex",
              flexFlow: "row",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              gap: "3px",
              float: "none"
            },
          },
        },
        icon: {
          ...fModuleStyle.icon,
          desktop: {
            ...fModuleStyle.icon.desktop,
            default: {
              ...fModuleStyle.icon.desktop.default,
              fontSize: "15px",
              color: "rgb(96,96,96)",
              width: "auto",
              height: "auto",
              boxShadow: "0px 0px 0px 0px  #333333",
            },
          },
        },
        icon2: {
          ...fModuleStyle.icon2,
          desktop: {
            ...fModuleStyle.icon2.desktop,
            default: {
              ...fModuleStyle.icon2.desktop.default,
              fontSize: "16px",
              color: "#dd3333"
            },
          },
        },
        icon3: {
          ...fModuleStyle.icon3,
          desktop: {
            ...fModuleStyle.icon3.desktop,
            default: {
              ...fModuleStyle.icon3.desktop.default,
              fontSize: "16px",
              color: "#dd3333"
            },
          },
        },
        selecticon: {
          ...fModuleStyle.selecticon,
          desktop: {
            ...fModuleStyle.selecticon.desktop,
            default: {
              ...fModuleStyle.selecticon.desktop.default,
              fontSize: "16px",
              color: "#dd3333"
            },
          },
        },
        count: {
          ...fModuleStyle.count,
          desktop: {
            ...fModuleStyle.count.desktop,
            default: {
              ...fModuleStyle.count.desktop.default,
              width: "auto",
              height: "auto",
              paddingTop: "0px",
              paddingRight: "0px",
              paddingBottom: "0px",
              paddingLeft: "0px",
              marginTop: "0px",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff00",
              fontFamily: "Open Sans",
              textTransform: "capitalize",
              fontSize: "16px",
            },
          },
        },
      },
      key: "reset",
      settings: {
        label: {
          is_label: "false",
          value: "Label"
        },
        reset_label: "Reset Filters",
        custom_class: "",
        admin_label: "",
        icons: { ...FILTER_RESET_DEFAULT_ICONS },
        visibility: {
          mobile: "false",
          tablet: "false",
          desktop: "false"
        },
        taxonomy_data: [],
        predefined_terms: [],
        cf_predefined_terms: []
      },
    },
    {
      type: "module",
      title: "Custom Text",
      style: {
        ...fModuleStyle,
        container: {
          ...fModuleStyle.container,
          desktop: {
            ...fModuleStyle.container.desktop,
            default: {
              ...fModuleStyle.container.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              paddingTop: "0px",
              paddingRight: "0",
              paddingBottom: "0px",
              paddingLeft: "0",
              marginTop: "0",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff",
              color: "rgb(0,0,0)",
              fontFamily: "DM Sans",
              fontSize: "14px",
              display: "flex",
              flexFlow: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "5px",
              float: "none",
              boxShadow: "0px 0px 0px 0px  #333333",
              top: "auto",
              right: "auto",
              bottom: "auto",
              left: "auto",
            },
          },
          mobile: {
            ...fModuleStyle.container.mobile,
            default: {
              ...fModuleStyle.container.mobile.default,
              fontSize: "12px",
            },
          },
        },
        icon: {
          ...fModuleStyle.icon,
          desktop: {
            ...fModuleStyle.icon.desktop,
            default: {
              ...fModuleStyle.icon.desktop.default,
              fontSize: "15px",
              color: "rgb(96,96,96)",
              width: "auto",
              height: "auto",
              boxShadow: "0px 0px 0px 0px  #333333",
            },
          },
        },
      },
      key: "customtext",
      settings: {
        background_image: "",
        custom_class: "",
        admin_label: "",
        customText: "Custom Text",
        icons: {
          visibility: false,
          icon: "",
          position: "before-customtext",
          type: "icon",
        },
        visibility: {
          mobile: "false",
          tablet: "false",
          desktop: "false",
        },
      },
    },
    {
      type: "module",
      title: "Range Slider",
      style: {
        ...fModuleStyle,
        container: {
          ...fModuleStyle.container,
          desktop: {
            ...fModuleStyle.container.desktop,
            default: {
              ...fModuleStyle.container.desktop.default,
              width: "auto",
              height: "auto",
              position: "relative",
              paddingTop: "0",
              paddingRight: "0",
              paddingBottom: "0",
              paddingLeft: "0",
              marginTop: "0",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff",
              color: "#4c5866",
              fontFamily: "Open Sans",
              fontSize: "14px",
              display: "flex",
              flexFlow: "column",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              gap: "0px",
              float: "none",
              top: "auto",
              right: "auto",
              bottom: "auto",
              left: "auto"
            },
          },
        },
        header: {
          ...fModuleStyle.header,
          desktop: {
            ...fModuleStyle.header.desktop,
            default: {
              ...fModuleStyle.header.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              top: "0",
              bottom: "0",
              left: "0",
              right: "0",
              paddingTop: "10px",
              paddingRight: "0",
              paddingBottom: "10px",
              paddingLeft: "0",
              marginTop: "0",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff",
              color: "#000",
              fontFamily: "DM Sans",
              fontWeight: "400",
              fontSize: "20px",
              display: "flex"
            },
          },
        },
        input: {
          ...fModuleStyle.input,
          desktop: {
            ...fModuleStyle.input.desktop,
            default: {
              ...fModuleStyle.input.desktop.default,
              width: "18px",
              height: "18px",
              position: "relative",
              paddingTop: "0px",
              paddingRight: "0",
              paddingBottom: "0px",
              paddingLeft: "0",
              marginTop: "0",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff",
              color: "#000",
              fontFamily: "Montserrat",
              fontWeight: "700",
              fontSize: "22px",
            },
          },
        },
        meta: {
          ...fModuleStyle.meta,
          desktop: {
            ...fModuleStyle.meta.desktop,
            default: {
              ...fModuleStyle.meta.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              display: "flex",
              flexFlow: "column",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              gap: "20px",
              float: "none",
              paddingTop: "0",
              paddingRight: "0",
              paddingBottom: "20px",
              paddingLeft: "0",
              marginTop: "0",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0"
            },
            hover: { ...fModuleStyle.meta.desktop.hover },
          },
          tablet: { ...fModuleStyle.meta.tablet },
          mobile: { ...fModuleStyle.meta.mobile },
        },
        mainmeta: {
          ...fModuleStyle.mainmeta,
          desktop: {
            ...fModuleStyle.mainmeta.desktop,
            default: {
              ...fModuleStyle.mainmeta.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              paddingTop: "10px",
              paddingRight: "0",
              paddingBottom: "0",
              paddingLeft: "0",
              marginTop: "0",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff",
              fontFamily: "Open Sans",
              textTransform: "capitalize",
              fontSize: "16px",
              color: "#dd3333",
              display: "flex",
              flexFlow: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "15px",
              float: "none",
              flexWrap: "wrap"
            },
          },
        },
        selectmeta: {
          ...fModuleStyle.selectmeta,
          desktop: {
            ...fModuleStyle.selectmeta.desktop,
            default: {
              ...fModuleStyle.selectmeta.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              paddingTop: "10px",
              paddingRight: "10px",
              paddingBottom: "10px",
              paddingLeft: "10px",
              marginTop: "0px",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff",
              fontFamily: "Open Sans",
              textTransform: "capitalize",
              fontSize: "16px",
              color: "#dd3333",
              display: "flex",
              flexFlow: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0px",
              float: "none",
              borderTopLeftRadius: "6px",
              borderTopRightRadius: "6px",
              borderBottomLeftRadius: "6px",
              borderBottomRightRadius: "6px",
              borderTopColor: "#c6bdbd",
              borderRightColor: "#c6bdbd",
              borderBottomColor: "#c6bdbd",
              borderLeftColor: "#c6bdbd",
              borderTopWidth: "1px",
              borderRightWidth: "1px",
              borderBottomWidth: "1px",
              borderLeftWidth: "1px",
              borderTopStyle: "solid",
              borderRightStyle: "solid",
              borderBottomStyle: "solid",
              borderLeftStyle: "solid"
            },
          },
        },
        meta1: {
          ...fModuleStyle.meta1,
          desktop: {
            ...fModuleStyle.meta1.desktop,
            default: {
              fontFamily: "Open Sans",
              fontSize: "16px",
              color: "rgb(96,96,96)",
            },
            hover: { ...fModuleStyle.meta1.desktop.hover },
          },
          tablet: { ...fModuleStyle.meta1.tablet },
          mobile: { ...fModuleStyle.meta1.mobile },
        },
        meta2: {
          ...fModuleStyle.meta2,
          desktop: {
            ...fModuleStyle.meta2.desktop,
            default: {
              display: "block",
              flexFlow: "unset",
              alignItems: "unset",
              justifyContent: "unset",
              gap: "unset",
              float: "none",
              position: "relative",
              width: "95%",
              height: "8px",
              backgroundColor: "rgb(235,230,231)",
              borderTopLeftRadius: "4px",
              borderTopRightRadius: "4px",
              borderBottomLeftRadius: "4px",
              borderBottomRightRadius: "4px",
              paddingTop: "0px",
              paddingRight: "0px",
              paddingBottom: "0px",
              paddingLeft: "0px",
              boxShadow: "0px 0px 0px 0px #333333",
              marginLeft: "6px"
            },
            hover: { ...fModuleStyle.meta2.desktop.hover },
            active: { ...fModuleStyle.meta2.desktop.active,
              backgroundColor: "rgb(0,0,0)",
             },
          },
          tablet: { ...fModuleStyle.meta2.tablet },
          mobile: { ...fModuleStyle.meta2.mobile },
        },
        meta3: {
          ...fModuleStyle.meta3,
          desktop: {
            ...fModuleStyle.meta3.desktop,
            default: {
              display: "block",
              flexFlow: "unset",
              alignItems: "unset",
              justifyContent: "unset",
              gap: "unset",
              float: "none",
              position: "absolute",
              boxSizing: "border-box",
              width: "25px",
              height: "25px",
              backgroundColor: "rgb(255,255,255)",
              borderTopLeftRadius: "50%",
              borderTopRightRadius: "50%",
              borderBottomLeftRadius: "50%",
              borderBottomRightRadius: "50%",
              borderTopWidth: "3px",
              borderRightWidth: "3px",
              borderBottomWidth: "3px",
              borderLeftWidth: "3px",
              borderTopStyle: "solid",
              borderRightStyle: "solid",
              borderBottomStyle: "solid",
              borderLeftStyle: "solid",
              borderTopColor: "rgb(6,6,6)",
              borderRightColor: "rgb(6,6,6)",
              borderBottomColor: "rgb(6,6,6)",
              borderLeftColor: "rgb(6,6,6)",
              paddingLeft: "0px",
              paddingRight: "0px",
              paddingTop: "0px",
              paddingBottom: "0px",
              marginLeft: "-8px",
              marginRight: "0px",
              marginTop: "-8px",
              marginBottom: "0px",
              boxShadow: "0px 0px 0px 0px #333333"
            },
            hover: { 
              ...fModuleStyle.meta3.desktop.hover,
              borderTopWidth: "3px",
              borderRightWidth: "3px",
              borderBottomWidth: "3px",
              borderLeftWidth: "3px",
              borderTopColor: "rgb(86,86,86)",
              borderRightColor: "rgb(86,86,86)",
              borderBottomColor: "rgb(86,86,86)",
              borderLeftColor: "rgb(86,86,86)",
              borderTopStyle: "solid",
              borderRightStyle: "solid",
              borderBottomStyle: "solid",
              borderLeftStyle: "solid"
             },
          },
          tablet: { ...fModuleStyle.meta3.tablet },
          mobile: { ...fModuleStyle.meta3.mobile },
        },
        meta4: {
          ...fModuleStyle.meta4,
          desktop: {
            ...fModuleStyle.meta4.desktop,
            default: {
              ...fModuleStyle.meta4.desktop.default,
              display: "flex",
              flexFlow: "row",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              gap: "3px",
              float: "none"
            },
          },
        },
        icon: {
          ...fModuleStyle.icon,
          desktop: {
            ...fModuleStyle.icon.desktop,
            default: {
              ...fModuleStyle.icon.desktop.default,
              fontSize: "16px",
              color: "#dd3333"
            },
          },
        },
        icon2: {
          ...fModuleStyle.icon2,
          desktop: {
            ...fModuleStyle.icon2.desktop,
            default: {
              ...fModuleStyle.icon2.desktop.default,
              fontSize: "16px",
              color: "#dd3333"
            },
          },
        },
        icon3: {
          ...fModuleStyle.icon3,
          desktop: {
            ...fModuleStyle.icon3.desktop,
            default: {
              ...fModuleStyle.icon3.desktop.default,
              fontSize: "16px",
              color: "#dd3333"
            },
          },
        },
        selecticon: {
          ...fModuleStyle.selecticon,
          desktop: {
            ...fModuleStyle.selecticon.desktop,
            default: {
              ...fModuleStyle.selecticon.desktop.default,
              fontSize: "16px",
              color: "#dd3333"
            },
          },
        },
        count: {
          ...fModuleStyle.count,
          desktop: {
            ...fModuleStyle.count.desktop,
            default: {
              ...fModuleStyle.count.desktop.default,
              width: "auto",
              height: "auto",
              paddingTop: "0px",
              paddingRight: "0px",
              paddingBottom: "0px",
              paddingLeft: "0px",
              marginTop: "0px",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff00",
              fontFamily: "Open Sans",
              textTransform: "capitalize",
              fontSize: "16px",
            },
          },
        },
      },
      key: "range_slider",
      settings: {
        custom_class: "",
        label: {
          is_label: "true",
          value: "Range Slider",
          icons: {
            visibility: false,
            icon: "",
            position: "before-label",
            type: "icon"
          }
        },
        data_source: "custom_field",
        custom_field_data: [
          {
            custom_field_key: "0",
            custom_field_value_list: [],
            compare_operator: "=",
            meta_type: "CHAR"
          }
        ],
        range_slider: {
          min: 0,
          max: 100,
          step: 1,
          default_values: {
            is_enable: "false"
          },
          prefix: {
            is_enable: "false",
            value: "Prefix"
          },
          suffix: {
            is_enable: "false",
            value: "Suffix"
          }
        },
        visibility: {
          mobile: "false",
          tablet: "false",
          desktop: "false"
        },
        taxonomy_data: [],
        predefined_terms: [],
        cf_predefined_terms: [],
        enable_toggle: "false",
        toggle_position: "right",
        close_toggle: "false",
      }
    },
    {
      type: "module",
      title: "Search",
      style: {
        ...fModuleStyle,
        container: {
          ...fModuleStyle.container,
          desktop: {
            ...fModuleStyle.container.desktop,
            default: {
              ...fModuleStyle.container.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              paddingTop: "10px",
              paddingRight: "0",
              paddingBottom: "0px",
              paddingLeft: "0",
              marginTop: "0",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "rgb(255,255,255)",
              color: "#4c5866",
              fontFamily: "Open Sans",
              fontSize: "14px",
              display: "flex",
              flexFlow: "column",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              gap: "0px",
              float: "none"
            },
          },
        },
        header: {
          ...fModuleStyle.header,
          desktop: {
            ...fModuleStyle.header.desktop,
            default: {
              ...fModuleStyle.header.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              top: "0",
              bottom: "0",
              left: "0",
              right: "0",
              paddingTop: "0px",
              paddingRight: "0",
              paddingBottom: "10px",
              paddingLeft: "0",
              marginTop: "0",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "rgba(255,255,255,0)",
              color: "#000",
              fontFamily: "DM Sans",
              fontWeight: "400",
              fontSize: "20px",
              display: "flex",
              flexFlow: "row"
            },
          },
        },
        input: {
          ...fModuleStyle.input,
          desktop: {
            ...fModuleStyle.input.desktop,
            default: {
              ...fModuleStyle.input.desktop.default,
              width: "100%",
              height: "50px",
              position: "relative",
              paddingTop: "0px",
              paddingRight: "10px",
              paddingBottom: "0px",
              paddingLeft: "10px",
              marginTop: "0",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "rgb(255,255,255)",
              color: "#000",
              fontFamily: "DM Sans",
              fontWeight: "400",
              fontSize: "16px",
              borderTopLeftRadius: "8px",
              borderBottomLeftRadius: "8px",
              borderTopRightRadius: "8px",
              borderBottomRightRadius: "8px",
              borderTopWidth: "2px",
              borderRightWidth: "2px",
              borderBottomWidth: "2px",
              borderLeftWidth: "2px",
              borderTopColor: "rgb(235,230,231)",
              borderRightColor: "rgb(235,230,231)",
              borderBottomColor: "rgb(235,230,231)",
              borderLeftColor: "rgb(235,230,231)",
              borderTopStyle: "solid",
              borderRightStyle: "solid",
              borderBottomStyle: "solid",
              borderLeftStyle: "solid",
              gap: "5px"
            },
            selected: {
                ...fModuleStyle.input.desktop.selected,
                backgroundColor: "rgb(246,247,251)",
                borderTopWidth: "2px",
                borderRightWidth: "2px",
                borderBottomWidth: "2px",
                borderLeftWidth: "2px",
                borderTopColor: "rgb(149,149,149)",
                borderRightColor: "rgb(149,149,149)",
                borderBottomColor: "rgb(149,149,149)",
                borderLeftColor: "rgb(149,149,149)",
                borderTopStyle: "solid",
                borderRightStyle: "solid",
                borderBottomStyle: "solid",
                borderLeftStyle: "solid"
            },
            placeholder: {
            color: "rgb(191,191,191)"
            },
          },
        },
        meta: {
          ...fModuleStyle.meta,
          desktop: {
            ...fModuleStyle.meta.desktop,
            default: {
              ...fModuleStyle.meta.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              paddingTop: "0px",
              paddingRight: "0px",
              paddingBottom: "0px",
              paddingLeft: "0px",
              marginTop: "0",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "rgba(0,0,0,0)",
              fontFamily: "Open Sans",
              textTransform: "capitalize",
              fontSize: "16px",
              color: "#000000",
              display: "flex",
              flexFlow: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "10px",
              float: "none",
              flexWrap: "wrap",
              borderTopLeftRadius: "10px",
              borderTopRightRadius: "10px",
              borderBottomLeftRadius: "10px",
              borderBottomRightRadius: "10px",
              borderTopWidth: "0px",
              borderRightWidth: "0px",
              borderBottomWidth: "0px",
              borderLeftWidth: "0px",
              borderTopColor: "#E91D63",
              borderRightColor: "#E91D63",
              borderBottomColor: "#E91D63",
              borderLeftColor: "#E91D63",
              borderTopStyle: "solid",
              borderRightStyle: "solid",
              borderBottomStyle: "solid",
              borderLeftStyle: "solid"
            },
          },
        },
        mainmeta: {
          ...fModuleStyle.mainmeta,
          desktop: {
            ...fModuleStyle.mainmeta.desktop,
            default: {
              ...fModuleStyle.mainmeta.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              paddingTop: "10px",
              paddingRight: "0",
              paddingBottom: "0",
              paddingLeft: "0",
              marginTop: "0",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff",
              fontFamily: "Open Sans",
              textTransform: "capitalize",
              fontSize: "16px",
              color: "#dd3333",
              display: "flex",
              flexFlow: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "15px",
              float: "none",
              flexWrap: "wrap"
            },
          },
        },
        selectmeta: {
          ...fModuleStyle.selectmeta,
          desktop: {
            ...fModuleStyle.selectmeta.desktop,
            default: {
              ...fModuleStyle.selectmeta.desktop.default,
              width: "100%",
              height: "auto",
              position: "relative",
              paddingTop: "10px",
              paddingRight: "10px",
              paddingBottom: "10px",
              paddingLeft: "10px",
              marginTop: "0px",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff",
              fontFamily: "Open Sans",
              textTransform: "capitalize",
              fontSize: "16px",
              color: "#dd3333",
              display: "flex",
              flexFlow: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0px",
              float: "none",
              borderTopLeftRadius: "6px",
              borderTopRightRadius: "6px",
              borderBottomLeftRadius: "6px",
              borderBottomRightRadius: "6px",
              borderTopColor: "#c6bdbd",
              borderRightColor: "#c6bdbd",
              borderBottomColor: "#c6bdbd",
              borderLeftColor: "#c6bdbd",
              borderTopWidth: "1px",
              borderRightWidth: "1px",
              borderBottomWidth: "1px",
              borderLeftWidth: "1px",
              borderTopStyle: "solid",
              borderRightStyle: "solid",
              borderBottomStyle: "solid",
              borderLeftStyle: "solid"
            },
          },
        },
        meta1: {
          ...fModuleStyle.meta1,
          desktop: {
            ...fModuleStyle.meta1.desktop,
            default: {
              ...fModuleStyle.meta1.desktop.default,
              width: "auto",
              height: "auto",
              position: "relative",
              paddingTop: "0px",
              paddingRight: "0px",
              paddingBottom: "0px",
              paddingLeft: "0px",
              marginTop: "0px",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "unset",
              fontFamily: "Open Sans",
              textTransform: "capitalize",
              fontSize: "16px",
              color: "#dd3333",
              display: "flex",
              flexFlow: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "0px",
              float: "none",
              borderTopLeftRadius: "0px",
              borderTopRightRadius: "0px",
              borderBottomLeftRadius: "0px",
              borderBottomRightRadius: "0px",
              borderTopColor: "#c6bdbd",
              borderRightColor: "#c6bdbd",
              borderBottomColor: "#c6bdbd",
              borderLeftColor: "#c6bdbd",
              borderTopWidth: "0px",
              borderRightWidth: "0px",
              borderBottomWidth: "0px",
              borderLeftWidth: "0px",
              borderTopStyle: "solid",
              borderRightStyle: "solid",
              borderBottomStyle: "solid",
              borderLeftStyle: "solid"
            },
          },
        },
        meta2: {
          ...fModuleStyle.meta2,
          desktop: {
            ...fModuleStyle.meta2.desktop,
            default: {
              ...fModuleStyle.meta2.desktop.default,
              display: "flex",
              flexFlow: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "5px",
              float: "none",
              width: "auto",
              height: "auto",
              position: "relative",
              paddingTop: "0px",
              paddingRight: "0px",
              paddingBottom: "0px",
              paddingLeft: "0px",
              marginTop: "0px",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "unset",
              fontFamily: "Open Sans",
              textTransform: "capitalize",
              fontSize: "16px",
              color: "#dd3333",
              borderTopLeftRadius: "0px",
              borderTopRightRadius: "0px",
              borderBottomLeftRadius: "0px",
              borderBottomRightRadius: "0px",
              borderTopColor: "#c6bdbd",
              borderRightColor: "#c6bdbd",
              borderBottomColor: "#c6bdbd",
              borderLeftColor: "#c6bdbd",
              borderTopWidth: "0px",
              borderRightWidth: "0px",
              borderBottomWidth: "0px",
              borderLeftWidth: "0px",
              borderTopStyle: "solid",
              borderRightStyle: "solid",
              borderBottomStyle: "solid",
              borderLeftStyle: "solid"
            },
          },
        },
        meta3: {
          ...fModuleStyle.meta3,
          desktop: {
            ...fModuleStyle.meta3.desktop,
            default: {
              ...fModuleStyle.meta3.desktop.default,
              display: "flex",
              flexFlow: "row",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              gap: "3px",
              float: "none"
            },
          },
        },
        meta4: {
          ...fModuleStyle.meta4,
          desktop: {
            ...fModuleStyle.meta4.desktop,
            default: {
              ...fModuleStyle.meta4.desktop.default,
              display: "flex",
              flexFlow: "row",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              gap: "3px",
              float: "none"
            },
          },
        },
        icon: {
          ...fModuleStyle.icon,
          desktop: {
            ...fModuleStyle.icon.desktop,
            default: {
              ...fModuleStyle.icon.desktop.default,
              fontSize: "18px",
              color: "rgb(96,96,96)",
              paddingBottom: "0px",
              paddingTop: "0px",
              paddingRight: "0px",
              paddingLeft: "0px",
              display: "flex",
              gap: "0px",
              marginRight: "0px"
            },
          },
        },
        icon2: {
          ...fModuleStyle.icon2,
          desktop: {
            ...fModuleStyle.icon2.desktop,
            default: {
              ...fModuleStyle.icon2.desktop.default,
              fontSize: "18px",
              color: "rgb(20,134,0)",
              paddingBottom: "0px",
              paddingTop: "0px",
              paddingRight: "0px",
              paddingLeft: "0px"
            },
          },
        },
        icon3: {
          ...fModuleStyle.icon3,
          desktop: {
            ...fModuleStyle.icon3.desktop,
            default: {
              ...fModuleStyle.icon3.desktop.default,
              fontSize: "18px",
              color: "rgb(96,96,96)",
              paddingTop: "0px",
              paddingBottom: "0px",
              paddingLeft: "0px",
              paddingRight: "0px"
            },
          },
        },
        selecticon: {
          ...fModuleStyle.selecticon,
          desktop: {
            ...fModuleStyle.selecticon.desktop,
            default: {
              ...fModuleStyle.selecticon.desktop.default,
              fontSize: "16px",
              color: "#dd3333"
            },
          },
        },
        count: {
          ...fModuleStyle.count,
          desktop: {
            ...fModuleStyle.count.desktop,
            default: {
              ...fModuleStyle.count.desktop.default,
              width: "auto",
              height: "auto",
              paddingTop: "0px",
              paddingRight: "0px",
              paddingBottom: "0px",
              paddingLeft: "0px",
              marginTop: "0px",
              marginRight: "0",
              marginBottom: "0",
              marginLeft: "0",
              backgroundColor: "#ffffff00",
              fontFamily: "Open Sans",
              textTransform: "capitalize",
              fontSize: "16px",
            },
          },
        },
      },
      key: "search",
      settings: {
        search_label: "Search",
        search_placeholder: "Search...",
        search_trigger: "enter_icon",
        smart_ai_search: {
          is_enable: "false"
        },
        keyword_search: {
          is_enable: "true"
        },
        custom_field: "0",
        char_limit: {
          is_enable: "false",
          limit: "3"
        },
        source: {
          everything: false,
          title: true,
          descriptions: false,
          custom_field: false
        },
        search_icon: {
          is_enable: "true",
          position: "left",
          icon: "",
          type: "icon"
        },
        voice_icon: {
          is_enable: "true",
          position: "right",
          icon: "",
          type: "icon",
          placeholder: "Listening Now..."
        },
        clear_icon: {
          is_enable: "true",
          position: "right",
          icon: "",
          type: "icon",
          visibility: "type"
        },
        custom_class: "",
        admin_label: "",
        label: {
          is_label: "true",
          value: "Label",
          icons: {
            visibility: false,
            icon: "",
            position: "before-label",
            type: "icon"
          }
        },
        enable_toggle: "false",
        toggle_position: "right",
        close_toggle: "false",
        visibility: {
          mobile: "false",
          tablet: "false",
          desktop: "false"
        },
        taxonomy_data: [],
        predefined_terms: [],
        cf_predefined_terms: []
      },
    },
    ...(canUseProductPostType()
      ? [
          {
            type: "module",
            title: "Star rating",
            style: {
              ...fModuleStyle,
              container: {
                ...fModuleStyle.container,
                desktop: {
                  ...fModuleStyle.container.desktop,
                  default: {
                    ...fModuleStyle.container.desktop.default,
                    width: "100%",
                    height: "auto",
                    position: "relative",
                    paddingTop: "10px",
                    paddingRight: "0",
                    paddingBottom: "0",
                    paddingLeft: "0",
                    marginTop: "0",
                    marginRight: "0",
                    marginBottom: "0",
                    marginLeft: "0",
                    backgroundColor: "rgba(255,255,255,0)",
                    color: "#4c5866",
                    fontFamily: "Open Sans",
                    fontSize: "14px",
                    display: "flex",
                    flexFlow: "column",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    gap: "0px",
                    float: "none",
                    boxShadow: "0px 0px 0px 0px  #333333",
                    top: "auto",
                    right: "auto",
                    bottom: "auto",
                    left: "auto",
                  },
                },
              },
              header: {
                ...fModuleStyle.header,
                desktop: {
                  ...fModuleStyle.header.desktop,
                  default: {
                    ...fModuleStyle.header.desktop.default,
                    width: "100%",
                    height: "auto",
                    position: "relative",
                    top: "0",
                    bottom: "0",
                    left: "0",
                    right: "0",
                    paddingTop: "0px",
                    paddingRight: "0",
                    paddingBottom: "10px",
                    paddingLeft: "0",
                    marginTop: "0",
                    marginRight: "0",
                    marginBottom: "0",
                    marginLeft: "0",
                    backgroundColor: "rgba(255,255,255,0)",
                    color: "#000",
                    fontFamily: "DM Sans",
                    fontWeight: "400",
                    fontSize: "20px",
                    boxShadow: "0px 0px 0px 0px  #333333",
                    display: "flex",
                  },
                },
              },
              // No checkbox UI — neutralize inherited checkbox input styles.
              input: {
                desktop: { default: {}, hover: {}, selected: {}, placeholder: {} },
                tablet: { default: {}, hover: {}, selected: {}, placeholder: {} },
                mobile: { default: {}, hover: {}, selected: {}, placeholder: {} },
              },
              meta: {
                ...fModuleStyle.meta,
                desktop: {
                  ...fModuleStyle.meta.desktop,
                  default: {
                    ...fModuleStyle.meta.desktop.default,
                    width: "100%",
                    height: "auto",
                    position: "relative",
                    paddingTop: "0px",
                    paddingRight: "0",
                    paddingBottom: "0",
                    paddingLeft: "0",
                    marginTop: "0",
                    marginRight: "0",
                    marginBottom: "0",
                    marginLeft: "0",
                    backgroundColor: "rgba(255,255,255,0)",
                    fontFamily: "Open Sans",
                    fontSize: "16px",
                    color: "#333333",
                    display: "flex",
                    flexFlow: "column",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    gap: "8px",
                    float: "none",
                    flexWrap: "nowrap",
                    boxShadow: "0px 0px 0px 0px  #333333",
                  },
                },
              },
              // Star rows — no card/border chrome from checkbox items.
              meta1: {
                desktop: {
                  default: {
                    width: "auto",
                    height: "auto",
                    position: "relative",
                    paddingTop: "0px",
                    paddingRight: "0",
                    paddingBottom: "0px",
                    paddingLeft: "0",
                    marginTop: "0px",
                    marginRight: "0",
                    marginBottom: "0",
                    marginLeft: "0",
                    backgroundColor: "rgba(255,255,255,0)",
                    fontFamily: "DM Sans",
                    fontSize: "16px",
                    color: "rgb(3,3,3)",
                    display: "flex",
                    flexFlow: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: "0px",
                    float: "none",
                    borderTopLeftRadius: "0px",
                    borderTopRightRadius: "0px",
                    borderBottomLeftRadius: "0px",
                    borderBottomRightRadius: "0px",
                    borderTopWidth: "0px",
                    borderRightWidth: "0px",
                    borderBottomWidth: "0px",
                    borderLeftWidth: "0px",
                    borderTopStyle: "none",
                    borderRightStyle: "none",
                    borderBottomStyle: "none",
                    borderLeftStyle: "none",
                    borderTopColor: "rgba(255,255,255,0)",
                    borderRightColor: "rgba(255,255,255,0)",
                    borderBottomColor: "rgba(255,255,255,0)",
                    borderLeftColor: "rgba(255,255,255,0)",
                    boxShadow: "0px 0px 0px 0px  #333333",
                  },
                  hover: {},
                  selected: {},
                },
                tablet: { default: {}, hover: {}, selected: {} },
                mobile: { default: {}, hover: {}, selected: {} },
              },
              meta2: {
                ...fModuleStyle.meta2,
                desktop: {
                  ...fModuleStyle.meta2.desktop,
                  default: {
                    ...fModuleStyle.meta2.desktop.default,
                    display: "flex",
                    flexFlow: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: "0.15em",
                    float: "none",
                  },
                },
              },
              meta3: {
                desktop: { default: {}, hover: {}, selected: {} },
                tablet: { default: {}, hover: {}, selected: {} },
                mobile: { default: {}, hover: {}, selected: {} },
              },
              icon: {
                ...fModuleStyle.icon,
                ...getWooRatingIconStyleDefaults(),
                desktop: {
                  ...fModuleStyle.icon.desktop,
                  ...getWooRatingIconStyleDefaults().desktop,
                  default: {
                    ...fModuleStyle.icon.desktop.default,
                    ...getWooRatingIconStyleDefaults().desktop.default,
                  },
                  hover: {
                    ...getWooRatingIconStyleDefaults().desktop.hover,
                  },
                  selected: {
                    ...getWooRatingIconStyleDefaults().desktop.selected,
                  },
                },
              },
            },
            key: "woo_rating_filter",
            settings: {
              custom_class: "",
              admin_label: "",
              label: {
                is_label: "true",
                value: "Star rating",
                icons: {
                  visibility: false,
                  icon: "",
                  position: "before-label",
                  type: "icon",
                },
              },
              show_checkbox: "false",
              show_icon: "false",
              show_count: "false",
              multiple_term: "false",
              enable_toggle: "false",
              toggle_position: "right",
              close_toggle: "false",
              rating_display: "stars",
              star_count: String(WOO_RATING_STAR_COUNT_DEFAULT),
              rating_compare: RATING_COMPARE_DEFAULT,
              default_value: "",
              visibility: {
                mobile: "false",
                tablet: "false",
                desktop: "false",
              },
            },
          },
        ]
      : []),
  ];

  const [searchValue, setSearchValue] = useState("");
  const [modules, setModules] = useState([...initialModules]);
  const handleModuleSearch = (event) => {
    let value = event.target.value;
    setSearchValue(value);
    let newArray = initialModules.filter(function (item) {
      return item.title
        .toString()
        .toLowerCase()
        .includes(value.toString().toLowerCase());
    });
    setModules([...newArray]);
  };
  const selectModuleImage = (key) => {
    return titleImgTitle;
  };

  const filterModules = modules.filter((item) => !isWooPickerModule(item.key));
  const wooModules = modules.filter((item) => isWooPickerModule(item.key));

  const renderModuleItem = (item) => {
    const moduleLocked = isModuleLocked(item.key, "filter");
    const moduleContent = (
      <>
        <FilterModulePickerIcon moduleKey={item.key} />
        <div>
          {item.title}
          {moduleLocked ? (
            <span className="caf-builder-tier-locked-wrap__badge caf-filter-module-picker-pro-badge">
              Pro
            </span>
          ) : null}
        </div>
      </>
    );

    return (
      <li
        key={item.key}
        className={`caf-filter-select-module-pop-up${
          moduleLocked ? " caf-builder-tier-locked-module-picker-item" : ""
        }`}
        onClick={() => {
          if (!moduleLocked) {
            props.onSelectModule(item);
          }
        }}
      >
        {moduleLocked ? (
          <Tooltip
            classNames={{
              root: "caf-builder-tooltip caf-builder-tier-locked-tooltip",
            }}
            placement="topLeft"
            title={
              <span className="caf-builder-tier-locked-section__tooltip-text">
                {item.title} is available in Category Ajax Filter Pro.{" "}
                <a
                  href={getUpgradeUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="caf-builder-tier-locked-section__upgrade-link"
                >
                  Upgrade to Pro
                </a>
              </span>
            }
          >
            <div className="caf-builder-tier-locked-module-picker-item__inner">
              {moduleContent}
            </div>
          </Tooltip>
        ) : (
          moduleContent
        )}
      </li>
    );
  };

  return (
    <div className="setting-popup-overlay-wrapper new-module">
      <div className={`setting-popup ${props?.animation}`}>
        <div className="setting-popup-title-bar">
         
          <div className="setting-popup-title">
            Choose Module
          </div>
          <div className="closeSettingPop" onClick={props.closeNewModulePopup}>
            <CloseCircleOutlined />
          </div>
        </div>
        <div className="new-modules-container">
          <div className="module-search-bar">
            <Input
              placeholder="Search module"
              value={searchValue}
              onChange={handleModuleSearch}
            />
          </div>
          <ul className="new-modules-items">
            {filterModules.map(renderModuleItem)}
            {wooModules.length > 0 ? (
              <>
                <li
                  style={{
                    ...MODULE_SECTION_LABEL_STYLE,
                    paddingTop: filterModules.length > 0 ? "10px" : "2px",
                  }}
                >
                  Woo Modules
                </li>
                {wooModules.map(renderModuleItem)}
              </>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NewModulePopUp;
