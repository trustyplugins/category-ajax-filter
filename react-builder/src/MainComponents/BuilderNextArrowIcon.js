import React from "react";

function BuilderNextArrowIcon({ className = "", alt = "", ...rest }) {
  const mergedClassName = ["caf-builder-next-arrow-icon", className]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      className={mergedClassName}
      viewBox="0 0 4 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={alt ? undefined : true}
      aria-label={alt || undefined}
      role={alt ? "img" : "presentation"}
      {...rest}
    >
      <path
        d="M2.42595e-07 0.350211L3.17724e-07 6.65039C0.000152906 6.71418 0.0135804 6.7767 0.038837 6.83123C0.0640937 6.88576 0.100223 6.93024 0.143336 6.95987C0.18645 6.9895 0.234915 7.00316 0.283515 6.99939C0.332114 6.99561 0.379008 6.97454 0.419148 6.93845L3.89201 3.78836C4.036 3.6578 4.036 3.3435 3.89201 3.21259L0.419148 0.0625026C0.379091 0.0260403 0.332174 0.00465794 0.283494 0.000678687C0.234813 -0.00330056 0.186231 0.0102755 0.143027 0.0399319C0.0998218 0.0695882 0.0636458 0.114191 0.0384302 0.168893C0.0132146 0.223596 -7.67674e-05 0.286306 2.42595e-07 0.350211Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default BuilderNextArrowIcon;
