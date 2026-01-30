"""
FastAPI Implementation to Serve Page Content and Finding Metrics.
"""
# Import FastAPI
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from sqlmodel import Field, Session, SQLModel,  create_engine, select

import uuid
from typing import Annotated

# Init
app = FastAPI()

origins = ["*"] # TODO: Do not allow this in prod.

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
)

"""Database Connection and Model"""
class Finding(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)

# TODO: Pull the below from .env
IP = '127.0.0.1'
user = 'postgres'
password = 'testpass123'
# TODO: Pull the above from .env

db_filename = 'findings.db'
db_url = f"postgresql://{user}:{password}@{IP}/{db_filename}"
connect_args = {"check_same_thread":False}
engine = create_engine(db_url)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

SessionDependency = Annotated[Session, Depends(get_session)]

# Example API Endpoint which can be called at https://fastapi:8000/
# Test FastAPI with fastapi dev api.py
# Docs are always available at https://fastapi:8000/docs, /redoc and /openapi.json
@app.get("/")
async def root():
    return {"api_health":"running"}

# TODO: Figure out if we need a migration script
@app.on_event("startup")
def init_start():
    create_db_and_tables()

@app.get("/findings/{finding_id}/metrics")
async def metrics(finding_id): # How should we organize findings in the DB? 
    """
    Draw down the finding metrics for a given finding.
    
    :param finding_id: str, the DB id of the finding
    """
    pass

@app.get("/findings/{finding_id}/content")
async def content(finding_id):
    """
    Pull Website Content from the DB for a given finding.
    
    :param finding_id: str (int?), the DB id of the finding
    """
    pass

# TODO: Implement OAuth2 or Other Security for this.
#       https://fastapi.tiangolo.com/tutorial/security/first-steps/
#       https://fastapi.tiangolo.com/tutorial/sql-databases/
@app.post("/findings/")
async def update_finding(finding: Finding, session: SessionDependency) -> Finding:
    session.add()
    pass
