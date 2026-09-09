import { create } from 'zustand';
import { CanvasElement, Project, ProjectPage } from '../types';
import { INITIAL_ELEMENTS } from '../mockData';
import { computeAutoLayouts } from '../utils/layoutEngine';

const STORAGE_KEY = 'zlab_projects_v2';
const ACTIVE_PROJECT_KEY = 'zlab_active_project_id';

const DEFAULT_PROJECT_ID = 'proj_default_showcase';

const createDefaultShowcaseProject = (): Project => {
  const now = new Date().toISOString();
  return {
    id: DEFAULT_PROJECT_ID,
    name: 'ZLab Studio Showcase',
    elements: computeAutoLayouts(INITIAL_ELEMENTS),
    pages: [
      { id: 'page-1', name: 'Page 1 — Main Canvas' },
      { id: 'page-2', name: 'Page 2 — Components' },
      { id: 'page-3', name: 'Page 3 — Mobile Flow' },
    ],
    activePageId: 'page-1',
    previewType: 'desktop',
    createdAt: now,
    updatedAt: now,
    category: 'Design System',
    tag: 'Web & Mobile',
  };
};

const loadInitialProjects = (): Record<string, Project> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load projects from localStorage, initializing fresh:', err);
  }

  const initial = { [DEFAULT_PROJECT_ID]: createDefaultShowcaseProject() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
  return initial;
};

const persistProjects = (projects: Record<string, Project>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.warn('Failed to persist projects to localStorage:', err);
  }
};

interface ProjectStoreState {
  projects: Record<string, Project>;
  activeProjectId: string;
  getActiveProject: () => Project;
  createProject: (
    name?: string,
    initialElements?: Record<string, CanvasElement>,
    previewType?: 'desktop' | 'mobile'
  ) => Project;
  setActiveProject: (id: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  updateActiveProjectElements: (
    elements: Record<string, CanvasElement> | ((prev: Record<string, CanvasElement>) => Record<string, CanvasElement>)
  ) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => Project;
  addPage: (name: string) => void;
  setActivePage: (pageId: string) => void;
  getRecentProjectsList: () => Project[];
}

export const useProjectStore = create<ProjectStoreState>((set, get) => {
  const initialProjects = loadInitialProjects();
  let initialActiveId = localStorage.getItem(ACTIVE_PROJECT_KEY) || DEFAULT_PROJECT_ID;
  if (!initialProjects[initialActiveId]) {
    initialActiveId = Object.keys(initialProjects)[0] || DEFAULT_PROJECT_ID;
  }

  return {
    projects: initialProjects,
    activeProjectId: initialActiveId,

    getActiveProject: () => {
      const { projects, activeProjectId } = get();
      return projects[activeProjectId] || Object.values(projects)[0] || createDefaultShowcaseProject();
    },

    createProject: (name, initialElements, previewType = 'desktop') => {
      const timestamp = Date.now();
      const newId = `proj_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();

      let elements: Record<string, CanvasElement>;

      if (initialElements && Object.keys(initialElements).length > 0) {
        elements = computeAutoLayouts(initialElements);
      } else if (previewType === 'mobile') {
        elements = computeAutoLayouts({
          'mobile-app-view': {
            id: 'mobile-app-view',
            name: 'Mobile Screen 1',
            type: 'frame',
            x: 0,
            y: 0,
            width: 390,
            height: 844,
            rotation: 0,
            borderRadius: 44,
            fill: '#131313',
            fillOpacity: 100,
            stroke: '#3f4753',
            strokeWidth: 1,
            shadowBlur: 32,
            shadowY: 12,
            shadowSpread: 0,
            visible: true,
            locked: false,
          },
        });
      } else {
        elements = computeAutoLayouts({
          'desktop-1440': {
            id: 'desktop-1440',
            name: 'Desktop Frame',
            type: 'frame',
            x: 0,
            y: 0,
            width: 1440,
            height: 900,
            rotation: 0,
            borderRadius: 8,
            fill: '#131313',
            fillOpacity: 100,
            stroke: '#3f4753',
            strokeWidth: 1,
            shadowBlur: 24,
            shadowY: 8,
            shadowSpread: 0,
            visible: true,
            locked: false,
          },
        });
      }

      const newProject: Project = {
        id: newId,
        name: name || `Untitled Design ${new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })}`,
        elements,
        pages: [{ id: 'page-1', name: 'Page 1' }],
        activePageId: 'page-1',
        previewType,
        createdAt: now,
        updatedAt: now,
      };

      set((state) => {
        const next = { ...state.projects, [newId]: newProject };
        persistProjects(next);
        try {
          localStorage.setItem(ACTIVE_PROJECT_KEY, newId);
        } catch (e) {
          // ignore
        }
        return {
          projects: next,
          activeProjectId: newId,
        };
      });

      return newProject;
    },

    setActiveProject: (id: string) => {
      set((state) => {
        if (!state.projects[id]) return state;
        try {
          localStorage.setItem(ACTIVE_PROJECT_KEY, id);
        } catch (e) {
          // ignore
        }
        return { activeProjectId: id };
      });
    },

    updateProject: (id: string, updates: Partial<Project>) => {
      set((state) => {
        const current = state.projects[id];
        if (!current) return state;

        const updated: Project = {
          ...current,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        const next = { ...state.projects, [id]: updated };
        persistProjects(next);
        return { projects: next };
      });
    },

    updateActiveProjectElements: (value) => {
      set((state) => {
        const current = state.projects[state.activeProjectId];
        if (!current) return state;

        const resolved = typeof value === 'function' ? value(current.elements) : value;
        const computed = computeAutoLayouts(resolved);

        const updated: Project = {
          ...current,
          elements: computed,
          updatedAt: new Date().toISOString(),
        };

        const next = { ...state.projects, [state.activeProjectId]: updated };
        persistProjects(next);
        return { projects: next };
      });
    },

    deleteProject: (id: string) => {
      set((state) => {
        const next = { ...state.projects };
        delete next[id];
        persistProjects(next);

        let nextActive = state.activeProjectId;
        if (nextActive === id) {
          nextActive = Object.keys(next)[0] || '';
          if (!nextActive) {
            const fallback = createDefaultShowcaseProject();
            next[fallback.id] = fallback;
            nextActive = fallback.id;
            persistProjects(next);
          }
        }

        try {
          localStorage.setItem(ACTIVE_PROJECT_KEY, nextActive);
        } catch (e) {
          // ignore
        }

        return {
          projects: next,
          activeProjectId: nextActive,
        };
      });
    },

    duplicateProject: (id: string) => {
      const state = get();
      const current = state.projects[id];
      if (!current) return state.getActiveProject();

      const timestamp = Date.now();
      const newId = `proj_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();

      const cloned: Project = {
        ...current,
        id: newId,
        name: `${current.name} (Copy)`,
        createdAt: now,
        updatedAt: now,
      };

      set((s) => {
        const next = { ...s.projects, [newId]: cloned };
        persistProjects(next);
        return { projects: next, activeProjectId: newId };
      });

      return cloned;
    },

    addPage: (name: string) => {
      set((state) => {
        const current = state.projects[state.activeProjectId];
        if (!current) return state;

        const pageId = `page-${Date.now()}`;
        const newPage: ProjectPage = { id: pageId, name };
        const updatedPages = [...current.pages, newPage];

        const updated: Project = {
          ...current,
          pages: updatedPages,
          activePageId: pageId,
          updatedAt: new Date().toISOString(),
        };

        const next = { ...state.projects, [state.activeProjectId]: updated };
        persistProjects(next);
        return { projects: next };
      });
    },

    setActivePage: (pageId: string) => {
      set((state) => {
        const current = state.projects[state.activeProjectId];
        if (!current) return state;

        const updated: Project = {
          ...current,
          activePageId: pageId,
        };

        const next = { ...state.projects, [state.activeProjectId]: updated };
        persistProjects(next);
        return { projects: next };
      });
    },

    getRecentProjectsList: () => {
      const state = get();
      return Object.values(state.projects).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    },
  };
});
