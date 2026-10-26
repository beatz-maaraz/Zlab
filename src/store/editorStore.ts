import { create } from 'zustand';
import { Collaborator, ToolMode, WorkspaceMode } from '../types';
import { INITIAL_COLLABORATORS } from '../mockData';

interface EditorStoreState {
  zoom: number;
  setZoom: (value: number | ((prev: number) => number)) => void;
  resetZoom: () => void;
  currentTool: ToolMode;
  setCurrentTool: (tool: ToolMode) => void;
  workspaceMode: WorkspaceMode;
  setWorkspaceMode: (mode: WorkspaceMode) => void;
  toggleWorkspaceMode: () => void;
  devicePreview: 'desktop' | 'mobile';
  setDevicePreview: (mode: 'desktop' | 'mobile') => void;
  selectedElementId: string;
  setSelectedElementId: (id: string) => void;
  selectedElementIds: string[];
  setSelectedElementIds: (ids: string[]) => void;
  toggleElementSelection: (id: string) => void;
  clearSelection: () => void;
  showGrid: boolean;
  setShowGrid: (value: boolean | ((prev: boolean) => boolean)) => void;
  toggleGrid: () => void;
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
  snapToGuides: boolean;
  setSnapToGuides: (value: boolean | ((prev: boolean) => boolean)) => void;
  toggleSnapToGuides: () => void;
  collaborators: Collaborator[];
  setCollaborators: (
    value: Collaborator[] | ((prev: Collaborator[]) => Collaborator[])
  ) => void;
  pan: { x: number; y: number };
  setPan: (
    value: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })
  ) => void;
  resetPan: () => void;
  documentColors: string[];
  addDocumentColor: (color: string) => void;
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

  workspaceMode: 'edit',
  setWorkspaceMode: (workspaceMode) => set({ workspaceMode }),
  toggleWorkspaceMode: () =>
    set((state) => ({ workspaceMode: state.workspaceMode === 'edit' ? 'view' : 'edit' })),

  devicePreview: 'desktop',
  setDevicePreview: (devicePreview) => set({ devicePreview }),

  selectedElementId: 'desktop-1440',
  setSelectedElementId: (id) =>
    set({
      selectedElementId: id,
      selectedElementIds: id ? [id] : [],
    }),

  selectedElementIds: ['desktop-1440'],
  setSelectedElementIds: (ids) =>
    set({
      selectedElementIds: ids,
      selectedElementId: ids.length > 0 ? ids[ids.length - 1] : '',
    }),

  toggleElementSelection: (id) =>
    set((state) => {
      const exists = state.selectedElementIds.includes(id);
      const newIds = exists
        ? state.selectedElementIds.filter((item) => item !== id)
        : [...state.selectedElementIds, id];
      return {
        selectedElementIds: newIds,
        selectedElementId: newIds.length > 0 ? newIds[newIds.length - 1] : '',
      };
    }),

  clearSelection: () =>
    set({
      selectedElementId: '',
      selectedElementIds: [],
    }),

  showGrid: false,
  setShowGrid: (value) =>
    set((state) => ({
      showGrid: typeof value === 'function' ? value(state.showGrid) : value,
    })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

  snapToGrid: false,
  setSnapToGrid: (snapToGrid) => set({ snapToGrid }),

  snapToGuides: true,
  setSnapToGuides: (value) =>
    set((state) => ({
      snapToGuides: typeof value === 'function' ? value(state.snapToGuides) : value,
    })),
  toggleSnapToGuides: () => set((state) => ({ snapToGuides: !state.snapToGuides })),

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

  documentColors: [],
  addDocumentColor: (color) =>
    set((state) => {
      if (state.documentColors.includes(color)) return state;
      return { documentColors: [...state.documentColors, color] };
    }),
}));
