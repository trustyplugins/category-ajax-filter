import React, { useEffect, useState } from "react";
import { Input, Segmented, Tooltip } from "antd";
import { commitPostModuleSettingsPatch } from "../postLayoutSnapshot";
import {
  BADGE_DEFAULT_TEXT,
  BADGE_NEW_CONDITION_OPTIONS,
  BADGE_NEW_DAYS_DEFAULT,
  BADGE_TEXT_SOURCE_OPTIONS,
  getBadgeTypeSettings,
  normalizeBadgeNewCondition,
  normalizeBadgeNewDays,
  normalizeBadgeTextSource,
} from "../../../woocommerce/badgeTypeOptions";
import {
  getFreeformLabelTextForUi,
  normalizeFreeformLabelText,
} from "../shared/freeformLabelTextUtils";

const NEW_BADGE_TYPE = "new";

function NewBadgeSettings(props) {
  const { data, indexes, onSettingChange } = props;
  const { rowindex, columnindex, moduleindex } = indexes || {};
  const modSettings =
    data?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex]?.settings || {};
  const newSettings = getBadgeTypeSettings(modSettings, NEW_BADGE_TYPE);

  const [textSource, setTextSource] = useState(
    normalizeBadgeTextSource(newSettings?.text_source),
  );
  const [customText, setCustomText] = useState(
    getFreeformLabelTextForUi(newSettings?.custom_text, BADGE_DEFAULT_TEXT.new),
  );
  const [condition, setCondition] = useState(
    normalizeBadgeNewCondition(newSettings?.condition),
  );
  const [days, setDays] = useState(
    String(normalizeBadgeNewDays(newSettings?.days)),
  );

  useEffect(() => {
    const nextNewSettings = getBadgeTypeSettings(modSettings, NEW_BADGE_TYPE);
    setTextSource(normalizeBadgeTextSource(nextNewSettings?.text_source));
    setCustomText(
      getFreeformLabelTextForUi(
        nextNewSettings?.custom_text,
        BADGE_DEFAULT_TEXT.new,
      ),
    );
    setCondition(normalizeBadgeNewCondition(nextNewSettings?.condition));
    setDays(String(normalizeBadgeNewDays(nextNewSettings?.days)));
  }, [data, rowindex, columnindex, moduleindex]);

  const patchNewSettings = (patchFn) => {
    commitPostModuleSettingsPatch({
      data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange,
      patch: (settings) => {
        const currentBadgeSettings =
          settings.badge_settings && typeof settings.badge_settings === "object"
            ? { ...settings.badge_settings }
            : {};
        const currentNewSettings =
          currentBadgeSettings[NEW_BADGE_TYPE] &&
          typeof currentBadgeSettings[NEW_BADGE_TYPE] === "object"
            ? { ...currentBadgeSettings[NEW_BADGE_TYPE] }
            : {};

        patchFn(currentNewSettings);

        settings.badge_settings = {
          ...currentBadgeSettings,
          [NEW_BADGE_TYPE]: currentNewSettings,
        };
      },
    });
  };

  const handleTextSourceChange = (value) => {
    const nextSource = normalizeBadgeTextSource(value);
    setTextSource(nextSource);
    patchNewSettings((newBadge) => {
      newBadge.text_source = nextSource;
    });
  };

  const handleCustomTextChange = (event) => {
    const value = event.target.value;
    setCustomText(value);
    patchNewSettings((newBadge) => {
      newBadge.custom_text = value;
    });
  };

  const handleCustomTextBlur = (event) => {
    const normalized = normalizeFreeformLabelText(
      event.target.value,
      BADGE_DEFAULT_TEXT.new,
    );
    setCustomText(normalized);
    patchNewSettings((newBadge) => {
      newBadge.custom_text = normalized;
    });
  };

  const handleConditionChange = (value) => {
    const nextCondition = normalizeBadgeNewCondition(value);
    setCondition(nextCondition);
    patchNewSettings((newBadge) => {
      newBadge.condition = nextCondition;
      if (nextCondition === "days" && !newBadge.days) {
        newBadge.days = BADGE_NEW_DAYS_DEFAULT;
      }
    });
  };

  const handleDaysChange = (event) => {
    const value = event.target.value;
    setDays(value);
    const parsed = Number.parseInt(String(value ?? "").trim(), 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
      return;
    }
    patchNewSettings((newBadge) => {
      newBadge.days = parsed;
    });
  };

  const handleDaysBlur = (event) => {
    const normalized = normalizeBadgeNewDays(event.target.value);
    setDays(String(normalized));
    patchNewSettings((newBadge) => {
      newBadge.days = normalized;
    });
  };

  return (
    <div className="setting-manage-f-label">
      <hr className="setting-hr-main"></hr>
      <label className="setting-label-main">New Settings</label>
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title="Choose whether to use the default new label or your own custom text."
        >
          <label>Text Source</label>
        </Tooltip>
        <Segmented
          value={textSource}
          onChange={handleTextSourceChange}
          className="hoverTabCaf"
          options={BADGE_TEXT_SOURCE_OPTIONS}
        />
      </div>
      {textSource === "custom_text" && (
        <div className="module-content-tab-row caf-design-two-half">
          <Tooltip
            classNames={{ root: "caf-builder-tooltip" }}
            placement="topLeft"
            title="Custom label shown on the new badge."
          >
            <label>Text</label>
          </Tooltip>
          <Input
            value={customText}
            onChange={handleCustomTextChange}
            onBlur={handleCustomTextBlur}
            placeholder={BADGE_DEFAULT_TEXT.new}
          />
        </div>
      )}
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title="Default uses the standard 30-day WooCommerce newness window. Days lets you set a custom count."
        >
          <label>Condition</label>
        </Tooltip>
        <Segmented
          value={condition}
          onChange={handleConditionChange}
          className="hoverTabCaf"
          options={BADGE_NEW_CONDITION_OPTIONS}
        />
      </div>
      {condition === "days" && (
        <div className="module-content-tab-row caf-design-two-half">
          <Tooltip
            classNames={{ root: "caf-builder-tooltip" }}
            placement="topLeft"
            title="Show the New badge on products created within this many days."
          >
            <label>Days</label>
          </Tooltip>
          <Input
            type="number"
            min={1}
            value={days}
            onChange={handleDaysChange}
            onBlur={handleDaysBlur}
            placeholder={String(BADGE_NEW_DAYS_DEFAULT)}
          />
        </div>
      )}
    </div>
  );
}

export default NewBadgeSettings;
