import { useState } from "react";
import { getFlagUrl, normalizeCountryName } from "../utils/countryFlags";

export default function FlagIcon({
  country,
  className = "flag-icon",
  alt,
}) {
  const normalizedCountry = normalizeCountryName(country);
  const [failed, setFailed] = useState(false);

  const flagUrl = getFlagUrl(normalizedCountry);

  if (failed || !flagUrl) {
    return (
      <span className={`${className} flag-fallback`} title={normalizedCountry}>
        {normalizedCountry.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={flagUrl}
      alt={alt || `${normalizedCountry} flag`}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}