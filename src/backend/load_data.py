from pathlib import Path
import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the .env file.")

BASE_DIR = Path(__file__).resolve().parent
CSV_PATH = BASE_DIR.parent / "data-processing" / "processed" / "country_data.csv"

if not CSV_PATH.exists():
    raise FileNotFoundError(f"CSV file not found at: {CSV_PATH}")

df = pd.read_csv(CSV_PATH)

expected_columns = {
    "country",
    "year",
    "housing_price_index",
    "mortgage_rate",
    "income",
    "unemployment",
    "gdp",
    "population",
}

missing = expected_columns - set(df.columns)
if missing:
    raise ValueError(f"Missing expected columns in CSV: {missing}")

df = df.dropna(subset=["country", "year"]).copy()

df["country"] = df["country"].astype(str).str.strip()
df["year"] = pd.to_numeric(df["year"], errors="coerce")

numeric_columns = [
    "housing_price_index",
    "mortgage_rate",
    "income",
    "unemployment",
    "gdp",
    "population",
]

for column in numeric_columns:
    df[column] = pd.to_numeric(df[column], errors="coerce")

df = df.dropna(subset=["country", "year"])
df["year"] = df["year"].astype(int)

df = df.sort_values(["country", "year"])

print(f"Rows to load: {len(df)}")
print(f"Countries to load: {df['country'].nunique()}")

engine = create_engine(DATABASE_URL)

with engine.begin() as connection:
    # Important: clears old rows so outdated 2023-only GDP/population values do not remain.
    connection.execute(text("DELETE FROM country_data"))

    records = df.to_dict(orient="records")

    connection.execute(
        text("""
            INSERT INTO country_data (
                country,
                year,
                housing_price_index,
                mortgage_rate,
                income,
                unemployment,
                gdp,
                population
            )
            VALUES (
                :country,
                :year,
                :housing_price_index,
                :mortgage_rate,
                :income,
                :unemployment,
                :gdp,
                :population
            )
        """),
        [
            {
                "country": record["country"],
                "year": int(record["year"]),
                "housing_price_index": None if pd.isna(record["housing_price_index"]) else float(record["housing_price_index"]),
                "mortgage_rate": None if pd.isna(record["mortgage_rate"]) else float(record["mortgage_rate"]),
                "income": None if pd.isna(record["income"]) else float(record["income"]),
                "unemployment": None if pd.isna(record["unemployment"]) else float(record["unemployment"]),
                "gdp": None if pd.isna(record["gdp"]) else float(record["gdp"]),
                "population": None if pd.isna(record["population"]) else float(record["population"]),
            }
            for record in records
        ],
    )

print("Data loaded successfully into country_data table.")