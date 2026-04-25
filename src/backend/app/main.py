from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.data import router as data_router

app = FastAPI(
    title="Housing Affordability API",
    description="API for housing affordability indicators",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(data_router)

@app.get("/")
def root():
    return {"message": "Housing Affordability API is running"}