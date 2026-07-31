const STYLE_DEVICES = ["desktop", "tablet", "mobile"];
const STYLE_STATES = ["default", "hover"];

const isEmptyBackgroundImageValue = (value) => {
  if (value === undefined || value === null) {
    return true;
  }
  const normalized = String(value).trim();
  return normalized === "" || normalized === "''";
};

/**
 * True when the Design tab "Image" upload mode was used (not "Post Image").
 */
export function hasCustomUploadedBackgroundImage(element) {
  const settings = element?.settings;
  if (!settings || typeof settings !== "object") {
    return false;
  }

  if (settings.background_image === "post-img") {
    return false;
  }

  if (settings.bg_type === "image") {
    return true;
  }

  const style = element?.style;
  if (!style || typeof style !== "object") {
    return false;
  }

  return STYLE_DEVICES.some((device) =>
    STYLE_STATES.some((state) => {
      const value = style?.[device]?.[state]?.backgroundImage;
      return !isEmptyBackgroundImageValue(value);
    })
  );
}

/**
 * Reset media-library background uploads (Design tab "Image" mode).
 */
export function clearCustomUploadedBackgroundImage(element) {
  if (!element || typeof element !== "object") {
    return;
  }

  if (!hasCustomUploadedBackgroundImage(element)) {
    return;
  }

  if (!element.settings || typeof element.settings !== "object") {
    element.settings = {};
  }

  element.settings.bg_type = "color";
  element.settings.background_image = "";

  if (!element.style || typeof element.style !== "object") {
    return;
  }

  STYLE_DEVICES.forEach((device) => {
    if (!element.style[device] || typeof element.style[device] !== "object") {
      return;
    }
    STYLE_STATES.forEach((state) => {
      if (!element.style[device][state]) {
        return;
      }
      element.style[device][state].backgroundImage = "''";
    });
  });
}
