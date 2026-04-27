import { useEffect, useMemo, useState } from "react";
import { fetchCountries, fetchCountryData } from "../api/api";
import YearFilter from "../components/YearFilter";
import MultiIndicatorChart from "../components/MultiIndicatorChart";
import FlagIcon from "../components/FlagIcon";

const indicatorOptions = [
  { key: "housing_price_index", label: "Housing Price Index", shortLabel: "HPI" },
  { key: "mortgage_rate", label: "Mortgage Rate", shortLabel: "Mortgage" },
  { key: "income", label: "Income", shortLabel: "Income" },
  { key: "unemployment", label: "Unemployment", shortLabel: "Unemployment" },
];

export default function IndicatorsComparisonPage() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedIndicators, setSelectedIndicators] = useState([
    "housing_price_index",
    "mortgage_rate",
    "income",
    "unemployment",
  ]);

  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const availableYears = useMemo(() => {
    const years = [];
    for (let y = 2005; y <= 2023; y++) years.push(y);
    return years;
  }, []);

  const [startYear, setStartYear] = useState(2005);
  const [endYear, setEndYear] = useState(2023);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countryList = await fetchCountries();
        setCountries(countryList);
        if (countryList.length > 0) setSelectedCountry(countryList[0]);
      } catch {
        setError("Failed to load countries.");
      }
    };

    loadCountries();
  }, []);

  useEffect(() => {
    if (!selectedCountry || startYear >= endYear) return;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const countryData = await fetchCountryData(
          selectedCountry,
          startYear,
          endYear
        );
        setData(countryData);
      } catch {
        setError("No data available for the selected country and period.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedCountry, startYear, endYear]);

  const toggleIndicator = (indicatorKey) => {
    setSelectedIndicators((prev) => {
      if (prev.includes(indicatorKey)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== indicatorKey);
      }

      return [...prev, indicatorKey];
    });
  };

  const selectAllIndicators = () => {
    setSelectedIndicators(indicatorOptions.map((item) => item.key));
  };

  const clearToMainIndicator = () => {
    setSelectedIndicators(["housing_price_index"]);
  };

  const latest = data[data.length - 1];
  const first = data[0];

  const formatValue = (key, value) => {
    if (value == null) return "N/A";

    if (key === "income") {
      return `${Number(value).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })} EUR`;
    }

    if (key === "mortgage_rate" || key === "unemployment") {
      return `${Number(value).toFixed(2)}%`;
    }

    return Number(value).toFixed(2);
  };

  const hpiChange =
    first?.housing_price_index && latest?.housing_price_index
      ? latest.housing_price_index - first.housing_price_index
      : null;

  return (
    <div className="analysis-page">
      <section className="full-width-section">
        <div className="page-header">
          <div className="section-badge">Indicator Analysis</div>
          <h2>Housing Affordability Indicators</h2>
          <p className="page-description">
            Select a country, choose a period, and compare one or more
            affordability indicators in a single indexed chart.
          </p>
        </div>

        <div className="dashboard-panel indicators-control-panel">
          <YearFilter
            startYear={startYear}
            endYear={endYear}
            onStartYearChange={setStartYear}
            onEndYearChange={setEndYear}
            availableYears={availableYears}
          />

          <div className="country-multi-select">
            <div className="country-multi-header">
              <div>
                <label className="filter-label">Country</label>
                <p>Select one country to analyze its affordability indicators.</p>
              </div>

              <span>1 selected</span>
            </div>

            <div className="country-multi-grid">
              {countries.map((country) => {
                const active = selectedCountry === country;

                return (
                  <button
                    type="button"
                    key={country}
                    className={`country-choice ${active ? "active" : ""}`}
                    onClick={() => setSelectedCountry(country)}
                  >
                    <FlagIcon country={country} className="flag-icon" />
                    <span>{country}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="indicator-selector-block">
            <div className="indicator-selector-header">
              <div>
                <label className="filter-label">Indicators</label>
                <p>Choose one, several, or all indicators to display in the chart.</p>
              </div>

              <div className="indicator-selector-actions">
                <button type="button" onClick={selectAllIndicators}>
                  Select all
                </button>
                <button type="button" onClick={clearToMainIndicator}>
                  HPI only
                </button>
              </div>
            </div>

            <div className="indicator-checkbox-grid">
              {indicatorOptions.map((indicator) => (
                <button
                  type="button"
                  key={indicator.key}
                  className={`indicator-toggle ${
                    selectedIndicators.includes(indicator.key) ? "active" : ""
                  }`}
                  onClick={() => toggleIndicator(indicator.key)}
                >
                  <span className={`indicator-dot ${indicator.key}`} />
                  <span>{indicator.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && <p className="info-message">Loading data...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && data.length > 0 && (
          <>
            <div className="country-indicator-card">
              <div className="country-indicator-header">
                <div className="country-indicator-identity">
                  <div className="country-indicator-flag-wrap">
                    <FlagIcon country={selectedCountry} className="flag-icon-large" />
                  </div>

                  <div>
                    <div className="section-badge">Country Summary</div>
                    <h3>{selectedCountry}</h3>
                    <p>
                      Latest available values for the selected period, shown in
                      original units.
                    </p>
                  </div>
                </div>

                <div className="country-indicator-period">
                  <span>Selected period</span>
                  <strong>
                    {startYear}–{endYear}
                  </strong>
                </div>
              </div>

              <div className="country-indicator-list">
                {indicatorOptions.map((indicator) => (
                  <div key={indicator.key} className="country-indicator-row">
                    <div className="country-indicator-left">
                      <span className={`indicator-dot ${indicator.key}`} />
                      <span>{indicator.label}</span>
                    </div>

                    <strong>{formatValue(indicator.key, latest?.[indicator.key])}</strong>
                  </div>
                ))}

                <div className="country-indicator-row highlight">
                  <div className="country-indicator-left">
                    <span className="indicator-dot hpi-change" />
                    <span>HPI change in selected period</span>
                  </div>

                  <strong>
                    {hpiChange == null ? "N/A" : `${hpiChange.toFixed(2)} pts`}
                  </strong>
                </div>
              </div>
            </div>

            <MultiIndicatorChart
              data={data}
              title={`Housing Affordability Indicators - ${selectedCountry}`}
              selectedIndicators={selectedIndicators}
              indicatorOptions={indicatorOptions}
            />

            <div className="insight-box">
              <h3>How to read this view</h3>
              <p>
                Since the indicators use different units, the chart displays
                each selected series as an index where the first selected year
                equals 100. Hovering over the chart shows both indexed and
                original values.
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}