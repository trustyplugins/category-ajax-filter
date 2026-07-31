import cloneDeep from "lodash/cloneDeep";
import {
  canUseFeature,
  canUseFilterModule,
  canUsePostModule,
  canUseProductPostType,
  isProTier,
} from "./capabilities";
import { resolveFilterDataSource } from "../MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/filterModuleTier";
import {
  FREE_PREVIEW_LOADER,
  resolvePaginationType,
  resolvePreviewLoaderData,
} from "../MainComponents/PreviewComponents/postPreview/shared/previewSettingsTier";
import {
  resolvePostImageSource,
  resolvePostLinkType,
} from "../MainComponents/PostComponents/components/settingTabContent/ModuleContentData/shared/postModuleTier";
import { flattenGradientToSolid } from "../MainComponents/utils/colorPicker";
import { enforceSingleInstanceFilterModulesInLayout } from "../MainComponents/FilterComponents/utils/filterLayoutSearchRules";
import { isWooVirtualTaxonomyKey } from "../MainComponents/FilterComponents/components/woocommerce/wooVirtualTaxonomies";

const flattenGradientsInNode = (node) => {
  if (Array.isArray(node)) {
    node.forEach((item) => flattenGradientsInNode(item));
    return;
  }
  if (!node || typeof node !== "object") {
    return;
  }
  Object.keys(node).forEach((key) => {
    const value = node[key];
    if (typeof value === "string" && value.includes("gradient(")) {
      node[key] = flattenGradientToSolid(value, "#000000");
      return;
    }
    flattenGradientsInNode(value);
  });
};

const DND_MISC_ITEM_FEATURE_MAP = {
  sorting: "sorting",
  result_count: "result_counter",
  selected: "active_filters",
};

const FREE_PAGINATION_TYPES = new Set(["number", "number2"]);

const walkLayoutModules = (initialData, visitor) => {
  if (!Array.isArray(initialData)) {
    return;
  }
  initialData.forEach((row) => {
    (row?.data || []).forEach((column) => {
      (column?.data || []).forEach((module) => {
        if (module && typeof module === "object") {
          visitor(module);
        }
      });
    });
  });
};

const filterModulesByTier = (initialData, canUseModule) => {
  if (!Array.isArray(initialData)) {
    return [];
  }
  return initialData.map((row) => {
    const nextRow = { ...row };
    nextRow.data = (row?.data || []).map((column) => {
      const nextColumn = { ...column };
      nextColumn.data = (column?.data || []).filter((module) => {
        if (!module?.key) {
          return true;
        }
        return canUseModule(module.key);
      });
      return nextColumn;
    });
    return nextRow;
  });
};

const sanitizeSearchModuleSettings = (settings) => {
  const next = { ...(settings || {}) };
  if (!canUseFeature("smart_ai_search")) {
    next.smart_ai_search = { is_enable: "false" };
    next.keyword_search = { ...(next.keyword_search || {}), is_enable: "true" };
  }
  if (!canUseFeature("search_custom_field")) {
    next.source = { ...(next.source || {}), custom_field: false };
    next.custom_field = "0";
  }
  if (!canUseFeature("voice_search")) {
    next.voice_icon = { ...(next.voice_icon || {}), is_enable: "false" };
  }
  if (!canUseFeature("search_show_icon")) {
    next.search_icon = { ...(next.search_icon || {}), is_enable: "false" };
  }
  if (!canUseFeature("search_clear_input")) {
    next.clear_icon = { ...(next.clear_icon || {}), is_enable: "false" };
  }
  if (!canUseFeature("label_show_icon") && next.label) {
    next.label = {
      ...next.label,
      icons: {
        ...(next.label.icons || {}),
        visibility: false,
        icon: "",
        type: "icon",
        position: "before-label",
      },
    };
  }
  if (!canUseFeature("filter_label_collapse")) {
    next.enable_toggle = "false";
    next.close_toggle = "false";
  }
  return next;
};

const sanitizeCheckboxDropdownSettings = (settings) => {
  const next = { ...(settings || {}) };
  next.data_source = resolveFilterDataSource(next.data_source);
  if (!canUseFeature("filter_custom_field")) {
    next.custom_field = "0";
  }
  if (!canUseFeature("filter_show_icon")) {
    const isColorSwatch =
      String(next.show_icon) === "true" &&
      String(next.term_visual || "") === "color";
    if (!isColorSwatch) {
      next.show_icon = "false";
    } else {
      next.term_visual = "color";
    }
    if (next.dropdown_data?.all_option) {
      next.dropdown_data = {
        ...next.dropdown_data,
        all_option: {
          ...next.dropdown_data.all_option,
          icons: {
            ...(next.dropdown_data.all_option.icons || {}),
            visibility: false,
            icon: "",
            type: "icon",
          },
        },
      };
    }
  }
  // Free: strip term FA/SVG icons but keep color swatch values.
  if (!canUseFeature("filter_term_icon") && Array.isArray(next.taxonomy_data)) {
    const stripTermIconsKeepColor = (term) => {
      if (!term || typeof term !== "object") return term;
      const icons = term.icons || {};
      const color =
        (typeof icons.color === "string" && icons.color.trim()) ||
        (icons.type === "color" && typeof icons.icon === "string"
          ? icons.icon.trim()
          : "");
      const nextTerm = { ...term };
      if (color) {
        nextTerm.icons = {
          type: "color",
          icon: color,
          color,
          position: icons.position || "before",
        };
      } else {
        nextTerm.icons = { icon: "", type: "icon", position: "before" };
      }
      if (Array.isArray(nextTerm.children_data)) {
        nextTerm.children_data = nextTerm.children_data.map(stripTermIconsKeepColor);
      }
      return nextTerm;
    };
    next.taxonomy_data = next.taxonomy_data.map((group) => ({
      ...group,
      term_data: (group?.term_data || []).map(stripTermIconsKeepColor),
    }));
  }
  if (!canUseFeature("filter_term_show_more")) {
    next.term_show_more = "false";
  }
  if (!canUseFeature("filter_term_default")) {
    next.predefined_terms = [];
  }
  if (!canUseFeature("label_show_icon") && next.label) {
    next.label = {
      ...next.label,
      icons: {
        ...(next.label.icons || {}),
        visibility: false,
        icon: "",
        type: "icon",
        position: "before-label",
      },
    };
  }
  if (!canUseFeature("filter_label_collapse")) {
    next.enable_toggle = "false";
    next.close_toggle = "false";
  }
  if (!canUseFeature("woo_product_filters") && Array.isArray(next.taxonomy_data)) {
    next.taxonomy_data = next.taxonomy_data.filter(
      (group) =>
        group &&
        !group.is_woo_virtual &&
        !isWooVirtualTaxonomyKey(group.key)
    );
  }
  return next;
};

const sanitizeResetModuleSettings = (settings) => {
  const next = { ...(settings || {}) };
  if (!canUseFeature("reset_module_icon")) {
    next.icons = { visibility: false, icon: "", type: "icon" };
  }
  if (!canUseFeature("label_show_icon") && next.label) {
    next.label = {
      ...next.label,
      icons: {
        ...(next.label.icons || {}),
        visibility: false,
        icon: "",
        type: "icon",
        position: "before-label",
      },
    };
  }
  if (!canUseFeature("filter_label_collapse")) {
    next.enable_toggle = "false";
    next.close_toggle = "false";
  }
  return next;
};

const sanitizeCustomTextModuleSettings = (settings) => {
  const next = { ...(settings || {}) };
  if (!canUseFeature("customtext_module_icon")) {
    next.icons = {
      visibility: false,
      icon: "",
      type: "icon",
      position: "before-customtext",
    };
  }
  return next;
};

export const sanitizePostModuleSettings = (moduleKey, settings) => {
  const next = { ...(settings || {}) };
  if (moduleKey === "image") {
    next.image_source = resolvePostImageSource(next.image_source);
    if (!canUseFeature("post_image_custom_field")) {
      next.custom_field = "0";
    }
  }
  if (
    moduleKey === "woo_product_image" &&
    !canUseFeature("woo_product_image_gallery")
  ) {
    next.image_source = "featured_image";
    next.gallery_image_limit = "1";
    next.auto_scroll = "false";
    next.auto_scroll_delay = "1000";
  }
  if (
    moduleKey === "product_price" &&
    !canUseFeature("woo_product_price_display_modes")
  ) {
    next.show_price = "default";
  }
  if (
    moduleKey === "woo_add_to_cart" &&
    !canUseFeature("woo_ajax_add_to_cart")
  ) {
    next.atc_behaviour = "product_page";
    next.after_atc = "none";
    next.after_atc_text = "Added";
  }
  if (
    moduleKey === "woo_add_to_cart" &&
    next.button_text_mode === "icon_only" &&
    !canUseFeature("label_show_icon")
  ) {
    next.button_text_mode = "woo_default";
  }
  if (moduleKey === "badges" && !canUseFeature("woo_badge_types")) {
    const badgeType =
      typeof next.badge_type === "string" ? next.badge_type.trim() : "";
    if (badgeType !== "new" && badgeType !== "sale") {
      next.badge_type = "new";
    }
  }
  if (next.link && typeof next.link === "object") {
    next.link = {
      ...next.link,
      type: resolvePostLinkType(next.link.type),
    };
    if (!canUseFeature("post_link_custom_field")) {
      next.link.custom_field = "0";
    }
  }
  // Prefix/suffix is unlocked for product_price on free; icon affixes stay Pro.
  // Add to Cart keeps prefix/suffix locked via the global post_prefix_suffix gate.
  if (moduleKey === "product_price") {
    if (!canUseFeature("label_show_icon")) {
      ["prefix", "suffix"].forEach((placement) => {
        const affix = next[placement];
        if (!affix || typeof affix !== "object") {
          return;
        }
        next[placement] = {
          ...affix,
          meta_type: affix.meta_type === "icon" ? "text" : affix.meta_type,
          icons: { visibility: false, icon: "", type: "icon" },
        };
      });
    }
  } else if (!canUseFeature("post_prefix_suffix")) {
    next.prefix = { is_enable: "false", meta_type: "text", meta_text: "" };
    next.suffix = { is_enable: "false", meta_type: "text", meta_text: "" };
  }
  if (!canUseFeature("label_show_icon")) {
    next.icons = {
      ...(next.icons || {}),
      visibility: false,
      icon: "",
      type: "icon",
      position: "",
    };
  }
  return next;
};

const sanitizeRangeSliderSettings = (settings) => {
  const next = { ...(settings || {}) };
  next.data_source = "custom_field";

  if (!canUseFeature("range_slider_custom_fields")) {
    const rows = Array.isArray(next.custom_field_data)
      ? next.custom_field_data
      : next.custom_field_data && typeof next.custom_field_data === "object"
        ? [next.custom_field_data]
        : [];
    const first = rows[0] && typeof rows[0] === "object" ? rows[0] : {};
    next.custom_field_data = [
      {
        ...first,
        custom_field_key: "_price",
        custom_field_value_list: Array.isArray(first.custom_field_value_list)
          ? first.custom_field_value_list
          : [],
        compare_operator: "BETWEEN",
        meta_type: "NUMERIC",
      },
    ];
  }

  if (!canUseFeature("label_show_icon") && next.label) {
    next.label = {
      ...next.label,
      icons: {
        ...(next.label.icons || {}),
        visibility: false,
        icon: "",
        type: "icon",
        position: "before-label",
      },
    };
  }
  if (!canUseFeature("filter_label_collapse")) {
    next.enable_toggle = "false";
    next.close_toggle = "false";
  }
  return next;
};

const sanitizeFilterModuleSettings = (moduleKey, settings) => {
  if (moduleKey === "search") {
    return sanitizeSearchModuleSettings(settings);
  }
  if (moduleKey === "checkbox_filter" || moduleKey === "dropdown_filter") {
    return sanitizeCheckboxDropdownSettings(settings);
  }
  if (moduleKey === "range_slider") {
    return sanitizeRangeSliderSettings(settings);
  }
  if (moduleKey === "reset") {
    return sanitizeResetModuleSettings(settings);
  }
  if (moduleKey === "customtext") {
    return sanitizeCustomTextModuleSettings(settings);
  }
  return settings;
};

const sanitizePreviewMiscData = (miscPreviewData) => {
  if (!miscPreviewData || typeof miscPreviewData !== "object") {
    return miscPreviewData;
  }
  const next = { ...miscPreviewData };

  if (next.extra && typeof next.extra === "object") {
    const extra = { ...next.extra };
    if (!canUseFeature("post_masonry")) {
      extra.masonary = false;
    }
    next.extra = extra;
  }

  if (next.container && typeof next.container === "object") {
    const container = { ...next.container };
    if (!canUseFeature("scroll_to_container")) {
      container.scroll = {
        desktop: { is_enable: "false", position: "-100" },
        tablet: {},
        mobile: {},
      };
    }
    next.container = container;
  }

  if (!canUseFeature("floating_filter") && next.extra) {
    const extra = { ...next.extra };
    ["desktop", "tablet", "mobile"].forEach((device) => {
      extra[device] = { ...(extra[device] || {}), filterPosition: "inline" };
    });
    next.extra = extra;
  }

  if (!canUseFeature("preview_loader_settings")) {
    next.loader = cloneDeep(FREE_PREVIEW_LOADER);
  } else if (next.loader) {
    next.loader = resolvePreviewLoaderData(next.loader);
  }

  if (Array.isArray(next.dnd_column_data)) {
    next.dnd_column_data = next.dnd_column_data.map((column) => {
      const nextColumn = { ...column };
      nextColumn.data = (column?.data || []).map((item) => {
        if (!item?.key) {
          return item;
        }
        const feature = DND_MISC_ITEM_FEATURE_MAP[item.key];
        const nextItem = { ...item, settings: { ...(item.settings || {}) } };
        if (item.key === "pagination") {
          nextItem.settings.pagination_type = resolvePaginationType(
            nextItem.settings.pagination_type,
          );
          return nextItem;
        }
        if (feature && !canUseFeature(feature)) {
          nextItem.settings.is_enable = "false";
        }
        return nextItem;
      });
      return nextColumn;
    });
  }

  return next;
};

const sanitizeCommonData = (commonData) => {
  if (!commonData || typeof commonData !== "object") {
    return commonData;
  }
  const next = { ...commonData };
  if (!canUseFeature("analytics")) {
    next.analytics_enabled = false;
  }
  if (!canUseFeature("filter_url")) {
    next.filter_url_enabled = false;
  }
  if (!canUseFeature("schema")) {
    next.schema_enabled = false;
  }
  if (next.post_type === "product" && !canUseProductPostType()) {
    next.post_type = "post";
  }
  if (next.preview_template_data?.misc_preview_data) {
    next.preview_template_data = {
      ...next.preview_template_data,
      misc_preview_data: sanitizePreviewMiscData(
        next.preview_template_data.misc_preview_data,
      ),
    };
  }
  return next;
};

const sanitizeFilterLayoutData = (filterLayoutData) => {
  if (!filterLayoutData || typeof filterLayoutData !== "object") {
    return filterLayoutData;
  }
  const next = { ...filterLayoutData };
  next.initial_data = filterModulesByTier(
    next.initial_data,
    canUseFilterModule,
  );
  next.initial_data = enforceSingleInstanceFilterModulesInLayout(
    next.initial_data,
  );
  walkLayoutModules(next.initial_data, (module) => {
    if (!module?.key) {
      return;
    }
    module.settings = sanitizeFilterModuleSettings(module.key, module.settings);
  });
  if (!canUseFeature("meta_relation")) {
    next.extra_data = { ...(next.extra_data || {}), meta_relation: "IN" };
    if (next.filter_query_data) {
      next.filter_query_data = {
        ...next.filter_query_data,
        meta_relation: "IN",
      };
    }
  }
  if (!canUseFeature("dynamic_term_counts")) {
    next.extra_data = {
      ...(next.extra_data || {}),
      dynamic_term_counts: "false",
    };
  }
  if (!canUseFeature("query_restriction")) {
    next.extra_data = {
      ...(next.extra_data || {}),
      query_restriction: {
        enabled: "false",
        include: { by: "", taxonomy: "", term_data: [] },
        exclude: { by: "", taxonomy: "", term_data: [], post_data: [] },
      },
    };
  }
  if (!canUseFeature("filter_custom_field") && next.filter_query_data) {
    next.filter_query_data = {
      ...next.filter_query_data,
      custom_field_data: [],
      data_source: {
        ...(next.filter_query_data.data_source || {}),
        custom_field: "false",
      },
    };
  }
  return next;
};

/**
 * Apply free-tier limits to a single post module (e.g. when adding from the module picker).
 *
 * @param {object} module Post layout module node.
 * @returns {object}
 */
export function sanitizePostModuleForTier(module) {
  if (isProTier() || !module || typeof module !== "object") {
    return module;
  }

  const next = { ...module };
  if (next.settings && next.key) {
    next.settings = sanitizePostModuleSettings(next.key, next.settings);
  }
  return next;
}

const sanitizePostLayoutData = (postLayoutData) => {
  if (!postLayoutData || typeof postLayoutData !== "object") {
    return postLayoutData;
  }
  const next = { ...postLayoutData };
  next.initial_data = filterModulesByTier(next.initial_data, canUsePostModule);
  walkLayoutModules(next.initial_data, (module) => {
    if (!module?.key) {
      return;
    }
    module.settings = sanitizePostModuleSettings(module.key, module.settings);
  });
  return next;
};

/**
 * Strip Pro-only modules/settings from layout JSON for the current tier.
 * Used on import and export so free JSON stays within free limits.
 *
 * @param {object} layoutDocument Builder layout root object.
 * @returns {object}
 */
export function sanitizeLayoutDocumentForTier(layoutDocument) {
  if (isProTier() || !layoutDocument || typeof layoutDocument !== "object") {
    return layoutDocument;
  }

  const next = cloneDeep(layoutDocument);

  if (next.common_data) {
    next.common_data = sanitizeCommonData(next.common_data);
  }
  if (next.filter_layout_data) {
    next.filter_layout_data = sanitizeFilterLayoutData(next.filter_layout_data);
  }
  if (next.post_layout_data) {
    next.post_layout_data = sanitizePostLayoutData(next.post_layout_data);
  }

  if (!canUseFeature("gradient_colors")) {
    flattenGradientsInNode(next);
  }

  if (
    next.common_data?.preview_template_data &&
    !next.common_data.preview_template_data.misc_preview_data &&
    next.common_data.preview_template_data
  ) {
    next.common_data.preview_template_data = {
      ...next.common_data.preview_template_data,
    };
  }

  return next;
}

export default sanitizeLayoutDocumentForTier;
