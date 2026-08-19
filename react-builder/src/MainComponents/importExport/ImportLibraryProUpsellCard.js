import React from "react";
import { getLibraryTemplateUpgradeUrl } from "./importLibraryAccess";
import proUpsellBg from "../images/import-library-pro-upsell-bg.png";

function ImportLibraryProUpsellLockIcon() {
  return (
    <svg
      className="caf-import-library-pro-upsell__lock-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8 11V8.2C8 5.88 9.79 4 12 4s4 1.88 4 4.2V11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect
        x="6.25"
        y="11"
        width="11.5"
        height="9"
        rx="2.2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 14.15v2.7M10.65 15.5h2.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ImportLibraryProUpsellCard() {
  return (
    <article className="caf-import-template-card caf-import-template-card--preview caf-import-template-card--pro-upsell">
      <a
        className="caf-import-library-pro-upsell"
        href={getLibraryTemplateUpgradeUrl()}
        target="_blank"
        rel="noopener noreferrer"
        style={{ backgroundImage: `url(${proUpsellBg})` }}
      >
        <span className="caf-import-template-badge caf-import-template-badge--pro">
          <span className="caf-import-template-badge-icon" aria-hidden="true" />
          Pro
        </span>
        <span className="caf-import-library-pro-upsell__lock">
          <ImportLibraryProUpsellLockIcon />
        </span>
        <p className="caf-import-library-pro-upsell__title">Explore Pro Layouts</p>
        <p className="caf-import-library-pro-upsell__desc">
          Unlock more professional layouts for blog, CPT & WooCommerce.
        </p>
        <span className="caf-import-library-pro-upsell__cta">
          <span className="caf-import-template-badge-icon" aria-hidden="true" />
          View Pro Layouts
        </span>
      </a>
      <p className="caf-import-template-caption" aria-hidden="true">
        &nbsp;
      </p>
    </article>
  );
}

export default ImportLibraryProUpsellCard;
