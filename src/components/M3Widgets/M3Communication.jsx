import React, { useState } from 'react';
import Badge from '@mui/material/Badge';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MailIcon from '@mui/icons-material/Mail';
import CloseIcon from '@mui/icons-material/Close';

/**
 * 2. M3 Communication Component Suite
 * Includes: Badges, Circular Progress, Linear Progress, and Snackbar
 */
export const M3BadgeWidget = ({ count = 5, showZero = false }) => {
  return (
    <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
      <Badge badgeContent={count} color="primary">
        <NotificationsIcon sx={{ color: '#e6e0e9', fontSize: 28 }} />
      </Badge>
      <Badge variant="dot" color="error">
        <MailIcon sx={{ color: '#e6e0e9', fontSize: 28 }} />
      </Badge>
      <Badge badgeContent="NEW" color="secondary" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 18 } }}>
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: '8px',
            backgroundColor: '#2b2930',
            color: '#cac4d0',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          Updates
        </Box>
      </Badge>
    </Stack>
  );
};

export const M3ProgressWidget = ({ value = 68 }) => {
  return (
    <Box sx={{ width: '100%', maxWidth: 360 }}>
      <Stack spacing={2.5}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: '#cac4d0' }}>
              Rendering Canvas Elements
            </Typography>
            <Typography variant="caption" sx={{ color: '#d0bcff', fontWeight: 600 }}>
              {value}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={value}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#36343b',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor: '#d0bcff',
                boxShadow: '0 0 10px rgba(208, 188, 255, 0.5)',
              },
            }}
          />
        </Box>

        <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
          <CircularProgress
            size={36}
            thickness={4.5}
            sx={{
              color: '#d0bcff',
              filter: 'drop-shadow(0 0 6px rgba(208, 188, 255, 0.4))',
            }}
          />
          <CircularProgress
            variant="determinate"
            value={75}
            size={36}
            thickness={4.5}
            sx={{
              color: '#00f0ff',
              filter: 'drop-shadow(0 0 6px rgba(0, 240, 255, 0.4))',
            }}
          />
          <Typography variant="body2" sx={{ color: '#cac4d0', fontSize: '0.8rem' }}>
            Syncing live state...
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export const M3SnackbarWidget = ({
  message = 'Changes synced to Z Lab Cloud',
  actionLabel = 'Undo',
  openInitially = true,
}) => {
  const [open, setOpen] = useState(openInitially);

  return (
    <Box sx={{ width: '100%', maxWidth: 420 }}>
      <Alert
        severity="info"
        variant="filled"
        sx={{
          backgroundColor: '#313033',
          color: '#f4eff4',
          borderRadius: '12px',
          border: '1px solid #48464c',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          '& .MuiAlert-icon': {
            color: '#d0bcff',
          },
        }}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => setOpen(false)}
            sx={{
              color: '#d0bcff',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8rem',
            }}
          >
            {actionLabel}
          </Button>
        }
      >
        {message}
      </Alert>
    </Box>
  );
};

/**
 * Composite Communication Showcase Wrapper
 */
export const M3CommunicationGroup = () => {
  return (
    <Box
      data-m3-widget="communication-group"
      sx={{
        p: 3,
        borderRadius: '24px',
        backgroundColor: '#1d1b20',
        border: '1px solid #36343b',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        maxWidth: 480,
      }}
    >
      <Typography variant="subtitle2" sx={{ color: '#cac4d0', mb: 2, fontWeight: 600 }}>
        M3 Communication
      </Typography>
      <Stack spacing={3}>
        <M3BadgeWidget count={12} />
        <M3ProgressWidget value={72} />
        <M3SnackbarWidget />
      </Stack>
    </Box>
  );
};

export default M3CommunicationGroup;
