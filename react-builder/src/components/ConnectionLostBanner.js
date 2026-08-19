import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateRight,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import apiClient, { refreshRestNonce } from "../api/client";
import { apiEndpoints } from "../api/endpoints";
import {
  clearConnection,
  setConnectionRetryFailed,
  setConnectionRetrying,
} from "../store/connectionSlice";

const ConnectionLostBanner = () => {
  const dispatch = useDispatch();
  const { lost, retryFailed, retrying } = useSelector((state) => state.connection);

  if (!lost) {
    return null;
  }

  const handleRetry = async () => {
    dispatch(setConnectionRetrying(true));
    dispatch(setConnectionRetryFailed(false));

    try {
      await refreshRestNonce(apiClient);
      await apiClient.get(apiEndpoints.getLayoutsList(1, ""));
      dispatch(clearConnection());
    } catch (error) {
      console.error(error);
      dispatch(setConnectionRetryFailed(true));
    } finally {
      dispatch(setConnectionRetrying(false));
    }
  };

  const noticeClass = retryFailed
    ? "caf-connection-notice caf-connection-notice--critical"
    : "caf-connection-notice caf-connection-notice--warning";

  return (
    <div className={noticeClass} role="alert">
      <div className="caf-connection-notice__inner">
        <div className="caf-connection-notice__content">
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className="caf-connection-notice__icon"
            aria-hidden="true"
          />
          <div className="caf-connection-notice__text">
            <p className="caf-connection-notice__title">
              {retryFailed ? "Still disconnected" : "Connection lost"}
            </p>
            <p className="caf-connection-notice__subtitle">
              {retryFailed
                ? "We could not reconnect to WordPress. Refresh the page to continue."
                : "Your session may have expired. Try again to reconnect."}
            </p>
          </div>
        </div>
        {retryFailed ? (
          <button
            type="button"
            className="caf-connection-notice__action"
            onClick={() => window.location.reload()}
          >
            Refresh page
          </button>
        ) : (
          <button
            type="button"
            className={`caf-connection-notice__action${
              retrying ? " caf-connection-notice__action--spinning" : ""
            }`}
            onClick={handleRetry}
            disabled={retrying}
          >
            {retrying ? (
              <FontAwesomeIcon icon={faRotateRight} aria-hidden="true" />
            ) : null}
            {retrying ? "Reconnecting…" : "Retry"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ConnectionLostBanner;
