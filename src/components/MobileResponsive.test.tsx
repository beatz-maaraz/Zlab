import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from './Header/Header';
import { FloatingToolbar } from './FloatingToolbar';
import { Inspector } from './Inspector/Inspector';
import { CanvasElement } from '../types';

describe('Mobile View and Alignment Features', () => {
  it('renders mobile compact header with overflow menu dropdown', () => {
    const handleDevicePreview = vi.fn();
    const handleUndo = vi.fn();
    const handleRedo = vi.fn();
    const handleOpenAnalysis = vi.fn();

    render(
      <Header
        projectTitle="Mobile Test Project"
        setProjectTitle={vi.fn()}
        zoom={1}
        setZoom={vi.fn()}
        devicePreview="mobile"
        setDevicePreview={handleDevicePreview}
        currentView="editor"
        setCurrentView={vi.fn()}
        onOpenSettings={vi.fn()}
        onExport={vi.fn()}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={true}
        canRedo={false}
        onOpenAnalysis={handleOpenAnalysis}
        analysisScore={94}
        isInspectorCollapsed={true}
        onToggleInspector={vi.fn()}
      />
    );

    const overflowBtn = screen.getByRole('button', { name: /more options/i });
    expect(overflowBtn).toBeDefined();

    // Click to open overflow dropdown
    fireEvent.click(overflowBtn);

    const dropdown = document.getElementById('header-mobile-overflow-dropdown');
    expect(dropdown).toBeDefined();
    expect(dropdown).not.toBeNull();

    // Verify items inside open dropdown
    const auditBtn = screen.getByText(/Design & A11y Audit/i);
    expect(auditBtn).toBeDefined();

    const desktopBtn = document.getElementById('btn-mobile-overflow-desktop');
    expect(desktopBtn).not.toBeNull();
    fireEvent.click(desktopBtn!);
    expect(handleDevicePreview).toHaveBeenCalledWith('desktop');

    // Re-opening overflow menu to test audit click
    fireEvent.click(overflowBtn);
    const auditBtn2 = screen.getByText(/Design & A11y Audit/i);
    fireEvent.click(auditBtn2);
    expect(handleOpenAnalysis).toHaveBeenCalled();
  });

  it('renders docked bottom toolbar with touch targets when isMobile is true', () => {
    const handleToolSelect = vi.fn();
    render(
      <FloatingToolbar
        currentTool="move"
        setCurrentTool={handleToolSelect}
        isMobile={true}
      />
    );

    const toolbar = document.getElementById('floating-canvas-toolbar');
    expect(toolbar).toBeDefined();
    expect(toolbar?.className).toContain('fixed');
    expect(toolbar?.className).toContain('bottom-12');
    expect(toolbar?.className).toContain('-translate-x-1/2');

    // Verify drawing tool button click
    const rectBtn = document.getElementById('tool-btn-rect');
    expect(rectBtn).toBeDefined();
    if (rectBtn) fireEvent.click(rectBtn);
    expect(handleToolSelect).toHaveBeenCalledWith('rect');
  });

  it('renders slide-up bottom sheet when isMobile is true in Inspector', () => {
    const mockElement: CanvasElement = {
      id: 'rect_1',
      name: 'Card Surface',
      type: 'rectangle',
      x: 20,
      y: 40,
      width: 350,
      height: 180,
      rotation: 0,
      borderRadius: 16,
      fill: '#1c1b1b',
      fillOpacity: 100,
      stroke: '#353534',
      strokeWidth: 1,
      shadowBlur: 10,
      shadowY: 4,
      shadowSpread: 0,
      visible: true,
      locked: false,
    };

    const handleClose = vi.fn();

    render(
      <Inspector
        selectedElement={mockElement}
        allElements={{ rect_1: mockElement }}
        onUpdateElement={vi.fn()}
        onExportSelected={vi.fn()}
        onClose={handleClose}
        isMobile={true}
        width={320}
      />
    );

    const backdrop = document.getElementById('inspector-mobile-backdrop');
    expect(backdrop).toBeDefined();

    const inspector = document.getElementById('inspector-sidebar');
    expect(inspector?.className).toContain('rounded-t-2xl');
    expect(inspector?.className).toContain('bottom-0');

    // Clicking mobile backdrop closes the inspector
    if (backdrop) fireEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalled();
  });
});
