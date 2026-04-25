from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.data import router as data_router

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Housing Affordability API",
    description="API for housing affordability indicators",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://housing-affordability-thesis.netlify.app/",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

origins = [
    "http://localhost:5173",
    "https://your-netlify-site-name.netlify.app",
]

# Allow frontend access during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(data_router)


@app.get("/")
def root():
    return {"message": "Housing Affordability API is running"}