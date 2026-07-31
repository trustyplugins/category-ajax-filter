import React, { useEffect, useMemo, useRef, useState } from "react";
import { DownOutlined, HistoryOutlined } from "@ant-design/icons";
import {
  getBuilderRevisionDisplayMax,
  getMaxStoredBuilderRevisions,
  isProTier,
} from "../tier/capabilities";
import { TierLockedWrap } from "../tier/TierLockedWrap";

const REVISION_PLACEHOLDER_LABELS = [
  "Module style > color",
  "Settings > label",
  "Layout structure updated",
  "Filter layout change",
  "Post layout change",
  "Extra data > post type",
  "Module style > padding",
  "Common data > layout title",
];

const REVISION_UPGRADE_MESSAGE =
  "Upgrade to Pro for full revision history (10 snapshots with restore).";

function formatRevisionTime(createdAt) {
  if (!createdAt) {
    return "Unknown time";
  }

  return new Date(createdAt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function createPlaceholderEntries(count, newestTimestamp = Date.now()) {
  return Array.from({ length: count }, (_, index) => ({
    id: `revision-placeholder-${index}`,
    isPlaceholder: true,
    label:
      REVISION_PLACEHOLDER_LABELS[index % REVISION_PLACEHOLDER_LABELS.length],
    createdAt: newestTimestamp - (index + 1) * 3600000,
  }));
}

function RevisionListItem({ entry, isCurrent, onRestoreRevision, as = "li" }) {
  const Tag = as;

  return (
    <Tag
      className={`caf-builder-revisions-panel__item${
        isCurrent ? " is-current" : ""
      }${entry?.isPlaceholder ? " is-placeholder" : ""}`}
    >
      <div className="caf-builder-revisions-panel__item-row">
        <div className="caf-builder-revisions-panel__timeline" aria-hidden="true">
          <span
            className={`caf-builder-revisions-panel__dot${
              isCurrent ? " is-filled" : ""
            }`}
          />
        </div>
        <div className="caf-builder-revisions-panel__content">
          <div className="caf-builder-revisions-panel__label">
            {entry?.label || "Builder change"}
          </div>
          <div className="caf-builder-revisions-panel__time">
            {formatRevisionTime(entry?.createdAt)}
          </div>
        </div>
        <div className="caf-builder-revisions-panel__action">
          {isCurrent ? (
            <span className="caf-builder-revisions-panel__current-badge">
              Current
            </span>
          ) : (
            <button
              type="button"
              className="caf-builder-revisions-panel__restore-btn"
              onClick={() => onRestoreRevision?.(entry?.id)}
              disabled={entry?.isPlaceholder}
            >
              Restore
            </button>
          )}
        </div>
      </div>
    </Tag>
  );
}

function BuilderRevisionsPanel({
  revisionHistory = [],
  currentRevisionId,
  onRestoreRevision,
}) {
  const listRef = useRef(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const displayMax = getBuilderRevisionDisplayMax();
  const storedMax = getMaxStoredBuilderRevisions();
  const showLockedPlaceholders = !isProTier();

  const { realEntries, placeholderEntries } = useMemo(() => {
    const real = [...(revisionHistory || [])].reverse();
    if (!showLockedPlaceholders) {
      return { realEntries: real, placeholderEntries: [] };
    }

    const placeholderCount = Math.max(0, displayMax - real.length);
    const newestTimestamp =
      real.find((entry) => entry?.createdAt)?.createdAt || Date.now();

    return {
      realEntries: real,
      placeholderEntries: createPlaceholderEntries(
        placeholderCount,
        newestTimestamp
      ),
    };
  }, [revisionHistory, showLockedPlaceholders, displayMax]);

  const totalEntries = realEntries.length + placeholderEntries.length;

  const updateScrollState = () => {
    const listEl = listRef.current;
    if (!listEl) {
      return;
    }

    const canScroll = listEl.scrollHeight > listEl.clientHeight + 4;
    const atBottom =
      listEl.scrollHeight - listEl.scrollTop - listEl.clientHeight < 8;
    setShowScrollDown(canScroll && !atBottom);
  };

  useEffect(() => {
    updateScrollState();

    const listEl = listRef.current;
    if (!listEl) {
      return undefined;
    }

    listEl.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);

    return () => {
      listEl.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [totalEntries]);

  const scrollToBottom = () => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const badgeLabel = showLockedPlaceholders
    ? `${storedMax} of ${displayMax}`
    : `Last ${displayMax}`;

  return (
    <div className="caf-builder-revisions-panel">
      <div className="caf-builder-revisions-panel__header">
        <div className="caf-builder-revisions-panel__title">
          <HistoryOutlined className="caf-builder-revisions-panel__title-icon" />
          <span>Revisions</span>
        </div>
        <span className="caf-builder-revisions-panel__count-badge">
          {badgeLabel}
        </span>
      </div>

      {totalEntries === 0 ? (
        <div className="caf-builder-revisions-panel__empty">
          No revisions available.
        </div>
      ) : (
        <div className="caf-builder-revisions-panel__body">
          <ul className="caf-builder-revisions-panel__list" ref={listRef}>
            {realEntries.map((entry, index) => (
              <RevisionListItem
                key={entry?.id || index}
                entry={entry}
                isCurrent={entry?.id === currentRevisionId}
                onRestoreRevision={onRestoreRevision}
              />
            ))}

            {placeholderEntries.length > 0 ? (
              <li className="caf-builder-revisions-panel__locked-group">
                <TierLockedWrap
                  locked
                  showProBadge
                  className="caf-builder-tier-locked-revisions-group"
                  upgradeMessage={REVISION_UPGRADE_MESSAGE}
                >
                  <div className="caf-builder-revisions-panel__locked-group-inner">
                    {placeholderEntries.map((entry, index) => (
                      <RevisionListItem
                        key={entry?.id || index}
                        as="div"
                        entry={entry}
                        isCurrent={false}
                        onRestoreRevision={onRestoreRevision}
                      />
                    ))}
                  </div>
                </TierLockedWrap>
              </li>
            ) : null}
          </ul>

          {showScrollDown ? (
            <button
              type="button"
              className="caf-builder-revisions-panel__scroll-btn"
              onClick={scrollToBottom}
              aria-label="Scroll to older revisions"
            >
              <DownOutlined />
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default BuilderRevisionsPanel;
