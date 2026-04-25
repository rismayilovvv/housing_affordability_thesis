from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from .. import crud, schemas
from ..models import CountryData

router = APIRouter(prefix="/api", tags=["data"])


@router.get("/countries")
def read_countries(db: Session = Depends(get_db)):
    results = crud.get_countries(db)
    countries = [row[0] for row in results]
    return {"countries": countries}


@router.get("/data", response_model=list[schemas.CountryDataResponse])
def read_country_data(
    country: str = Query(..., description="Country name"),
    start_year: int | None = Query(None, description="Start year"),
    end_year: int | None = Query(None, description="End year"),
    db: Session = Depends(get_db),
):
    query = db.query(CountryData).filter(CountryData.country == country)

    if start_year is not None:
        query = query.filter(CountryData.year >= start_year)

    if end_year is not None:
        query = query.filter(CountryData.year <= end_year)

    data = query.order_by(CountryData.year.asc()).all()

    if not data:
        raise HTTPException(status_code=404, detail="No data found for selected filters.")

    return data