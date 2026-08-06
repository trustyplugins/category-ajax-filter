import React from "react";

const iconClass = (className, mode) =>
  ["caf-filter-position-tab-icon", `caf-filter-position-tab-icon--${mode}`, className]
    .filter(Boolean)
    .join(" ");

function InlineFilterPositionIcon({ className }) {
  return (
    <svg
      className={iconClass(className, "inline")}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M1.5 0.5H10.5C10.7652 0.5 11.0195 0.605432 11.207 0.792969C11.3946 0.980505 11.5 1.23478 11.5 1.5V10.5C11.5 10.7652 11.3946 11.0195 11.207 11.207C11.0195 11.3946 10.7652 11.5 10.5 11.5H1.5C1.23478 11.5 0.980505 11.3946 0.792969 11.207C0.605432 11.0195 0.5 10.7652 0.5 10.5V1.5C0.5 1.23478 0.605432 0.980505 0.792969 0.792969C0.980505 0.605432 1.23478 0.5 1.5 0.5ZM0.625 10.5C0.625 10.7321 0.716764 10.955 0.880859 11.1191C1.04495 11.2832 1.26794 11.375 1.5 11.375H3.875V4.375H0.625V10.5ZM4 11.375H10.5C10.7321 11.375 10.955 11.2832 11.1191 11.1191C11.2832 10.955 11.375 10.7321 11.375 10.5V4.375H4V11.375ZM1.5 0.625C1.26794 0.625 1.04495 0.716765 0.880859 0.880859C0.716765 1.04495 0.625 1.26794 0.625 1.5V4.25H11.375V1.5C11.375 1.29689 11.3044 1.10104 11.1768 0.945312L11.1191 0.880859L11.0547 0.823242C10.899 0.695598 10.7031 0.625 10.5 0.625H1.5Z"
        fill="currentColor"
        stroke="currentColor"
      />
    </svg>
  );
}

function FloatButtonFilterPositionIcon({ className }) {
  return (
    <svg
      className={iconClass(className, "floating")}
      viewBox="0 0 15 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="0.5"
        y="0.5"
        width="13.6965"
        height="11"
        rx="1.5"
        stroke="currentColor"
        strokeDasharray="4 1"
      />
      <rect
        x="3.04297"
        y="9.00977"
        width="8.61123"
        height="2.68805"
        rx="1.34403"
        fill="currentColor"
      />
    </svg>
  );
}

function FilterPositionIcon({ mode, className }) {
  if (mode === "floating") {
    return <FloatButtonFilterPositionIcon className={className} />;
  }
  return <InlineFilterPositionIcon className={className} />;
}

export default FilterPositionIcon;
