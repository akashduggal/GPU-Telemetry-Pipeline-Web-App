
from fastapi import FastAPI, WebSocket, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from broadcaster import Broadcast
import asyncio
import json

from . import crud, models, schemas
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

broadcast = Broadcast("redis://redis:6379")

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await broadcast.connect()

@app.on_event("shutdown")
async def shutdown_event():
    await broadcast.disconnect()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/metrics", response_model=list[schemas.GPUMetric])
def read_metrics(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    metrics = crud.get_gpu_metrics(db, skip=skip, limit=limit)
    return metrics

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    await broadcast.publish(channel="gpu_metrics", message=json.dumps({"status": "connected"}))
    async with broadcast.subscribe(channel="gpu_metrics") as subscriber:
        async for event in subscriber:
            await websocket.send_text(event.message)
