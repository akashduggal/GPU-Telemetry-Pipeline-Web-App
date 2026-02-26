
import asyncio
import json
import random
import logging
from datetime import datetime
import uuid
from aiokafka import AIOKafkaProducer
from aiokafka.errors import KafkaConnectionError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Generate a fixed set of GPU UUIDs to simulate a real environment
GPU_UUIDS = [str(uuid.uuid4()) for _ in range(4)]


async def start_producer():
    producer = None
    for i in range(5):  # Retry up to 5 times
        try:
            producer = AIOKafkaProducer(bootstrap_servers='kafka:9092')
            await producer.start()
            logger.info("Successfully connected to Kafka.")
            break  # Exit loop on successful connection
        except KafkaConnectionError:
            logger.warning(f"Failed to connect to Kafka, retrying in {i+1} seconds...")
            await asyncio.sleep(i + 1)

    try:
        while True:
            metric = {
                "gpu_id": random.choice(GPU_UUIDS),
                "temperature": random.uniform(60, 90),
                "power_draw": random.uniform(150, 250),
                "fan_speed": random.uniform(40, 80),
                "memory_usage": random.uniform(20, 80),
                "utilization": random.uniform(50, 100),
                "timestamp": datetime.now().isoformat()
            }
            await producer.send_and_wait("gpu_metrics", json.dumps(metric).encode('utf-8'))
            await asyncio.sleep(1)
    finally:
        if producer:
            await producer.stop()

if __name__ == "__main__":
    asyncio.run(start_producer())

