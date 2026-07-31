import React from "react";
import { Switch } from "antd";

/** Static locked prefix/suffix chrome for Free builds. */
export default function PostPrefixSuffixProPanel({ prefixLabel = "Prefix", suffixLabel = "Suffix" }) {
  return <><div className="setting-manage-f-label"><label className="setting-label-main">{prefixLabel}</label><div className="module-content-tab-row caf-design-two-half"><label>Enable</label><Switch checked={false} disabled /></div></div><div className="setting-manage-f-label"><hr className="setting-hr-main" /><label className="setting-label-main">{suffixLabel}</label><div className="module-content-tab-row caf-design-two-half"><label>Enable</label><Switch checked={false} disabled /></div></div></>;
}
