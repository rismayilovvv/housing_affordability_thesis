import { useEffect, useMemo, useState } from "react";
import { fetchCountries, fetchCountryData } from "../api/api";
import ComparisonChart from "../components/ComparisonChart";
import FlagIcon from "../components/FlagIcon";
import YearFilter from "../components/YearFilter";

const metricOptions = [
  { key: "housing_price_index", label: "Housing Price Index", short: "HPI" },
  { key: "mortgage_rate", label: "Mortgage Rate", short: "MR" },
  { key: "income", label: "Income", short: "INC" },
  { key: "unemployment", label: "Unemployment", short: "UN" },
];

export default function ComparisonPage() {
  const [countries, setCountries] = useState([]);
  const [countryA, setCountryA] = useState("");
  const [countryB, setCountryB] = useState("");
  const [metric, setMetric] = useState("housing_price_index");

  const [dataA, setDataA] = useState([]);
  const [dataB, setDataB] = useState([]);

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

        if (countryList.length >= 2) {
          setCountryA(countryList[0]);
          setCountryB(countryList[1]);
        }
      } catch {
        setError("Failed to load countries.");
      }
    };

    loadCountries();
  }, []);

  useEffect(() => {
    if (!countryA || !countryB || startYear > endYear) return;

    const loadComparisonData = async () => {
      setLoading(true);
      setError("");

      try {
        const [resultA, resultB] = await Promise.all([
          fetchCountryData(countryA, startYear, endYear),
          fetchCountryData(countryB, startYear, endYear),
        ]);

        setDataA(resultA);
        setDataB(resultB);
      } catch {
        setError("Failed to load comparison data for the selected countries.");
        setDataA([]);
        setDataB([]);
      } finally {
        setLoading(false);
      }
    };

    loadComparisonData();
  }, [countryA, countryB, startYear, endYear]);

  const selectedMetric = metricOptions.find((item) => item.key === metric);

  const years = useMemo(() => {
    const set = new Set([
      ...dataA.map((item) => item.year),
      ...dataB.map((item) => item.year),
    ]);
    return [...set].sort((a, b) => a - b);
  }, [dataA, dataB]);

  const alignedA = useMemo(() => {
    const map = new Map(dataA.map((item) => [item.year, item]));
    return years.map((year) => map.get(year)?.[metric] ?? null);
  }, [dataA, years, metric]);

  const alignedB = useMemo(() => {
    const map = new Map(dataB.map((item) => [item.year, item]));
    return years.map((year) => map.get(year)?.[metric] ?? null);
  }, [dataB, years, metric]);

  const latestA = dataA[dataA.length - 1];
  const latestB = dataB[dataB.length - 1];

  const formatValue = (key, value) => {
    if (value == null) return "N/A";
    if (key === "income") return `${Number(value).toLocaleString()} EUR`;
    return Number(value).toFixed(2);
  };

  const computeDifference = () => {
    if (!latestA || !latestB) return "N/A";
    const a = latestA?.[metric];
    const b = latestB?.[metric];
    if (a == null || b == null) return "N/A";

    const diff = Number(a) - Number(b);
    if (metric === "income") {
      return `${diff.toLocaleString()} EUR`;
    }
    return diff.toFixed(2);
  };

  return (
    <div className="analysis-page">
      <section className="full-width-section">
        <div className="page-header comparison-header">
          <div className="section-badge">Comparison View</div>
          <h2>Country Comparison</h2>
          <p className="page-description">
            Compare two countries across the same period and inspect how
            housing-affordability indicators evolved side by side. This view is
            useful for identifying similarities, divergences, and relative
            pressures across national housing markets.
          </p>
        </div>

        <div className="comparison-page-shell">
          <div className="comparison-control-card">
            <div className="comparison-card-header">
              <h3>Comparison Settings</h3>
              <p>
                Select two countries, choose the indicator, and define the time
                range for the comparison.
              </p>
            </div>

            <div className="comparison-controls-grid">
              <div className="comparison-filter-group">
                <div>
                  <label className="filter-label" htmlFor="country-a">
                    First country
                  </label>
                  <select
                    id="country-a"
                    className="filter-select"
                    value={countryA}
                    onChange={(e) => setCountryA(e.target.value)}
                  >
                    {countries.map((country) => (
                      <option key={`a-${country}`} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="filter-label" htmlFor="country-b">
                    Second country
                  </label>
                  <select
                    id="country-b"
                    className="filter-select"
                    value={countryB}
                    onChange={(e) => setCountryB(e.target.value)}
                  >
                    {countries.map((country) => (
                      <option key={`b-${country}`} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="comparison-filter-group single">
                <div>
                  <label className="filter-label" htmlFor="metric">
                    Indicator
                  </label>
                  <select
                    id="metric"
                    className="filter-select"
                    value={metric}
                    onChange={(e) => setMetric(e.target.value)}
                  >
                    {metricOptions.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <YearFilter
                startYear={startYear}
                endYear={endYear}
                onStartYearChange={setStartYear}
                onEndYearChange={setEndYear}
                availableYears={availableYears}
              />
            </div>
          </div>

          <div className="comparison-chart-card">
            <div className="comparison-card-header">
              <h3>Comparison Summary</h3>
              <p>
                A quick overview of the two countries based on the latest
                available values for the selected indicator.
              </p>
            </div>

            {!loading && years.length > 0 && (
              <div className="comparison-summary-pro">
                <div className="comparison-country-card">
                  <div className="comparison-country-top">
                    <div className="comparison-country-flag">
                      <FlagIcon country={countryA} className="flag-icon-large" />
                    </div>
                    <div>
                      <h4>{countryA}</h4>
                      <span>Country A</span>
                    </div>
                  </div>

                  <div className="comparison-country-metric">
                    <div className="comparison-country-metric-label">
                      {selectedMetric?.label}
                    </div>
                    <strong>{formatValue(metric, latestA?.[metric])}</strong>
                  </div>
                </div>

                <div className="comparison-country-card">
                  <div className="comparison-country-top">
                    <div className="comparison-country-flag">
                      <FlagIcon country={countryB} className="flag-icon-large" />
                    </div>
                    <div>
                      <h4>{countryB}</h4>
                      <span>Country B</span>
                    </div>
                  </div>

                  <div className="comparison-country-metric">
                    <div className="comparison-country-metric-label">
                      {selectedMetric?.label}
                    </div>
                    <strong>{formatValue(metric, latestB?.[metric])}</strong>
                  </div>
                </div>

                <div className="comparison-summary-stats">
                  <div className="comparison-summary-row">
                    <div className="comparison-summary-left">
                      <div className="comparison-summary-icon">
                        {selectedMetric?.short || "MT"}
                      </div>
                      <span>Latest Difference</span>
                    </div>
                    <strong>{computeDifference()}</strong>
                  </div>

                  <div className="comparison-summary-row">
                    <div className="comparison-summary-left">
                      <div className="comparison-summary-icon">YR</div>
                      <span>Selected Period</span>
                    </div>
                    <strong>
                      {startYear} - {endYear}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {loading && <p className="info-message">Loading comparison data...</p>}
            {error && <p className="error-message">{error}</p>}
          </div>
        </div>

        {!loading && years.length > 0 && (
          <>
            <div className="comparison-chart-card comparison-chart-card-full">
              <div className="comparison-card-header">
                <h3>{selectedMetric?.label} Comparison</h3>
                <p>
                  This chart places both countries on the same timeline for
                  direct visual comparison.
                </p>
              </div>

              <ComparisonChart
                title={`${selectedMetric?.label} Comparison: ${countryA} vs ${countryB}`}
                labels={years}
                countryA={countryA}
                countryB={countryB}
                datasetA={alignedA}
                datasetB={alignedB}
                metricLabel={selectedMetric?.label}
              />
            </div>

            <div className="insight-box">
              <h3>How to read this comparison</h3>
              <p>
                Compare whether the selected indicator followed a similar or
                diverging path between the two countries. This helps identify
                whether housing-related pressures developed in parallel or under
                different macroeconomic conditions.
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}