
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Box,
  Tabs,
  Tab,
} from '@mui/material';
import { Memory as MemoryIcon, Speed as SpeedIcon, Thermostat as ThermostatIcon, Power as PowerIcon, DeveloperBoard as DeveloperBoardIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import Header from './components/Header';
import LoadingIndicator from './components/LoadingIndicator';
import GpuCard from './components/GpuCard';

const MAX_DATA_POINTS = 30;

function App() {
  const [gpuMetrics, setGpuMetrics] = useState({});
  const [connected, setConnected] = useState(false);
  const [selectedGpu, setSelectedGpu] = useState(null);
  const ws = useRef(null);
  const theme = useTheme();

  const handleGpuChange = (event, newValue) => {
    setSelectedGpu(newValue);
  };

  const connect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
    }

    const newWs = new WebSocket(`ws://localhost:8000/ws/telemetry`);
    ws.current = newWs;

    newWs.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };

    newWs.onmessage = (event) => {
      const newMetric = JSON.parse(event.data);
      if (newMetric.gpu_id === undefined) {
        return;
      }
      setGpuMetrics(prevMetrics => {
        const gpuId = newMetric.gpu_id;
        const newGpuData = { ...prevMetrics[gpuId] };

        const metrics = ['temperature', 'power_draw', 'fan_speed', 'memory_usage', 'utilization'];

        metrics.forEach(metric => {
          if (!newGpuData[metric]) {
            newGpuData[metric] = [];
          }
          newGpuData[metric] = [...newGpuData[metric], { timestamp: newMetric.timestamp, [metric]: newMetric[metric] }].slice(-MAX_DATA_POINTS);
        });

        return {
          ...prevMetrics,
          [gpuId]: newGpuData,
        };
      });
    };

    newWs.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };

    newWs.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  useEffect(() => {
    if (!selectedGpu && Object.keys(gpuMetrics).length > 0) {
      setSelectedGpu(Object.keys(gpuMetrics)[0]);
    }
  }, [gpuMetrics, selectedGpu]);

  const metricDetails = {
    temperature: { label: "Temperature (°C)", color: theme.palette.error.main, icon: <ThermostatIcon sx={{ color: theme.palette.error.main }} /> },
    power_draw: { label: "Power Draw (W)", color: theme.palette.warning.main, icon: <PowerIcon sx={{ color: theme.palette.warning.main }} /> },
    fan_speed: { label: "Fan Speed (%)", color: theme.palette.info.main, icon: <SpeedIcon sx={{ color: theme.palette.info.main }} /> },
    memory_usage: { label: "Memory Usage (%)", color: theme.palette.secondary.main, icon: <MemoryIcon sx={{ color: theme.palette.secondary.main }} /> },
    utilization: { label: "Utilization (%)", color: theme.palette.primary.main, icon: <DeveloperBoardIcon sx={{ color: theme.palette.primary.main }} /> },
  };

  return (
    <>
      <Header connected={connected} onReconnect={connect} />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {Object.keys(gpuMetrics).length === 0 ? (
          <LoadingIndicator />
        ) : (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={selectedGpu} onChange={handleGpuChange} aria-label="GPU selection tabs" centered>
                {Object.keys(gpuMetrics).map((gpuId, index) => (
                  <Tab key={gpuId} label={`GPU ${index + 1}`} value={gpuId} />
                ))}
              </Tabs>
            </Box>
            {selectedGpu && gpuMetrics[selectedGpu] && (
              <Box sx={{ p: 3 }}>
                <GpuCard
                  key={selectedGpu}
                  gpuId={selectedGpu}
                  gpuData={gpuMetrics[selectedGpu]}
                  metricDetails={metricDetails}
                />
              </Box>
            )}
          </Box>
        )}
      </Container>
    </>
  );
}

export default App;
