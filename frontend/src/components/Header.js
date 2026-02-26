import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip as MuiTooltip,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const Header = ({ connected, onReconnect }) => {
  const theme = useTheme();

  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar>
        <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          GPU Telemetry Dashboard
        </Typography>
        <Typography variant="body2" sx={{ mr: 2, color: connected ? theme.palette.success.main : theme.palette.error.main, fontWeight: 'bold' }}>
          {connected ? 'Connected' : 'Disconnected'}
        </Typography>
        <MuiTooltip title="Reconnect">
          <IconButton onClick={onReconnect} color="inherit">
            <RefreshIcon />
          </IconButton>
        </MuiTooltip>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
