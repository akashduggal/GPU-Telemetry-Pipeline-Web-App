import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';

const LoadingIndicator = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <CircularProgress />
      <Typography variant="h6" sx={{ ml: 2 }}>
        Waiting for telemetry data...
      </Typography>
    </Box>
  );
};

export default LoadingIndicator;
