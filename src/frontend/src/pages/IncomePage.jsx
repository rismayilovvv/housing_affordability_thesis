import { useEffect, useMemo, useState } from "react";
import { fetchCountries, fetchCountryData } from "../api/api";
import CountryFilter from "../components/CountryFilter";
import YearFilter from "../components/YearFilter";
import IndicatorChart from "../components/IndicatorChart";
import SummaryCards from "../components/SummaryCards";

export default function IncomePage() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
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
        if (countryList.length > 0) {
          setSelectedCountry(countryList[0]);
        }
      } catch {
        setError("Failed to load countries.");
      }
    };

    loadCountries();
  }, []);

  useEffect(() => {
    if (!selectedCountry || startYear > endYear) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const countryData = await fetchCountryData(
          selectedCountry,
          startYear,
          endYear
        );
        setData(countryData);
        setError("");
      } catch {
        setError("No data available for the selected country and period.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedCountry, startYear, endYear]);

  return (
    <div className="analysis-page">
      <section className="full-width-section">
        <div className="page-header">
          <div className="section-badge">Analysis View</div>
          <h2>Housing Prices vs Income</h2>
          <p className="page-description">
            This view compares housing price developments with disposable income
            for the selected country and period. It helps assess whether income
            growth kept pace with changes in housing prices and whether housing
            became relatively more or less affordable over time.
          </p>
        </div>

        <div className="dashboard-panel">
          <CountryFilter
            countries={countries}
            selectedCountry={selectedCountry}
            onChange={setSelectedCountry}
          />

          <YearFilter
            startYear={startYear}
            endYear={endYear}
            onStartYearChange={setStartYear}
            onEndYearChange={setEndYear}
            availableYears={availableYears}
          />
        </div>

        {loading && <p className="info-message">Loading data...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && data.length > 0 && (
          <>
            <SummaryCards
              country={selectedCountry}
              data={data}
              secondKey="income"
              secondLabel="Income"
            />

            <IndicatorChart
              data={data}
              title={`Housing Prices vs Income - ${selectedCountry}`}
              firstLabel="Housing Price Index"
              secondLabel="Income"
              firstKey="housing_price_index"
              secondKey="income"
            />

            <div className="insight-box">
              <h3>How to read this view</h3>
              <p>
                If housing prices rise faster than income, the affordability gap
                tends to widen. If income growth keeps pace with or exceeds
                housing price growth, affordability conditions may remain more
                stable.
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}