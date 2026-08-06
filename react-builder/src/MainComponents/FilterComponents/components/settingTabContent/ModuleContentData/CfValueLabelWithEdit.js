import React from "react";
import { EditOutlined } from "@ant-design/icons";
import TermTaxonomyLabelText from "./TermTaxonomyLabelText";

const CfValueLabelWithEdit = ({ label, onEdit }) => (
  <div className="caf-filter-query-cf-value-title">
    <span className="caf-filter-query-cf-value-label-group">
      <TermTaxonomyLabelText name={label} />
      <span
        className="caf-filter-query-cf-value-edit"
        onClick={(event) => {
          event.stopPropagation();
          onEdit();
        }}
        role="button"
        tabIndex={0}
        aria-label="Edit value label"
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            onEdit();
          }
        }}
      >
        <EditOutlined />
      </span>
    </span>
  </div>
);

export default CfValueLabelWithEdit;
