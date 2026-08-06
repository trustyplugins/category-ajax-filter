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

const SECTION_COPY = {
  select: {
    title: "Setup step failed to load",
    description:
      "Something went wrong while loading this step. Try again or use the header to continue.",
  },
  filter: {
    title: "Filter builder failed to load",
    description:
      "An unexpected error occurred in the filter builder. Try again or switch to another step from the header.",
  },
  post: {
    title: "Post layout builder failed to load",
    description:
      "An unexpected error occurred in the post builder. Try again or switch to another step from the header.",
  },
  preview: {
    title: "Layout preview failed to load",
    description:
      "An unexpected error occurred in the layout preview. Try again or switch to another step from the header.",
  },
  "layouts-list": {
    title: "Filters list failed to load",
    description:
      "An unexpected error occurred while displaying your filters. Try again or refresh the page.",
  },
  analytics: {
    title: "Analytics dashboard failed to load",
    description:
      "An unexpected error occurred in the analytics dashboard. Try again or refresh the page.",
  },
};

class BuilderErrorBoundary extends React.Component {
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
    const section = this.props.section || "builder";
    const report = buildSupportReport({
      errorId: this.state.errorId,
      error,
      errorInfo,
      type: "section",
      section,
    });

    this.setState({ report });
    console.error(`[CAF ${section}]`, error, errorInfo);
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
    const { children, section = "filter" } = this.props;

    if (!this.state.hasError) {
      return children;
    }

    const copy = SECTION_COPY[section] || SECTION_COPY.filter;
    const showRefresh = section === "layouts-list" || section === "analytics";

    return (
      <div className="caf-builder-error-fallback">
        <div className="caf-builder-error-fallback__card" role="alert">
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className="caf-builder-error-fallback__icon"
            aria-hidden="true"
          />
          <h2 className="caf-builder-error-fallback__title">{copy.title}</h2>
          <p className="caf-builder-error-fallback__description">
            {copy.description}
          </p>
          <SupportErrorActions report={this.state.report} />
          <div className="caf-builder-error-fallback__actions">
            <button
              type="button"
              className="caf-builder-error-fallback__action caf-builder-error-fallback__action--primary"
              onClick={this.handleRetry}
            >
              <FontAwesomeIcon icon={faRotateRight} aria-hidden="true" />
              Try again
            </button>
            {showRefresh ? (
              <button
                type="button"
                className="caf-builder-error-fallback__action caf-builder-error-fallback__action--secondary"
                onClick={() => window.location.reload()}
              >
                Refresh page
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

export default BuilderErrorBoundary;
