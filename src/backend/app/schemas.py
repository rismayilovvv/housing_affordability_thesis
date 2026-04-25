from pydantic import BaseModel
from typing import Optional


class CountryDataResponse(BaseModel):
    country: str
    year: int
    housing_price_index: Optional[float] = None
    mortgage_rate: Optional[float] = None
    income: Optional[float] = None
    unemployment: Optional[float] = None
    gdp: Optional[float] = None
    population: Optional[float] = None

    class Config:
        from_attributes = True


class CountryListResponse(BaseModel):
    country: str

    class Config:
        from_attributes = True