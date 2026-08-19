import React from "react";
import { Tooltip } from "antd";
import { getUpgradeUrl } from "./capabilities";

const DEFAULT_UPGRADE_MESSAGE =
  "This feature is available in Category Ajax Filter Pro.";

export function TierLockedSection({
  locked = false,
  sectionTitle,
  children,
  className = "",
  upgradeMessage = DEFAULT_UPGRADE_MESSAGE,
}) {
  const sectionClasses = [
    "caf-main-setting-section",
    locked ? "caf-builder-tier-locked-section" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const section = (
    <section
      className={sectionClasses}
      aria-disabled={locked || undefined}
    >
      {sectionTitle ? (
        <h3 className="caf-main-setting-section-title caf-builder-tier-locked-section__title">
          {sectionTitle}
          {locked ? (
            <span className="caf-builder-tier-locked-section__badge">Pro</span>
          ) : null}
        </h3>
      ) : null}
      <div
        className={
          locked
            ? "caf-main-setting-section-body caf-builder-tier-locked-section__content"
            : "caf-main-setting-section-body"
        }
      >
        {children}
      </div>
      {locked ? (
        <div
          className="caf-builder-tier-locked-section__overlay"
          aria-hidden="true"
        />
      ) : null}
    </section>
  );

  if (!locked) {
    return section;
  }

  const upgradeUrl = getUpgradeUrl();
  const tooltipContent = (
    <span className="caf-builder-tier-locked-section__tooltip-text">
      {upgradeMessage}{" "}
      <a
        href={upgradeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="caf-builder-tier-locked-section__upgrade-link"
      >
        Upgrade to Pro
      </a>
    </span>
  );

  return (
    <Tooltip
      classNames={{ root: "caf-builder-tooltip caf-builder-tier-locked-tooltip" }}
      placement="topLeft"
      title={tooltipContent}
    >
      <div className="caf-builder-tier-locked-section__wrapper">{section}</div>
    </Tooltip>
  );
}

export default TierLockedSection;
