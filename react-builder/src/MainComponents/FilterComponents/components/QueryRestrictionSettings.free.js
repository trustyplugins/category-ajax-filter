import React from "react";
import { Switch } from "antd";

const emptyInclude = () => ({
  by: "",
  taxonomy: "",
  term_data: [],
});

const emptyExclude = () => ({
  by: "",
  taxonomy: "",
  term_data: [],
  post_data: [],
});

export const normalizeQueryRestriction = () => ({
  enabled: false,
  include: emptyInclude(),
  exclude: emptyExclude(),
});

export default function QueryRestrictionSettings() {
  return (
    <div className="caf-main-setting-page data-field caf-query-restriction-settings">
      <label className="caf-main-setting-page label">Query Restriction</label>
      <div
        className="caf-query-restriction-enable"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 12, opacity: 0.85 }}>
          Limit which posts can appear
        </span>
        <Switch checked={false} onChange={() => {}} disabled />
      </div>
      <p style={{ fontSize: 11, margin: "0 0 10px", opacity: 0.75 }}>
        Query restriction is available in Category Ajax Filter Pro.
      </p>
    </div>
  );
}
