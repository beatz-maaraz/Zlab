import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';

/**
 * 6. M3 Text Inputs Component Suite
 * Includes: Outlined TextField, Filled TextField, and Search TextField with adornments
 */
export const M3OutlinedTextField = ({
  label = 'Project Title',
  placeholder = 'e.g. Cyberpunk Interface System',
  defaultValue = 'Z Lab Mobile Studio',
  helperText = 'Visible on canvas and export manifests',
  onChange,
  ...props
}) => {
  return (
    <TextField
      variant="outlined"
      fullWidth
      label={label}
      placeholder={placeholder}
      defaultValue={defaultValue}
      helperText={helperText}
      onChange={onChange}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <PersonIcon sx={{ color: '#938f99', fontSize: 20 }} />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          backgroundColor: '#1d1b20',
          '& fieldset': { borderColor: '#49454f' },
          '&:hover fieldset': { borderColor: '#938f99' },
          '&.Mui-focused fieldset': {
            borderColor: '#d0bcff',
            boxShadow: '0 0 12px rgba(208, 188, 255, 0.3)',
          },
        },
        '& .MuiInputLabel-root': {
          color: '#cac4d0',
          '&.Mui-focused': { color: '#d0bcff' },
        },
        '& .MuiFormHelperText-root': {
          color: '#938f99',
          fontSize: '0.75rem',
        },
      }}
      {...props}
    />
  );
};

export const M3FilledTextField = ({
  label = 'Design Token (JSON)',
  defaultValue = '{"color": "#d0bcff", "elevation": 4}',
  helperText = 'Material Design 3 Token Spec',
  onChange,
  ...props
}) => {
  return (
    <TextField
      variant="filled"
      fullWidth
      label={label}
      defaultValue={defaultValue}
      helperText={helperText}
      onChange={onChange}
      sx={{
        '& .MuiFilledInput-root': {
          borderRadius: '12px 12px 0 0',
          backgroundColor: '#2b2930',
          '&:hover': { backgroundColor: '#36343b' },
          '&.Mui-focused': {
            backgroundColor: '#36343b',
            '&:after': { borderColor: '#d0bcff' },
          },
        },
        '& .MuiInputLabel-root': {
          color: '#cac4d0',
          '&.Mui-focused': { color: '#d0bcff' },
        },
        '& .MuiFormHelperText-root': {
          color: '#938f99',
          fontSize: '0.75rem',
        },
      }}
      {...props}
    />
  );
};

export const M3SearchField = ({
  placeholder = 'Search components, tokens, or styles...',
  onChange,
  ...props
}) => {
  return (
    <TextField
      variant="outlined"
      fullWidth
      placeholder={placeholder}
      onChange={onChange}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#d0bcff', fontSize: 22 }} />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '28px',
          backgroundColor: '#211f26',
          py: 0.5,
          '& fieldset': { borderColor: '#49454f' },
          '&:hover fieldset': { borderColor: '#938f99' },
          '&.Mui-focused fieldset': {
            borderColor: '#d0bcff',
            boxShadow: '0 0 16px rgba(208, 188, 255, 0.35)',
          },
        },
      }}
      {...props}
    />
  );
};

export const M3TextInputsGroup = () => {
  return (
    <Box
      data-m3-widget="text-inputs-group"
      sx={{
        p: 3,
        borderRadius: '24px',
        backgroundColor: '#1d1b20',
        border: '1px solid #36343b',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        maxWidth: 420,
      }}
    >
      <Typography variant="subtitle2" sx={{ color: '#cac4d0', mb: 2.5, fontWeight: 600 }}>
        M3 Text Inputs
      </Typography>
      <Stack spacing={2.5}>
        <M3SearchField />
        <M3OutlinedTextField />
        <M3FilledTextField />
      </Stack>
    </Box>
  );
};

export default M3TextInputsGroup;
