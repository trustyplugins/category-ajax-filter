import React, { useEffect, useMemo, useState } from "react";
import BuilderErrorBoundary from "../components/BuilderErrorBoundary";
import ConnectionLostBanner from "../components/ConnectionLostBanner";
import {
  Alert,
  Card,
  Col,
  Row,
  Select,
  Tag,
  Typography,
  Space,
  Button,
  Spin,
  Skeleton,
  message,
  Modal,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
  DesktopOutlined,
  TabletOutlined,
  MobileOutlined,
  LineChartOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import "./caf-builder-analytics.css";
import BuilderAnalyticsLogoIcon from "./BuilderAnalyticsLogoIcon";

const { Title, Text, Paragraph } = Typography;

const BUILDER_FILTER_VALUE_OFFSET = 1000000000;

const defaultDeviceTotals = {
  desktop: 0,
  tablet: 0,
  phone: 0,
};

const defaultSummaryComparison = {
  available: false,
  label: "",
  clicks: { previous: 0, change_percent: 0, direction: "na" },
  zero_results: { previous: 0, change_percent: 0, direction: "na" },
  device_desktop: { previous: 0, change_percent: 0, direction: "na" },
  device_tablet: { previous: 0, change_percent: 0, direction: "na" },
  device_phone: { previous: 0, change_percent: 0, direction: "na" },
};

const INSIGHT_TABS = [
  { label: "Top Terms", value: "top" },
  { label: "All Searches", value: "searches" },
  { label: "Zero Results", value: "zero" },
];

const DATE_RANGE_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "All Time", value: "all" },
];

function ComparisonFootnote({ comparison }) {
  if (!comparison?.available || !comparison?.label) {
    return null;
  }

  return (
    <Text type="secondary" className="caf-builder-analytics__comparison-label">
      {comparison.label}
    </Text>
  );
}

function ComparisonBadge({ metricKey, comparison, invertColors = false }) {
  if (!comparison?.available) {
    return null;
  }

  const metric = comparison?.[metricKey];
  if (!metric || metric.direction === "na") {
    return null;
  }

  const percentLabel = `${Math.abs(Number(metric.change_percent || 0)).toLocaleString(undefined, {
    maximumFractionDigits: 1,
  })}%`;
  const isFlat = metric.direction === "flat";
  const isUp = metric.direction === "up";
  const positiveIsGood = !invertColors;
  let color = "default";
  let Icon = MinusOutlined;

  if (!isFlat) {
    const isPositive = isUp;
    const isGood = positiveIsGood ? isPositive : !isPositive;
    color = isGood ? "success" : "error";
    Icon = isGood ? ArrowUpOutlined : ArrowDownOutlined;
  }

  return (
    <Tag
      color={color}
      className="caf-builder-analytics__comparison-badge"
      icon={<Icon />}
      title={comparison.label || undefined}
    >
      {percentLabel}
    </Tag>
  );
}

function StatCardSkeleton({ variant = "clicks" }) {
  return (
    <div className="caf-builder-analytics__stat-skeleton-wrap">
      <Skeleton.Input
        active
        size="large"
        className={`caf-builder-analytics__skeleton-value-lg${
          variant === "zero" ? " caf-builder-analytics__skeleton-value-lg--zero" : ""
        }`}
      />
      <div className="caf-builder-analytics__stat-skeleton-gap">
        <Skeleton.Input
          active
          size="small"
          className={`caf-builder-analytics__skeleton-label-sm${
            variant === "zero" ? " caf-builder-analytics__skeleton-label-sm--zero" : ""
          }`}
        />
      </div>
    </div>
  );
}

function AnalyticsDashboardV2() {
  const [deviceType, setDeviceType] = useState("desktop");
  const [insightTab, setInsightTab] = useState("top");
  const [filterSelection, setFilterSelection] = useState(0);
  const [dateRange, setDateRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState({
    clicks: 0,
    zero_results: 0,
    comparison: defaultSummaryComparison,
  });
  const [migration, setMigration] = useState({
    total_legacy_filters: 0,
    migrated_filters: 0,
    pending_filters: 0,
    completed: false,
  });
  const [isMigratingLegacy, setIsMigratingLegacy] = useState(false);
  const [filterOptions, setFilterOptions] = useState([{ label: "All Filters", value: 0 }]);
  const [liveTrendData, setLiveTrendData] = useState([]);
  const [liveInsightData, setLiveInsightData] = useState({ top: [], searches: [], zero: [] });
  const [noAnalyticsEnabledFilters, setNoAnalyticsEnabledFilters] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [liveDeviceTotals, setLiveDeviceTotals] = useState(defaultDeviceTotals);

  const deviceComparisonMetricKey = `device_${deviceType}`;

  const mergeComparisonMetric = (comparisonData, metricKey) => ({
    ...defaultSummaryComparison[metricKey],
    ...(comparisonData?.[metricKey] || {}),
  });

  const fetchData = async (filterId, range) => {
    if (!window.caf_builder_analytics || !window.caf_builder_analytics.ajax_url) {
      return;
    }

    setIsLoading(true);
    try {
      const payload = new URLSearchParams();
      payload.append("action", "tc_caf_get_analytics_v2_data");
      payload.append("nonce", window.caf_builder_analytics.nonce || "");
      payload.append("filter_id", String(filterId || 0));
      payload.append("date_range", range || "7d");

      const response = await fetch(window.caf_builder_analytics.ajax_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: payload.toString(),
      });
      const json = await response.json();
      if (!json || !json.success || !json.data) {
        setNoAnalyticsEnabledFilters(false);
        return;
      }

      const data = json.data;
      setSummary({
        clicks: Number(data.summary?.clicks || 0),
        zero_results: Number(data.summary?.zero_results || 0),
        comparison: {
          ...defaultSummaryComparison,
          ...(data.summary?.comparison || {}),
          clicks: mergeComparisonMetric(data.summary?.comparison, "clicks"),
          zero_results: mergeComparisonMetric(data.summary?.comparison, "zero_results"),
          device_desktop: mergeComparisonMetric(data.summary?.comparison, "device_desktop"),
          device_tablet: mergeComparisonMetric(data.summary?.comparison, "device_tablet"),
          device_phone: mergeComparisonMetric(data.summary?.comparison, "device_phone"),
        },
      });
      setMigration(
        data.migration || {
          total_legacy_filters: 0,
          migrated_filters: 0,
          pending_filters: 0,
          completed: false,
        }
      );
      setFilterOptions(
        Array.isArray(data.filters) && data.filters.length
          ? data.filters
          : [{ label: "All Filters", value: 0 }]
      );
      if (typeof data.selected_filter !== "undefined") {
        setFilterSelection(parseInt(data.selected_filter, 10) || 0);
      }
      setLiveDeviceTotals({
        desktop: parseInt(data.device_totals?.desktop || 0, 10),
        tablet: parseInt(data.device_totals?.tablet || 0, 10),
        phone: parseInt(data.device_totals?.phone || 0, 10),
      });
      setLiveTrendData(Array.isArray(data.trend) ? data.trend : []);
      const normalizeInsightRows = (rows, bucket) =>
        Array.isArray(rows)
          ? rows
              .filter((row) => row && typeof row === "object")
              .map((row, idx) => ({
                key: `${bucket}-${String(row.key || "row")}-${idx}`,
                term: String(row.term || ""),
                meta: String(row.meta || ""),
                count: Number(row.count || 0),
              }))
          : [];
      setLiveInsightData({
        top: normalizeInsightRows(data.insights?.top, "top"),
        searches: normalizeInsightRows(data.insights?.searches, "searches"),
        zero: normalizeInsightRows(data.insights?.zero, "zero"),
      });
      setNoAnalyticsEnabledFilters(Boolean(data.no_analytics_enabled_filters));
    } catch (e) {
      setNoAnalyticsEnabledFilters(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(filterSelection, dateRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSelection, dateRange]);

  const totalClicksLabel = useMemo(
    () => Number(summary.clicks || 0).toLocaleString(),
    [summary.clicks]
  );
  const totalZeroLabel = useMemo(
    () => Number(summary.zero_results || 0).toLocaleString(),
    [summary.zero_results]
  );
  const activeInsightRows = useMemo(
    () =>
      Array.isArray(liveInsightData[insightTab])
        ? liveInsightData[insightTab].map((row) => ({ ...row }))
        : [],
    [liveInsightData, insightTab]
  );

  const emptyScopeLayout = noAnalyticsEnabledFilters;

  const handleResetAnalyticsClick = () => {
    if (!window.caf_builder_analytics || !window.caf_builder_analytics.ajax_url) {
      return;
    }

    const scopeAll = filterSelection === 0;
    const isBuilder = filterSelection >= BUILDER_FILTER_VALUE_OFFSET;

    const title = "Reset analytics data?";

    let primaryWarning;
    let secondaryNote;
    if (scopeAll) {
      primaryWarning =
        "You are about to permanently delete every analytics row stored in the database for this plugin: raw events, daily rollups, term-level summaries, and search-keyword aggregates — across all legacy filters and all builder layouts.";
      secondaryNote =
        "This does not delete your filters or layouts, and it does not change analytics on/off settings. Once confirmed, the data cannot be recovered.";
    } else if (isBuilder) {
      primaryWarning =
        "You are about to permanently delete all analytics records tied to this builder layout only (events, daily totals, term activity, and search aggregates for its index).";
      secondaryNote =
        "Other filters and layouts are not affected. This action cannot be undone.";
    } else {
      primaryWarning =
        "You are about to permanently delete all analytics records stored for this legacy filter only (events, daily totals, term activity, search aggregates, and the legacy performance snapshot option if present).";
      secondaryNote =
        "Other filters and builder layouts are not affected. This action cannot be undone.";
    }

    Modal.confirm({
      title,
      width: 520,
      okText: "Yes, delete permanently",
      cancelText: "Cancel",
      okType: "danger",
      centered: true,
      className: "caf-builder-analytics-delete-confirm-modal caf-builder-modal",
      content: (
        <div className="caf-builder-analytics__modal-content">
          <Paragraph className="caf-builder-analytics__modal-lead">{primaryWarning}</Paragraph>
          <Paragraph type="secondary" className="caf-builder-analytics__modal-note">
            {secondaryNote}
          </Paragraph>
        </div>
      ),
      onOk: async () => {
        setIsResetting(true);
        try {
          const payload = new URLSearchParams();
          payload.append("action", "tc_caf_reset_analytics_v2");
          payload.append("nonce", window.caf_builder_analytics.nonce || "");
          payload.append("filter_id", String(filterSelection));

          const response = await fetch(window.caf_builder_analytics.ajax_url, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: payload.toString(),
          });
          const json = await response.json();
          if (!json || !json.success) {
            throw new Error("reset failed");
          }
          message.success("Analytics data was removed from the database.");
          await fetchData(filterSelection, dateRange);
        } catch (e) {
          message.error("Could not reset analytics. Please try again.");
          throw e;
        } finally {
          setIsResetting(false);
        }
      },
    });
  };

  const migrateLegacyData = async () => {
    if (!window.caf_builder_analytics || !window.caf_builder_analytics.ajax_url) {
      return;
    }
    setIsMigratingLegacy(true);
    try {
      const payload = new URLSearchParams();
      payload.append("action", "tc_caf_migrate_legacy_analytics");
      payload.append("nonce", window.caf_builder_analytics.nonce || "");
      payload.append("filter_id", "0");

      const response = await fetch(window.caf_builder_analytics.ajax_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: payload.toString(),
      });
      const json = await response.json();
      if (!json || !json.success) {
        message.error("Legacy migration failed.");
        return;
      }
      message.success("Legacy analytics migrated successfully.");
      await fetchData(filterSelection, dateRange);
    } catch (e) {
      message.error("Legacy migration failed.");
    } finally {
      setIsMigratingLegacy(false);
    }
  };

  const renderZeroTokens = (termText) => {
    const rawParts = String(termText || "")
      .split("+")
      .map((part) => part.trim())
      .filter(Boolean);

    if (!rawParts.length) {
      return null;
    }

    return (
      <Space size={[8, 8]} wrap>
        {rawParts.map((part, idx) => {
          const hasPair = part.includes(":");
          const pieces = hasPair ? part.split(":") : [part];
          const keyLabel = pieces[0] ? pieces[0].trim() : "";
          const valueLabel = pieces.slice(1).join(":").trim();

          return (
            <div key={`${part}-${idx}`} className="caf-builder-analytics__zero-token">
              {hasPair ? (
                <>
                  <Text className="caf-builder-analytics__zero-token-key">{keyLabel}</Text>
                  <Text className="caf-builder-analytics__zero-token-separator">:</Text>
                  <Text strong className="caf-builder-analytics__zero-token-value">
                    {valueLabel || keyLabel}
                  </Text>
                </>
              ) : (
                <Text strong className="caf-builder-analytics__zero-token-value">
                  {part}
                </Text>
              )}
            </div>
          );
        })}
      </Space>
    );
  };

  const renderTrendContent = () => {
    if (emptyScopeLayout) {
      if (isLoading) {
        return (
          <div className="caf-builder-analytics__chart-state">
            <Spin size="large" />
          </div>
        );
      }

      return (
        <div className="caf-builder-analytics__chart-state caf-builder-analytics__chart-state--padded">
          <Alert
            type="info"
            showIcon
            className="caf-builder-analytics__empty-alert"
            message="No filters have analytics enabled"
            description="Turn on analytics for a legacy filter (filter panel), or enable Analytics in the builder Misc drawer for a published layout and save. Until then, this dashboard stays empty even if old data exists in the database."
          />
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="caf-builder-analytics__chart-state">
          <Spin size="large" />
        </div>
      );
    }

    if (!liveTrendData.length) {
      return (
        <div className="caf-builder-analytics__chart-state">
          <Text type="secondary">No trend data available for selected range.</Text>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={liveTrendData} margin={{ top: 12, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cafAnalyticsAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#f97316"
            strokeWidth={3}
            fill="url(#cafAnalyticsAreaFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <>
      <ConnectionLostBanner />
      <BuilderErrorBoundary section="analytics">
        <div className="caf-builder-analytics">
          <div className="caf-builder-analytics__container">
            <Card className="caf-builder-analytics__hero-card" variant="borderless">
              <Row gutter={[16, 16]} align="middle" justify="space-between">
                <Col>
                  <Space size={16} align="center">
                    <BuilderAnalyticsLogoIcon className="caf-builder-analytics__hero-logo" />
                    <div className="caf-builder-analytics__hero-copy">
                      <Title level={3} className="caf-builder-analytics__hero-title">
                        CATEGORY AJAX FILTER
                      </Title>
                      <Text className="caf-builder-analytics__hero-subtitle">
                        Category Ajax Filter Dashboard
                      </Text>
                    </div>
                  </Space>
                </Col>
                <Col>
                  <Row gutter={12}>
                    <Col>
                      <Select
                        value={filterSelection}
                        onChange={setFilterSelection}
                        className="caf-builder-analytics__filter-select"
                        size="large"
                        options={filterOptions}
                      />
                    </Col>
                    <Col>
                      <Select
                        value={dateRange}
                        onChange={setDateRange}
                        className="caf-builder-analytics__filter-select"
                        size="large"
                        options={DATE_RANGE_OPTIONS}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>

            {!emptyScopeLayout && migration.pending_filters > 0 ? (
              <Card className="caf-builder-analytics__migration-card" variant="borderless">
                <Row align="middle" justify="space-between" gutter={[12, 12]}>
                  <Col>
                    <Text strong>Legacy Migration</Text>
                    <div>
                      <Text type="secondary">
                        {migration.migrated_filters} / {migration.total_legacy_filters} migrated
                        {migration.pending_filters > 0
                          ? ` (${migration.pending_filters} pending)`
                          : ""}
                      </Text>
                    </div>
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      onClick={migrateLegacyData}
                      loading={isMigratingLegacy}
                      disabled={isMigratingLegacy || migration.pending_filters <= 0}
                    >
                      Migrate Legacy Data
                    </Button>
                  </Col>
                </Row>
              </Card>
            ) : null}

            {!emptyScopeLayout ? (
              <Row gutter={[16, 16]} className="caf-builder-analytics__kpi-row">
                <Col xs={24} md={8}>
                  <Card className="caf-builder-analytics__stat-card" variant="borderless">
                    <Space size={14} align="start">
                      <div className="caf-builder-analytics__stat-icon caf-builder-analytics__stat-icon--clicks">
                        <LineChartOutlined />
                      </div>
                      <div>
                        <Title level={4} className="caf-builder-analytics__stat-heading">
                          Clicks
                        </Title>
                        <Text type="secondary">Total clicks on filter items</Text>
                      </div>
                    </Space>
                    <div className="caf-builder-analytics__stat-footer">
                      <div>
                        {isLoading ? (
                          <StatCardSkeleton variant="clicks" />
                        ) : (
                          <>
                            <div className="caf-builder-analytics__stat-value caf-builder-analytics__stat-value--clicks">
                              {totalClicksLabel}
                            </div>
                            <ComparisonFootnote comparison={summary.comparison} />
                          </>
                        )}
                      </div>
                      {isLoading ? (
                        <Skeleton.Input active size="small" className="caf-builder-analytics__skeleton-badge" />
                      ) : (
                        <ComparisonBadge metricKey="clicks" comparison={summary.comparison} />
                      )}
                    </div>
                  </Card>
                </Col>

                <Col xs={24} md={8}>
                  <Card className="caf-builder-analytics__stat-card" variant="borderless">
                    <Space size={14} align="start">
                      <div className="caf-builder-analytics__stat-icon caf-builder-analytics__stat-icon--zero">
                        <StopOutlined />
                      </div>
                      <div>
                        <Title level={4} className="caf-builder-analytics__stat-heading">
                          Zero Results
                        </Title>
                        <Text type="secondary">No results found events</Text>
                      </div>
                    </Space>
                    <div className="caf-builder-analytics__stat-footer">
                      <div>
                        {isLoading ? (
                          <StatCardSkeleton variant="zero" />
                        ) : (
                          <>
                            <div className="caf-builder-analytics__stat-value caf-builder-analytics__stat-value--zero">
                              {totalZeroLabel}
                            </div>
                            <ComparisonFootnote comparison={summary.comparison} />
                          </>
                        )}
                      </div>
                      {isLoading ? (
                        <Skeleton.Input active size="small" className="caf-builder-analytics__skeleton-badge" />
                      ) : (
                        <ComparisonBadge
                          metricKey="zero_results"
                          comparison={summary.comparison}
                          invertColors
                        />
                      )}
                    </div>
                  </Card>
                </Col>

                <Col xs={24} md={8}>
                  <Card className="caf-builder-analytics__stat-card" variant="borderless">
                    <Space size={14} align="start">
                      <div className="caf-builder-analytics__stat-icon caf-builder-analytics__stat-icon--devices">
                        <DesktopOutlined />
                      </div>
                      <div>
                        <Title level={4} className="caf-builder-analytics__stat-heading">
                          Devices Clicks
                        </Title>
                        <Text type="secondary">Desktop vs Mobile clicks</Text>
                      </div>
                    </Space>
                    <Space className="caf-builder-analytics__device-switcher">
                      <Button
                        className="caf-builder-analytics__device-btn"
                        type={deviceType === "desktop" ? "default" : "text"}
                        icon={<DesktopOutlined />}
                        onClick={() => setDeviceType("desktop")}
                      />
                      <Button
                        className="caf-builder-analytics__device-btn"
                        type={deviceType === "tablet" ? "default" : "text"}
                        icon={<TabletOutlined />}
                        onClick={() => setDeviceType("tablet")}
                      />
                      <Button
                        className="caf-builder-analytics__device-btn"
                        type={deviceType === "phone" ? "default" : "text"}
                        icon={<MobileOutlined />}
                        onClick={() => setDeviceType("phone")}
                      />
                    </Space>
                    <div className="caf-builder-analytics__stat-footer caf-builder-analytics__stat-footer--devices">
                      <div>
                        {isLoading ? (
                          <StatCardSkeleton variant="devices" />
                        ) : (
                          <>
                            <div className="caf-builder-analytics__stat-value caf-builder-analytics__stat-value--devices">
                              {Number(liveDeviceTotals[deviceType] || 0).toLocaleString()}
                            </div>
                            <ComparisonFootnote comparison={summary.comparison} />
                          </>
                        )}
                      </div>
                      {isLoading ? (
                        <Skeleton.Input active size="small" className="caf-builder-analytics__skeleton-badge" />
                      ) : (
                        <ComparisonBadge
                          metricKey={deviceComparisonMetricKey}
                          comparison={summary.comparison}
                        />
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>
            ) : null}

            <Row gutter={[16, 16]} className="caf-builder-analytics__charts-row">
              <Col xs={24}>
                <Card title="Trend" className="caf-builder-analytics__panel-card" variant="borderless">
                  <div className="caf-builder-analytics__trend-chart">{renderTrendContent()}</div>
                </Card>
              </Col>

              {!emptyScopeLayout ? (
                <Col xs={24}>
                  <Card
                    title="Insights & Search Data"
                    className="caf-builder-analytics__panel-card"
                    variant="borderless"
                    extra={
                      <div className="caf-builder-analytics__insights-tabs">
                        {INSIGHT_TABS.map((tab) => (
                          <button
                            key={tab.value}
                            type="button"
                            onClick={() => setInsightTab(tab.value)}
                            className={`caf-builder-analytics__insights-tab${
                              insightTab === tab.value ? " is-active" : ""
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    }
                  >
                    <Text type="secondary" className="caf-builder-analytics__insights-lead">
                      Track top terms, searches and failed filter combinations
                    </Text>
                    <div key={`insights-list-${insightTab}`} className="caf-builder-analytics__insights-list">
                      {isLoading ? (
                        Array.from({ length: 4 }).map((_, idx) => (
                          <div
                            key={`insight-skeleton-${idx}`}
                            className="caf-builder-analytics__insight-item caf-builder-analytics__insight-item--skeleton"
                          >
                            <div className="caf-builder-analytics__insight-skeleton-main">
                              <Skeleton.Input
                                active
                                size="small"
                                className="caf-builder-analytics__skeleton-insight-title"
                              />
                              <div className="caf-builder-analytics__stat-skeleton-gap">
                                <Skeleton.Input
                                  active
                                  size="small"
                                  className="caf-builder-analytics__skeleton-insight-meta"
                                />
                              </div>
                            </div>
                            <Skeleton.Input
                              active
                              size="small"
                              className="caf-builder-analytics__skeleton-insight-count"
                            />
                          </div>
                        ))
                      ) : activeInsightRows.length ? (
                        activeInsightRows.map((item, idx) => (
                          <div key={`${item.key}-${idx}`} className="caf-builder-analytics__insight-item">
                            {insightTab === "zero" ? (
                              <div className="caf-builder-analytics__insight-content caf-builder-analytics__insight-content--zero">
                                {renderZeroTokens(item.term)}
                                <Text type="secondary" className="caf-builder-analytics__insight-meta--zero">
                                  {item.meta}
                                </Text>
                              </div>
                            ) : (
                              <div className="caf-builder-analytics__insight-content">
                                <Text strong className="caf-builder-analytics__insight-term">
                                  {item.term}
                                </Text>
                                <Text type="secondary" className="caf-builder-analytics__insight-meta">
                                  {item.meta}
                                </Text>
                              </div>
                            )}

                            {insightTab === "zero" ? (
                              <Text strong className="caf-builder-analytics__insight-count caf-builder-analytics__insight-count--zero">
                                {item.count}
                              </Text>
                            ) : (
                              <Text strong className="caf-builder-analytics__insight-count">
                                {item.count}
                              </Text>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="caf-builder-analytics__insights-empty">
                          <Text type="secondary">No insights found for selected range.</Text>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              ) : null}
            </Row>

            <Card className="caf-builder-analytics__reset-card" variant="borderless">
              <Row justify="space-between" align="middle" gutter={[16, 16]}>
                <Col xs={24} md={16}>
                  <Text type="secondary" className="caf-builder-analytics__reset-copy">
                    Remove stored metrics for the scope selected in the header (filter and date range).
                    Use only when you need a clean slate.
                  </Text>
                </Col>
                <Col xs={24} md={8} className="caf-builder-analytics__reset-actions">
                  <Button
                    danger
                    type="primary"
                    className="caf-builder-analytics__reset-btn"
                    loading={isResetting}
                    disabled={isResetting}
                    onClick={handleResetAnalyticsClick}
                  >
                    Reset analytics data
                  </Button>
                </Col>
              </Row>
            </Card>
          </div>
        </div>
      </BuilderErrorBoundary>
    </>
  );
}

export default AnalyticsDashboardV2;
