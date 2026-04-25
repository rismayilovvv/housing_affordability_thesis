import { useEffect, useMemo, useState } from "react";
import { fetchCountries, fetchCountryData } from "../api/api";
import FlagIcon from "./FlagIcon";

function RankingCard({ title, items, suffix = "" }) {
  return (
    <div className="ranking-card">
      <h4>{title}</h4>

      <div className="ranking-list">
        {items?.length > 0 ? (
          items.map((item, index) => (
            <div key={`${title}-${item.country}`} className="ranking-item">
              <div className="ranking-left">
                <span className="ranking-position">#{index + 1}</span>
                <FlagIcon country={item.country} className="flag-icon" />
                <span>{item.country}</span>
              </div>

              <strong>
                {Number(item.value).toFixed(2)}
                {suffix}
              </strong>
            </div>
          ))
        ) : (
          <div className="ranking-empty">No data available.</div>
        )}
      </div>
    </div>
  );
}

export default function RankingsSection() {
  const [latestRows, setLatestRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRankings = async () => {
      try {
        setLoading(true);
        setError("");

        const countries = await fetchCountries();

        const rows = await Promise.all(
          countries.map(async (country) => {
            const data = await fetchCountryData(country, 2005, 2023);
            const latest = data?.[data.length - 1];

            return {
              country,
              year: latest?.year,
              hpi: latest?.housing_price_index,
              unemployment: latest?.unemployment,
              mortgage: latest?.mortgage_rate,
            };
          })
        );

        setLatestRows(rows.filter((row) => row.year));
      } catch {
        setError("Failed to load ranking data.");
        setLatestRows([]);
      } finally {
        setLoading(false);
      }
    };

    loadRankings();
  }, []);

  const rankings = useMemo(() => {
    const validHpi = latestRows.filter((row) => row.hpi != null);
    const validUnemployment = latestRows.filter((row) => row.unemployment != null);
    const validMortgage = latestRows.filter((row) => row.mortgage != null);

    return {
      highestHpi: [...validHpi]
        .sort((a, b) => b.hpi - a.hpi)
        .slice(0, 3)
        .map((row) => ({ country: row.country, value: row.hpi })),

      lowestUnemployment: [...validUnemployment]
        .sort((a, b) => a.unemployment - b.unemployment)
        .slice(0, 3)
        .map((row) => ({ country: row.country, value: row.unemployment })),

      highestMortgage: [...validMortgage]
        .sort((a, b) => b.mortgage - a.mortgage)
        .slice(0, 3)
        .map((row) => ({ country: row.country, value: row.mortgage })),
    };
  }, [latestRows]);

  return (
    <div className="ranking-section">
      <div className="section-badge">Cross-country Rankings</div>
      <h3 className="section-title">Quick comparative highlights</h3>
      <p className="map-description">
        This section summarizes selected cross-country rankings based on the
        latest available values in the processed dashboard dataset.
      </p>

      {loading && <p className="info-message">Loading rankings...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <div className="ranking-grid">
          <RankingCard title="Highest Latest HPI" items={rankings.highestHpi} />
          <RankingCard
            title="Lowest Unemployment"
            items={rankings.lowestUnemployment}
          />
          <RankingCard
            title="Highest Mortgage Rate"
            items={rankings.highestMortgage}
          />
        </div>
      )}
    </div>
  );
}