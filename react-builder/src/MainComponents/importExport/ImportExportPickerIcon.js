import React from "react";
import BuilderImportExportIcon from "../BuilderImportExportIcon";
import BuilderPaginationIcon from "../BuilderPaginationIcon";
import BuilderSelectedIcon from "../BuilderSelectedIcon";
import BuilderResultCounterIcon from "../BuilderResultCounterIcon";
import BuilderSortingIcon from "../BuilderSortingIcon";
import FilterModulePickerIcon from "../FilterComponents/components/FilterModulePickerIcon";

const iconClass = (className) =>
  ["caf-import-export-picker-icon", className].filter(Boolean).join(" ");

function FullFilterLayoutIcon({ className }) {
  return (
    <svg
      className={iconClass(className)}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M16.8179 2.66016H4.42646C3.4488 2.66016 2.65625 3.4527 2.65625 4.43036V16.8218C2.65625 17.7995 3.4488 18.592 4.42646 18.592H16.8179C17.7956 18.592 18.5881 17.7995 18.5881 16.8218V4.43036C18.5881 3.4527 17.7956 2.66016 16.8179 2.66016Z"
        stroke="currentColor"
        strokeWidth="1.59315"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.65625 7.97266H18.5881"
        stroke="currentColor"
        strokeWidth="1.59315"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.9668 7.97266V18.5939"
        stroke="currentColor"
        strokeWidth="1.59315"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FilterScopeIcon({ className }) {
  return (
    <svg
      className={iconClass(className)}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M19.4735 2.65625H1.77148L8.85231 11.0293V16.8179L12.3927 18.5881V11.0293L19.4735 2.65625Z"
        stroke="currentColor"
        strokeWidth="1.59315"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SinglePostItemIcon({ className }) {
  return (
    <svg
      className={iconClass(className)}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12.392 1.76953H5.31122C4.84173 1.76953 4.39147 1.95603 4.0595 2.28801C3.72752 2.61999 3.54102 3.07025 3.54102 3.53974V17.7014C3.54102 18.1709 3.72752 18.6211 4.0595 18.9531C4.39147 19.2851 4.84173 19.4716 5.31122 19.4716H15.9325C16.4019 19.4716 16.8522 19.2851 17.1842 18.9531C17.5162 18.6211 17.7027 18.1709 17.7027 17.7014V7.08015L12.392 1.76953Z"
        stroke="currentColor"
        strokeWidth="1.59315"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.3906 1.76953V7.08015H17.7012"
        stroke="currentColor"
        strokeWidth="1.59315"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.1648 11.5117H7.08398"
        stroke="currentColor"
        strokeWidth="1.59315"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.1648 15.0469H7.08398"
        stroke="currentColor"
        strokeWidth="1.59315"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LayoutSettingsIcon({ className }) {
  return (
    <svg
      className={iconClass(className)}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g clipPath="url(#caf-import-layout-settings-clip)">
        <path
          d="M10.6221 13.2833C12.0886 13.2833 13.2774 12.0945 13.2774 10.628C13.2774 9.16148 12.0886 7.97266 10.6221 7.97266C9.15562 7.97266 7.9668 9.16148 7.9668 10.628C7.9668 12.0945 9.15562 13.2833 10.6221 13.2833Z"
          stroke="currentColor"
          strokeWidth="1.59315"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17.1687 13.2782C17.0509 13.5451 17.0157 13.8413 17.0678 14.1284C17.1199 14.4155 17.2567 14.6804 17.4608 14.889L17.5139 14.9422C17.6785 15.1066 17.8091 15.3018 17.8981 15.5167C17.9872 15.7316 18.0331 15.9619 18.0331 16.1946C18.0331 16.4272 17.9872 16.6576 17.8981 16.8725C17.8091 17.0874 17.6785 17.2826 17.5139 17.447C17.3495 17.6116 17.1543 17.7422 16.9394 17.8312C16.7245 17.9203 16.4941 17.9662 16.2615 17.9662C16.0288 17.9662 15.7985 17.9203 15.5836 17.8312C15.3687 17.7422 15.1735 17.6116 15.0091 17.447L14.9559 17.3939C14.7473 17.1898 14.4824 17.053 14.1953 17.0009C13.9082 16.9488 13.612 16.984 13.3451 17.1018C13.0833 17.214 12.86 17.4003 12.7027 17.6378C12.5455 17.8752 12.4611 18.1535 12.46 18.4383V18.5888C12.46 19.0583 12.2735 19.5085 11.9415 19.8405C11.6095 20.1725 11.1592 20.359 10.6898 20.359C10.2203 20.359 9.77001 20.1725 9.43803 19.8405C9.10605 19.5085 8.91955 19.0583 8.91955 18.5888V18.5091C8.91269 18.2162 8.81787 17.932 8.64739 17.6937C8.47691 17.4553 8.23867 17.2738 7.96364 17.1726C7.69668 17.0548 7.40054 17.0196 7.11342 17.0717C6.82629 17.1238 6.56135 17.2606 6.35275 17.4647L6.29964 17.5178C5.96748 17.85 5.51697 18.0366 5.04722 18.0366C4.57747 18.0366 4.12696 17.85 3.7948 17.5178C3.46264 17.1856 3.27603 16.7351 3.27603 16.2654C3.27603 15.7956 3.46264 15.3451 3.7948 15.013L3.84791 14.9599C4.0668 14.7456 4.21279 14.4679 4.2652 14.1661C4.31762 13.8643 4.27382 13.5537 4.13999 13.2782C4.02779 13.0164 3.8415 12.7931 3.60403 12.6358C3.36657 12.4786 3.0883 12.3942 2.80349 12.3931H2.65302C2.18353 12.3931 1.73327 12.2066 1.40129 11.8746C1.06932 11.5426 0.882813 11.0923 0.882812 10.6229C0.882812 10.1534 1.06932 9.70311 1.40129 9.37113C1.73327 9.03915 2.18353 8.85265 2.65302 8.85265H2.73268C3.01749 8.85151 3.29576 8.76712 3.53322 8.60986C3.77069 8.45259 3.95698 8.22933 4.06918 7.96754C4.187 7.70058 4.22215 7.40445 4.17009 7.11732C4.11803 6.8302 3.98115 6.56526 3.7771 6.35666L3.72399 6.30355C3.39183 5.97139 3.20522 5.52088 3.20522 5.05113C3.20522 4.58138 3.39183 4.13087 3.72399 3.79871C4.05616 3.46654 4.50666 3.27994 4.97641 3.27994C5.44616 3.27994 5.89667 3.46654 6.22883 3.79871L6.28194 3.85181C6.49621 4.07071 6.77388 4.21669 7.07568 4.26911C7.37747 4.32153 7.68811 4.27772 7.96364 4.1439C8.22542 4.0317 8.44869 3.8454 8.60595 3.60794C8.76321 3.37047 8.8476 3.09221 8.84874 2.80739V2.65692C8.84874 2.18744 9.03524 1.73718 9.36722 1.4052C9.6992 1.07322 10.1495 0.886719 10.6189 0.886719C11.0884 0.886719 11.5387 1.07322 11.8707 1.4052C12.2026 1.73718 12.3892 2.18744 12.3892 2.65692V2.73658C12.3903 3.0214 12.4747 3.29966 12.6319 3.53713C12.7892 3.77459 13.0125 3.96089 13.2743 4.07309C13.5412 4.19091 13.8374 4.22606 14.1245 4.174C14.4116 4.12193 14.6765 3.98505 14.8851 3.78101L14.9382 3.7279C15.2704 3.39574 15.7209 3.20913 16.1907 3.20913C16.4233 3.20913 16.6536 3.25494 16.8685 3.34395C17.0834 3.43296 17.2786 3.56343 17.4431 3.7279C17.6076 3.89237 17.738 4.08762 17.827 4.30251C17.916 4.51741 17.9619 4.74772 17.9619 4.98032C17.9619 5.21292 17.916 5.44323 17.827 5.65813C17.738 5.87302 17.6076 6.06827 17.4431 6.23274L17.39 6.28585C17.1826 6.50824 17.0498 6.78981 17.0102 7.09128C16.9705 7.39275 17.0259 7.69908 17.1687 7.96754C17.2809 8.22933 17.4672 8.45259 17.7047 8.60986C17.9421 8.76712 18.2204 8.85151 18.5052 8.85265H18.5849C19.0544 8.85265 19.5046 9.03915 19.8366 9.37113C20.1686 9.70311 20.3551 10.1534 20.3551 10.6229C20.3551 11.0923 20.1686 11.5426 19.8366 11.8746C19.5046 12.2066 19.0544 12.3931 18.5849 12.3931H18.5052C18.2204 12.3942 17.9421 12.4786 17.7047 12.6358C17.4672 12.7931 17.2809 13.0164 17.1687 13.2782Z"
          stroke="currentColor"
          strokeWidth="1.59315"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="caf-import-layout-settings-clip">
          <rect width="21.2425" height="21.2425" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function ImportFromLibraryIcon({ className }) {
  return (
    <svg
      className={iconClass(className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8.96273 2.98047H3.98402C3.43409 2.98047 2.98828 3.42628 2.98828 3.97621V8.95491C2.98828 9.50485 3.43409 9.95065 3.98402 9.95065H8.96273C9.51266 9.95065 9.95847 9.50485 9.95847 8.95491V3.97621C9.95847 3.42628 9.51266 2.98047 8.96273 2.98047Z"
        stroke="currentColor"
        strokeWidth="1.79229"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.9178 2.98047H14.9391C14.3892 2.98047 13.9434 3.42628 13.9434 3.97621V8.95491C13.9434 9.50485 14.3892 9.95065 14.9391 9.95065H19.9178C20.4677 9.95065 20.9135 9.50485 20.9135 8.95491V3.97621C20.9135 3.42628 20.4677 2.98047 19.9178 2.98047Z"
        stroke="currentColor"
        strokeWidth="1.79229"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.96273 13.9336H3.98402C3.43409 13.9336 2.98828 14.3794 2.98828 14.9293V19.908C2.98828 20.458 3.43409 20.9038 3.98402 20.9038H8.96273C9.51266 20.9038 9.95847 20.458 9.95847 19.908V14.9293C9.95847 14.3794 9.51266 13.9336 8.96273 13.9336Z"
        stroke="currentColor"
        strokeWidth="1.79229"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.9178 13.9336H14.9391C14.3892 13.9336 13.9434 14.3794 13.9434 14.9293V19.908C13.9434 20.458 14.3892 20.9038 14.9391 20.9038H19.9178C20.4677 20.9038 20.9135 20.458 20.9135 19.908V14.9293C20.9135 14.3794 20.4677 13.9336 19.9178 13.9336Z"
        stroke="currentColor"
        strokeWidth="1.79229"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChooseFileIcon({ className }) {
  return (
    <svg
      className={iconClass(className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M13.9398 1.98438H5.9739C5.44573 1.98438 4.93919 2.19419 4.56571 2.56767C4.19224 2.94114 3.98242 3.44768 3.98242 3.97586V19.9077C3.98242 20.4359 4.19224 20.9424 4.56571 21.3159C4.93919 21.6894 5.44573 21.8992 5.9739 21.8992H17.9228C18.451 21.8992 18.9575 21.6894 19.331 21.3159C19.7045 20.9424 19.9143 20.4359 19.9143 19.9077V7.95882L13.9398 1.98438Z"
        stroke="currentColor"
        strokeWidth="1.79229"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.9434 1.98438V7.95882H19.9178"
        stroke="currentColor"
        strokeWidth="1.79229"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.9492 10.9492V16.9237"
        stroke="currentColor"
        strokeWidth="1.79229"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.96289 13.9364L11.9501 10.9492L14.9373 13.9364"
        stroke="currentColor"
        strokeWidth="1.79229"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ImportExportPreviewEyeIcon({ className = "" }) {
  return (
    <svg
      className={iconClass(className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const FILTER_MODULE_KEYS = new Set([
  "checkbox_filter",
  "dropdown_filter",
  "range_slider",
  "search",
  "reset",
]);

const ICON_MAP = {
  export: BuilderImportExportIcon,
  import: ImportFromLibraryIcon,
  full_layout: FullFilterLayoutIcon,
  full_filter_layout: FullFilterLayoutIcon,
  full_filter: FullFilterLayoutIcon,
  filter_layout: FilterScopeIcon,
  filter: FilterScopeIcon,
  post_layout: SinglePostItemIcon,
  single_post_item: SinglePostItemIcon,
  layout_settings: LayoutSettingsIcon,
  pagination: BuilderPaginationIcon,
  selected: BuilderSelectedIcon,
  result_count: BuilderResultCounterIcon,
  sorting: BuilderSortingIcon,
  library: ImportFromLibraryIcon,
  file: ChooseFileIcon,
  choose_file: ChooseFileIcon,
};

function ImportExportPickerIcon({ iconKey, className }) {
  if (FILTER_MODULE_KEYS.has(iconKey)) {
    return (
      <FilterModulePickerIcon moduleKey={iconKey} className={className} />
    );
  }

  const Icon = ICON_MAP[iconKey] || FullFilterLayoutIcon;
  return <Icon className={className} />;
}

export function ImportExportLabel({ iconKey, children, className = "" }) {
  return (
    <span className={["caf-import-export-label", className].filter(Boolean).join(" ")}>
      <ImportExportPickerIcon
        iconKey={iconKey}
        className="caf-import-export-label-icon"
      />
      <span>{children}</span>
    </span>
  );
}

export default ImportExportPickerIcon;
