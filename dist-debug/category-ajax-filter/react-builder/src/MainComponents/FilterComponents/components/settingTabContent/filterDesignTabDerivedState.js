/**
 * Pure helpers for Filter DesignTab (layout-derived UI state).
 * Extracted from DesignTab.js without logic changes — easier to test and split further later.
 */

import { isWooRatingFilterModule } from "../woocommerce/wooFilterModuleTemplates";

/** Map shared "Stars" sub-tab (icon) to the correct style section per design panel. */
export function resolveWooRatingStarsDesignMetaKey(
  moduleKey,
  selectedMetaDropdown,
  panel,
  fallback
) {
  if (!isWooRatingFilterModule(moduleKey) || selectedMetaDropdown !== "icon") {
    return fallback;
  }
  if (panel === "layout" || panel === "sizing") {
    return "meta2";
  }
  return "icon";
}

export function normalizeFlexFlowDirection(flexFlow) {
  const raw = String(flexFlow || "").trim();
  if (!raw) {
    return "";
  }
  const [direction] = raw.split(/\s+/);
  if (
    direction === "row" ||
    direction === "column" ||
    direction === "row-reverse" ||
    direction === "column-reverse"
  ) {
    return direction;
  }
  return raw;
}

export function resolveFilterDesignEffectiveStyleTab({
  moduleKey,
  styleTab,
  selectedMetaContainer,
  selectedMetaDropdown,
}) {
  if (styleTab === "container") {
    return selectedMetaContainer;
  }
  if (styleTab === "meta1" || styleTab === "selectmeta") {
    if (isWooRatingFilterModule(moduleKey) && selectedMetaDropdown === "icon") {
      return "meta2";
    }
    return selectedMetaDropdown;
  }
  if (styleTab === "meta" && moduleKey === "search") {
    return selectedMetaDropdown;
  }
  return styleTab;
}

export function resolveFilterDesignTabStyleStates({
  hoverSwitchSpacing,
  hoverSwitchPosition,
  hoverSwitchBg,
  hoverSwitchAl,
  hoverSwitchBr,
  hoverSwitchBs,
  hoverSwitchText,
}) {
  let styleStateSpacing = "default";
  if (hoverSwitchSpacing === true) {
    styleStateSpacing = "hover";
  } else if (hoverSwitchSpacing === "selected") {
    styleStateSpacing = "selected";
  }

  let styleStatePosition = "default";
  if (hoverSwitchPosition === true) {
    styleStatePosition = "hover";
  } else if (hoverSwitchPosition === "selected") {
    styleStatePosition = "selected";
  }

  let styleStateBg = "default";
  if (hoverSwitchBg === true) {
    styleStateBg = "hover";
  } else if (hoverSwitchBg === "active") {
    styleStateBg = "active";
  } else if (hoverSwitchBg === "selected") {
    styleStateBg = "selected";
  }

  let styleStateAl = "default";
  if (hoverSwitchAl === true) {
    styleStateAl = "hover";
  } else if (hoverSwitchAl === "selected") {
    styleStateAl = "selected";
  }

  let styleStateBr = "default";
  if (hoverSwitchBr === true) {
    styleStateBr = "hover";
  } else if (hoverSwitchBr === "selected") {
    styleStateBr = "selected";
  }

  let styleStateBs = "default";
  if (hoverSwitchBs === true) {
    styleStateBs = "hover";
  } else if (hoverSwitchBs === "selected") {
    styleStateBs = "selected";
  }

  let styleStateIcon = "default";
  if (hoverSwitchText === true) {
    styleStateIcon = "hover";
  } else if (hoverSwitchText === "selected") {
    styleStateIcon = "selected";
  } else if (hoverSwitchText === "placeholder") {
    styleStateIcon = "placeholder";
  } else {
    styleStateIcon = "default";
  }

  return {
    styleStateSpacing,
    styleStatePosition,
    styleStateBg,
    styleStateAl,
    styleStateBr,
    styleStateBs,
    styleStateIcon,
  };
}

export function resolveFlexFlowForFilterDesignTab({
  data,
  type,
  rowindex,
  columnindex,
  moduleindex,
  device,
  styleStateAl,
  styleTab,
}) {
  let flexFlow = "";
  if (type === "row") {
    let RowStyle = data[rowindex].style;
    if (RowStyle[device][styleStateAl]?.["flexFlow"]) {
      flexFlow = RowStyle[device][styleStateAl]["flexFlow"];
    } else {
      if (device === "desktop") {
        if (styleStateAl === "default") {
          if (RowStyle[device]["default"]?.["flexFlow"]) {
            flexFlow = RowStyle[device]["default"]["flexFlow"];
          }
        }
        if (styleStateAl === "hover") {
          if (RowStyle[device]["default"]?.["flexFlow"]) {
            flexFlow = RowStyle[device]["default"]["flexFlow"];
          }
        }
      }
      if (device === "tablet") {
        if (styleStateAl === "default") {
          if (RowStyle["desktop"]["default"]?.["flexFlow"]) {
            flexFlow = RowStyle["desktop"]["default"]["flexFlow"];
          }
        } else {
          if (RowStyle[device]["default"]?.["flexFlow"]) {
            flexFlow = RowStyle[device]["default"]["flexFlow"];
          } else {
            if (RowStyle["desktop"]["hover"]?.["flexFlow"]) {
              flexFlow = RowStyle["desktop"]["hover"]["flexFlow"];
            } else {
              if (RowStyle["desktop"]["default"]?.["flexFlow"]) {
                flexFlow = RowStyle["desktop"]["default"]["flexFlow"];
              }
            }
          }
        }
      }
      if (device === "mobile") {
        if (styleStateAl === "default") {
          if (RowStyle["desktop"]["default"]?.["flexFlow"]) {
            flexFlow = RowStyle["desktop"]["default"]["flexFlow"];
          }
        } else {
          if (RowStyle[device]["default"]?.["flexFlow"]) {
            flexFlow = RowStyle[device]["default"]["flexFlow"];
          } else {
            if (RowStyle["desktop"]["hover"]?.["flexFlow"]) {
              flexFlow = RowStyle["desktop"]["hover"]["flexFlow"];
            } else {
              if (RowStyle["desktop"]["default"]?.["flexFlow"]) {
                flexFlow = RowStyle["desktop"]["default"]["flexFlow"];
              }
            }
          }
        }
      }
    }
  }
  if (type === "column") {
    let ColStyle = data[rowindex].data[columnindex].style;
    if (ColStyle[device][styleStateAl]?.["flexFlow"]) {
      flexFlow = ColStyle[device][styleStateAl]["flexFlow"];
    } else {
      if (device === "desktop") {
        if (styleStateAl === "hover") {
          if (ColStyle[device]["default"]?.["flexFlow"]) {
            flexFlow = ColStyle[device]["default"]["flexFlow"];
          }
        }
      }
      if (device === "tablet") {
        if (styleStateAl === "default") {
          if (ColStyle["desktop"]["default"]?.["flexFlow"]) {
            flexFlow = ColStyle["desktop"]["default"]["flexFlow"];
          }
        } else {
          if (ColStyle[device]["default"]?.["flexFlow"]) {
            flexFlow = ColStyle[device]["default"]["flexFlow"];
          } else {
            if (ColStyle["desktop"]["hover"]?.["flexFlow"]) {
              flexFlow = ColStyle["desktop"]["hover"]["flexFlow"];
            } else {
              if (ColStyle["desktop"]["default"]?.["flexFlow"]) {
                flexFlow = ColStyle["desktop"]["default"]["flexFlow"];
              }
            }
          }
        }
      }
      if (device === "mobile") {
        if (styleStateAl === "default") {
          if (ColStyle["desktop"]["default"]?.["flexFlow"]) {
            flexFlow = ColStyle["desktop"]["default"]["flexFlow"];
          }
        } else {
          if (ColStyle[device]["default"]?.["flexFlow"]) {
            flexFlow = ColStyle[device]["default"]["flexFlow"];
          } else {
            if (ColStyle["desktop"]["hover"]?.["flexFlow"]) {
              flexFlow = ColStyle["desktop"]["hover"]["flexFlow"];
            } else {
              if (ColStyle["desktop"]["default"]?.["flexFlow"]) {
                flexFlow = ColStyle["desktop"]["default"]["flexFlow"];
              }
            }
          }
        }
      }
    }
  }
  if (type === "module") {
    let ModuleStyle = data[rowindex].data[columnindex].data[moduleindex].style;
    if (styleTab !== "container") {
      if (!ModuleStyle?.[styleTab]) {
        return normalizeFlexFlowDirection(flexFlow);
      }
      if (ModuleStyle[styleTab][device][styleStateAl]?.["flexFlow"]) {
        flexFlow = ModuleStyle[styleTab][device][styleStateAl]["flexFlow"];
      } else {
        if (device === "desktop") {
          if (styleStateAl === "hover") {
            if (ModuleStyle[styleTab][device]["default"]?.["flexFlow"]) {
              flexFlow = ModuleStyle[styleTab][device]["default"]["flexFlow"];
            }
          }
        }
        if (device === "tablet") {
          if (styleStateAl === "default") {
            if (ModuleStyle[styleTab]["desktop"]["default"]?.["flexFlow"]) {
              flexFlow =
                ModuleStyle[styleTab]["desktop"]["default"]["flexFlow"];
            }
          } else {
            if (ModuleStyle[styleTab][device]["default"]?.["flexFlow"]) {
              flexFlow = ModuleStyle[styleTab][device]["default"]["flexFlow"];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["hover"]?.["flexFlow"]) {
                flexFlow =
                  ModuleStyle[styleTab]["desktop"]["hover"]["flexFlow"];
              } else {
                if (
                  ModuleStyle[styleTab]["desktop"]["default"]?.["flexFlow"]
                ) {
                  flexFlow =
                    ModuleStyle[styleTab]["desktop"]["default"]["flexFlow"];
                }
              }
            }
          }
        }
        if (device === "mobile") {
          if (styleStateAl === "default") {
            if (ModuleStyle[styleTab]["desktop"]["default"]?.["flexFlow"]) {
              flexFlow =
                ModuleStyle[styleTab]["desktop"]["default"]["flexFlow"];
            }
          } else {
            if (ModuleStyle[styleTab][device]["default"]?.["flexFlow"]) {
              flexFlow = ModuleStyle[styleTab][device]["default"]["flexFlow"];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["hover"]?.["flexFlow"]) {
                flexFlow =
                  ModuleStyle[styleTab]["desktop"]["hover"]["flexFlow"];
              } else {
                if (
                  ModuleStyle[styleTab]["desktop"]["default"]?.["flexFlow"]
                ) {
                  flexFlow =
                    ModuleStyle[styleTab]["desktop"]["default"]["flexFlow"];
                }
              }
            }
          }
        }
      }
    } else {
      if (ModuleStyle[styleTab][device][styleStateAl]?.["flexFlow"]) {
        flexFlow = ModuleStyle[styleTab][device][styleStateAl]["flexFlow"];
      } else {
        if (device === "desktop") {
          if (styleStateAl === "hover") {
            if (ModuleStyle[styleTab][device]["default"]?.["flexFlow"]) {
              flexFlow = ModuleStyle[styleTab][device]["default"]["flexFlow"];
            }
          }
        }
        if (device === "tablet") {
          if (styleStateAl === "default") {
            if (ModuleStyle[styleTab]["desktop"]["default"]?.["flexFlow"]) {
              flexFlow =
                ModuleStyle[styleTab]["desktop"]["default"]["flexFlow"];
            }
          } else {
            if (ModuleStyle[styleTab][device]["default"]?.["flexFlow"]) {
              flexFlow = ModuleStyle[styleTab][device]["default"]["flexFlow"];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["hover"]?.["flexFlow"]) {
                flexFlow =
                  ModuleStyle[styleTab]["desktop"]["hover"]["flexFlow"];
              } else {
                if (
                  ModuleStyle[styleTab]["desktop"]["default"]?.["flexFlow"]
                ) {
                  flexFlow =
                    ModuleStyle[styleTab]["desktop"]["default"]["flexFlow"];
                }
              }
            }
          }
        }
        if (device === "mobile") {
          if (styleStateAl === "default") {
            if (ModuleStyle[styleTab]["desktop"]["default"]?.["flexFlow"]) {
              flexFlow =
                ModuleStyle[styleTab]["desktop"]["default"]["flexFlow"];
            }
          } else {
            if (ModuleStyle[styleTab][device]["default"]?.["flexFlow"]) {
              flexFlow = ModuleStyle[styleTab][device]["default"]["flexFlow"];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["hover"]?.["flexFlow"]) {
                flexFlow =
                  ModuleStyle[styleTab]["desktop"]["hover"]["flexFlow"];
              } else {
                if (
                  ModuleStyle[styleTab]["desktop"]["default"]?.["flexFlow"]
                ) {
                  flexFlow =
                    ModuleStyle[styleTab]["desktop"]["default"]["flexFlow"];
                }
              }
            }
          }
        }
      }
    }
  }
  return normalizeFlexFlowDirection(flexFlow);
}

export function resolveDisplayPropertyForFilterDesignTab({
  data,
  type,
  rowindex,
  columnindex,
  moduleindex,
  device,
  styleStateAl,
  styleTab,
}) {
  let display = "";
  if (type === "row") {
    let RowStyle = data[rowindex].style;
    if (RowStyle[device][styleStateAl]?.["display"]) {
      display = RowStyle[device][styleStateAl]["display"];
    } else {
      if (device === "desktop") {
        if (styleStateAl === "default") {
          if (RowStyle[device]["default"]?.["display"]) {
            display = RowStyle[device]["default"]["display"];
          }
        }
        if (styleStateAl === "hover") {
          if (RowStyle[device]["default"]?.["display"]) {
            display = RowStyle[device]["default"]["display"];
          }
        }
      }
      if (device === "tablet") {
        if (styleStateAl === "default") {
          if (RowStyle["desktop"]["default"]?.["display"]) {
            display = RowStyle["desktop"]["default"]["display"];
          }
        } else {
          if (RowStyle[device]["default"]?.["display"]) {
            display = RowStyle[device]["default"]["display"];
          } else {
            if (RowStyle["desktop"]["hover"]?.["display"]) {
              display = RowStyle["desktop"]["hover"]["display"];
            } else {
              if (RowStyle["desktop"]["default"]?.["display"]) {
                display = RowStyle["desktop"]["default"]["display"];
              }
            }
          }
        }
      }
      if (device === "mobile") {
        if (styleStateAl === "default") {
          if (RowStyle["desktop"]["default"]?.["display"]) {
            display = RowStyle["desktop"]["default"]["display"];
          }
        } else {
          if (RowStyle[device]["default"]?.["display"]) {
            display = RowStyle[device]["default"]["display"];
          } else {
            if (RowStyle["desktop"]["hover"]?.["display"]) {
              display = RowStyle["desktop"]["hover"]["display"];
            } else {
              if (RowStyle["desktop"]["default"]?.["display"]) {
                display = RowStyle["desktop"]["default"]["display"];
              }
            }
          }
        }
      }
    }
  }

  if (type === "column") {
    let ColStyle = data[rowindex].data[columnindex].style;
    if (ColStyle[device][styleStateAl]?.["display"]) {
      display = ColStyle[device][styleStateAl]["display"];
    } else {
      if (device === "desktop") {
        if (styleStateAl === "hover") {
          if (ColStyle[device]["default"]?.["display"]) {
            display = ColStyle[device]["default"]["display"];
          }
        }
      }
      if (device === "tablet") {
        if (styleStateAl === "default") {
          if (ColStyle["desktop"]["default"]?.["display"]) {
            display = ColStyle["desktop"]["default"]["display"];
          }
        } else {
          if (ColStyle[device]["default"]?.["display"]) {
            display = ColStyle[device]["default"]["display"];
          } else {
            if (ColStyle["desktop"]["hover"]?.["display"]) {
              display = ColStyle["desktop"]["hover"]["display"];
            } else {
              if (ColStyle["desktop"]["default"]?.["display"]) {
                display = ColStyle["desktop"]["default"]["display"];
              }
            }
          }
        }
      }
      if (device === "mobile") {
        if (styleStateAl === "default") {
          if (ColStyle["desktop"]["default"]?.["display"]) {
            display = ColStyle["desktop"]["default"]["display"];
          }
        } else {
          if (ColStyle[device]["default"]?.["display"]) {
            display = ColStyle[device]["default"]["display"];
          } else {
            if (ColStyle["desktop"]["hover"]?.["display"]) {
              display = ColStyle["desktop"]["hover"]["display"];
            } else {
              if (ColStyle["desktop"]["default"]?.["display"]) {
                display = ColStyle["desktop"]["default"]["display"];
              }
            }
          }
        }
      }
    }
  }

  if (type === "module") {
    let ModuleStyle = data[rowindex].data[columnindex].data[moduleindex].style;
    if (styleTab !== "container") {
      if (!ModuleStyle?.[styleTab]) {
        return display;
      }
      if (ModuleStyle[styleTab][device][styleStateAl]?.["display"]) {
        display = ModuleStyle[styleTab][device][styleStateAl]["display"];
      } else {
        if (device === "desktop") {
          if (styleStateAl === "hover") {
            if (ModuleStyle[styleTab][device]["default"]?.["display"]) {
              display = ModuleStyle[styleTab][device]["default"]["display"];
            }
          }
        }
        if (device === "tablet") {
          if (styleStateAl === "default") {
            if (ModuleStyle[styleTab]["desktop"]["default"]?.["display"]) {
              display =
                ModuleStyle[styleTab]["desktop"]["default"]["display"];
            }
          } else {
            if (ModuleStyle[styleTab][device]["default"]?.["display"]) {
              display = ModuleStyle[styleTab][device]["default"]["display"];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["hover"]?.["display"]) {
                display =
                  ModuleStyle[styleTab]["desktop"]["hover"]["display"];
              } else {
                if (
                  ModuleStyle[styleTab]["desktop"]["default"]?.["display"]
                ) {
                  display =
                    ModuleStyle[styleTab]["desktop"]["default"]["display"];
                }
              }
            }
          }
        }
        if (device === "mobile") {
          if (styleStateAl === "default") {
            if (ModuleStyle[styleTab]["desktop"]["default"]?.["display"]) {
              display =
                ModuleStyle[styleTab]["desktop"]["default"]["display"];
            }
          } else {
            if (ModuleStyle[styleTab][device]["default"]?.["display"]) {
              display = ModuleStyle[styleTab][device]["default"]["display"];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["hover"]?.["display"]) {
                display =
                  ModuleStyle[styleTab]["desktop"]["hover"]["display"];
              } else {
                if (
                  ModuleStyle[styleTab]["desktop"]["default"]?.["display"]
                ) {
                  display =
                    ModuleStyle[styleTab]["desktop"]["default"]["display"];
                }
              }
            }
          }
        }
      }
    } else {
      if (ModuleStyle[styleTab][device][styleStateAl]?.["display"]) {
        display = ModuleStyle[styleTab][device][styleStateAl]["display"];
      } else {
        if (device === "desktop") {
          if (styleStateAl === "hover") {
            if (ModuleStyle[styleTab][device]["default"]?.["display"]) {
              display = ModuleStyle[styleTab][device]["default"]["display"];
            }
          }
        }
        if (device === "tablet") {
          if (styleStateAl === "default") {
            if (ModuleStyle[styleTab]["desktop"]["default"]?.["display"]) {
              display =
                ModuleStyle[styleTab]["desktop"]["default"]["display"];
            }
          } else {
            if (ModuleStyle[styleTab][device]["default"]?.["display"]) {
              display = ModuleStyle[styleTab][device]["default"]["display"];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["hover"]?.["display"]) {
                display =
                  ModuleStyle[styleTab]["desktop"]["hover"]["display"];
              } else {
                if (
                  ModuleStyle[styleTab]["desktop"]["default"]?.["display"]
                ) {
                  display =
                    ModuleStyle[styleTab]["desktop"]["default"]["display"];
                }
              }
            }
          }
        }
        if (device === "mobile") {
          if (styleStateAl === "default") {
            if (ModuleStyle[styleTab]["desktop"]["default"]?.["display"]) {
              display =
                ModuleStyle[styleTab]["desktop"]["default"]["display"];
            }
          } else {
            if (ModuleStyle[styleTab][device]["default"]?.["display"]) {
              display = ModuleStyle[styleTab][device]["default"]["display"];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["hover"]?.["display"]) {
                display =
                  ModuleStyle[styleTab]["desktop"]["hover"]["display"];
              } else {
                if (
                  ModuleStyle[styleTab]["desktop"]["default"]?.["display"]
                ) {
                  display =
                    ModuleStyle[styleTab]["desktop"]["default"]["display"];
                }
              }
            }
          }
        }
      }
    }
  }
  return display;
}

export { buildFlexAlignOptions } from "../../../shared/designTabFlexAlignOptions";
