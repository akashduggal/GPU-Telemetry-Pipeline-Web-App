
from sqlalchemy.orm import Session
from . import models, schemas

def get_gpu_metrics(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.GPUMetric).offset(skip).limit(limit).all()

def create_gpu_metric(db: Session, metric: schemas.GPUMetricCreate):
    db_metric = models.GPUMetric(**metric.dict())
    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)
    return db_metric
