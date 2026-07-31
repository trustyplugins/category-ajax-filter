export function getModuleErrorBoundaryResetKey(
  rowindex,
  columnindex,
  moduleindex,
  moduleKey
) {
  return `${rowindex}-${columnindex}-${moduleindex}-${moduleKey}`;
}
