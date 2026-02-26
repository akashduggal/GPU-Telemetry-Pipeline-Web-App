import React from 'react';
import {
  Typography,
  Box,
} from '@mui/material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
} from 'recharts';
import { useTheme } from '@mui/material/styles';

const GpuChart = ({ data, dataKey, color, icon }) => {
  const theme = useTheme();

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Box sx={{ height: 150, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1, fontWeight: 500 }}>
          {dataKey.charAt(0).toUpperCase() + dataKey.slice(1).replace('_', ' ')}
        </Typography>
      </Box>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 20,
          }}
        >
          <defs>
            <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="timestamp"
            stroke={theme.palette.text.secondary}
            tickFormatter={formatTimestamp}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '0.5rem',
              boxShadow: '0 0 10px rgba(0,0,0,0.5)',
            }}
            labelStyle={{ color: theme.palette.text.primary, fontWeight: 'bold' }}
            itemStyle={{ color: color }}
            labelFormatter={formatTimestamp}
          />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#color-${dataKey})`} />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default GpuChart;
