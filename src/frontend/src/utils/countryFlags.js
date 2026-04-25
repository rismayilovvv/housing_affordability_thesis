const countryCodeMap = {
  "Czech Republic": "cz",
  Czechia: "cz",
  Hungary: "hu",
  Germany: "de",
  Italy: "it",
  France: "fr",
  Netherlands: "nl",
  Bulgaria: "bg",
  Croatia: "hr",
  Sweden: "se",
  Spain: "es",
  Lithuania: "lt",
  Estonia: "ee",
};

export function normalizeCountryName(country) {
  const map = {
    Czechia: "Czech Republic",
    "Czech Rep.": "Czech Republic",
  };

  return map[country] || country;
}

export function getCountryCode(country) {
  const normalized = normalizeCountryName(country);
  return countryCodeMap[normalized] || "";
}

export function getFlagUrl(country) {
  const code = getCountryCode(country);
  if (!code) return "";
  return `https://flagcdn.com/w40/${code}.png`;
}