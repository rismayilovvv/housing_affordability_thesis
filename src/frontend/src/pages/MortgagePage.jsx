import { useEffect, useMemo, useState } from "react";
import { fetchCountries, fetchCountryData } from "../api/api";
import CountryFilter from "../components/CountryFilter";
import YearFilter from "../components/YearFilter";
import IndicatorChart from "../components/IndicatorChart";
import SummaryCards from "../components/SummaryCards";

export default function MortgagePage() {
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
          <h2>Housing Prices vs Mortgage Rates</h2>
          <p className="page-description">
            This view compares the evolution of housing prices and mortgage rates
            for the selected country and period. It helps identify whether lower
            borrowing costs coincided with stronger housing price growth and how
            credit conditions may have influenced affordability pressures.
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
              secondKey="mortgage_rate"
              secondLabel="Mortgage Rate"
            />

            <IndicatorChart
              data={data}
              title={`Housing Prices vs Mortgage Rates - ${selectedCountry}`}
              firstLabel="Housing Price Index"
              secondLabel="Mortgage Rate"
              firstKey="housing_price_index"
              secondKey="mortgage_rate"
            />

            <div className="insight-box">
              <h3>How to read this view</h3>
              <p>
                Compare whether changes in housing prices moved together with
                changing borrowing costs. Periods of lower interest rates may
                support housing demand, while rising mortgage rates can increase
                affordability pressure even if prices slow down.
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}