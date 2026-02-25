
import asyncio
import json
import logging
from aiokafka import AIOKafkaConsumer
from aiokafka.errors import KafkaConnectionError
from .database import SessionLocal
from . import crud, schemas
from app.main import broadcast

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def start_consumer():
    consumer = None
    for i in range(5):  # Retry up to 5 times
        try:
            consumer = AIOKafkaConsumer(
                'gpu_metrics',
                bootstrap_servers='kafka:9092',
                group_id="my-group"
            )
            await consumer.start()
            logger.info("Successfully connected to Kafka.")
            break  # Exit loop on successful connection
        except KafkaConnectionError:
            logger.warning(f"Failed to connect to Kafka, retrying in {i+1} seconds...")
            await asyncio.sleep(i + 1)
    


    try:
        async for msg in consumer:
            metric_data = json.loads(msg.value)
            db = SessionLocal()
            try:
                metric = schemas.GPUMetricCreate(**metric_data)
                crud.create_gpu_metric(db, metric=metric)
                await broadcast.publish(channel="gpu_metrics", message=json.dumps(metric_data))
            finally:
                db.close()
    finally:
        if consumer:
            await consumer.stop()

if __name__ == "__main__":
    asyncio.run(start_consumer())
