import React from "react";

function BuilderDeleteIcon({
  className = "",
  alt = "Delete",
  onClick,
  ...rest
}) {
  const mergedClassName = ["caf-builder-delete-icon", className]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      className={mergedClassName}
      viewBox="0 0 10 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={alt}
      role="img"
      onClick={onClick}
      {...rest}
    >
      <path
        d="M1.08067 3.47547V11.658C1.08067 12.4797 1.60062 13.1458 2.24202 13.1458H6.88739C7.52881 13.1458 8.04874 12.4797 8.04874 11.658V3.47547M1.08067 3.47547H0.5M1.08067 3.47547H2.24202M8.04874 3.47547H8.62941M8.04874 3.47547H6.88739M2.24202 3.47547V1.98774C2.24202 1.16608 2.76197 0.5 3.40336 0.5H5.72605C6.36746 0.5 6.88739 1.16608 6.88739 1.98774V3.47547M2.24202 3.47547H6.88739M3.40336 6.45094V10.1703M5.72605 6.45094V10.1703"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default BuilderDeleteIcon;
