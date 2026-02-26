
from sqlalchemy import Column, Integer, String, Float, DateTime
from .database import Base

class GPUMetric(Base):
    __tablename__ = "gpu_metrics"

    id = Column(Integer, primary_key=True, index=True)
    gpu_id = Column(String, index=True)
    temperature = Column(Float)
    power_draw = Column(Float)
    fan_speed = Column(Float)
    memory_usage = Column(Float)
    utilization = Column(Float)
    timestamp = Column(DateTime)
