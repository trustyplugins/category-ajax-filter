/**
 * Applies row/column background type (color vs post image) to a cloned post layout tree.
 * Mutates `next` in place; caller owns clone + onChangeStyle commit.
 */
export function applyPostDesignTabBgTypeChange({
  key,
  next,
  type,
  rowindex,
  columnindex,
}) {
  if (type === "row") {
    const row = next[rowindex];
    if (!row) return;
    const settingData = { ...row.settings };
    const styleRow = row.style;
    settingData.bg_type = key;
    if (key === "post_image") {
      settingData["background_image"] = "post-img";
      styleRow.desktop.default.backgroundColor = "#00000000";
      styleRow.desktop.default.backgroundImage = "''";
      styleRow.desktop.default.backgroundSize = "cover";
      styleRow.desktop.default.backgroundPosition = "top left";
      styleRow.desktop.default.backgroundRepeat = "no-repeat";
    } else {
      settingData["background_image"] = "";
      styleRow.desktop.default.backgroundColor = "#00000000";
    }
    if (key === "color") {
      styleRow.desktop.default.backgroundImage = "''";
    }
    row.settings = settingData;
    row.style = styleRow;
  }
  if (type === "column") {
    const col = next[rowindex]?.data?.[columnindex];
    if (!col) return;
    const settingData = { ...col.settings };
    const styleCol = col.style;
    settingData.bg_type = key;
    if (key === "post_image") {
      settingData["background_image"] = "post-img";
      styleCol.desktop.default.backgroundColor = "#00000000";
      styleCol.desktop.default.backgroundImage = "''";
      styleCol.desktop.default.backgroundSize = "cover";
      styleCol.desktop.default.backgroundPosition = "top left";
      styleCol.desktop.default.backgroundRepeat = "no-repeat";
    } else {
      settingData["background_image"] = "";
      styleCol.desktop.default.backgroundColor = "#00000000";
    }
    if (key === "color") {
      styleCol.desktop.default.backgroundImage = "''";
    }
    col.settings = settingData;
    col.style = styleCol;
  }
}
