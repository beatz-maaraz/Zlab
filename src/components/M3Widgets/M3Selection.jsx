import React, { useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';

/**
 * 5. M3 Selection Component Suite
 * Includes: Checkboxes, Radio Buttons, Switches, and Sliders
 */
export const M3CheckboxWidget = ({ label = 'Enable Cyberpunk HUD Overlay', checked: initialChecked = true }) => {
  const [checked, setChecked] = useState(initialChecked);

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          sx={{
            color: '#938f99',
            '&.Mui-checked': {
              color: '#d0bcff',
            },
          }}
        />
      }
      label={<Typography sx={{ color: '#e6e0e9', fontSize: '0.875rem' }}>{label}</Typography>}
    />
  );
};

export const M3RadioWidget = ({ defaultValue = 'desktop' }) => {
  const [value, setValue] = useState(defaultValue);

  return (
    <FormControl>
      <RadioGroup
        value={value}
        onChange={(e) => setValue(e.target.value)}
        row
      >
        <FormControlLabel
          value="desktop"
          control={
            <Radio
              sx={{
                color: '#938f99',
                '&.Mui-checked': { color: '#d0bcff' },
              }}
            />
          }
          label={<Typography sx={{ color: '#e6e0e9', fontSize: '0.85rem' }}>Desktop (1440)</Typography>}
        />
        <FormControlLabel
          value="mobile"
          control={
            <Radio
              sx={{
                color: '#938f99',
                '&.Mui-checked': { color: '#d0bcff' },
              }}
            />
          }
          label={<Typography sx={{ color: '#e6e0e9', fontSize: '0.85rem' }}>Mobile (390)</Typography>}
        />
      </RadioGroup>
    </FormControl>
  );
};

export const M3SwitchWidget = ({
  label = 'Dark Mode Glow Accent',
  checked: initialChecked = true,
  onChange,
}) => {
  const [checked, setChecked] = useState(initialChecked);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 320 }}>
      <Typography sx={{ color: '#e6e0e9', fontSize: '0.875rem', fontWeight: 500 }}>
        {label}
      </Typography>
      <Switch
        checked={checked}
        onChange={(e) => {
          setChecked(e.target.checked);
          if (onChange) onChange(e.target.checked);
        }}
        sx={{
          width: 52,
          height: 32,
          padding: 0,
          '& .MuiSwitch-switchBase': {
            padding: 0.5,
            '&.Mui-checked': {
              transform: 'translateX(20px)',
              color: '#381e72',
              '& + .MuiSwitch-track': {
                backgroundColor: '#d0bcff',
                opacity: 1,
                border: 0,
              },
            },
          },
          '& .MuiSwitch-thumb': {
            width: 24,
            height: 24,
            backgroundColor: checked ? '#381e72' : '#938f99',
          },
          '& .MuiSwitch-track': {
            borderRadius: 16,
            border: '2px solid #938f99',
            backgroundColor: '#36343b',
            opacity: 1,
          },
        }}
      />
    </Box>
  );
};

export const M3SliderWidget = ({
  label = 'Backdrop Blur Intensity',
  defaultValue = 65,
  min = 0,
  max = 100,
  onChange,
}) => {
  const [val, setVal] = useState(defaultValue);

  return (
    <Box sx={{ width: '100%', maxWidth: 340 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography sx={{ color: '#cac4d0', fontSize: '0.8rem' }}>{label}</Typography>
        <Typography sx={{ color: '#d0bcff', fontSize: '0.8rem', fontWeight: 600 }}>{val}px</Typography>
      </Box>
      <Stack spacing={2} direction="row" sx={{ alignItems: 'center' }}>
        <VolumeDownIcon sx={{ color: '#938f99', fontSize: 18 }} />
        <Slider
          value={val}
          min={min}
          max={max}
          onChange={(e, newVal) => {
            setVal(newVal);
            if (onChange) onChange(newVal);
          }}
          sx={{
            color: '#d0bcff',
            '& .MuiSlider-thumb': {
              boxShadow: '0 0 12px rgba(208, 188, 255, 0.6)',
            },
          }}
        />
        <VolumeUpIcon sx={{ color: '#938f99', fontSize: 18 }} />
      </Stack>
    </Box>
  );
};

export const M3SelectionGroup = () => {
  return (
    <Box
      data-m3-widget="selection-group"
      sx={{
        p: 3,
        borderRadius: '24px',
        backgroundColor: '#1d1b20',
        border: '1px solid #36343b',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        maxWidth: 420,
      }}
    >
      <Typography variant="subtitle2" sx={{ color: '#cac4d0', mb: 2, fontWeight: 600 }}>
        M3 Selection Controls
      </Typography>
      <Stack spacing={2.5}>
        <M3SwitchWidget label="Hardware Acceleration" checked={true} />
        <M3SwitchWidget label="Snap to Grid Guides" checked={false} />
        <Box sx={{ pt: 1 }}>
          <M3RadioWidget />
        </Box>
        <M3CheckboxWidget label="Include Alpha Transparency" checked={true} />
        <M3SliderWidget label="Surface Elevation" defaultValue={45} />
      </Stack>
    </Box>
  );
};

export default M3SelectionGroup;
