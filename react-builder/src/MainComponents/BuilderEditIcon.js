import React from "react";

function BuilderEditIcon({ className = "", alt = "Edit", ...rest }) {
  const mergedClassName = ["caf-builder-edit-icon", className]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      className={mergedClassName}
      viewBox="0 0 12 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={alt}
      role="img"
      {...rest}
    >
      <path
        d="M11.3392 12.2425H0.5M10.737 0.869126C10.4917 0.61844 10.1669 0.486106 9.83388 0.501157C9.50085 0.516207 9.18679 0.677414 8.96061 0.949408L3.61326 6.89032L2.90871 9.5664L5.31743 8.78364L10.6648 2.87619C10.7905 2.75131 10.8924 2.59963 10.9643 2.43016C11.0362 2.26068 11.0768 2.07688 11.0835 1.88966C11.0902 1.70244 11.0631 1.51563 11.0035 1.34031C10.944 1.165 10.8534 1.00476 10.737 0.869126Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default BuilderEditIcon;
