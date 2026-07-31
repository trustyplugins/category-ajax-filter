import React from "react";

function BuilderImportExportNewIcon({
  className = "",
  alt = "Import/Export",
  onClick,
  ...rest
}) {
  const mergedClassName = ["caf-builder-import-export-new-icon", className]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      className={mergedClassName}
      viewBox="0 0 22 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={alt}
      role="img"
      onClick={onClick}
      {...rest}
    >
      <path
        d="M6.22222 0L0 6.20667H4.66667V17.1111H7.77778V6.20667H12.4444L6.22222 0ZM17.1111 21.7933V10.8889H14V21.7933H9.33333L15.5556 28L21.7778 21.7933H17.1111Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default BuilderImportExportNewIcon;
