import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
RAW_DIR = BASE_DIR / "raw"
PROCESSED_DIR = BASE_DIR / "processed"
PROCESSED_DIR.mkdir(exist_ok=True)

COUNTRIES = [
    "Czech Republic",
    "Hungary",
    "Germany",
    "Italy",
    "France",
    "Netherlands",
    "Bulgaria",
    "Croatia",
    "Sweden",
    "Spain",
    "Lithuania",
    "Estonia",
]

USD_TO_EUR = 0.92

EURO_ADOPTION_YEARS = {
    "Estonia": 2011,
    "Lithuania": 2015,
}


def normalize_country_names(series):
    return (
        series.astype(str)
        .str.strip()
        .replace({
            "Czechia": "Czech Republic",
            "Czech Rep.": "Czech Republic",
        })
    )


def process_worldbank(file_path, value_name, convert_usd_to_eur=False):
    df = pd.read_csv(file_path, skiprows=4)

    df = df.rename(columns={"Country Name": "country"})
    df["country"] = normalize_country_names(df["country"])
    df = df[df["country"].isin(COUNTRIES)]

    year_columns = [col for col in df.columns if str(col).isdigit()]

    df = df.melt(
        id_vars=["country"],
        value_vars=year_columns,
        var_name="year",
        value_name=value_name,
    )

    df["year"] = pd.to_numeric(df["year"], errors="coerce")
    df[value_name] = pd.to_numeric(df[value_name], errors="coerce")

    df = df.dropna(subset=["year"])
    df["year"] = df["year"].astype(int)
    df = df[(df["year"] >= 2005) & (df["year"] <= 2023)]

    if convert_usd_to_eur:
        df[value_name] = df[value_name] * USD_TO_EUR

    df = df[["country", "year", value_name]]
    df = df.drop_duplicates(subset=["country", "year"])
    return df


def process_clean_mortgage_file(file_path, value_name):
    df = pd.read_csv(file_path)

    df["country"] = normalize_country_names(df["country"])
    df = df[df["country"].isin(COUNTRIES)]

    df["year"] = pd.to_numeric(df["year"], errors="coerce")
    df[value_name] = pd.to_numeric(df[value_name], errors="coerce")

    df = df.dropna(subset=["country", "year"])
    df["year"] = df["year"].astype(int)
    df = df[(df["year"] >= 2005) & (df["year"] <= 2023)]

    df = df[["country", "year", value_name]]
    df = df.drop_duplicates(subset=["country", "year"])
    return df


def convert_income_to_eur(row):
    country = row["country"]
    year = row["year"]
    income = row["income"]
    rate = row["rate"]

    if pd.isna(income):
        return income

    if country in EURO_ADOPTION_YEARS and year >= EURO_ADOPTION_YEARS[country]:
        return income

    if pd.notna(rate):
        return income / rate

    return income


# -----------------------
# 1. HPI
# -----------------------
hpi_df = pd.read_csv(RAW_DIR / "hpi.csv")

hpi_df = hpi_df[["geo", "TIME_PERIOD", "OBS_VALUE"]].rename(columns={
    "geo": "country",
    "TIME_PERIOD": "year",
    "OBS_VALUE": "housing_price_index",
})

hpi_df["country"] = normalize_country_names(hpi_df["country"])
hpi_df["year"] = pd.to_numeric(hpi_df["year"], errors="coerce")
hpi_df["housing_price_index"] = pd.to_numeric(hpi_df["housing_price_index"], errors="coerce")

hpi_df = hpi_df[hpi_df["country"].isin(COUNTRIES)]
hpi_df = hpi_df[(hpi_df["year"] >= 2005) & (hpi_df["year"] <= 2023)]
hpi_df = hpi_df.dropna(subset=["country", "year"])
hpi_df["year"] = hpi_df["year"].astype(int)
hpi_df = hpi_df.drop_duplicates(subset=["country", "year"])


# -----------------------
# 2. Income
# -----------------------
income_df = pd.read_csv(RAW_DIR / "income.csv")

income_df["country"] = normalize_country_names(income_df["REF_AREA_NAME"])

income_df = income_df[
    (income_df["country"].isin(COUNTRIES)) &
    (income_df["SEX_NAME"] == "Total") &
    (income_df["COMP_BREAKDOWN_2_NAME"] == "Definition: Current definition (OECD_IDD)") &
    (income_df["COMP_BREAKDOWN_3_NAME"] == "Statistical operation: Arithmetic mean (OECD_IDD)")
].copy()

income_df = income_df.rename(columns={
    "TIME_PERIOD": "year",
    "OBS_VALUE": "income",
    "AGE_NAME": "age_name",
})

income_df["year"] = pd.to_numeric(income_df["year"], errors="coerce")
income_df["income"] = pd.to_numeric(income_df["income"], errors="coerce")

income_df = income_df.dropna(subset=["country", "year"])
income_df["year"] = income_df["year"].astype(int)
income_df = income_df[(income_df["year"] >= 2005) & (income_df["year"] <= 2023)]

age_priority = {
    "All age ranges or no breakdown by age": 1,
    "18 to 65 years old": 2,
    "18 to 25 years old": 3,
}

income_df["age_priority"] = income_df["age_name"].map(age_priority).fillna(99)
income_df = income_df.sort_values(["country", "year", "age_priority"])
income_df = income_df.drop_duplicates(subset=["country", "year"], keep="first")
income_df = income_df[["country", "year", "income"]]


# -----------------------
# 3. Exchange Rates
# -----------------------
exchange_df = pd.read_csv(RAW_DIR / "exchange_rates.csv")

exchange_df = exchange_df.melt(
    id_vars=["Year"],
    value_vars=["CZK", "SEK", "HUF", "BGN", "LTL", "EEK"],
    var_name="currency",
    value_name="rate",
)

currency_map = {
    "CZK": "Czech Republic",
    "SEK": "Sweden",
    "HUF": "Hungary",
    "BGN": "Bulgaria",
    "LTL": "Lithuania",
    "EEK": "Estonia",
}

exchange_df["country"] = exchange_df["currency"].map(currency_map)
exchange_df = exchange_df.rename(columns={"Year": "year"})
exchange_df["year"] = pd.to_numeric(exchange_df["year"], errors="coerce")
exchange_df["rate"] = pd.to_numeric(exchange_df["rate"], errors="coerce")
exchange_df = exchange_df.dropna(subset=["country", "year"])
exchange_df["year"] = exchange_df["year"].astype(int)
exchange_df = exchange_df[["country", "year", "rate"]]

income_df = income_df.merge(exchange_df, on=["country", "year"], how="left")
income_df["income"] = income_df.apply(convert_income_to_eur, axis=1)
income_df = income_df[["country", "year", "income"]]


# -----------------------
# 4. Mortgage
# -----------------------
mortgage_df = process_clean_mortgage_file(
    RAW_DIR / "mortgage_rate.csv",
    "mortgage_rate",
)


# -----------------------
# 5. Unemployment
# -----------------------
unemployment_df = pd.read_csv(RAW_DIR / "unemployment.csv")

unemployment_df = unemployment_df[
    ["geo", "TIME_PERIOD", "OBS_VALUE", "sex"]
].rename(columns={
    "geo": "country",
    "TIME_PERIOD": "year",
    "OBS_VALUE": "unemployment",
})

unemployment_df["country"] = normalize_country_names(unemployment_df["country"])
unemployment_df = unemployment_df[unemployment_df["sex"] == "Total"]

unemployment_df["year"] = pd.to_numeric(unemployment_df["year"], errors="coerce")
unemployment_df["unemployment"] = pd.to_numeric(unemployment_df["unemployment"], errors="coerce")

unemployment_df = unemployment_df[unemployment_df["country"].isin(COUNTRIES)]
unemployment_df = unemployment_df[(unemployment_df["year"] >= 2005) & (unemployment_df["year"] <= 2023)]
unemployment_df = unemployment_df.dropna(subset=["country", "year"])
unemployment_df["year"] = unemployment_df["year"].astype(int)

unemployment_df = unemployment_df[["country", "year", "unemployment"]]
unemployment_df = unemployment_df.drop_duplicates(subset=["country", "year"])


# -----------------------
# 6. GDP + Population
# -----------------------
gdp_df = process_worldbank(
    RAW_DIR / "gdp.csv",
    "gdp",
    convert_usd_to_eur=True,
)

population_df = process_worldbank(
    RAW_DIR / "population.csv",
    "population",
    convert_usd_to_eur=False,
)


# -----------------------
# 7. Merge all datasets
# -----------------------
final_df = hpi_df.merge(income_df, on=["country", "year"], how="left")
final_df = final_df.merge(mortgage_df, on=["country", "year"], how="left")
final_df = final_df.merge(unemployment_df, on=["country", "year"], how="left")
final_df = final_df.merge(gdp_df, on=["country", "year"], how="left")
final_df = final_df.merge(population_df, on=["country", "year"], how="left")

final_df = final_df.drop_duplicates(subset=["country", "year"])
final_df = final_df.sort_values(["country", "year"])

output_path = PROCESSED_DIR / "country_data.csv"
final_df.to_csv(output_path, index=False)

print("Processed data saved to:", output_path)
print("Countries in final dataset:", sorted(final_df["country"].dropna().unique()))
print("Rows in final dataset:", len(final_df))
print(final_df.head())