/**
 * Pure helpers for Post DesignTab (layout-derived UI state).
 * Extracted from DesignTab.js without intended behavior change.
 */

export function resolvePostDesignTabStyleStates({
  hoverSwitchSpacing,
  hoverSwitchPosition,
  hoverSwitchBg,
  hoverSwitchAl,
  hoverSwitchBr,
  hoverSwitchBs,
}) {
  let styleStateSpacing = "default";
  if (hoverSwitchSpacing) {
    styleStateSpacing = "hover";
  }
  let styleStatePosition = "default";
  if (hoverSwitchPosition) {
    styleStatePosition = "hover";
  }
  let styleStateBg = "default";
  if (hoverSwitchBg) {
    styleStateBg = "hover";
  }
  let styleStateAl = "default";
  if (hoverSwitchAl) {
    styleStateAl = "hover";
  }
  let styleStateBr = "default";
  if (hoverSwitchBr) {
    styleStateBr = "hover";
  }
  let styleStateBs = "default";
  if (hoverSwitchBs) {
    styleStateBs = "hover";
  }
  return {
    styleStateSpacing,
    styleStatePosition,
    styleStateBg,
    styleStateAl,
    styleStateBr,
    styleStateBs,
  };
}

/**
 * Resolves flexFlow for row / column / module from layout data (post layout shape).
 * Preserves post-specific row branch (`?.[""]`) and customfield module branch.
 */
export function resolveFlexFlowForPostDesignTab({
  data,
  type,
  rowindex,
  columnindex,
  moduleindex,
  module,
  device,
  styleStateAl,
  styleTab,
}) {
  let flexFlow = "";
  if (type === "row") {
    let RowStyle = data[rowindex].style;
    if (RowStyle[device][styleStateAl]?.[""]) {
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
    let ModuleStyle =
      data[rowindex].data[columnindex].data[moduleindex].style;
    // Missing style buckets (e.g. stale "star" after module switch) fall back to root.
    const styleTabBucket =
      styleTab && styleTab !== "container" ? ModuleStyle?.[styleTab] : null;
    if (styleTabBucket) {
      if (styleTabBucket[device]?.[styleStateAl]?.["flexFlow"]) {
        flexFlow = styleTabBucket[device][styleStateAl]["flexFlow"];
      } else {
        if (device === "desktop") {
          if (styleStateAl === "hover") {
            if (styleTabBucket[device]?.["default"]?.["flexFlow"]) {
              flexFlow = styleTabBucket[device]["default"]["flexFlow"];
            }
          }
        }
        if (device === "tablet") {
          if (styleStateAl === "default") {
            if (styleTabBucket["desktop"]?.["default"]?.["flexFlow"]) {
              flexFlow = styleTabBucket["desktop"]["default"]["flexFlow"];
            }
          } else {
            if (styleTabBucket[device]?.["default"]?.["flexFlow"]) {
              flexFlow = styleTabBucket[device]["default"]["flexFlow"];
            } else {
              if (styleTabBucket["desktop"]?.["hover"]?.["flexFlow"]) {
                flexFlow = styleTabBucket["desktop"]["hover"]["flexFlow"];
              } else {
                if (styleTabBucket["desktop"]?.["default"]?.["flexFlow"]) {
                  flexFlow = styleTabBucket["desktop"]["default"]["flexFlow"];
                }
              }
            }
          }
        }
        if (device === "mobile") {
          if (styleStateAl === "default") {
            if (styleTabBucket["desktop"]?.["default"]?.["flexFlow"]) {
              flexFlow = styleTabBucket["desktop"]["default"]["flexFlow"];
            }
          } else {
            if (styleTabBucket[device]?.["default"]?.["flexFlow"]) {
              flexFlow = styleTabBucket[device]["default"]["flexFlow"];
            } else {
              if (styleTabBucket["desktop"]?.["hover"]?.["flexFlow"]) {
                flexFlow = styleTabBucket["desktop"]["hover"]["flexFlow"];
              } else {
                if (styleTabBucket["desktop"]?.["default"]?.["flexFlow"]) {
                  flexFlow = styleTabBucket["desktop"]["default"]["flexFlow"];
                }
              }
            }
          }
        }
      }
    } else {
      if (ModuleStyle[device][styleStateAl]?.["flexFlow"]) {
        flexFlow = ModuleStyle[device][styleStateAl]["flexFlow"];
      } else {
        if (device === "desktop") {
          if (styleStateAl === "hover") {
            if (ModuleStyle[device]["default"]?.["flexFlow"]) {
              flexFlow = ModuleStyle[device]["default"]["flexFlow"];
            }
          }
        }
        if (device === "tablet") {
          if (styleStateAl === "default") {
            if (ModuleStyle["desktop"]["default"]?.["flexFlow"]) {
              flexFlow = ModuleStyle["desktop"]["default"]["flexFlow"];
            }
          } else {
            if (ModuleStyle[device]["default"]?.["flexFlow"]) {
              flexFlow = ModuleStyle[device]["default"]["flexFlow"];
            } else {
              if (ModuleStyle["desktop"]["hover"]?.["flexFlow"]) {
                flexFlow = ModuleStyle["desktop"]["hover"]["flexFlow"];
              } else {
                if (ModuleStyle["desktop"]["default"]?.["flexFlow"]) {
                  flexFlow = ModuleStyle["desktop"]["default"]["flexFlow"];
                }
              }
            }
          }
        }
        if (device === "mobile") {
          if (styleStateAl === "default") {
            if (ModuleStyle["desktop"]["default"]?.["flexFlow"]) {
              flexFlow = ModuleStyle["desktop"]["default"]["flexFlow"];
            }
          } else {
            if (ModuleStyle[device]["default"]?.["flexFlow"]) {
              flexFlow = ModuleStyle[device]["default"]["flexFlow"];
            } else {
              if (ModuleStyle["desktop"]["hover"]?.["flexFlow"]) {
                flexFlow = ModuleStyle["desktop"]["hover"]["flexFlow"];
              } else {
                if (ModuleStyle["desktop"]["default"]?.["flexFlow"]) {
                  flexFlow = ModuleStyle["desktop"]["default"]["flexFlow"];
                }
              }
            }
          }
        }
      }
    }
  }
  return flexFlow;
}

/**
 * Resolves display for row / column / module from layout data (post layout shape).
 */
export function resolveDisplayPropertyForPostDesignTab({
  data,
  type,
  rowindex,
  columnindex,
  moduleindex,
  module,
  device,
  styleStateAl,
  styleTab,
}) {
  let display = "";
  if (type === "row") {
    const RowStyle = data[rowindex].style;
    if (RowStyle[device][styleStateAl]?.["display"]) {
      display = RowStyle[device][styleStateAl]["display"];
    } else if (RowStyle[device]?.default?.display) {
      display = RowStyle[device].default.display;
    }
  }
  if (type === "column") {
    const ColStyle = data[rowindex].data[columnindex].style;
    if (ColStyle[device][styleStateAl]?.["display"]) {
      display = ColStyle[device][styleStateAl]["display"];
    } else if (ColStyle[device]?.default?.display) {
      display = ColStyle[device].default.display;
    }
  }
  if (type === "module") {
    const ModuleStyle = data[rowindex].data[columnindex].data[moduleindex].style;
    // Missing style buckets (e.g. stale "star" after module switch) fall back to root.
    const styleTabBucket =
      styleTab && styleTab !== "container" ? ModuleStyle?.[styleTab] : null;
    if (styleTabBucket) {
      if (styleTabBucket[device]?.[styleStateAl]?.["display"]) {
        display = styleTabBucket[device][styleStateAl]["display"];
      } else if (styleTabBucket[device]?.default?.display) {
        display = styleTabBucket[device].default.display;
      }
    } else {
      if (ModuleStyle[device][styleStateAl]?.["display"]) {
        display = ModuleStyle[device][styleStateAl]["display"];
      } else if (ModuleStyle[device]?.default?.display) {
        display = ModuleStyle[device].default.display;
      }
    }
  }
  return display;
}
