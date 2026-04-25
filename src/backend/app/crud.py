from sqlalchemy.orm import Session
from sqlalchemy import distinct
from .models import CountryData


def get_countries(db: Session):
    return db.query(distinct(CountryData.country)).all()


def get_country_data(db: Session, country: str):
    return (
        db.query(CountryData)
        .filter(CountryData.country == country)
        .order_by(CountryData.year.asc())
        .all()
    )