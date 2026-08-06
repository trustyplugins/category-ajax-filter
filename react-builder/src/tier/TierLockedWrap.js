import React from "react";
import { Tooltip } from "antd";
import { getUpgradeUrl } from "./capabilities";

const DEFAULT_UPGRADE_MESSAGE =
  "This feature is available in Category Ajax Filter Pro.";

export function TierLockedWrap({
  locked = false,
  children,
  className = "",
  upgradeMessage = DEFAULT_UPGRADE_MESSAGE,
  showProBadge = false,
}) {
  if (!locked) {
    return children;
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
      <div className={`caf-builder-tier-locked-wrap ${className}`.trim()}>
        {showProBadge ? (
          <span className="caf-builder-tier-locked-wrap__badge">Pro</span>
        ) : null}
        <div className="caf-builder-tier-locked-wrap__content">{children}</div>
        <div
          className="caf-builder-tier-locked-wrap__overlay"
          aria-hidden="true"
        />
      </div>
    </Tooltip>
  );
}

export default TierLockedWrap;
