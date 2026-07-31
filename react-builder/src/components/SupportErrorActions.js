import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faCheck } from "@fortawesome/free-solid-svg-icons";
import { copySupportReport } from "../utils/supportDiagnostics";

const SupportErrorActions = ({ report, variant = "card" }) => {
  const [copied, setCopied] = useState(false);

  if (!report?.errorId) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await copySupportReport(report);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      console.error("[CAF] Could not copy support report", error);
    }
  };

  if (variant === "inline") {
    return (
      <div className="caf-support-error-actions caf-support-error-actions--inline">
        <span className="caf-support-error-actions__ref">
          Reference <code>{report.errorId}</code>
        </span>
        <button
          type="button"
          className="caf-support-error-actions__copy caf-support-error-actions__copy--inline"
          onClick={handleCopy}
        >
          <FontAwesomeIcon icon={copied ? faCheck : faCopy} aria-hidden="true" />
          {copied ? "Copied" : "Copy support info"}
        </button>
      </div>
    );
  }

  return (
    <div className="caf-support-error-actions">
      <p className="caf-support-error-actions__id">
        Support reference: <code>{report.errorId}</code>
      </p>
      <p className="caf-support-error-actions__hint">
        Copy this report and send it to CAF support if the problem continues.
      </p>
      <button
        type="button"
        className="caf-support-error-actions__copy"
        onClick={handleCopy}
      >
        <FontAwesomeIcon icon={copied ? faCheck : faCopy} aria-hidden="true" />
        {copied ? "Copied" : "Copy support info"}
      </button>
    </div>
  );
};

export default SupportErrorActions;
