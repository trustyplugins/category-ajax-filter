import { builderLayoutData } from "../BuilderLayoutData";
import { fModuleStyle } from "../FilterComponents/styleData";

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const findModuleInRows = (rows, moduleKey) => {
  if (!Array.isArray(rows)) {
    return null;
  }

  for (const row of rows) {
    const columns = Array.isArray(row?.data) ? row.data : [];
    for (const column of columns) {
      const modules = Array.isArray(column?.data) ? column.data : [];
      for (const module of modules) {
        if (module?.type === "module" && module.key === moduleKey) {
          return module;
        }
      }
    }
  }

  return null;
};

const findModuleDeep = (node, moduleKey) => {
  if (!node || typeof node !== "object") {
    return null;
  }

  if (node.type === "module" && node.key === moduleKey) {
    return node;
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findModuleDeep(item, moduleKey);
      if (found) {
        return found;
      }
    }
    return null;
  }

  for (const value of Object.values(node)) {
    const found = findModuleDeep(value, moduleKey);
    if (found) {
      return found;
    }
  }

  return null;
};

const libraryModuleFallbacks = {
  dropdown_filter: {
    type: "module",
    title: "Dropdown Filter",
    style: deepClone(fModuleStyle),
    key: "dropdown_filter",
    settings: {
      dropdown_data: {
        icons: {
          icon_switch: true,
          active_icon: "fas fa-arrow-up",
          inactive_icon: "",
          active_type: "icon",
          inactive_type: "icon",
          position: "right",
        },
        all_option: {
          value: "All",
          is_enable: "false",
          icons: {
            visibility: false,
            icon: "",
            type: "icon",
          },
        },
      },
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
          type: "icon",
        },
      },
      skins: {
        checkbox: "checkbox_skin1",
      },
      multiple_term: "false",
      show_icon: "false",
      show_count: "false",
      enable_toggle: "false",
      toggle_position: "right",
      close_toggle: "false",
      count_separator: "brackets",
      data_source: "taxonomy",
      custom_field_data: [],
      visibility: {
        mobile: "false",
        tablet: "false",
        desktop: "false",
      },
    },
  },
  range_slider: {
    type: "module",
    title: "Range Slider",
    style: deepClone(fModuleStyle),
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
          type: "icon",
        },
      },
      data_source: "custom_field",
      custom_field_data: [
        {
          custom_field_key: "0",
          custom_field_value_list: [],
          compare_operator: "=",
          meta_type: "CHAR",
        },
      ],
      range_slider: {
        min: 0,
        max: 100,
        step: 1,
        default_values: {
          is_enable: "false",
        },
        prefix: {
          is_enable: "false",
          value: "Prefix",
        },
        suffix: {
          is_enable: "false",
          value: "Suffix",
        },
      },
      visibility: {
        mobile: "false",
        tablet: "false",
        desktop: "false",
      },
      taxonomy_data: [],
      predefined_terms: [],
      cf_predefined_terms: [],
    },
  },
};

export const getFilterModuleForLibrary = (moduleKey) => {
  const fromFilterRows = findModuleInRows(
    builderLayoutData?.filter_layout_data?.initial_data,
    moduleKey
  );
  if (fromFilterRows) {
    return deepClone(fromFilterRows);
  }

  const fromLayout = findModuleDeep(builderLayoutData, moduleKey);
  if (fromLayout) {
    return deepClone(fromLayout);
  }

  const fallback = libraryModuleFallbacks[moduleKey];
  return fallback ? deepClone(fallback) : null;
};
