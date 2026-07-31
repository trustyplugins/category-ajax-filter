export const toLayoutIndex = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const layoutIndexEquals = (left, right) =>
  Number(left) === Number(right);

export const normalizeLayoutIndexes = ({
  type = "row",
  rowindex = 0,
  columnindex = "",
  moduleindex = "",
  module = "",
} = {}) => ({
  type,
  rowindex: toLayoutIndex(rowindex, 0),
  columnindex:
    columnindex === "" || columnindex === null || columnindex === undefined
      ? ""
      : toLayoutIndex(columnindex, 0),
  moduleindex:
    moduleindex === "" || moduleindex === null || moduleindex === undefined
      ? ""
      : toLayoutIndex(moduleindex, 0),
  module,
});
