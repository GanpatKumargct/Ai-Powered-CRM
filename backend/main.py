from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import engine
from models import models
from routers import interaction_router, chat_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI-First CRM (HCP Module)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interaction_router.router)
app.include_router(chat_router.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to AI-First CRM API"}
