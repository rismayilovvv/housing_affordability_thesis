import FlagIcon from "./FlagIcon";
import {
  CalendarRange,
  Landmark,
  Percent,
  TrendingUp,
} from "lucide-react";

const metricConfig = {
  housing_price_index: {
    label: "Latest HPI",
    icon: TrendingUp,
  },
  mortgage_rate: {
    label: "Latest Mortgage Rate",
    icon: Percent,
  },
  income: {
    label: "Latest Income",
    icon: Landmark,
  },
  unemployment: {
    label: "Latest Unemployment",
    icon: Percent,
  },
};

export default function SummaryCards({ country, data, secondKey, secondLabel }) {
  if (!data || data.length === 0) return null;

  const latest = data[data.length - 1];
  const firstYear = data[0]?.year;
  const lastYear = latest?.year;

  const formatValue = (key, value) => {
    if (value == null) return "N/A";
    if (key === "income") {
      return `${Number(value).toLocaleString()} EUR`;
    }
    return Number(value).toFixed(2);
  };

  const secondIconConfig = metricConfig[secondKey] || {
    label: `Latest ${secondLabel}`,
    icon: TrendingUp,
  };

  const SecondIcon = secondIconConfig.icon;

  return (
    <div className="summary-panel">
      <div className="summary-panel-header">
        <div className="section-badge">Country Summary</div>
        <h3>Latest available overview</h3>
        <p>
          This section summarizes the selected country and the latest available
          indicator values for the chosen period.
        </p>
      </div>

      <div className="summary-panel-body">
        <div className="summary-country-hero">
          <div className="summary-country-flag-wrap">
            <FlagIcon country={country} className="flag-icon-large" />
          </div>

          <div className="summary-country-text">
            <h4>{country}</h4>
            <span>Selected country</span>
          </div>
        </div>

        <div className="summary-list">
          <div className="summary-list-row">
            <div className="summary-list-left">
              <div className="summary-list-icon">
                <CalendarRange size={16} strokeWidth={2.2} />
              </div>
              <span>Available Period</span>
            </div>
            <strong>
              {firstYear} - {lastYear}
            </strong>
          </div>

          <div className="summary-list-row">
            <div className="summary-list-left">
              <div className="summary-list-icon">
                <TrendingUp size={16} strokeWidth={2.2} />
              </div>
              <span>Latest HPI</span>
            </div>
            <strong>
              {formatValue("housing_price_index", latest?.housing_price_index)}
            </strong>
          </div>

          <div className="summary-list-row">
            <div className="summary-list-left">
              <div className="summary-list-icon">
                <SecondIcon size={16} strokeWidth={2.2} />
              </div>
              <span>{secondIconConfig.label}</span>
            </div>
            <strong>{formatValue(secondKey, latest?.[secondKey])}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}