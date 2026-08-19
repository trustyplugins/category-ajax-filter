import React from "react";
import { Switch } from "antd";

function wrapAffixHint(label) {
  if (typeof label !== "string") {
    return label;
  }
  const match = label.match(/^(Prefix|Suffix)\s+(\([^)]+\))$/);
  if (!match) {
    return label;
  }
  return (
    <>
      {match[1]}{" "}
      <span className="setting-label-sub-text">{match[2]}</span>
    </>
  );
}

/** Static locked prefix/suffix chrome for Free builds. */
export default function PostPrefixSuffixProPanel({ prefixLabel = "Prefix", suffixLabel = "Suffix" }) {
  return <><div className="setting-manage-f-label"><label className="setting-label-main">{wrapAffixHint(prefixLabel)}</label><div className="module-content-tab-row caf-design-two-half"><label>Enable</label><Switch checked={false} disabled /></div></div><div className="setting-manage-f-label"><hr className="setting-hr-main" /><label className="setting-label-main">{wrapAffixHint(suffixLabel)}</label><div className="module-content-tab-row caf-design-two-half"><label>Enable</label><Switch checked={false} disabled /></div></div></>;
}
