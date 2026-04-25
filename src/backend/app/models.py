from sqlalchemy import Column, Integer, String, Float
from .database import Base


class CountryData(Base):
    __tablename__ = "country_data"

    country = Column(String, primary_key=True, index=True)
    year = Column(Integer, primary_key=True, index=True)
    housing_price_index = Column(Float, nullable=True)
    mortgage_rate = Column(Float, nullable=True)
    income = Column(Float, nullable=True)
    unemployment = Column(Float, nullable=True)
    gdp = Column(Float, nullable=True)
    population = Column(Float, nullable=True)