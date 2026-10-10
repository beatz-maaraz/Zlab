import React, { useState } from 'react';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import LayersIcon from '@mui/icons-material/Layers';
import PaletteIcon from '@mui/icons-material/Palette';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';

/**
 * 4. M3 Navigation Component Suite
 * Includes: Bottom Navigation, Navigation Drawer item list, and Tabs
 */
export const M3BottomNavWidget = ({ defaultValue = 0, onChange }) => {
  const [value, setValue] = useState(defaultValue);

  return (
    <Box data-m3-widget="bottom-nav" sx={{ width: '100%', maxWidth: 390 }}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          if (onChange) onChange(newValue);
        }}
        sx={{
          borderRadius: '28px',
          backgroundColor: '#1d1b20',
          border: '1px solid #36343b',
          py: 1,
          height: 68,
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          '& .MuiBottomNavigationAction-root': {
            color: '#cac4d0',
            minWidth: 64,
            transition: 'all 0.2s ease',
            '&.Mui-selected': {
              color: '#d0bcff',
              '& .MuiSvgIcon-root': {
                filter: 'drop-shadow(0 0 8px rgba(208, 188, 255, 0.6))',
              },
            },
          },
        }}
      >
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Layers" icon={<LayersIcon />} />
        <BottomNavigationAction label="Themes" icon={<PaletteIcon />} />
        <BottomNavigationAction label="Settings" icon={<SettingsIcon />} />
      </BottomNavigation>
    </Box>
  );
};

export const M3TabsWidget = ({ defaultValue = 0, onChange }) => {
  const [tabIndex, setTabIndex] = useState(defaultValue);

  return (
    <Box
      data-m3-widget="tabs"
      sx={{
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#1d1b20',
        borderRadius: '16px',
        border: '1px solid #36343b',
        p: 0.5,
      }}
    >
      <Tabs
        value={tabIndex}
        onChange={(e, val) => {
          setTabIndex(val);
          if (onChange) onChange(val);
        }}
        textColor="primary"
        indicatorColor="primary"
        variant="fullWidth"
        sx={{
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
            backgroundColor: '#d0bcff',
            boxShadow: '0 0 8px rgba(208, 188, 255, 0.8)',
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: '#cac4d0',
            '&.Mui-selected': {
              color: '#d0bcff',
            },
          },
        }}
      >
        <Tab label="Components" />
        <Tab label="Tokens" />
        <Tab label="Prototype" />
      </Tabs>
    </Box>
  );
};

export const M3NavDrawerWidget = ({ activeItem = 'Dashboard', onItemSelect }) => {
  const items = [
    { label: 'Dashboard', icon: <DashboardIcon /> },
    { label: 'Design Kits', icon: <LayersIcon /> },
    { label: 'Projects', icon: <FolderIcon /> },
    { label: 'Settings', icon: <SettingsIcon /> },
  ];

  return (
    <Box
      data-m3-widget="nav-drawer"
      sx={{
        width: '100%',
        maxWidth: 280,
        backgroundColor: '#1d1b20',
        borderRadius: '24px',
        border: '1px solid #36343b',
        p: 2,
        boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
      }}
    >
      <Typography variant="overline" sx={{ color: '#938f99', px: 2, fontWeight: 700, letterSpacing: 1 }}>
        M3 Navigation Rail
      </Typography>
      <List sx={{ pt: 1 }}>
        {items.map((item) => {
          const isSelected = activeItem === item.label;
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => onItemSelect && onItemSelect(item.label)}
                sx={{
                  borderRadius: '28px',
                  px: 2.5,
                  py: 1.25,
                  '&.Mui-selected': {
                    backgroundColor: '#4a4458',
                    color: '#e8def8',
                    '& .MuiListItemIcon-root': {
                      color: '#d0bcff',
                    },
                    '&:hover': {
                      backgroundColor: '#5d556d',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: isSelected ? '#d0bcff' : '#cac4d0', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isSelected ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export const M3NavigationGroup = () => {
  return (
    <Stack spacing={3} data-m3-widget="navigation-group">
      <M3TabsWidget />
      <M3BottomNavWidget />
      <M3NavDrawerWidget />
    </Stack>
  );
};

export default M3NavigationGroup;
