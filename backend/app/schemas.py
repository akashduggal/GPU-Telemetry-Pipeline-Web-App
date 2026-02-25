
from pydantic import BaseModel
from datetime import datetime

class GPUMetricBase(BaseModel):
    gpu_id: int
    temperature: float
    power_draw: float
    fan_speed: float
    memory_usage: float
    utilization: float
    timestamp: datetime

class GPUMetricCreate(GPUMetricBase):
    pass

class GPUMetric(GPUMetricBase):
    id: int

    class Config:
        orm_mode = True
