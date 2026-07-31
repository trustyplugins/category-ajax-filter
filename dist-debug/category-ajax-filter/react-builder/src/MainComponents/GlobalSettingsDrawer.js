import React, { useState } from "react";
import { Drawer } from "antd";
import BuilderGearIcon from "./BuilderGearIcon";
import CustomFontManager from "./CustomFontManager";
import { canUseFeature } from "../tier/capabilities";
import { TierLockedSection } from "../tier/TierLockedSection";

const GLOBAL_SETTINGS_PRO_MESSAGE =
  "Plugin settings and custom fonts are available in Category Ajax Filter Pro.";

function GlobalSettingsDrawer() {
  const [open, setOpen] = useState(false);
  const settingsLocked = !canUseFeature("global_settings");

  return (
    <>
      <div
        className="caf-settings-main-outer"
        role="button"
        tabIndex={0}
        aria-label="Plugin settings"
        onClick={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            setOpen(true);
          }
        }}
      >
        <BuilderGearIcon className="caf-setting-icon" alt="Settings" />
      </div>

      <Drawer
        title="Plugin Settings"
        placement="right"
        closable={false}
        onClose={() => setOpen(false)}
        open={open}
        rootClassName="caf-global-settings-drawer"
      >
        <TierLockedSection
          locked={settingsLocked}
          className="caf-builder-tier-locked-section--global-settings"
          upgradeMessage={GLOBAL_SETTINGS_PRO_MESSAGE}
        >
          <CustomFontManager />
        </TierLockedSection>
      </Drawer>
    </>
  );
}

export default GlobalSettingsDrawer;
