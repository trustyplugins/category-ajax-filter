import React, { useState } from "react";
import { Button, Drawer } from "antd";
import BuilderGearIcon from "./BuilderGearIcon";
import { TierLockedSection } from "../tier/TierLockedSection";

const GLOBAL_SETTINGS_PRO_MESSAGE =
  "Plugin settings and custom fonts are available in Category Ajax Filter Pro.";

function GlobalSettingsDrawer() {
  const [open, setOpen] = useState(false);

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
          locked
          className="caf-builder-tier-locked-section--global-settings"
          upgradeMessage={GLOBAL_SETTINGS_PRO_MESSAGE}
        >
          <div className="caf-misc-setting-page-popup-container">
            <div className="caf-main-setting-page-popup-content">
              <div className="caf-main-setting-page-popup-form-section">
                <section className="caf-main-setting-section">
                  <h3 className="caf-main-setting-section-title">Custom Fonts</h3>
                  <div className="caf-main-setting-section-body">
                    <div className="caf-main-setting-page data-field">
                      <p className="caf-main-setting-page description">
                        Upload TTF font files to use them in the Global Font
                        Family selector for your layouts.
                      </p>
                      <Button disabled>Upload Font</Button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </TierLockedSection>
      </Drawer>
    </>
  );
}

export default GlobalSettingsDrawer;
