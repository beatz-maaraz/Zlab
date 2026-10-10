import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import LayersIcon from '@mui/icons-material/Layers';
import NavigationIcon from '@mui/icons-material/Navigation';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { M3_CATEGORIES } from '../components/M3Widgets';

const CATEGORY_ICONS = {
  actions: <TouchAppIcon sx={{ fontSize: 20, color: '#d0bcff' }} />,
  communication: <NotificationsActiveIcon sx={{ fontSize: 20, color: '#9fcaff' }} />,
  containment: <LayersIcon sx={{ fontSize: 20, color: '#efb8c8' }} />,
  navigation: <NavigationIcon sx={{ fontSize: 20, color: '#b4f0b8' }} />,
  selection: <CheckBoxIcon sx={{ fontSize: 20, color: '#ffcc00' }} />,
  'text-inputs': <TextFieldsIcon sx={{ fontSize: 20, color: '#00f0ff' }} />,
};

/**
 * Material 3 Component Library Sidebar
 * Organizes the 6 M3 categories into an accordion layout with search and click-to-add / drag-to-canvas support.
 */
export const Sidebar = ({
  onAddComponent,
  onAddSuite,
  activeCategoryFilter = 'all',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({
    actions: true,
    communication: true,
    containment: true,
    navigation: false,
    selection: false,
    'text-inputs': false,
  });
  const [selectedTag, setSelectedTag] = useState('all');

  const toggleAccordion = (catId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const expandAll = () => {
    const all = {};
    M3_CATEGORIES.forEach((c) => (all[c.id] = true));
    setExpandedCategories(all);
  };

  const collapseAll = () => {
    const none = {};
    M3_CATEGORIES.forEach((c) => (none[c.id] = false));
    setExpandedCategories(none);
  };

  // Filter categories and components based on search & tag
  const filteredCategories = useMemo(() => {
    return M3_CATEGORIES.map((cat) => {
      if (selectedTag !== 'all' && cat.id !== selectedTag) {
        return null;
      }
      const matchingComps = cat.components.filter((c) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return c.name.toLowerCase().includes(q) || cat.name.toLowerCase().includes(q);
      });

      if (searchTerm && matchingComps.length === 0) {
        return null;
      }

      return {
        ...cat,
        components: matchingComps,
      };
    }).filter(Boolean);
  }, [searchTerm, selectedTag]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#16141a',
        borderRight: '1px solid #2d2a33',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar Header */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid #2d2a33' }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <AutoAwesomeIcon sx={{ color: '#d0bcff', fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ color: '#e6e0e9', fontWeight: 700, letterSpacing: 0.2 }}>
              Material 3 Library
            </Typography>
          </Stack>
          <Chip
            label="M3 + MUI"
            size="small"
            sx={{
              backgroundColor: '#4a4458',
              color: '#eaddff',
              fontSize: '0.65rem',
              fontWeight: 700,
              height: 20,
            }}
          />
        </Stack>
        <Typography variant="caption" sx={{ color: '#938f99', display: 'block', mb: 2 }}>
          Drag or click components to drop onto the design canvas.
        </Typography>

        {/* Search Field */}
        <TextField
          fullWidth
          size="small"
          placeholder="Filter M3 components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#938f99', fontSize: 18 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: '#211f26',
              fontSize: '0.8125rem',
              '& fieldset': { borderColor: '#36343b' },
              '&:hover fieldset': { borderColor: '#49454f' },
              '&.Mui-focused fieldset': { borderColor: '#d0bcff' },
            },
          }}
        />

        {/* Category Pills Filter */}
        <Stack direction="row" spacing={0.5} sx={{ mt: 1.5, overflowX: 'auto', pb: 0.5, noScrollbar: true }}>
          <Chip
            label="All (6)"
            size="small"
            clickable
            onClick={() => setSelectedTag('all')}
            sx={{
              fontSize: '0.7rem',
              backgroundColor: selectedTag === 'all' ? '#d0bcff' : '#211f26',
              color: selectedTag === 'all' ? '#381e72' : '#cac4d0',
              fontWeight: selectedTag === 'all' ? 700 : 500,
            }}
          />
          {M3_CATEGORIES.map((c) => (
            <Chip
              key={c.id}
              label={c.name}
              size="small"
              clickable
              onClick={() => setSelectedTag(c.id)}
              sx={{
                fontSize: '0.7rem',
                backgroundColor: selectedTag === c.id ? '#d0bcff' : '#211f26',
                color: selectedTag === c.id ? '#381e72' : '#cac4d0',
                fontWeight: selectedTag === c.id ? 700 : 500,
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* Accordion Categories List */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5, spaceY: 1 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', px: 1, mb: 1 }}>
          <Typography variant="caption" sx={{ color: '#938f99', textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '0.68rem', fontWeight: 700 }}>
            6 Official M3 Categories
          </Typography>
          <Stack direction="row" spacing={1}>
            <Typography
              variant="caption"
              onClick={expandAll}
              sx={{ color: '#d0bcff', cursor: 'pointer', fontSize: '0.7rem', '&:hover': { textDecoration: 'underline' } }}
            >
              Expand all
            </Typography>
            <Typography variant="caption" sx={{ color: '#49454f' }}>
              •
            </Typography>
            <Typography
              variant="caption"
              onClick={collapseAll}
              sx={{ color: '#938f99', cursor: 'pointer', fontSize: '0.7rem', '&:hover': { textDecoration: 'underline' } }}
            >
              Collapse
            </Typography>
          </Stack>
        </Stack>

        {filteredCategories.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#938f99' }}>
              No M3 components matching "{searchTerm}"
            </Typography>
          </Box>
        ) : (
          filteredCategories.map((category) => {
            const isExpanded = expandedCategories[category.id] ?? true;

            return (
              <Accordion
                key={category.id}
                expanded={isExpanded}
                onChange={() => toggleAccordion(category.id)}
                disableGutters
                sx={{
                  backgroundColor: '#1d1b20',
                  color: '#e6e0e9',
                  borderRadius: '16px !important',
                  mb: 1.25,
                  border: '1px solid #2d2a33',
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': {
                    borderColor: 'rgba(208, 188, 255, 0.25)',
                    backgroundColor: '#1f1d24',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: '#cac4d0', fontSize: 20 }} />}
                  sx={{
                    px: 2,
                    py: 1,
                    minHeight: 52,
                    '& .MuiAccordionSummary-content': { my: 0.5 },
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', width: '100%', mr: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>{CATEGORY_ICONS[category.id]}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        {category.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#938f99', fontSize: '0.7rem' }}>
                        {category.components.length} components
                      </Typography>
                    </Box>
                  </Stack>
                </AccordionSummary>

                <AccordionDetails sx={{ px: 2, pb: 2, pt: 0.5 }}>
                  <Stack spacing={1}>
                    {category.components.map((comp) => {
                      const isSuite = comp.variant === 'suite';

                      return (
                        <Box
                          key={comp.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData(
                              'application/json',
                              JSON.stringify({
                                type: 'm3-component',
                                componentType: comp.type,
                                category: category.id,
                                name: comp.name,
                              })
                            );
                          }}
                          onClick={() => {
                            if (onAddComponent) {
                              onAddComponent(comp);
                            }
                          }}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1.25,
                            px: 1.5,
                            borderRadius: '12px',
                            backgroundColor: isSuite ? 'rgba(208, 188, 255, 0.08)' : '#26242c',
                            border: isSuite ? '1px dashed #d0bcff' : '1px solid #36343b',
                            cursor: 'pointer',
                            transition: 'all 0.18s ease',
                            '&:hover': {
                              backgroundColor: isSuite ? 'rgba(208, 188, 255, 0.15)' : '#312e38',
                              borderColor: '#d0bcff',
                              transform: 'translateX(2px)',
                            },
                          }}
                        >
                          <Box sx={{ minWidth: 0, flex: 1, mr: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                color: isSuite ? '#eaddff' : '#e6e0e9',
                                fontWeight: isSuite ? 600 : 500,
                                fontSize: '0.8rem',
                                truncate: true,
                              }}
                            >
                              {comp.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#938f99', fontSize: '0.68rem' }}>
                              {comp.type}
                            </Typography>
                          </Box>

                          <Tooltip title="Add to Canvas">
                            <Box
                              sx={{
                                width: 26,
                                height: 26,
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#381e72',
                                color: '#d0bcff',
                                transition: 'all 0.15s ease',
                                '&:hover': {
                                  backgroundColor: '#d0bcff',
                                  color: '#381e72',
                                },
                              }}
                            >
                              <AddIcon sx={{ fontSize: 16 }} />
                            </Box>
                          </Tooltip>
                        </Box>
                      );
                    })}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })
        )}
      </Box>

      {/* Footer Quick Batch Importer */}
      <Box sx={{ p: 2, borderTop: '1px solid #2d2a33', backgroundColor: '#141218' }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AutoAwesomeIcon />}
          onClick={() => onAddSuite && onAddSuite()}
          sx={{
            borderRadius: '14px',
            py: 1,
            backgroundColor: '#4a4458',
            color: '#eaddff',
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#5d556d',
              boxShadow: '0 0 16px rgba(208, 188, 255, 0.3)',
            },
          }}
        >
          Add Complete M3 Showcase
        </Button>
      </Box>
    </Box>
  );
};

export const ComponentSidebar = Sidebar;
export default Sidebar;
