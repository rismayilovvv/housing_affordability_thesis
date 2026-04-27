const countryCodeMap = {
  Austria: "at",
  Belgium: "be",
  Bulgaria: "bg",
  Croatia: "hr",
  "Czech Republic": "cz",
  Czechia: "cz",
  Denmark: "dk",
  Estonia: "ee",
  Finland: "fi",
  France: "fr",
  Germany: "de",
  Greece: "gr",
  Hungary: "hu",
  Iceland: "is",
  Ireland: "ie",
  Italy: "it",
  Latvia: "lv",
  Lithuania: "lt",
  Luxembourg: "lu",
  Netherlands: "nl",
  Norway: "no",
  Poland: "pl",
  Portugal: "pt",
  Romania: "ro",
  Slovakia: "sk",
  Slovenia: "si",
  Spain: "es",
  Sweden: "se",
  Switzerland: "ch",
  "United Kingdom": "gb",
  UK: "gb",
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