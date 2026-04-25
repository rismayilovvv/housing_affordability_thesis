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
df = df.dropna(subset=["country", "year"])

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

print(f"Rows to load: {len(df)}")

engine = create_engine(DATABASE_URL)

with engine.begin() as connection:
    for _, row in df.iterrows():
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
                ON CONFLICT (country, year) DO NOTHING
            """),
            {
                "country": row["country"],
                "year": int(row["year"]),
                "housing_price_index": None if pd.isna(row["housing_price_index"]) else float(row["housing_price_index"]),
                "mortgage_rate": None if pd.isna(row["mortgage_rate"]) else float(row["mortgage_rate"]),
                "income": None if pd.isna(row["income"]) else float(row["income"]),
                "unemployment": None if pd.isna(row["unemployment"]) else float(row["unemployment"]),
                "gdp": None if pd.isna(row["gdp"]) else float(row["gdp"]),
                "population": None if pd.isna(row["population"]) else float(row["population"]),
            }
        )

print("Data loaded successfully into country_data table.")