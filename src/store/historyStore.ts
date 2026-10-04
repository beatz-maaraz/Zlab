import { create } from 'zustand';
import { CanvasElement } from '../types';

interface HistoryStoreState {
  history: Record<string, CanvasElement>[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  pushSnapshot: (elements: Record<string, CanvasElement>) => void;
  undo: () => Record<string, CanvasElement> | null;
  redo: () => Record<string, CanvasElement> | null;
  resetHistory: (initialElements: Record<string, CanvasElement>) => void;
}

export const useHistoryStore = create<HistoryStoreState>((set, get) => ({
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,

  resetHistory: (initialElements) => {
    set({
      history: [initialElements],
      historyIndex: 0,
      canUndo: false,
      canRedo: false,
    });
  },

  pushSnapshot: (newElements) => {
    set((state) => {
      // Deep clone to ensure immutability in history snapshots
      const clonedElements = JSON.parse(JSON.stringify(newElements));
      const upToCurrent = state.history.slice(0, state.historyIndex + 1);
      // Cap history depth to 40 steps to keep memory light and snappy
      const trimmed = upToCurrent.length > 40 ? upToCurrent.slice(upToCurrent.length - 39) : upToCurrent;
      const nextHistory = [...trimmed, clonedElements];
      const nextIndex = nextHistory.length - 1;

      return {
        history: nextHistory,
        historyIndex: nextIndex,
        canUndo: nextIndex > 0,
        canRedo: false,
      };
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      const targetSnapshot = history[targetIndex];
      set({
        historyIndex: targetIndex,
        canUndo: targetIndex > 0,
        canRedo: true,
      });
      return targetSnapshot;
    }
    return null;
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      const targetSnapshot = history[targetIndex];
      set({
        historyIndex: targetIndex,
        canUndo: true,
        canRedo: targetIndex < history.length - 1,
      });
      return targetSnapshot;
    }
    return null;
  },
}));
