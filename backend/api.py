"""
Maltek Findings — FastAPI backend
Deploy target: Railway (PostgreSQL plugin provides DATABASE_URL automatically)
Local dev:     copy .env.example → .env and fill in values
"""

import os
from contextlib import asynccontextmanager
from typing import Optional, Any

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Column, Text
from sqlalchemy.types import JSON
from sqlmodel import Field, Session, SQLModel, create_engine, select
from typing import Annotated

load_dotenv()

# ─── database ────────────────────────────────────────────────────────────────

def _build_db_url() -> str:
    # Railway injects DATABASE_URL when a Postgres plugin is attached.
    url = os.getenv("DATABASE_URL", "")
    if url:
        # SQLAlchemy 1.4+ requires postgresql:// not postgres://
        return url.replace("postgres://", "postgresql://", 1)
    # Fallback for local dev (.env file)
    host     = os.getenv("DB_HOST", "")
    port     = os.getenv("DB_PORT", "5432")
    user     = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "")
    name     = os.getenv("DB_NAME", "findings")
    if not host:
        raise RuntimeError(
            "No database configured. "
            "Set DATABASE_URL (Railway: link the Postgres plugin to this service under Variables → Add Reference) "
            "or set DB_HOST/DB_USER/DB_PASSWORD/DB_NAME for local dev."
        )
    return f"postgresql://{user}:{password}@{host}:{port}/{name}"


engine = create_engine(_build_db_url())


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]

# ─── models ──────────────────────────────────────────────────────────────────

class Finding(SQLModel, table=True):
    __tablename__ = "findings"

    id:                  Optional[int] = Field(default=None, primary_key=True)
    pentester:           str           = Field(index=True)
    title:               str           = Field(index=True)
    date:                str                                      # YYYY-MM-DD
    severity:            str                                      # Critical/High/Medium/Low/Info
    status:              str                                      # Open/Fixed/Accepted Risk
    wstg_id:             str           = Field(index=True)        # e.g. WSTG-INPV-05
    wstg_category:       str
    cwe_id:              Optional[int] = None
    cvss:                Optional[str] = None
    affected_component:  Optional[str] = None

    # Long-text fields stored as TEXT in Postgres
    description:         str = Field(sa_column=Column(Text, nullable=False))
    impact:              str = Field(sa_column=Column(Text, nullable=False))
    recommendation:      str = Field(sa_column=Column(Text, nullable=False))

    # JSON columns (arrays)
    steps_to_reproduce:  Optional[Any] = Field(default=None, sa_column=Column(JSON))
    poc_images:          Optional[Any] = Field(default=None, sa_column=Column(JSON))
    references:          Optional[Any] = Field(default=None, sa_column=Column(JSON))


class FindingCreate(SQLModel):
    """Payload for POST /findings/"""
    pentester:           str
    title:               str
    date:                str
    severity:            str
    status:              str
    wstg_id:             str
    wstg_category:       str
    cwe_id:              Optional[int] = None
    cvss:                Optional[str] = None
    affected_component:  Optional[str] = None
    description:         str
    impact:              str
    recommendation:      str
    steps_to_reproduce:  list          = []
    poc_images:          list          = []
    references:          list          = []


# ─── response helper (snake_case → camelCase for the frontend) ───────────────

def to_dict(f: Finding) -> dict:
    return {
        "id":                 f.id,
        "pentester":          f.pentester,
        "title":              f.title,
        "date":               f.date,
        "severity":           f.severity,
        "status":             f.status,
        "wstgId":             f.wstg_id,
        "wstgCategory":       f.wstg_category,
        "cweId":              f.cwe_id,
        "cvss":               f.cvss,
        "affectedComponent":  f.affected_component,
        "description":        f.description,
        "impact":             f.impact,
        "recommendation":     f.recommendation,
        "stepsToReproduce":   f.steps_to_reproduce or [],
        "pocImages":          f.poc_images or [],
        "references":         f.references or [],
    }


# ─── app lifecycle ───────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(_app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield


app = FastAPI(title="Maltek Findings API", lifespan=lifespan)

# CORS — allow Vercel frontend + localhost dev
_allowed_origins = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", "https://findings-kappa.vercel.app,http://localhost:5173").split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# ─── routes ──────────────────────────────────────────────────────────────────

@app.get("/")
def health():
    return {"api_health": "running"}


@app.get("/findings")
def list_findings(session: SessionDep):
    findings = session.exec(select(Finding)).all()
    return [to_dict(f) for f in findings]


@app.get("/findings/{finding_id}")
def get_finding(finding_id: int, session: SessionDep):
    finding = session.get(Finding, finding_id)
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")
    return to_dict(finding)


# TODO: Protect with API key / OAuth2 before exposing publicly
# https://fastapi.tiangolo.com/tutorial/security/first-steps/
@app.post("/findings/", status_code=201)
def create_finding(payload: FindingCreate, session: SessionDep):
    finding = Finding(**payload.model_dump())
    session.add(finding)
    session.commit()
    session.refresh(finding)
    return to_dict(finding)
