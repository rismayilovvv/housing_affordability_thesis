import FlagIcon from "./FlagIcon";

export default function CountryFilter({
  countries,
  selectedCountry,
  onChange,
  label = "Select country",
}) {
  return (
    <div className="country-filter-block">
      <label className="filter-label">{label}</label>
      <div className="country-chip-grid">
        {countries.map((country) => (
          <button
            key={country}
            type="button"
            className={`country-chip-button ${
              selectedCountry === country ? "active" : ""
            }`}
            onClick={() => onChange(country)}
          >
            <FlagIcon
              country={country}
              className="flag-icon"
              alt={`${country} flag`}
            />
            <span>{country}</span>
          </button>
        ))}
      </div>
    </div>
  );
}