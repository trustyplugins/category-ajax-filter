import React from "react";
import BuilderPaginationIcon from "./BuilderPaginationIcon";
import BuilderResultCounterIcon from "./BuilderResultCounterIcon";
import BuilderSelectedIcon from "./BuilderSelectedIcon";
import BuilderSortingIcon from "./BuilderSortingIcon";

const MISC_PREVIEW_ICONS = {
  pagination: BuilderPaginationIcon,
  result_count: BuilderResultCounterIcon,
  sorting: BuilderSortingIcon,
  selected: BuilderSelectedIcon,
};

function BuilderMiscPreviewItemIcon({ itemKey, className = "", ...rest }) {
  const Icon = MISC_PREVIEW_ICONS[itemKey];
  if (!Icon) {
    return null;
  }

  return <Icon className={className} {...rest} />;
}

export default BuilderMiscPreviewItemIcon;
