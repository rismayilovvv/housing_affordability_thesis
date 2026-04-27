import { useEffect, useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "@vnedyalk0v/react19-simple-maps";
import FlagIcon from "./FlagIcon";
import { fetchCountryData } from "../api/api";

const selectedCountries = [
  { name: "Austria", iso3: "AUT" },
  { name: "Belgium", iso3: "BEL" },
  { name: "Bulgaria", iso3: "BGR" },
  { name: "Croatia", iso3: "HRV" },
  { name: "Czech Republic", iso3: "CZE" },
  { name: "Denmark", iso3: "DNK" },
  { name: "Estonia", iso3: "EST" },
  { name: "Finland", iso3: "FIN" },
  { name: "France", iso3: "FRA" },
  { name: "Germany", iso3: "DEU" },
  { name: "Greece", iso3: "GRC" },
  { name: "Hungary", iso3: "HUN" },
  { name: "Iceland", iso3: "ISL" },
  { name: "Ireland", iso3: "IRL" },
  { name: "Italy", iso3: "ITA" },
  { name: "Latvia", iso3: "LVA" },
  { name: "Lithuania", iso3: "LTU" },
  { name: "Luxembourg", iso3: "LUX" },
  { name: "Netherlands", iso3: "NLD" },
  { name: "Norway", iso3: "NOR" },
  { name: "Poland", iso3: "POL" },
  { name: "Portugal", iso3: "PRT" },
  { name: "Romania", iso3: "ROU" },
  { name: "Slovakia", iso3: "SVK" },
  { name: "Slovenia", iso3: "SVN" },
  { name: "Spain", iso3: "ESP" },
  { name: "Sweden", iso3: "SWE" },
  { name: "Switzerland", iso3: "CHE" },
  { name: "United Kingdom", iso3: "GBR" },
];

const selectedCountryCodes = new Set(selectedCountries.map((c) => c.iso3));
const iso3ToCountryName = Object.fromEntries(
  selectedCountries.map((c) => [c.iso3, c.name])
);

const detailItems = [
  { key: "year", label: "Latest year", icon: "YR" },
  { key: "housing_price_index", label: "HPI", icon: "HP" },
  { key: "mortgage_rate", label: "Mortgage rate", icon: "%" },
  { key: "income", label: "Income", icon: "€" },
  { key: "unemployment", label: "Unemployment", icon: "UN" },
  { key: "gdp", label: "GDP", icon: "GD" },
  { key: "population", label: "Population", icon: "PO" },
];

export default function EuropeMap() {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [countryStats, setCountryStats] = useState({});
  const [tooltip, setTooltip] = useState(null);
  const [pinnedCountry, setPinnedCountry] = useState(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const loadGeoData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/maps/europe.geojson");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        if (
          !data ||
          data.type !== "FeatureCollection" ||
          !Array.isArray(data.features)
        ) {
          throw new Error("Invalid GeoJSON structure");
        }

        setGeoData(data);
      } catch (err) {
        console.error("GeoJSON load error:", err);
        setError(`Failed to load map data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadGeoData();
  }, []);

  useEffect(() => {
    const loadCountryStats = async () => {
      try {
        const entries = await Promise.all(
          selectedCountries.map(async ({ name }) => {
            try {
              const data = await fetchCountryData(name, 2005, 2023);
              const latest = data?.[data.length - 1] || null;
              return [name, latest];
            } catch {
              return [name, null];
            }
          })
        );

        setCountryStats(Object.fromEntries(entries));
      } catch (err) {
        console.error("Failed to load country stats:", err);
      }
    };

    loadCountryStats();
  }, []);

  const formatValue = (label, value) => {
    if (value == null) return "N/A";
    if (label === "income") return `${Number(value).toLocaleString()} EUR`;
    return Number(value).toFixed(2);
  };

  const formatGDP = (value) => {
    if (value == null) return "N/A";
    if (value >= 1_000_000_000_000) {
      return `€${(value / 1_000_000_000_000).toFixed(2)} trillion`;
    }
    if (value >= 1_000_000_000) {
      return `€${(value / 1_000_000_000).toFixed(2)} billion`;
    }
    if (value >= 1_000_000) {
      return `€${(value / 1_000_000).toFixed(2)} million`;
    }
    return `€${value.toLocaleString()}`;
  };

  const formatPopulation = (value) => {
    if (value == null) return "N/A";
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(2)} billion`;
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(2)} million`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(2)} thousand`;
    }
    return value.toString();
  };

  const getDisplayValue = (key, data) => {
    if (!data) return "N/A";
    if (key === "year") return data.year ?? "N/A";
    if (key === "gdp") return formatGDP(data.gdp);
    if (key === "population") return formatPopulation(data.population);
    return formatValue(key, data[key]);
  };

  const buildCountryPayload = (geo) => {
    const iso3 = geo.properties?.ISO3 || "";
    const rawName =
      geo.properties?.NAME ||
      geo.properties?.name ||
      geo.properties?.ADMIN ||
      "Unknown country";

    const mappedCountryName = iso3ToCountryName[iso3];
    const isSelected = selectedCountryCodes.has(iso3);
    const latestData = mappedCountryName
      ? countryStats[mappedCountryName]
      : null;

    return {
      iso3,
      rawName,
      countryName: mappedCountryName || rawName,
      isSelected,
      data: latestData,
    };
  };

  const mapContent = useMemo(() => {
    if (!geoData) return null;

    return (
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 480,
          center: [18, 54],
        }}
        width={900}
        height={700}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup zoom={zoom} center={[18, 54]}>
          <Geographies geography={geoData}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const payload = buildCountryPayload(geo);
                const isPinned = pinnedCountry?.iso3 === payload.iso3;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    tabIndex={-1}
                    style={{
                      default: {
                        fill: isPinned
                          ? "var(--map-pinned)"
                          : payload.isSelected
                          ? "var(--map-active)"
                          : "var(--map-default)",
                        stroke: "var(--map-stroke)",
                        strokeWidth: isPinned ? 1.6 : 0.9,
                        outline: "none",
                      },
                      hover: {
                        fill: payload.isSelected
                          ? "var(--map-hover)"
                          : "var(--map-default)",
                        stroke: "var(--map-stroke)",
                        strokeWidth: payload.isSelected ? 1.1 : 0.9,
                        outline: "none",
                        cursor: payload.isSelected ? "pointer" : "default",
                      },
                      pressed: {
                        fill: isPinned
                          ? "var(--map-pinned)"
                          : payload.isSelected
                          ? "var(--map-active)"
                          : "var(--map-default)",
                        stroke: "var(--map-stroke)",
                        strokeWidth: isPinned ? 1.6 : 0.9,
                        outline: "none",
                      },
                    }}
                    onMouseDown={(event) => {
                      event.preventDefault();
                    }}
                    onFocus={(event) => {
                      event.target.blur();
                    }}
                    onMouseEnter={(event) => {
                      setTooltip({
                        x: event.clientX,
                        y: event.clientY,
                        ...payload,
                      });
                    }}
                    onMouseMove={(event) => {
                      setTooltip((prev) =>
                        prev
                          ? {
                              ...prev,
                              x: event.clientX,
                              y: event.clientY,
                            }
                          : null
                      );
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      if (!payload.isSelected) return;

                      setPinnedCountry(payload);
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    );
  }, [geoData, countryStats, pinnedCountry, zoom]);

  return (
    <div className="map-page-shell">
      <div className="map-layout map-layout-visual">
        <div className="map-card map-card-visual">
          <div className="map-legend-card">
            <div className="map-legend-title">LEGEND</div>

            <div className="map-legend-item">
              <span className="legend-swatch selected" />
              <span>Selected country</span>
            </div>

            <div className="map-legend-item">
              <span className="legend-swatch hovered" />
              <span>Hovered country</span>
            </div>

            <div className="map-legend-item">
              <span className="legend-swatch not-in-dataset" />
              <span>Not included in dataset</span>
            </div>
          </div>

          <div className="map-zoom-controls">
            <button
              type="button"
              className="zoom-button"
              onClick={() => setZoom((prev) => Math.min(prev + 0.2, 3))}
            >
              +
            </button>

            <button
              type="button"
              className="zoom-button"
              onClick={() => setZoom((prev) => Math.max(prev - 0.2, 1))}
            >
              −
            </button>
          </div>

          <div className="map-wrapper map-wrapper-visual">
            {loading && <p className="info-message">Loading map...</p>}
            {!loading && error && <p className="error-message">{error}</p>}
            {!loading && !error && mapContent}
          </div>
        </div>

        <div className="map-side-panel map-side-panel-visual">
          {!pinnedCountry ? (
            <div className="map-detail-card map-detail-empty">
              <div className="map-detail-card-top">
                <div className="map-modal-badge">Country Details</div>
              </div>

              <h4>Select a highlighted country</h4>
              <p>
                Click a country included in the dataset to display its latest
                indicators here.
              </p>
            </div>
          ) : (
            <div className="map-detail-card map-detail-card-pro">
              <div className="map-detail-card-top">
                <h3 className="map-panel-main-title">Country Details</h3>
                <div className="map-country-code-badge">
                  {pinnedCountry.iso3.slice(0, 2)}
                </div>
              </div>

              <div className="map-detail-header map-detail-header-pro">
                <div className="map-detail-flag-wrap">
                  <FlagIcon
                    country={pinnedCountry.countryName}
                    className="flag-icon-large"
                  />
                </div>

                <div className="map-detail-title-wrap">
                  <h4>{pinnedCountry.countryName}</h4>
                  <p>Included in dataset</p>
                </div>
              </div>

              <div className="map-summary-list">
                {detailItems.map((item) => (
                  <div key={item.key} className="map-summary-row">
                    <div className="map-summary-left">
                      <div className="map-summary-icon">{item.icon}</div>
                      <span>{item.label}</span>
                    </div>

                    <strong>{getDisplayValue(item.key, pinnedCountry.data)}</strong>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="map-clear-button map-clear-button-pro"
                onClick={() => setPinnedCountry(null)}
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      </div>

      {tooltip && (
        <div
          className="map-tooltip map-tooltip-dark"
          style={{
            left: tooltip.x + 16,
            top: tooltip.y + 16,
          }}
        >
          <div className="map-tooltip-header">
            {tooltip.isSelected && (
              <FlagIcon
                country={tooltip.countryName}
                className="flag-icon-large"
              />
            )}

            <div>
              <div className="map-tooltip-country">{tooltip.countryName}</div>

              <div
                className={`map-tooltip-subtitle ${
                  tooltip.isSelected ? "status-included" : "status-excluded"
                }`}
              >
                {tooltip.isSelected
                  ? "Included in dataset"
                  : "Not included in dataset"}
              </div>
            </div>
          </div>

          {tooltip.isSelected && tooltip.data ? (
            <div className="map-tooltip-stats">
              <div>
                <strong>Latest year:</strong> {tooltip.data.year ?? "N/A"}
              </div>
              <div>
                <strong>HPI:</strong>{" "}
                {formatValue("hpi", tooltip.data.housing_price_index)}
              </div>
              <div>
                <strong>Mortgage rate:</strong>{" "}
                {formatValue("mortgage", tooltip.data.mortgage_rate)}
              </div>
              <div>
                <strong>Income:</strong>{" "}
                {formatValue("income", tooltip.data.income)}
              </div>
              <div>
                <strong>Unemployment:</strong>{" "}
                {formatValue("unemployment", tooltip.data.unemployment)}
              </div>
              <div>
                <strong>GDP:</strong> {formatGDP(tooltip.data.gdp)}
              </div>
              <div>
                <strong>Population:</strong>{" "}
                {formatPopulation(tooltip.data.population)}
              </div>
              <div className="map-tooltip-footer">Click to view details</div>
            </div>
          ) : (
            <div className="map-tooltip-stats">
              <div>This country is not part of the selected thesis dataset.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}