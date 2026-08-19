import {
  DEFAULT_SWATCH_COLOR,
  buildColorTermIcons,
  restoreIconFromBackup,
  termHasColorSwatch,
} from "./termVisualUtils";

/**
 * Custom-field value color helpers.
 * Do not call taxonomy term-tree seeders from here.
 */

export const seedDefaultColorOnCustomFieldValues = (
  values,
  defaultColor = DEFAULT_SWATCH_COLOR,
) => {
  if (!Array.isArray(values)) {
    return values;
  }
  return values.map((value) => {
    if (!value || typeof value !== "object") {
      return value;
    }
    const next = { ...value };
    if (!termHasColorSwatch(next.icons)) {
      next.icons = buildColorTermIcons(
        next.icons,
        defaultColor,
        next.icons?.position || "before",
      );
    }
    return next;
  });
};

export const ensureDefaultSwatchColorsOnCustomFieldSettings = (
  settings,
  defaultColor = DEFAULT_SWATCH_COLOR,
) => {
  if (!settings || typeof settings !== "object") {
    return settings;
  }
  if (!Array.isArray(settings.custom_field_data)) {
    return settings;
  }
  return {
    ...settings,
    custom_field_data: settings.custom_field_data.map((group) => ({
      ...group,
      custom_field_value_list: seedDefaultColorOnCustomFieldValues(
        group?.custom_field_value_list,
        defaultColor,
      ),
    })),
  };
};

export const restoreCustomFieldIconsFromColorBackup = (settings) => {
  if (!settings || typeof settings !== "object") {
    return settings;
  }
  if (!Array.isArray(settings.custom_field_data)) {
    return settings;
  }
  return {
    ...settings,
    custom_field_data: settings.custom_field_data.map((group) => ({
      ...group,
      custom_field_value_list: (group?.custom_field_value_list || []).map(
        (value) => {
          if (!value || typeof value !== "object") {
            return value;
          }
          return {
            ...value,
            icons: restoreIconFromBackup(value.icons),
          };
        },
      ),
    })),
  };
};

export const applyColorToCustomFieldValue = (values, valueIndex, color) => {
  if (!Array.isArray(values) || !color) {
    return values;
  }
  return values.map((value, index) => {
    if (index !== valueIndex || !value || typeof value !== "object") {
      return value;
    }
    return {
      ...value,
      icons: buildColorTermIcons(
        value.icons,
        color,
        value.icons?.position || "before",
      ),
    };
  });
};

export const buildDefaultCustomFieldValueIcons = (colorMode) =>
  colorMode
    ? buildColorTermIcons({}, DEFAULT_SWATCH_COLOR, "before")
    : {
        icon: "",
        type: "icon",
        position: "before",
        iconChecked: true,
      };
