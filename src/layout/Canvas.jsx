import React, { useState, useRef, useCallback } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import ComputerIcon from '@mui/icons-material/Computer';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import EditIcon from '@mui/icons-material/Edit';
import { toPng } from 'html-to-image';
import { m3Theme } from '../theme/m3-theme';

// Import our 6 M3 category components
import {
  M3FilledButton,
  M3TonalButton,
  M3OutlinedButton,
  M3TextButton,
  M3Fab,
  M3ExtendedFab,
  M3ActionsGroup,
  M3BadgeWidget,
  M3ProgressWidget,
  M3SnackbarWidget,
  M3CommunicationGroup,
  M3ElevatedCard,
  M3OutlinedCard,
  M3DialogPreview,
  M3ContainmentGroup,
  M3BottomNavWidget,
  M3TabsWidget,
  M3NavDrawerWidget,
  M3NavigationGroup,
  M3SwitchWidget,
  M3SliderWidget,
  M3CheckboxWidget,
  M3RadioWidget,
  M3SelectionGroup,
  M3OutlinedTextField,
  M3FilledTextField,
  M3SearchField,
  M3TextInputsGroup,
} from '../components/M3Widgets';

/**
 * Component Resolver Map
 */
const M3_RENDER_MAP = {
  M3FilledButton: () => <M3FilledButton label="M3 Filled Action" />,
  M3TonalButton: () => <M3TonalButton label="M3 Tonal Action" />,
  M3OutlinedButton: () => <M3OutlinedButton label="M3 Outlined Action" />,
  M3TextButton: () => <M3TextButton label="M3 Text Action" />,
  M3Fab: () => <M3Fab />,
  M3ExtendedFab: () => <M3ExtendedFab label="New Action" />,
  M3ActionsGroup: () => <M3ActionsGroup />,
  M3BadgeWidget: () => <M3BadgeWidget count={9} />,
  M3ProgressWidget: () => <M3ProgressWidget value={65} />,
  M3SnackbarWidget: () => <M3SnackbarWidget />,
  M3CommunicationGroup: () => <M3CommunicationGroup />,
  M3ElevatedCard: () => <M3ElevatedCard />,
  M3OutlinedCard: () => <M3OutlinedCard />,
  M3DialogPreview: () => <M3DialogPreview />,
  M3ContainmentGroup: () => <M3ContainmentGroup />,
  M3BottomNavWidget: () => <M3BottomNavWidget />,
  M3TabsWidget: () => <M3TabsWidget />,
  M3NavDrawerWidget: () => <M3NavDrawerWidget />,
  M3NavigationGroup: () => <M3NavigationGroup />,
  M3SwitchWidget: () => <M3SwitchWidget />,
  M3SliderWidget: () => <M3SliderWidget />,
  M3CheckboxWidget: () => <M3CheckboxWidget />,
  M3RadioWidget: () => <M3RadioWidget />,
  M3SelectionGroup: () => <M3SelectionGroup />,
  M3OutlinedTextField: () => <M3OutlinedTextField />,
  M3FilledTextField: () => <M3FilledTextField />,
  M3SearchField: () => <M3SearchField />,
  M3TextInputsGroup: () => <M3TextInputsGroup />,
};

/**
 * Default starter showcase items demonstrating all 6 categories
 */
const INITIAL_CANVAS_ITEMS = [
  { id: 'item-1', type: 'M3ElevatedCard', category: 'containment', name: 'Elevated Card' },
  { id: 'item-2', type: 'M3ActionsGroup', category: 'actions', name: 'Action Buttons Suite' },
  { id: 'item-3', type: 'M3SelectionGroup', category: 'selection', name: 'Selection Controls' },
  { id: 'item-4', type: 'M3TextInputsGroup', category: 'text-inputs', name: 'Text Inputs Suite' },
  { id: 'item-5', type: 'M3BottomNavWidget', category: 'navigation', name: 'Bottom Navigation' },
  { id: 'item-6', type: 'M3CommunicationGroup', category: 'communication', name: 'Communication Suite' },
];

/**
 * Material 3 Design Canvas
 * The prototyping workspace displaying M3 components with html-to-image export.
 */
export const Canvas = ({
  items = INITIAL_CANVAS_ITEMS,
  setItems,
  onSelectItem,
  selectedId,
}) => {
  const [canvasItems, setCanvasItems] = useState(items);
  const [deviceFrame, setDeviceFrame] = useState('freeform'); // 'freeform' | 'desktop' | 'mobile'
  const [isInteractive, setIsInteractive] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState(null);
  const exportTargetRef = useRef(null);

  const currentItems = setItems ? items : canvasItems;
  const updateItems = setItems || setCanvasItems;

  // Handle Drag & Drop of M3 widgets onto Canvas
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);
      if (data.type === 'm3-component' && data.componentType) {
        const newItem = {
          id: `m3_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          type: data.componentType,
          category: data.category || 'general',
          name: data.name || data.componentType,
        };
        updateItems((prev) => [...prev, newItem]);
        showNotice(`Dropped ${data.name} onto canvas`);
      }
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  const handleRemoveItem = (id, e) => {
    e?.stopPropagation();
    updateItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleDuplicateItem = (id, e) => {
    e?.stopPropagation();
    const itemToDup = currentItems.find((it) => it.id === id);
    if (!itemToDup) return;
    const duplicated = {
      ...itemToDup,
      id: `m3_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `${itemToDup.name} (Copy)`,
    };
    updateItems((prev) => [...prev, duplicated]);
    showNotice(`Duplicated ${itemToDup.name}`);
  };

  const handleResetShowcase = () => {
    updateItems(INITIAL_CANVAS_ITEMS);
    showNotice('Restored M3 Design Suite');
  };

  const handleClearCanvas = () => {
    updateItems([]);
    showNotice('Cleared canvas');
  };

  const showNotice = (msg) => {
    setExportNotice(msg);
    setTimeout(() => setExportNotice(null), 3000);
  };

  // HTML-TO-IMAGE EXPORT HANDLER
  const handleExportPNG = useCallback(async () => {
    if (!exportTargetRef.current) return;
    setIsExporting(true);
    try {
      // Allow DOM to settle and generate high-res 2x pixel ratio export
      const dataUrl = await toPng(exportTargetRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#141218',
        cacheBust: true,
      });

      const downloadLink = document.createElement('a');
      downloadLink.download = `zlab-m3-prototype-${Date.now()}.png`;
      downloadLink.href = dataUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      showNotice('Exported high-res PNG snapshot!');
    } catch (err) {
      console.error('html-to-image export error:', err);
      showNotice('Export error. Retrying...');
    } finally {
      setIsExporting(false);
    }
  }, []);

  return (
    <ThemeProvider theme={m3Theme}>
      <Box
        sx={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0f0e13',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Workspace Top Toolbar */}
        <Box
          sx={{
            px: 3,
            py: 1.5,
            backgroundColor: '#17151c',
            borderBottom: '1px solid #2d2a33',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
          }}
        >
          {/* Left: Canvas Title & Count */}
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#e6e0e9', fontWeight: 700 }}>
                Z Lab M3 Design Stage
              </Typography>
              <Typography variant="caption" sx={{ color: '#938f99' }}>
                {currentItems.length} active M3 components • Material Design 3
              </Typography>
            </Box>

            {/* Mode Switcher */}
            <Stack direction="row" spacing={0.5} sx={{ backgroundColor: '#211f26', p: 0.5, borderRadius: '12px' }}>
              <Button
                size="small"
                variant={isInteractive ? 'contained' : 'text'}
                onClick={() => setIsInteractive(true)}
                startIcon={<TouchAppIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 1.5,
                  backgroundColor: isInteractive ? '#d0bcff' : 'transparent',
                  color: isInteractive ? '#381e72' : '#cac4d0',
                }}
              >
                Interactive
              </Button>
              <Button
                size="small"
                variant={!isInteractive ? 'contained' : 'text'}
                onClick={() => setIsInteractive(false)}
                startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 1.5,
                  backgroundColor: !isInteractive ? '#d0bcff' : 'transparent',
                  color: !isInteractive ? '#381e72' : '#cac4d0',
                }}
              >
                Edit & Inspect
              </Button>
            </Stack>
          </Stack>

          {/* Center: Device Presets */}
          <Stack direction="row" spacing={1} sx={{ backgroundColor: '#211f26', p: 0.5, borderRadius: '12px' }}>
            <Tooltip title="Responsive Freeform">
              <IconButton
                size="small"
                onClick={() => setDeviceFrame('freeform')}
                sx={{
                  color: deviceFrame === 'freeform' ? '#d0bcff' : '#938f99',
                  backgroundColor: deviceFrame === 'freeform' ? 'rgba(208, 188, 255, 0.12)' : 'transparent',
                }}
              >
                <AspectRatioIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Desktop Artboard (1440)">
              <IconButton
                size="small"
                onClick={() => setDeviceFrame('desktop')}
                sx={{
                  color: deviceFrame === 'desktop' ? '#d0bcff' : '#938f99',
                  backgroundColor: deviceFrame === 'desktop' ? 'rgba(208, 188, 255, 0.12)' : 'transparent',
                }}
              >
                <ComputerIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Mobile View (390)">
              <IconButton
                size="small"
                onClick={() => setDeviceFrame('mobile')}
                sx={{
                  color: deviceFrame === 'mobile' ? '#d0bcff' : '#938f99',
                  backgroundColor: deviceFrame === 'mobile' ? 'rgba(208, 188, 255, 0.12)' : 'transparent',
                }}
              >
                <SmartphoneIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Right: Actions & html-to-image Export */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Tooltip title="Reset to standard 6-category showcase">
              <IconButton size="small" onClick={handleResetShowcase} sx={{ color: '#cac4d0' }}>
                <RefreshIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            {currentItems.length > 0 && (
              <Tooltip title="Clear all components">
                <IconButton size="small" onClick={handleClearCanvas} sx={{ color: '#cac4d0' }}>
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}

            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleExportPNG}
              disabled={isExporting}
              sx={{
                borderRadius: '16px',
                px: 2,
                py: 0.8,
                backgroundColor: '#d0bcff',
                color: '#381e72',
                fontWeight: 700,
                fontSize: '0.8rem',
                textTransform: 'none',
                boxShadow: '0 0 16px rgba(208, 188, 255, 0.35)',
                '&:hover': {
                  backgroundColor: '#eaddff',
                  boxShadow: '0 0 24px rgba(208, 188, 255, 0.5)',
                },
              }}
            >
              {isExporting ? 'Exporting...' : 'Export (html-to-image)'}
            </Button>
          </Stack>
        </Box>

        {/* Feedback Banner */}
        {exportNotice && (
          <Box
            sx={{
              position: 'absolute',
              top: 72,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#2b2930',
              border: '1px solid #d0bcff',
              color: '#eaddff',
              px: 3,
              py: 1,
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              zIndex: 100,
              boxShadow: '0 8px 24px rgba(0,0,0,0.6), 0 0 16px rgba(208, 188, 255, 0.4)',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 18, color: '#d0bcff' }} />
            {exportNotice}
          </Box>
        )}

        {/* Canvas Body (Droppable Area with Grid Pattern) */}
        <Box
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 4,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            backgroundImage: `radial-gradient(circle, #27242f 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        >
          {/* Export Target Artboard Container */}
          <Box
            ref={exportTargetRef}
            id="m3-design-canvas-artboard"
            sx={{
              width:
                deviceFrame === 'mobile'
                  ? '390px'
                  : deviceFrame === 'desktop'
                  ? '1180px'
                  : '100%',
              maxWidth: deviceFrame === 'freeform' ? '1280px' : undefined,
              minHeight: '600px',
              backgroundColor: '#141218',
              borderRadius: deviceFrame === 'mobile' ? '40px' : '28px',
              border: '2px solid #2d2a33',
              boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 32px rgba(208, 188, 255, 0.08)',
              p: deviceFrame === 'mobile' ? 3 : 4,
              transition: 'width 0.3s cubic-bezier(0.2, 0, 0, 1)',
            }}
          >
            {/* Artboard Header Header Tag */}
            <Stack
              direction="row"
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
                pb: 2,
                borderBottom: '1px solid #232029',
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#d0bcff', boxShadow: '0 0 8px #d0bcff' }} />
                <Typography variant="overline" sx={{ color: '#cac4d0', fontWeight: 700, letterSpacing: 1.2 }}>
                  Material 3 Prototype Stage • {deviceFrame.toUpperCase()}
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: '#938f99', fontStyle: 'italic' }}>
                Drop target active • html-to-image ready
              </Typography>
            </Stack>

            {currentItems.length === 0 ? (
              <Box
                sx={{
                  py: 12,
                  textAlign: 'center',
                  border: '2px dashed #36343b',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(29, 27, 32, 0.4)',
                }}
              >
                <Typography variant="h6" sx={{ color: '#cac4d0', mb: 1 }}>
                  Your Canvas is Empty
                </Typography>
                <Typography variant="body2" sx={{ color: '#938f99', mb: 3, maxWidth: 360, mx: 'auto' }}>
                  Drag & drop Material 3 components from the sidebar or click components to start prototyping.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleResetShowcase}
                  sx={{
                    borderRadius: '16px',
                    borderColor: '#d0bcff',
                    color: '#d0bcff',
                    textTransform: 'none',
                  }}
                >
                  Load 6-Category Starter Showcase
                </Button>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns:
                    deviceFrame === 'mobile'
                      ? '1fr'
                      : 'repeat(auto-fill, minmax(340px, 1fr))',
                  gap: 3,
                }}
              >
                {currentItems.map((item, index) => {
                  const RenderComponent = M3_RENDER_MAP[item.type];

                  return (
                    <Box
                      key={item.id}
                      onClick={() => onSelectItem && onSelectItem(item.id)}
                      sx={{
                        position: 'relative',
                        borderRadius: '20px',
                        transition: 'all 0.2s ease',
                        border: !isInteractive
                          ? '1px dashed #49454f'
                          : '1px solid transparent',
                        p: !isInteractive ? 1.5 : 0,
                        '&:hover': {
                          borderColor: !isInteractive ? '#d0bcff' : 'transparent',
                        },
                      }}
                    >
                      {/* Component Action Badge in Edit Mode */}
                      {!isInteractive && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 1,
                            px: 1,
                          }}
                        >
                          <Typography variant="caption" sx={{ color: '#cac4d0', fontWeight: 600 }}>
                            {item.name}
                          </Typography>
                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Duplicate">
                              <IconButton
                                size="small"
                                onClick={(e) => handleDuplicateItem(item.id, e)}
                                sx={{ color: '#938f99', '&:hover': { color: '#d0bcff' } }}
                              >
                                <ContentCopyIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove">
                              <IconButton
                                size="small"
                                onClick={(e) => handleRemoveItem(item.id, e)}
                                sx={{ color: '#938f99', '&:hover': { color: '#f2b8b5' } }}
                              >
                                <DeleteIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Box>
                      )}

                      {/* Rendered Component */}
                      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        {RenderComponent ? (
                          <RenderComponent />
                        ) : (
                          <Paper sx={{ p: 2, bgcolor: '#211f26', color: '#e6e0e9' }}>
                            {item.name}
                          </Paper>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export const DesignCanvas = Canvas;
export default Canvas;
