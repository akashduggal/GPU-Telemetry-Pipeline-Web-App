import React from 'react';
import {
  Typography,
  Paper,
  Box,
  Fade,
} from '@mui/material';
import GpuChart from './GpuChart';

const GpuCard = ({ gpuId, gpuData, metricDetails }) => {
  return (
    <Box sx={{ flex: '1'}}>
      <Fade in={true} timeout={500}>
        <Paper elevation={4} sx={{ borderRadius: 4, p: 2, height: '100%' }}>
          <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
            GPU ID: {gpuId}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
            {Object.keys(metricDetails).map(metric => (
              <Box key={metric} sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 300 }}>
                <GpuChart
                  data={gpuData[metric] || []}
                  dataKey={metric}
                  color={metricDetails[metric].color}
                  icon={metricDetails[metric].icon}
                />
              </Box>
            ))}
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default GpuCard;

