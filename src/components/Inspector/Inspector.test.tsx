import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Inspector } from './Inspector';
import { CanvasElement } from '../../types';

const mockFrameElement: CanvasElement = {
  id: 'desktop-1440',
  name: 'Desktop - 1440',
  type: 'frame',
  x: 0,
  y: 0,
  width: 1440,
  height: 900,
  rotation: 0,
  borderRadius: 0,
  fill: '#141218',
  fillOpacity: 100,
  stroke: '#49454f',
  strokeWidth: 1,
  shadowBlur: 0,
  shadowY: 0,
  shadowSpread: 0,
  visible: true,
  locked: false,
};

const mockButtonElement: CanvasElement = {
  id: 'button-1',
  name: 'Primary Button',
  type: 'button',
  x: 120,
  y: 240,
  width: 160,
  height: 48,
  rotation: 0,
  borderRadius: 8,
  fill: '#0D99FF',
  fillOpacity: 100,
  stroke: 'none',
  strokeWidth: 0,
  shadowBlur: 4,
  shadowY: 2,
  shadowSpread: 0,
  visible: true,
  locked: false,
  materialPreset: 'm3',
  variant: 'filled',
};

describe('Inspector Component', () => {
  it('renders top header with element name, type pill, visibility and lock controls', () => {
    const handleUpdate = vi.fn();
    const handleClose = vi.fn();

    render(
      <Inspector
        selectedElement={mockFrameElement}
        onUpdateElement={handleUpdate}
        onExportSelected={vi.fn()}
        onClose={handleClose}
        width={288}
      />
    );

    // Name and type pill
    expect(screen.getByText('Desktop - 1440')).toBeDefined();
    expect(screen.getByText('frame')).toBeDefined();

    // Toggle visibility
    const hideBtn = screen.getByTitle('Hide element');
    fireEvent.click(hideBtn);
    expect(handleUpdate).toHaveBeenCalledWith({ visible: false });

    // Lock toggle
    const lockBtn = screen.getByTitle('Lock element');
    fireEvent.click(lockBtn);
    expect(handleUpdate).toHaveBeenCalledWith({ locked: true });

    // Close
    const closeBtn = screen.getByTitle('Close Inspector / Deselect');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });

  it('renders navigation mode tabs and switches tabs', () => {
    render(
      <Inspector
        selectedElement={mockFrameElement}
        onUpdateElement={vi.fn()}
        onExportSelected={vi.fn()}
        width={288}
      />
    );

    const designTab = screen.getByRole('button', { name: /design/i });
    const prototypeTab = screen.getByRole('button', { name: /prototype/i });
    const inspectTab = screen.getByRole('button', { name: /inspect/i });

    expect(designTab).toBeDefined();
    expect(prototypeTab).toBeDefined();
    expect(inspectTab).toBeDefined();

    // Switch to prototype
    fireEvent.click(prototypeTab);
    expect(screen.getByText(/Interaction Node/i)).toBeDefined();

    // Switch to inspect
    fireEvent.click(inspectTab);
    expect(screen.getByRole('button', { name: /^CSS$/i })).toBeDefined();
  });

  it('separates frame presets from component presets when artboard frame is selected', () => {
    const handleUpdate = vi.fn();
    render(
      <Inspector
        selectedElement={mockFrameElement}
        onUpdateElement={handleUpdate}
        onExportSelected={vi.fn()}
        width={288}
      />
    );

    // When frame is selected: shows Frame Presets and M3 Surface tokens
    expect(screen.getByText(/Frame Presets/i)).toBeDefined();
    expect(screen.getByText('Android Large')).toBeDefined();
    expect(screen.getByText(/M3 Surface Tokens/i)).toBeDefined();

    // Clicking Android Large updates dimensions without touching x, y
    const androidBtn = screen.getByTitle('Set frame dimensions to 360 × 800');
    fireEvent.click(androidBtn);
    expect(handleUpdate).toHaveBeenCalledWith({
      width: 360,
      height: 800,
    });
  });

  it('exposes InspectorPresets when a UI component is selected and applies atomic tokens without mutating x, y, width, height', () => {
    const handleUpdate = vi.fn();
    render(
      <Inspector
        selectedElement={mockButtonElement}
        onUpdateElement={handleUpdate}
        onExportSelected={vi.fn()}
        width={288}
      />
    );

    // Shows PRESETS with M3, iOS, Glass toggle buttons
    expect(screen.getByText('PRESETS')).toBeDefined();
    expect(screen.getByRole('button', { name: /^M3$/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /^iOS$/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /^Glass$/i })).toBeDefined();

    // Switch to iOS preset
    const iosButton = screen.getByRole('button', { name: /^iOS$/i });
    fireEvent.click(iosButton);

    // Verify atomic update applies tokens and DOES NOT touch x, y, width, height
    expect(handleUpdate).toHaveBeenCalledWith({
      presetTheme: 'ios',
      materialPreset: 'ios',
      fill: '#1C1C1E',
      stroke: '#38383A',
      strokeColor: '#38383A',
      strokeWidth: 1,
      borderRadius: 12,
      radius: 12,
      shadowY: 2,
      shadowBlur: 8,
      shadowSpread: 0,
    });

    // Clicking an individual palette swatch updates fill
    const swatch = screen.getByLabelText('#D0BCFF');
    fireEvent.click(swatch);
    expect(handleUpdate).toHaveBeenCalledWith({ fill: '#D0BCFF' });
  });

  it('renders pinned export footer with split button and format options', () => {
    const handleExportSelected = vi.fn();
    render(
      <Inspector
        selectedElement={mockFrameElement}
        onUpdateElement={vi.fn()}
        onExportSelected={handleExportSelected}
        width={288}
      />
    );

    // Primary action button defaults to PNG (2x)
    expect(screen.getByText('Export PNG (2x)')).toBeDefined();

    // Open dropdown caret
    const caretBtn = screen.getByTitle('Pick alternate export format');
    fireEvent.click(caretBtn);

    expect(screen.getByText('SVG')).toBeDefined();
    expect(screen.getByText('Element JSON')).toBeDefined();
    expect(screen.getByText('More Options...')).toBeDefined();

    // Clicking More Options triggers onExportSelected
    const moreOptionsBtn = screen.getByText('More Options...');
    fireEvent.click(moreOptionsBtn);
    expect(handleExportSelected).toHaveBeenCalled();
  });
});
