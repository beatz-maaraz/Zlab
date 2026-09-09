import { create } from 'zustand';
import { Collaborator, ToolMode } from '../types';
import { INITIAL_COLLABORATORS } from '../mockData';

interface EditorStoreState {
  zoom: number;
  setZoom: (value: number | ((prev: number) => number)) => void;
  resetZoom: () => void;
  currentTool: ToolMode;
  setCurrentTool: (tool: ToolMode) => void;
  devicePreview: 'desktop' | 'mobile';
  setDevicePreview: (mode: 'desktop' | 'mobile') => void;
  selectedElementId: string;
  setSelectedElementId: (id: string) => void;
  showGrid: boolean;
  setShowGrid: (value: boolean | ((prev: boolean) => boolean)) => void;
  toggleGrid: () => void;
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
  collaborators: Collaborator[];
  setCollaborators: (
    value: Collaborator[] | ((prev: Collaborator[]) => Collaborator[])
  ) => void;
  pan: { x: number; y: number };
  setPan: (
    value: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })
  ) => void;
  resetPan: () => void;
}

export const useEditorStore = create<EditorStoreState>((set) => ({
  zoom: 0.8,
  setZoom: (value) =>
    set((state) => {
      const next = typeof value === 'function' ? value(state.zoom) : value;
      return { zoom: Math.min(3, Math.max(0.2, Number(next.toFixed(2)))) };
    }),
  resetZoom: () => set({ zoom: 1 }),

  currentTool: 'move',
  setCurrentTool: (tool) => set({ currentTool: tool }),

  devicePreview: 'desktop',
  setDevicePreview: (devicePreview) => set({ devicePreview }),

  selectedElementId: 'desktop-1440',
  setSelectedElementId: (id) => set({ selectedElementId: id }),

  showGrid: false,
  setShowGrid: (value) =>
    set((state) => ({
      showGrid: typeof value === 'function' ? value(state.showGrid) : value,
    })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

  snapToGrid: false,
  setSnapToGrid: (snapToGrid) => set({ snapToGrid }),

  collaborators: INITIAL_COLLABORATORS,
  setCollaborators: (value) =>
    set((state) => ({
      collaborators: typeof value === 'function' ? value(state.collaborators) : value,
    })),

  pan: { x: 0, y: 0 },
  setPan: (value) =>
    set((state) => ({
      pan: typeof value === 'function' ? value(state.pan) : value,
    })),
  resetPan: () => set({ pan: { x: 0, y: 0 } }),
}));
