import React, { useState } from "react";
import { Input, Tooltip } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import { moduleStyle } from "./styleData";
import PostModulePickerIcon from "./PostModulePickerIcon";
import {
  getUpgradeUrl,
  isModuleLocked,
  canUseProductPostType,
} from "../../../tier/capabilities";
import { getWooAttributeSwatchModuleTemplate } from "./woocommerce/wooAttributeSwatchTemplate";

const getWooProductImageModuleTemplate = () => ({
  type: "module",
  title: "Product Image",
  key: "woo_product_image",
  style: {
    ...moduleStyle,
    desktop: {
      ...moduleStyle.desktop,
      default: {
        ...moduleStyle.desktop.default,
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
        backgroundColor: "#00000000",
        color: "#4c5866",
        fontFamily: "Open Sans",
        fontSize: "14px",
        flexBasis: "auto",
        justifyContent: "flex-start",
        boxShadow: "0px 0px 0px 0px #333333",
        top: "auto",
        right: "auto",
        bottom: "auto",
        left: "auto",
        width: "100%",
        borderTopLeftRadius: "20px",
        borderTopRightRadius: "20px",
      },
    },
  },
  settings: {
    background_image: "",
    image_size: "medium_large",
    custom_class: "",
    admin_label: "",
    placeholder_image: "",
    image_source: "featured_image",
    custom_field: "0",
    gallery_image_limit: "2",
    auto_scroll: "false",
    auto_scroll_delay: "1000",
    link: {
      condition: false,
      customlink: "",
      target: "same-tab",
      type: "post-url",
      visibility: false,
      custom_field: "0",
    },
    visibility: {
      mobile: "false",
      tablet: "false",
      desktop: "false",
    },
  },
});

const getWooProductPriceModuleTemplate = () => ({
  type: "module",
  title: "Product Price",
  key: "product_price",
  style: {
    ...moduleStyle,
    desktop: {
      ...moduleStyle.desktop,
      default: {
        ...moduleStyle.desktop.default,
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
        fontSize: "24px",
        flexBasis: "auto",
        justifyContent: "flex-start",
        boxShadow: "0px 0px 0px 0px #333333",
        top: "auto",
        right: "auto",
        bottom: "auto",
        left: "auto",
        fontWeight: "700",
        width: "100%",
      },
    },
    mobile: {
      ...moduleStyle.mobile,
      default: {
        ...moduleStyle.mobile.default,
        fontSize: "18px",
      },
    },
    meta: {
      ...moduleStyle?.meta,
      desktop: {
        ...moduleStyle?.meta?.desktop,
        default: {
          ...moduleStyle?.meta?.desktop?.default,
          display: "flex",
          justifyContent: "flex-start",
          gap: "0px",
          flexFlow: "row",
        },
      },
    },
    prefix: {
      ...moduleStyle?.prefix,
      desktop: {
        ...moduleStyle?.prefix?.desktop,
        default: {
          ...moduleStyle?.prefix?.desktop?.default,
          boxShadow: "0px 0px 0px 0px #333333",
          width: "auto",
          height: "auto",
        },
      },
    },
    suffix: {
      ...moduleStyle?.suffix,
      desktop: {
        ...moduleStyle?.suffix?.desktop,
        default: {
          ...moduleStyle?.suffix?.desktop?.default,
          boxShadow: "0px 0px 0px 0px #333333",
          width: "auto",
          height: "auto",
        },
      },
    },
  },
  settings: {
    background_image: "",
    custom_class: "",
    admin_label: "",
    show_price: "default",
    prefix: {
      is_enable: "false",
      meta_type: "regular_price",
      meta_text: "Prefix",
      text_visibility: "all",
      icons: {
        visibility: false,
        icon: "",
        type: "icon",
      },
    },
    suffix: {
      is_enable: "false",
      meta_type: "regular_price",
      meta_text: "Suffix",
      text_visibility: "all",
      icons: {
        visibility: false,
        icon: "",
        type: "icon",
      },
    },
    visibility: {
      mobile: "false",
      tablet: "false",
      desktop: "false",
    },
  },
});

const getWooProductRatingModuleTemplate = () => ({
  type: "module",
  title: "Product Rating",
  key: "woo_product_rating",
  style: {
    ...moduleStyle,
    desktop: {
      ...moduleStyle.desktop,
      default: {
        ...moduleStyle.desktop.default,
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
        fontSize: "24px",
        flexBasis: "auto",
        justifyContent: "flex-start",
        boxShadow: "0px 0px 0px 0px #333333",
        top: "auto",
        right: "auto",
        bottom: "auto",
        left: "auto",
        fontWeight: "700",
        width: "100%",
      },
    },
    mobile: {
      ...moduleStyle.mobile,
      default: {
        ...moduleStyle.mobile.default,
        fontSize: "18px",
      },
    },
    meta: {
      ...moduleStyle?.meta,
      desktop: {
        ...moduleStyle?.meta?.desktop,
        default: {
          ...moduleStyle?.meta?.desktop?.default,
          display: "flex",
          justifyContent: "flex-start",
          gap: "0px",
          flexFlow: "row",
        },
      },
    },
    prefix: {
      ...moduleStyle?.prefix,
      desktop: {
        ...moduleStyle?.prefix?.desktop,
        default: {
          ...moduleStyle?.prefix?.desktop?.default,
          boxShadow: "0px 0px 0px 0px #333333",
          width: "auto",
          height: "auto",
        },
      },
    },
    suffix: {
      ...moduleStyle?.suffix,
      desktop: {
        ...moduleStyle?.suffix?.desktop,
        default: {
          ...moduleStyle?.suffix?.desktop?.default,
          boxShadow: "0px 0px 0px 0px #333333",
          width: "auto",
          height: "auto",
        },
      },
    },
  },
  settings: {
    background_image: "",
    custom_class: "",
    admin_label: "",
    rating_display: "stars",
    prefix: {
      is_enable: "false",
      meta_type: "text",
      meta_text: "Prefix",
      count_separator: "none",
      icons: {
        visibility: false,
        icon: "",
        type: "icon",
      },
    },
    suffix: {
      is_enable: "false",
      meta_type: "text",
      meta_text: "Suffix",
      count_separator: "none",
      icons: {
        visibility: false,
        icon: "",
        type: "icon",
      },
    },
    visibility: {
      mobile: "false",
      tablet: "false",
      desktop: "false",
    },
  },
});

const getWooAddToCartModuleTemplate = () => ({
  type: "module",
  title: "Add to Cart",
  key: "woo_add_to_cart",
  style: {
    ...moduleStyle,
    desktop: {
      ...moduleStyle.desktop,
      default: {
        ...moduleStyle.desktop.default,
        boxShadow: "0px 0px 0px 0px  #333333",
        top: "auto",
        right: "auto",
        bottom: "auto",
        left: "auto",
        fontFamily: "DM Sans",
        color: "rgb(247,247,247)",
        fontSize: "16px",
        display: "flex",
        gap: "8px",
        backgroundColor: "rgb(96,96,96)",
        width: "auto",
        height: "auto",
        paddingTop: "15px",
        paddingBottom: "15px",
        paddingLeft: "25px",
        paddingRight: "25px",
        borderTopLeftRadius: "8px",
        borderTopRightRadius: "8px",
        borderBottomLeftRadius: "8px",
        borderBottomRightRadius: "8px",
        marginTop: "10px",
      },
      hover: {
        ...moduleStyle.desktop.hover,
        backgroundColor: "rgb(0,0,0)",
      },
    },
    mobile: {
      ...moduleStyle.mobile,
      default: {
        ...moduleStyle.mobile.default,
        paddingTop: "10px",
        paddingBottom: "10px",
        paddingLeft: "20px",
        paddingRight: "20px",
        fontSize: "14px",
      },
    },
    meta: {
      ...moduleStyle?.meta,
      desktop: {
        ...moduleStyle?.meta?.desktop,
        default: {
          ...moduleStyle?.meta?.desktop?.default,
          display: "flex",
          justifyContent: "flex-start",
          gap: "0px",
          flexFlow: "row",
        },
      },
    },
    prefix: {
      ...moduleStyle?.prefix,
      desktop: {
        ...moduleStyle?.prefix?.desktop,
        default: {
          ...moduleStyle?.prefix?.desktop?.default,
          boxShadow: "0px 0px 0px 0px #333333",
          width: "auto",
          height: "auto",
        },
      },
    },
    suffix: {
      ...moduleStyle?.suffix,
      desktop: {
        ...moduleStyle?.suffix?.desktop,
        default: {
          ...moduleStyle?.suffix?.desktop?.default,
          boxShadow: "0px 0px 0px 0px #333333",
          width: "auto",
          height: "auto",
        },
      },
    },
  },
  settings: {
    background_image: "",
    custom_class: "",
    admin_label: "",
    changeButtonValue: "Add to cart",
    button_text_mode: "woo_default",
    button_text_type_key: "simple",
    button_text_by_type: {
      simple: "Add to cart",
      variable: "Select options",
      grouped: "View products",
      external: "Buy product",
      subscription: "Subscribe",
    },
    button_icon: {
      icons: {
        visibility: true,
        icon: "fas fa-shopping-cart",
        type: "icon",
        position: "before-button",
      },
    },
    atc_behaviour: "ajax",
    after_atc: "none",
    after_atc_text: "Added",
    link: {
      visibility: true,
      type: "post-url",
      customlink: "",
      target: "same-tab",
      custom_field: "0",
    },
    prefix: {
      is_enable: "false",
      meta_type: "text",
      meta_text: "Prefix",
      icons: {
        visibility: false,
        icon: "",
        type: "icon",
      },
    },
    suffix: {
      is_enable: "false",
      meta_type: "icon",
      meta_text: "Suffix",
      icons: {
        visibility: false,
        icon: "fas fa-shopping-cart",
        type: "icon",
      },
    },
    visibility: {
      mobile: "false",
      tablet: "false",
      desktop: "false",
    },
  },
});

const getBadgesModuleTemplate = () => ({
  type: "module",
  title: "Badges",
  key: "badges",
  style: {
    ...moduleStyle,
    desktop: {
      ...moduleStyle.desktop,
      default: {
        ...moduleStyle.desktop.default,
        boxShadow: "0px 0px 0px 0px  #333333",
        top: "auto",
        right: "auto",
        bottom: "auto",
        left: "auto",
        fontFamily: "DM Sans",
        color: "rgb(255,255,255)",
        fontSize: "12px",
        display: "flex",
        gap: "6px",
        backgroundColor: "rgb(255,90,90)",
        width: "auto",
        height: "auto",
        paddingTop: "6px",
        paddingBottom: "6px",
        paddingLeft: "12px",
        paddingRight: "12px",
        borderTopLeftRadius: "4px",
        borderTopRightRadius: "4px",
        borderBottomLeftRadius: "4px",
        borderBottomRightRadius: "4px",
        marginTop: "0",
      },
      hover: {
        ...moduleStyle.desktop.hover,
        backgroundColor: "rgb(220,60,60)",
      },
    },
    mobile: {
      ...moduleStyle.mobile,
      default: {
        ...moduleStyle.mobile.default,
        paddingTop: "5px",
        paddingBottom: "5px",
        paddingLeft: "10px",
        paddingRight: "10px",
        fontSize: "11px",
      },
    },
    meta: {
      ...moduleStyle?.meta,
      desktop: {
        ...moduleStyle?.meta?.desktop,
        default: {
          ...moduleStyle?.meta?.desktop?.default,
          display: "flex",
          justifyContent: "flex-start",
          gap: "0px",
          flexFlow: "row",
        },
      },
    },
    prefix: {
      ...moduleStyle?.prefix,
      desktop: {
        ...moduleStyle?.prefix?.desktop,
        default: {
          ...moduleStyle?.prefix?.desktop?.default,
          boxShadow: "0px 0px 0px 0px #333333",
          width: "auto",
          height: "auto",
        },
      },
    },
    suffix: {
      ...moduleStyle?.suffix,
      desktop: {
        ...moduleStyle?.suffix?.desktop,
        default: {
          ...moduleStyle?.suffix?.desktop?.default,
          boxShadow: "0px 0px 0px 0px #333333",
          width: "auto",
          height: "auto",
        },
      },
    },
  },
  settings: {
    background_image: "",
    custom_class: "",
    admin_label: "",
    badge_type: "sale",
    badge_settings: {
      sale: {
        text_source: "default",
        custom_text: "Sale",
      },
      featured: {
        text_source: "default",
        custom_text: "Featured",
      },
      new: {
        text_source: "default",
        custom_text: "New",
        condition: "default",
        days: 30,
      },
      stock_status_text: {
        display: "current",
        text_source: "default",
        custom_text: "In stock",
      },
      stock_quantity: {
        low_stock_threshold_enable: "false",
        show_when_quantity: 5,
      },
      discount: {
        discount_type: "percentage",
      },
      best_seller: {
        text_source: "default",
        custom_text: "Best Seller",
        min_sale: "default",
        min_sale_count: 1,
      },
    },
    prefix: {
      is_enable: "false",
      meta_type: "text",
      meta_text: "Prefix",
      icons: {
        visibility: false,
        icon: "",
        type: "icon",
      },
    },
    suffix: {
      is_enable: "false",
      meta_type: "text",
      meta_text: "Suffix",
      icons: {
        visibility: false,
        icon: "",
        type: "icon",
      },
    },
    visibility: {
      mobile: "false",
      tablet: "false",
      desktop: "false",
    },
  },
});

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

const NewModulePopUp = (props) => {
  const isWooPickerModule = (moduleKey) =>
    moduleKey === "woo_product_image" ||
    moduleKey === "product_price" ||
    moduleKey === "woo_product_rating" ||
    moduleKey === "woo_add_to_cart" ||
    moduleKey === "woo_attribute_swatch" ||
    moduleKey === "badges";
  //console.log(props);
  const initialModules = [
    {
      type: "module",
      title: "Post Image",
      style: {
        ...moduleStyle,
        desktop: {
          ...moduleStyle.desktop,
          default: {
            ...moduleStyle.desktop.default,
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
            backgroundColor: "#00000000",
            color: "#4c5866",
            fontFamily: "Open Sans",
            fontSize: "14px",
            flexBasis: "auto",
            justifyContent: "flex-start",
            boxShadow: "0px 0px 0px 0px #333333",
            top: "auto",
            right: "auto",
            bottom: "auto",
            left: "auto",
            width: "100%",
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
          },
        },
      },
      key: "image",
      settings: {
        background_image: "",
        image_size: "medium_large",
        custom_class: "",
        admin_label: "",
        placeholder_image: "",
        image_source: "featured_image",
        custom_field: "0",
        link: {
          condition: false,
          customlink: "",
          target: "same-tab",
          type: "post-url",
          visibility: false,
          custom_field: "0",
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
      title: "Post Author",
      style: {
        ...moduleStyle,
        desktop: {
          ...moduleStyle.desktop,
          default: {
            ...moduleStyle.desktop.default,
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
            color: "rgb(144,144,144)",
            fontFamily: "DM Sans",
            fontSize: "14px",
            flexBasis: "auto",
            justifyContent: "flex-start",
            boxShadow: "0px 0px 0px 0px #333333",
            top: "auto",
            right: "auto",
            bottom: "auto",
            left: "auto",
            display: "flex",
            gap: "5px",
            fontStyle: "normal",
            textTransform: "capitalize",
            textDecoration: "inherit",
            width: "auto",
          },
        },
        mobile: {
          ...moduleStyle.mobile,
          default: {
            ...moduleStyle.mobile.default,
            fontSize: "12px",
          },
        },
        meta: {
          ...moduleStyle?.meta,
          desktop: {
            ...moduleStyle?.meta?.desktop,
            default: {
              ...moduleStyle?.meta?.desktop?.default,
              display: "flex",
              justifyContent: "flex-start",
              gap: "5px",
              flexFlow: "row",
            },
          },
        },
        prefix: {
          ...moduleStyle?.prefix,
          desktop: {
            ...moduleStyle?.prefix?.desktop,
            default: {
              ...moduleStyle?.prefix?.desktop?.default,
              boxShadow: "0px 0px 0px 0px #333333",
              width: "auto",
              height: "auto",
              paddingTop: "0px",
              paddingBottom: "0px",
              paddingRight: "0px",
              paddingLeft: "0px",
            },
          },
        },
        suffix: {
          ...moduleStyle?.suffix,
          desktop: {
            ...moduleStyle?.suffix?.desktop,
            default: {
              ...moduleStyle?.suffix?.desktop?.default,
              boxShadow: "0px 0px 0px 0px #333333",
              width: "auto",
              height: "auto",
              paddingTop: "0px",
              paddingBottom: "0px",
              paddingRight: "0px",
              paddingLeft: "0px",
            },
          },
        },
      },
      key: "author",
      settings: {
        background_image: "",
        icons: {
          visibility: true,
          icon: "far fa-user",
          position: "before-author",
          type: "icon",
        },
        avatar_status: "true",
        avatar_type: "default",
        custom_class: "",
        admin_label: "",
        prefix: {
          is_enable: "true",
          meta_type: "text",
          meta_text: "By",
          icons: {
            visibility: true,
            icon: "fas fa-tag",
            type: "icon",
          },
        },
        suffix: {
          is_enable: "false",
          meta_type: "icon",
          meta_text: "Suffix",
          icons: {
            visibility: true,
            icon: "fas fa-tag",
            type: "icon",
          },
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
      title: "Post Date",
      style: {
        ...moduleStyle,
        desktop: {
          ...moduleStyle.desktop,
          default: {
            ...moduleStyle.desktop.default,
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
            color: "rgb(144,144,144)",
            fontFamily: "DM Sans",
            fontSize: "14px",
            flexBasis: "auto",
            justifyContent: "flex-start",
            boxShadow: "0px 0px 0px 0px #333333",
            top: "auto",
            right: "auto",
            bottom: "auto",
            left: "auto",
            width: "auto",
            display: "flex",
            gap: "5px",
          },
        },
        mobile: {
          ...moduleStyle.mobile,
          default: {
            ...moduleStyle.mobile.default,
            fontSize: "12px",
          },
        },
        meta: {
          ...moduleStyle?.meta,
          desktop: {
            ...moduleStyle?.meta?.desktop,
            default: {
              ...moduleStyle?.meta?.desktop?.default,
              display: "flex",
              justifyContent: "flex-start",
              gap: "5px",
              flexFlow: "row",
            },
          },
        },
        prefix: {
          ...moduleStyle?.prefix,
          desktop: {
            ...moduleStyle?.prefix?.desktop,
            default: {
              ...moduleStyle?.prefix?.desktop?.default,
              boxShadow: "0px 0px 0px 0px #333333",
              width: "auto",
              height: "auto",
              paddingTop: "0px",
              paddingBottom: "0px",
              paddingRight: "0px",
              paddingLeft: "0px",
            },
          },
        },
        suffix: {
          ...moduleStyle?.suffix,
          desktop: {
            ...moduleStyle?.suffix?.desktop,
            default: {
              ...moduleStyle?.suffix?.desktop?.default,
              boxShadow: "0px 0px 0px 0px #333333",
              width: "auto",
              height: "auto",
              paddingTop: "0px",
              paddingBottom: "0px",
              paddingRight: "0px",
              paddingLeft: "0px",
            },
          },
        },
      },
      key: "date",
      settings: {
        background_image: "",
        custom_class: "",
        admin_label: "",
        date_format: "F j, Y",
        prefix: {
          is_enable: "false",
          meta_type: "text",
          meta_text: "Prefix",
          icons: {
            visibility: false,
            icon: "",
            type: "icon",
          },
        },
        suffix: {
          is_enable: "false",
          meta_type: "text",
          meta_text: "Suffix",
          icons: {
            visibility: false,
            icon: "",
            type: "icon",
          },
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
      title: "Comment Count",
      style: {
        ...moduleStyle,
        desktop: {
          ...moduleStyle.desktop,
          default: {
            ...moduleStyle.desktop.default,
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
            color: "rgb(144,144,144)",
            fontFamily: "DM Sans",
            fontSize: "14px",
            flexBasis: "auto",
            justifyContent: "flex-start",
            boxShadow: "0px 0px 0px 0px #333333",
            top: "auto",
            right: "auto",
            bottom: "auto",
            left: "auto",
            display: "flex",
            gap: "5px",
            width: "auto",
          },
        },
        mobile: {
          ...moduleStyle.mobile,
          default: {
            ...moduleStyle.mobile.default,
            fontSize: "12px",
          },
        },
        meta: {
          ...moduleStyle?.meta,
          desktop: {
            ...moduleStyle?.meta?.desktop,
            default: {
              ...moduleStyle?.meta?.desktop?.default,
              display: "flex",
              justifyContent: "flex-start",
              gap: "5px",
              flexFlow: "row",
            },
          },
        },
        prefix: {
          ...moduleStyle?.prefix,
          desktop: {
            ...moduleStyle?.prefix?.desktop,
            default: {
              ...moduleStyle?.prefix?.desktop?.default,
              boxShadow: "0px 0px 0px 0px #333333",
              width: "auto",
              height: "auto",
              paddingTop: "0px",
              paddingBottom: "0px",
              paddingRight: "0px",
              paddingLeft: "0px",
            },
          },
        },
        suffix: {
          ...moduleStyle?.suffix,
          desktop: {
            ...moduleStyle?.suffix?.desktop,
            default: {
              ...moduleStyle?.suffix?.desktop?.default,
              boxShadow: "0px 0px 0px 0px #333333",
              width: "auto",
              height: "auto",
              paddingTop: "0px",
              paddingBottom: "0px",
              paddingRight: "0px",
              paddingLeft: "0px",
            },
          },
        },
      },
      key: "commentcount",
      settings: {
        background_image: "",
        custom_class: "",
        admin_label: "",
        prefix: {
          is_enable: "false",
          meta_type: "text",
          meta_text: "Prefix",
          icons: {
            visibility: false,
            icon: "",
            type: "icon",
          },
        },
        suffix: {
          is_enable: "true",
          meta_type: "text",
          meta_text: "Comments",
          icons: {
            visibility: false,
            icon: "",
            type: "icon",
          },
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
      title: "Post Title",
      style: {
        ...moduleStyle,
        desktop: {
          ...moduleStyle.desktop,
          default: {
            ...moduleStyle.desktop.default,
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
            fontSize: "24px",
            flexBasis: "auto",
            justifyContent: "flex-start",
            boxShadow: "0px 0px 0px 0px #333333",
            top: "auto",
            right: "auto",
            bottom: "auto",
            left: "auto",
            fontWeight: "700",
            width: "100%",
          },
        },
        mobile: {
          ...moduleStyle.mobile,
          default: {
            ...moduleStyle.mobile.default,
            fontSize: "18px",
          },
        },
        meta: {
          ...moduleStyle?.meta,
          desktop: {
            ...moduleStyle?.meta?.desktop,
            default: {
              ...moduleStyle?.meta?.desktop?.default,
              display: "flex",
              justifyContent: "flex-start",
              gap: "0px",
              flexFlow: "row",
            },
          },
        },
        prefix: {
          ...moduleStyle?.prefix,
          desktop: {
            ...moduleStyle?.prefix?.desktop,
            default: {
              ...moduleStyle?.prefix?.desktop?.default,
              boxShadow: "0px 0px 0px 0px #333333",
              width: "auto",
              height: "auto",
            },
          },
        },
        suffix: {
          ...moduleStyle?.suffix,
          desktop: {
            ...moduleStyle?.suffix?.desktop,
            default: {
              ...moduleStyle?.suffix?.desktop?.default,
              boxShadow: "0px 0px 0px 0px #333333",
              width: "auto",
              height: "auto",
            },
          },
        },
      },
      key: "title",
      settings: {
        background_image: "",
        custom_class: "",
        admin_label: "",
        link: {
          visibility: false,
          type: "",
          customlink: "",
          target: "",
          condition: "",
          custom_field: "0",
        },
        prefix: {
          is_enable: "false",
          meta_type: "text",
          meta_text: "Prefix",
          icons: {
            visibility: false,
            icon: "",
            type: "icon",
          },
        },
        suffix: {
          is_enable: "false",
          meta_type: "text",
          meta_text: "Suffix",
          icons: {
            visibility: false,
            icon: "",
            type: "icon",
          },
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
      title: "Terms",
      style: {
        ...moduleStyle,
        desktop: {
          ...moduleStyle.desktop,
          default: {
            ...moduleStyle.desktop.default,
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
            color: "rgb(96,96,96)",
            fontFamily: "DM Sans",
            fontSize: "15px",
            flexBasis: "auto",
            justifyContent: "flex-start",
            boxShadow: "0px 0px 0px 0px #333333",
            top: "auto",
            right: "auto",
            bottom: "auto",
            left: "auto",
            display: "flex",
            gap: "8px",
            width: "auto",
          },
        },
        mobile: {
          ...moduleStyle.mobile,
          default: {
            ...moduleStyle.mobile.default,
            fontSize: "12px",
          },
        },
        meta: {
          ...moduleStyle?.meta,
          desktop: {
            ...moduleStyle?.meta?.desktop,
            default: {
              ...moduleStyle?.meta?.desktop?.default,
              boxShadow: "0px 0px 0px 0px #333333",
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
              backgroundColor: "rgb(246,247,251)",
              paddingTop: "6px",
              paddingBottom: "6px",
              paddingLeft: "15px",
              paddingRight: "15px",
              borderTopLeftRadius: "10px",
              borderTopRightRadius: "10px",
              borderBottomLeftRadius: "10px",
              borderBottomRightRadius: "10px",
            },
          },
        },
      },
      key: "categories",
      settings: {
        background_image: "",
        custom_class: "",
        admin_label: "",
        limit: 2,
        separator: "none",
        last_separator: false,
        link: {
          visibility: false,
          target: "same-tab",
        },
        visibility: {
          mobile: "false",
          tablet: "false",
          desktop: "false",
        },
        categories: "0",
      },
    },
    {
      type: "module",
      title: "Post Description",
      style: {
        ...moduleStyle,
        desktop: {
          ...moduleStyle.desktop,
          default: {
            ...moduleStyle.desktop.default,
            height: "auto",
            position: "relative",
            paddingTop: "10px",
            paddingRight: "0",
            paddingBottom: "10px",
            paddingLeft: "0",
            marginTop: "0",
            marginRight: "0",
            marginBottom: "0",
            marginLeft: "0",
            backgroundColor: "#ffffff",
            color: "rgb(96,96,96)",
            fontFamily: "DM Sans",
            fontSize: "16px",
            flexBasis: "auto",
            justifyContent: "flex-start",
            boxShadow: "0px 0px 0px 0px #333333",
            top: "auto",
            right: "auto",
            bottom: "auto",
            left: "auto",
            fontStyle: "normal",
            textTransform: "inherit",
            textDecoration: "inherit",
            width: "100%",
            fontWeight: "400",
          },
        },
        mobile: {
          ...moduleStyle.mobile,
          default: {
            ...moduleStyle.mobile.default,
            fontSize: "14px",
          },
        },
      },
      key: "excerpt",
      settings: {
        background_image: "",
        custom_class: "",
        admin_label: "",
        excerptLength: "18",
        htmlRender: false,
        visibility: {
          mobile: "false",
          tablet: "false",
          desktop: "false",
        },
      },
    },
    {
      type: "module",
      title: "Custom Field",
      style: {
        ...moduleStyle,
        desktop: {
          ...moduleStyle.desktop,
          default: {
            ...moduleStyle.desktop.default,
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
            color: "#4c5866",
            fontFamily: "DM Sans",
            fontSize: "14px",
            flexBasis: "auto",
            justifyContent: "flex-start",
            boxShadow: "0px 0px 0px 0px #333333",
            top: "auto",
            right: "auto",
            bottom: "auto",
            left: "auto",
            display: "flex",
            gap: "5px",
            width: "auto",
          },
        },
        mobile: {
          ...moduleStyle.mobile,
          default: {
            ...moduleStyle.mobile.default,
            fontSize: "12px",
          },
        },
        meta: {
          ...moduleStyle?.meta,
          desktop: {
            ...moduleStyle?.meta?.desktop,
            default: {
              ...moduleStyle?.meta?.desktop?.default,
              display: "flex",
              justifyContent: "flex-start",
              gap: "5px",
              flexFlow: "row",
            },
          },
        },
        prefix: {
          ...moduleStyle?.prefix,
          desktop: {
            ...moduleStyle?.prefix?.desktop,
            default: {
              ...moduleStyle?.prefix?.desktop?.default,
              boxShadow: "0px 0px 0px 0px #333333",
              fontFamily: "DM Sans",
              width: "auto",
              height: "auto",
              paddingTop: "0px",
              paddingLeft: "0px",
              paddingBottom: "0px",
              paddingRight: "0px",
            },
          },
        },
        suffix: {
          ...moduleStyle?.suffix,
          desktop: {
            ...moduleStyle?.suffix?.desktop,
            default: {
              ...moduleStyle?.suffix?.desktop?.default,
              boxShadow: "0px 0px 0px 0px #333333",
              fontFamily: "DM Sans",
              width: "auto",
              height: "auto",
              paddingTop: "0px",
              paddingLeft: "0px",
              paddingBottom: "0px",
              paddingRight: "0px",
            },
          },
        },
      },
      key: "customfield",
      settings: {
        background_image: "",
        prefix: {
          is_enable: "true",
          meta_type: "text",
          meta_text: "Prefix",
          icons: {
            visibility: false,
            icon: "",
            type: "icon",
          },
        },
        suffix: {
          is_enable: "true",
          meta_type: "text",
          meta_text: "Suffix",
          icons: {
            visibility: false,
            icon: "",
            type: "icon",
          },
        },
        custom_field: "0",
        custom_class: "",
        admin_label: "",
        visibility: {
          mobile: "false",
          tablet: "false",
          desktop: "false",
        },
      },
    },
    {
      type: "module",
      title: "Custom Text",
      style: {
        ...moduleStyle,
        desktop: {
          ...moduleStyle.desktop,
          default: {
            ...moduleStyle.desktop.default,
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
            flexBasis: "auto",
            justifyContent: "flex-start",
            boxShadow: "0px 0px 0px 0px  #333333",
            width: "100%",
            top: "auto",
            right: "auto",
            bottom: "auto",
            left: "auto",
          },
        },
        mobile: {
          ...moduleStyle.mobile,
          default: {
            ...moduleStyle.mobile.default,
            fontSize: "12px",
          },
        },
      },
      key: "customtext",
      settings: {
        background_image: "",
        custom_class: "",
        admin_label: "",
        customText: "",
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
      title: "Post Button",
      style: {
        ...moduleStyle,
        desktop: {
          ...moduleStyle.desktop,
          default: {
            ...moduleStyle.desktop.default,
            boxShadow: "0px 0px 0px 0px  #333333",
            top: "auto",
            right: "auto",
            bottom: "auto",
            left: "auto",
            fontFamily: "DM Sans",
            color: "rgb(247,247,247)",
            fontSize: "16px",
            display: "flex",
            gap: "8px",
            backgroundColor: "rgb(96,96,96)",
            width: "auto",
            height: "auto",
            paddingTop: "15px",
            paddingBottom: "15px",
            paddingLeft: "25px",
            paddingRight: "25px",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
            borderBottomLeftRadius: "8px",
            borderBottomRightRadius: "8px",
            marginTop: "10px",
          },
          hover: {
            ...moduleStyle.desktop.hover,
            backgroundColor: "rgb(0,0,0)",
          },
        },
        mobile: {
          ...moduleStyle.mobile,
          default: {
            ...moduleStyle.mobile.default,
            paddingTop: "10px",
            paddingBottom: "10px",
            paddingLeft: "20px",
            paddingRight: "20px",
            fontSize: "14px",
          },
        },
        meta: {
          ...moduleStyle?.meta,
          desktop: {
            ...moduleStyle?.meta?.desktop,
            default: {
              ...moduleStyle?.meta?.desktop?.default,
              display: "flex",
              justifyContent: "flex-start",
              gap: "0px",
              flexFlow: "row",
            },
          },
        },
        prefix: {
          ...moduleStyle?.prefix,
          desktop: {
            ...moduleStyle?.prefix?.desktop,
            default: {
              ...moduleStyle?.prefix?.desktop?.default,
              boxShadow: "0px 0px 0px 0px #333333",
              width: "auto",
              height: "auto",
            },
          },
        },
        suffix: {
          ...moduleStyle?.suffix,
          desktop: {
            ...moduleStyle?.suffix?.desktop,
            default: {
              ...moduleStyle?.suffix?.desktop?.default,
              boxShadow: "0px 0px 0px 0px #333333",
              width: "auto",
              height: "auto",
            },
          },
        },
      },
      key: "button",
      settings: {
        background_image: "",
        custom_class: "",
        admin_label: "",
        changeButtonValue: "Read More",
        link: {
          visibility: true,
          type: "post-url",
          customlink: "",
          target: "same-tab",
          custom_field: "0",
        },
        prefix: {
          is_enable: "false",
          meta_type: "text",
          meta_text: "Prefix",
          icons: {
            visibility: false,
            icon: "",
            type: "icon",
          },
        },
        suffix: {
          is_enable: "true",
          meta_type: "icon",
          meta_text: "Suffix",
          icons: {
            visibility: true,
            icon: "fas fa-arrow-right",
            // position: "before-label",
            type: "icon",
          },
        },
        visibility: {
          mobile: "false",
          tablet: "false",
          desktop: "false",
        },
      },
    },
  ];

  const wooProductImageModule = canUseProductPostType()
    ? [getWooProductImageModuleTemplate()]
    : [];
  const wooProductPriceModule = canUseProductPostType()
    ? [getWooProductPriceModuleTemplate()]
    : [];
  const wooProductRatingModule = canUseProductPostType()
    ? [getWooProductRatingModuleTemplate()]
    : [];
  const wooAddToCartModule = canUseProductPostType()
    ? [getWooAddToCartModuleTemplate()]
    : [];
  const wooAttributeSwatchModule = canUseProductPostType()
    ? [getWooAttributeSwatchModuleTemplate()]
    : [];
  const wooBadgesModule = canUseProductPostType()
    ? [getBadgesModuleTemplate()]
    : [];
  const allInitialModules = [
    ...initialModules,
    ...wooProductImageModule,
    ...wooProductPriceModule,
    ...wooProductRatingModule,
    ...wooAddToCartModule,
    ...wooAttributeSwatchModule,
    ...wooBadgesModule,
  ];

  // console.log(initialModules);
  const [searchValue, setSearchValue] = useState("");
  const [modules, setModules] = useState(
    allInitialModules.map((item) => JSON.parse(JSON.stringify(item))),
  );
  const handleModuleSearch = (event) => {
    let value = event.target.value;
    setSearchValue(value);
    let newArray = allInitialModules.filter(function (item) {
      return item.title
        .toString()
        .toLowerCase()
        .includes(value.toString().toLowerCase());
    });
    setModules([...newArray]);
  };

  const postModules = modules.filter((item) => !isWooPickerModule(item.key));
  const wooModules = modules.filter((item) => isWooPickerModule(item.key));

  const renderModuleItem = (item) => {
    const moduleLocked = isModuleLocked(item.key, "post");
    const moduleContent = (
      <>
        <PostModulePickerIcon moduleKey={item.key} />
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
        className={`caf-post-select-module-pop-up${
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
          <div className="setting-popup-title">Choose Module</div>
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
            {postModules.length > 0 ? (
              <>
                <li style={MODULE_SECTION_LABEL_STYLE}>Post Modules</li>
                {postModules.map(renderModuleItem)}
              </>
            ) : null}
            {wooModules.length > 0 ? (
              <>
                <li
                  style={{
                    ...MODULE_SECTION_LABEL_STYLE,
                    paddingTop: postModules.length > 0 ? "10px" : "2px",
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
