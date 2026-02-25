# GPU Telemetry Pipeline Dashboard Documentation

## Project Overview

This project is a GPU telemetry pipeline and dashboard that allows users to monitor GPU metrics in real-time. It consists of a backend that collects and processes telemetry data, a frontend that displays the data on a dashboard, and a Redis message broker to facilitate communication between the backend components. The entire application is containerized using Docker for easy deployment and scalability.

## Project Structure

The project is organized into the following main directories:

-   `backend/`: Contains the Python-based backend application.
-   `frontend/`: Contains the React-js-based frontend application.
-   `nginx/`: Contains the NGINX configuration for routing traffic to the frontend and backend services.
-   `docker-compose.yml`: Defines the services, networks, and volumes for the Docker-based deployment.

## Backend

The backend is a Python-based application responsible for collecting, processing, and serving GPU telemetry data. It is built using the FastAPI framework and communicates with other services via a Redis message broker.

### Technologies

-   **Python 3.9**
-   **FastAPI**: A modern, fast (high-performance) web framework for building APIs with Python 3.6+ based on standard Python type hints.
-   **SQLAlchemy**: The Python SQL toolkit and Object Relational Mapper.
-   **PostgreSQL**: A powerful, open-source object-relational database system.
-   **Redis**: An in-memory data structure store, used as a message broker.
-   **AIOKafka**: An asynchronous Kafka client for Python.
-   **Docker**: For containerization.

### Services

The backend is composed of three main services:

-   `api`: The main FastAPI application that provides API endpoints for the frontend and serves real-time data via WebSockets.
-   `producer`: A standalone script that generates mock GPU telemetry data and sends it to a Kafka topic. This simulates a real-world scenario where multiple GPU sensors are reporting data.
-   `consumer`: A standalone script that consumes data from the Kafka topic, stores it in the PostgreSQL database, and publishes it to a Redis channel for real-time updates on the frontend.

### API Endpoints

-   `GET /metrics`: Retrieves a list of GPU metrics from the database. It supports pagination using the `skip` and `limit` query parameters.
-   `WS /ws`: The WebSocket endpoint for real-time communication. When a client connects, it subscribes to the `gpu_metrics` Redis channel and receives new data as it becomes available.

### Database

The backend uses a PostgreSQL database to store the GPU telemetry data. The database schema is defined in `backend/app/models.py` and consists of a single table, `gpu_metrics`, with the following columns:

-   `id`: Primary key.
-   `gpu_id`: The ID of the GPU.
-   `temperature`: GPU temperature in Celsius.
-   `power_draw`: GPU power draw in watts.
-   `fan_speed`: GPU fan speed in percentage.
-   `memory_usage`: GPU memory usage in percentage.
-   `utilization`: GPU utilization in percentage.
-   `timestamp`: The timestamp when the metric was recorded.

### Message Broker

Redis is used as a message broker to facilitate real-time communication between the backend and the frontend. When the `consumer` service receives a new metric from Kafka, it publishes the metric to the `gpu_metrics` Redis channel. The `api` service, which maintains the WebSocket connections with the clients, subscribes to this channel and sends the new data to the connected clients.

### Data Pipeline

The data flows through the system as follows:

1.  The `producer` service generates mock GPU telemetry data and sends it to the `gpu_metrics` Kafka topic.
2.  The `consumer` service consumes the data from the Kafka topic.
3.  The `consumer` stores the data in the PostgreSQL database.
4.  The `consumer` publishes the data to the `gpu_metrics` Redis channel.
5.  The `api` service receives the data from the Redis channel and sends it to the connected frontend clients via WebSockets.

## Frontend

The frontend is a React-based single-page application (SPA) that provides a real-time dashboard for visualizing GPU telemetry data. It uses Material-UI for the user interface components and Recharts for creating interactive charts.

### Technologies

-   **React**: A JavaScript library for building user interfaces.
-   **Material-UI**: A popular React UI framework.
-   **Recharts**: A composable charting library built on React components.
-   **WebSocket API**: For real-time communication with the backend.
-   **Docker**: For containerization.

### Components

The frontend is built using a modular component architecture. The main components are:

-   `App.js`: The root component that manages the WebSocket connection, application state, and renders the main layout.
-   `MetricCard.js`: A component that displays the latest metrics and historical data for a single GPU. It includes line charts for temperature, power draw, memory usage, utilization, and fan speed.
-   `LineChart.js`: A reusable component for rendering line charts using Recharts.
-   `ConnectionStatus.js`: A component that displays the current status of the WebSocket connection (connected, disconnected, or reconnecting).

### State Management

The application state is managed within the `App` component using React's `useState` and `useRef` hooks. The main state object, `metrics`, stores the telemetry data for each GPU. The data is organized by `gpu_id`, and each GPU has an array of metric objects, with a maximum history of 50 data points.

### Real-time Updates

The frontend establishes a WebSocket connection to the backend's `/ws` endpoint. When the connection is open, it listens for incoming messages. Each message contains a new GPU metric, which is then added to the application's state. The `App` component passes the relevant data to the `MetricCard` components, which then re-render to display the latest information. The application also includes a reconnection mechanism that attempts to re-establish the WebSocket connection if it is lost.

## NGINX Configuration

NGINX is used as a reverse proxy to route traffic to the appropriate services. It is configured to serve the frontend application and forward API requests to the backend.

### Reverse Proxy

The NGINX configuration file, `nginx/nginx.conf`, defines the following reverse proxy rules:

-   Requests to the root URL (`/`) are forwarded to the `frontend` service.
-   Requests to the `/api` and `/ws` paths are forwarded to the `api` service.
-   The configuration also includes the necessary headers for WebSocket connections.

## Deployment

The entire application is containerized using Docker and can be easily deployed using Docker Compose.

### Docker Compose

The `docker-compose.yml` file defines the following services:

-   `nginx`: The NGINX reverse proxy.
-   `redis`: The Redis message broker.
-   `db`: The PostgreSQL database.
-   `zookeeper`: Required for Kafka.
-   `kafka`: The Kafka message broker.
-   `api`: The FastAPI backend application.
-   `producer`: The data producer.
-   `consumer`: The data consumer.
-   `frontend`: The React frontend application.

### Running the Application

To run the application, you can use the following command:

```bash
docker-compose up -d
```

This will start all the services in the background. You can then access the application by navigating to `http://localhost` in your web browser.

## Testing

The project includes unit tests for the frontend components.

### Frontend Tests

The frontend tests are written using the React Testing Library. The following components have tests:

-   `App.js`: Tests the main application component.
-   `ConnectionStatus.js`: Tests the connection status component.
-   `MetricCard.js`: Tests the metric card component.

To run the frontend tests, you can use the following command in the `frontend` directory:

```bash
npm test
```

## Configuration

The project uses a `.env` file in the `frontend` directory to configure the WebSocket URL. The backend configuration is managed within the `docker-compose.yml` file and the Python code.

### Frontend

The `frontend/.env` file contains the following variable:

-   `REACT_APP_WS_URL`: The URL of the WebSocket endpoint. By default, this is set to `ws://localhost:8000/ws`, but it is not currently used in the `App.js` file, which hardcodes the WebSocket URL to `ws://localhost/ws`.

### Backend

The backend configuration is primarily located in the `docker-compose.yml` file. This includes the database connection details, Redis host, and Kafka settings. The database URL is defined in `backend/app/database.py` as `postgresql://user:password@db/gputelemetry`.

## Tradeoffs

-   **Mock Data**: The `producer` service generates mock data. While this is useful for development and testing, it does not represent real-world GPU metrics.
-   **No Authentication**: The API and WebSocket endpoints are not protected by any authentication or authorization mechanisms, making them insecure for production use.
-   **Limited Scalability**: The current setup uses a single consumer and producer, which could become a bottleneck if the data volume increases significantly. The deployment is also limited to a single node.
-   **Basic Error Handling**: The error handling in the services is minimal. A more robust implementation would include more comprehensive error handling, retry mechanisms, and dead-letter queues.
-   **Hardcoded Configuration**: Some configuration values, such as the WebSocket URL in the frontend, are hardcoded, which makes it harder to configure the application for different environments.

## Future Scope

-   **Real-time GPU Monitoring**: Replace the mock data producer with a service that collects real-time metrics from actual GPUs using libraries like `nvitop` or `pynvml`.
-   **Authentication and Authorization**: Implement a robust authentication and authorization mechanism to secure the API and WebSocket endpoints. This could involve using OAuth2, JWT, or other industry-standard solutions.
-   **Scalability**: Improve the scalability of the application by deploying it on a container orchestration platform like Kubernetes. This would allow for auto-scaling of services based on demand and provide better fault tolerance.
-   **Enhanced Frontend**: Add more features to the frontend, such as historical data analysis, custom dashboards, and alerting.
-   **Data Persistence and Backup**: Implement a proper data backup and recovery strategy for the PostgreSQL database to prevent data loss.
-   **CI/CD Pipeline**: A CI/CD pipeline could be added to automate the building, testing, and deployment of the application.
-   **Configuration Management**: Externalize all configuration values and manage them using a configuration management tool or service.
