import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateRight,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import SupportErrorActions from "./SupportErrorActions";
import {
  buildSupportReport,
  generateCafErrorId,
  persistClientError,
} from "../utils/supportDiagnostics";

class ModuleErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorId: "", report: null };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorId: generateCafErrorId(),
      errorMessage: String(error?.message || "Unknown error"),
    };
  }

  componentDidCatch(error, errorInfo) {
    const { moduleKey = "unknown", moduleLabel } = this.props;
    const report = buildSupportReport({
      errorId: this.state.errorId,
      error,
      errorInfo,
      type: "module",
      section: "",
      moduleKey,
      moduleLabel,
    });

    this.setState({ report });
    console.error(`[CAF module:${moduleKey}]`, error, errorInfo);
    persistClientError(report);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, errorId: "", report: null });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorId: "", report: null });
  };

  render() {
    const { children, moduleKey = "module", moduleLabel } = this.props;

    if (!this.state.hasError) {
      return children;
    }

    const label = moduleLabel || moduleKey;

    return (
      <div className="caf-module-error-fallback" role="alert">
        <div className="caf-module-error-fallback__header">
          <div className="caf-module-error-fallback__lead">
            <span className="caf-module-error-fallback__icon-wrap" aria-hidden="true">
              <FontAwesomeIcon
                icon={faTriangleExclamation}
                className="caf-module-error-fallback__icon"
              />
            </span>
            <div className="caf-module-error-fallback__text">
              <span className="caf-module-error-fallback__title">{label}</span>
              <span className="caf-module-error-fallback__subtitle">
                This module could not be loaded.
              </span>
            </div>
          </div>
          <button
            type="button"
            className="caf-module-error-fallback__action"
            onClick={this.handleRetry}
          >
            <FontAwesomeIcon icon={faRotateRight} aria-hidden="true" />
            Retry
          </button>
        </div>
        <SupportErrorActions report={this.state.report} variant="inline" />
      </div>
    );
  }
}

export default ModuleErrorBoundary;
