import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

/**
 * 1. M3 Actions Component Suite
 * Includes: Filled Button, Tonal (Secondary Container) Button, Outlined Button, Text Button, FAB, and Extended FAB
 */
export const M3FilledButton = ({
  label = 'Filled Button',
  startIcon = <SendIcon fontSize="small" />,
  onClick,
  ...props
}) => (
  <Button
    variant="contained"
    color="primary"
    startIcon={startIcon}
    onClick={onClick}
    sx={{
      textTransform: 'none',
      fontWeight: 600,
      borderRadius: '20px',
      px: 3,
      py: 1.25,
      boxShadow: '0 0 16px rgba(208, 188, 255, 0.25)',
      '&:hover': {
        boxShadow: '0 0 24px rgba(208, 188, 255, 0.45)',
      },
    }}
    {...props}
  >
    {label}
  </Button>
);

export const M3TonalButton = ({
  label = 'Tonal Button',
  startIcon = <FavoriteIcon fontSize="small" />,
  onClick,
  ...props
}) => (
  <Button
    variant="contained"
    color="secondary"
    startIcon={startIcon}
    onClick={onClick}
    sx={{
      textTransform: 'none',
      fontWeight: 500,
      borderRadius: '20px',
      px: 3,
      py: 1.25,
      backgroundColor: '#4a4458',
      color: '#e8def8',
      '&:hover': {
        backgroundColor: '#5d556d',
        boxShadow: '0 0 12px rgba(232, 222, 248, 0.2)',
      },
    }}
    {...props}
  >
    {label}
  </Button>
);

export const M3OutlinedButton = ({
  label = 'Outlined Button',
  onClick,
  ...props
}) => (
  <Button
    variant="outlined"
    onClick={onClick}
    sx={{
      textTransform: 'none',
      fontWeight: 500,
      borderRadius: '20px',
      px: 3,
      py: 1.25,
      borderColor: '#938f99',
      color: '#d0bcff',
      '&:hover': {
        borderColor: '#d0bcff',
        backgroundColor: 'rgba(208, 188, 255, 0.08)',
        boxShadow: '0 0 10px rgba(208, 188, 255, 0.15)',
      },
    }}
    {...props}
  >
    {label}
  </Button>
);

export const M3TextButton = ({
  label = 'Text Button',
  onClick,
  ...props
}) => (
  <Button
    variant="text"
    onClick={onClick}
    sx={{
      textTransform: 'none',
      fontWeight: 500,
      borderRadius: '20px',
      px: 2,
      py: 1,
      color: '#d0bcff',
      '&:hover': {
        backgroundColor: 'rgba(208, 188, 255, 0.1)',
      },
    }}
    {...props}
  >
    {label}
  </Button>
);

export const M3Fab = ({
  icon = <AddIcon />,
  size = 'large',
  color = 'primary',
  onClick,
  ...props
}) => (
  <Fab
    color={color}
    size={size}
    onClick={onClick}
    sx={{
      backgroundColor: '#eaddff',
      color: '#21005d',
      borderRadius: '16px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4), 0 0 14px rgba(208, 188, 255, 0.3)',
      '&:hover': {
        backgroundColor: '#d0bcff',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5), 0 0 22px rgba(208, 188, 255, 0.5)',
      },
    }}
    {...props}
  >
    {icon}
  </Fab>
);

export const M3ExtendedFab = ({
  label = 'New Prototype',
  icon = <AddIcon sx={{ mr: 1 }} />,
  onClick,
  ...props
}) => (
  <Fab
    variant="extended"
    color="primary"
    onClick={onClick}
    sx={{
      borderRadius: '16px',
      px: 3,
      py: 1.5,
      textTransform: 'none',
      fontWeight: 600,
      backgroundColor: '#eaddff',
      color: '#21005d',
      boxShadow: '0 4px 18px rgba(0, 0, 0, 0.4), 0 0 16px rgba(208, 188, 255, 0.3)',
      '&:hover': {
        backgroundColor: '#d0bcff',
        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.5), 0 0 24px rgba(208, 188, 255, 0.5)',
      },
    }}
    {...props}
  >
    {icon}
    {label}
  </Fab>
);

/**
 * Composite Action Group Showcase Wrapper
 */
export const M3ActionsGroup = ({ title = 'M3 Action Buttons' }) => {
  return (
    <Box
      data-m3-widget="actions-group"
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
        {title}
      </Typography>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <M3FilledButton label="Filled" />
          <M3TonalButton label="Tonal" />
          <M3OutlinedButton label="Outlined" />
          <M3TextButton label="Text" />
        </Stack>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <M3Fab aria-label="add" />
          <M3ExtendedFab label="Create Frame" />
        </Stack>
      </Stack>
    </Box>
  );
};

export default M3ActionsGroup;
