import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [metrics, setMetrics] = useState([]);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const newWs = new WebSocket('ws://localhost/ws');
    setWs(newWs);

    newWs.onmessage = (event) => {
      const newMetric = JSON.parse(event.data);
      setMetrics(prevMetrics => [...prevMetrics, newMetric]);
    };

    return () => {
      newWs.close();
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>GPU Telemetry</h1>
      </header>
      <div className="metrics-container">
        {metrics.map((metric, index) => (
          <div key={index} className="metric">
            <p>GPU ID: {metric.gpu_id}</p>
            <p>Temperature: {metric.temperature}°C</p>
            <p>Power Draw: {metric.power_draw}W</p>
            <p>Fan Speed: {metric.fan_speed}%</p>
            <p>Memory Usage: {metric.memory_usage}%</p>
            <p>Utilization: {metric.utilization}%</p>
            <p>Timestamp: {new Date(metric.timestamp).toLocaleTimeString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

