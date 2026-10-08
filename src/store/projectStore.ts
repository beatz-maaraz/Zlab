import { create } from 'zustand';
import { CanvasElement, Project, ProjectPage } from '../types';
import { INITIAL_ELEMENTS } from '../mockData';
import { computeAutoLayouts } from '../utils/layoutEngine';
import {
  syncProjectToFirestore,
  fetchUserProjectsFromFirestore,
  deleteProjectFromFirestore,
} from '../lib/firestoreProjects';
import { auth } from '../lib/firebase';

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

let lastProjectsState: Record<string, Project> | null = null;
let persistTimeout: ReturnType<typeof setTimeout> | null = null;

const pendingFirestoreSyncs: Record<string, ReturnType<typeof setTimeout>> = {};

const debouncedSyncProjectToFirestore = (project: Project, userId: string) => {
  if (pendingFirestoreSyncs[project.id]) {
    clearTimeout(pendingFirestoreSyncs[project.id]);
  }
  pendingFirestoreSyncs[project.id] = setTimeout(() => {
    syncProjectToFirestore(project, userId).catch(console.error);
    delete pendingFirestoreSyncs[project.id];
  }, 2000); // 2 second debounce for Firestore writes
};

const persistProjects = (projects: Record<string, Project>) => {
  lastProjectsState = projects;
  if (persistTimeout) clearTimeout(persistTimeout);
  persistTimeout = setTimeout(() => {
    try {
      if (lastProjectsState) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lastProjectsState));
      }
    } catch (err) {
      console.warn('Failed to persist projects to localStorage:', err);
    }
  }, 500);
};

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (lastProjectsState) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lastProjectsState));
      } catch (err) {}
    }
  });
}

interface ProjectStoreState {
  projects: Record<string, Project>;
  activeProjectId: string;
  currentUserId: string | null;
  getActiveProject: () => Project;
  syncWithUser: (userId: string) => Promise<void>;
  onUserSignedOut: () => void;
  createProject: (
    name?: string,
    initialElements?: Record<string, CanvasElement>,
    previewType?: 'desktop' | 'mobile',
    additionalDetails?: Partial<Project>
  ) => Project;
  setActiveProject: (id: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  updateActiveProjectElements: (
    elements: Record<string, CanvasElement> | ((prev: Record<string, CanvasElement>) => Record<string, CanvasElement>)
  ) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => Project;
  addPage: (name?: string) => void;
  setActivePage: (pageId: string) => void;
  renamePage: (pageId: string, name: string) => void;
  duplicatePage: (pageId: string) => void;
  deletePage: (pageId: string) => void;
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
    currentUserId: null,

    syncWithUser: async (userId: string) => {
      set({ currentUserId: userId });
      try {
        const cloudProjects = await fetchUserProjectsFromFirestore(userId);
        if (cloudProjects.length > 0) {
          const map: Record<string, Project> = {};
          cloudProjects.forEach((p) => {
            map[p.id] = p;
          });
          const mostRecent = cloudProjects.sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0];
          set({
            projects: map,
            activeProjectId: mostRecent ? mostRecent.id : Object.keys(map)[0],
          });
          persistProjects(map);
        } else {
          // New user on Firebase: Seed initial showcase project to Firestore for them
          const current = get().getActiveProject();
          const userProject: Project = {
            ...current,
            id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            ownerId: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          const next = { [userProject.id]: userProject };
          set({ projects: next, activeProjectId: userProject.id });
          persistProjects(next);
          await debouncedSyncProjectToFirestore(userProject, userId);
        }
      } catch (err) {
        console.warn('Failed to sync projects with Firestore:', err);
      }
    },

    onUserSignedOut: () => {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(ACTIVE_PROJECT_KEY);
      } catch (e) {
        // ignore
      }
      const initialProjects = { [DEFAULT_PROJECT_ID]: createDefaultShowcaseProject() };
      set({
        projects: initialProjects,
        activeProjectId: DEFAULT_PROJECT_ID,
        currentUserId: null,
      });
    },

    getActiveProject: () => {
      const { projects, activeProjectId } = get();
      return projects[activeProjectId] || Object.values(projects)[0] || createDefaultShowcaseProject();
    },

    createProject: (name, initialElements, previewType = 'desktop', additionalDetails) => {
      const timestamp = Date.now();
      const newId = `proj_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();

      let elements: Record<string, CanvasElement>;

      if (initialElements && Object.keys(initialElements).length > 0) {
        elements = computeAutoLayouts(initialElements);
        // Ensure mobile-app-view root frame exists if missing
        if (!elements['mobile-app-view']) {
          elements['mobile-app-view'] = {
            id: 'mobile-app-view',
            name: 'Mobile App View',
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
            strokeWidth: 2,
            shadowBlur: 32,
            shadowY: 12,
            shadowSpread: 0,
            visible: true,
            locked: false,
          };
        }
        if (!elements['desktop-1440']) {
          elements['desktop-1440'] = {
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
          };
        }
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
            strokeWidth: 2,
            shadowBlur: 32,
            shadowY: 12,
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
        status: 'active',
        ...additionalDetails,
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

      const { currentUserId } = get();
      if (currentUserId) {
        debouncedSyncProjectToFirestore(newProject, currentUserId);
      }

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
      let updatedProject: Project | null = null;
      set((state) => {
        const current = state.projects[id];
        if (!current) return state;

        const updated: Project = {
          ...current,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        updatedProject = updated;

        const next = { ...state.projects, [id]: updated };
        persistProjects(next);
        return { projects: next };
      });

      const { currentUserId } = get();
      if (currentUserId && updatedProject) {
        debouncedSyncProjectToFirestore(updatedProject, currentUserId);
      }
    },

    updateActiveProjectElements: (value) => {
      let updatedProject: Project | null = null;
      set((state) => {
        const current = state.projects[state.activeProjectId];
        if (!current) return state;

        const resolved = typeof value === 'function' ? value(current.elements) : value;
        const computed = computeAutoLayouts(resolved);

        const pageElements = {
          ...(current.pageElements || {}),
          [current.activePageId]: computed,
        };

        const updated: Project = {
          ...current,
          elements: computed,
          pageElements,
          updatedAt: new Date().toISOString(),
        };
        updatedProject = updated;

        const next = { ...state.projects, [state.activeProjectId]: updated };
        persistProjects(next);
        return { projects: next };
      });

      const { currentUserId } = get();
      if (currentUserId && updatedProject) {
        debouncedSyncProjectToFirestore(updatedProject, currentUserId);
      }
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

      const targetUserId = get().currentUserId || auth.currentUser?.uid;
      if (targetUserId) {
        deleteProjectFromFirestore(id);
      }
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

      const { currentUserId } = get();
      if (currentUserId) {
        debouncedSyncProjectToFirestore(cloned, currentUserId);
      }

      return cloned;
    },

    addPage: (name?: string) => {
      set((state) => {
        const current = state.projects[state.activeProjectId];
        if (!current) return state;

        const pageNumber = current.pages.length + 1;
        const pageId = `page-${Date.now()}`;
        const pageName = name?.trim() || `Page ${pageNumber}`;
        const newPage: ProjectPage = { id: pageId, name: pageName };

        const isMobile = current.previewType === 'mobile';
        const defaultArtboardId = isMobile ? 'mobile-app-view' : 'desktop-1440';

        const initialPageElements: Record<string, CanvasElement> = {
          [defaultArtboardId]: {
            id: defaultArtboardId,
            name: isMobile ? 'Mobile App View' : 'Desktop - 1440',
            type: 'frame',
            x: 0,
            y: 0,
            width: isMobile ? 390 : 1440,
            height: isMobile ? 844 : 900,
            rotation: 0,
            borderRadius: isMobile ? 28 : 8,
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
        };

        const existingPageElements = current.pageElements || {
          [current.activePageId]: current.elements,
        };

        const updatedPageElements = {
          ...existingPageElements,
          [current.activePageId]: current.elements,
          [pageId]: initialPageElements,
        };

        const updated: Project = {
          ...current,
          pages: [...current.pages, newPage],
          activePageId: pageId,
          elements: initialPageElements,
          pageElements: updatedPageElements,
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
        if (!current || current.activePageId === pageId) return state;

        const existingPageElements = current.pageElements || {
          [current.activePageId]: current.elements,
        };

        // Save current elements to outgoing page
        const savedPageElements = {
          ...existingPageElements,
          [current.activePageId]: current.elements,
        };

        const isMobile = current.previewType === 'mobile';
        const defaultArtboardId = isMobile ? 'mobile-app-view' : 'desktop-1440';

        // Load new page elements or fallback
        const targetElements = savedPageElements[pageId] || {
          [defaultArtboardId]: {
            id: defaultArtboardId,
            name: isMobile ? 'Mobile App View' : 'Desktop - 1440',
            type: 'frame',
            x: 0,
            y: 0,
            width: isMobile ? 390 : 1440,
            height: isMobile ? 844 : 900,
            rotation: 0,
            borderRadius: isMobile ? 28 : 8,
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
        };

        const updated: Project = {
          ...current,
          activePageId: pageId,
          elements: targetElements,
          pageElements: savedPageElements,
          updatedAt: new Date().toISOString(),
        };

        const next = { ...state.projects, [state.activeProjectId]: updated };
        persistProjects(next);
        return { projects: next };
      });
    },

    renamePage: (pageId: string, name: string) => {
      set((state) => {
        const current = state.projects[state.activeProjectId];
        if (!current) return state;

        const updatedPages = current.pages.map((p) =>
          p.id === pageId ? { ...p, name: name.trim() || p.name } : p
        );

        const updated: Project = {
          ...current,
          pages: updatedPages,
          updatedAt: new Date().toISOString(),
        };

        const next = { ...state.projects, [state.activeProjectId]: updated };
        persistProjects(next);
        return { projects: next };
      });
    },

    duplicatePage: (pageId: string) => {
      set((state) => {
        const current = state.projects[state.activeProjectId];
        if (!current) return state;

        const targetPage = current.pages.find((p) => p.id === pageId);
        if (!targetPage) return state;

        const newId = `page-${Date.now()}`;
        const newPage: ProjectPage = {
          id: newId,
          name: `${targetPage.name} (Copy)`,
        };

        const existingPageElements = current.pageElements || {
          [current.activePageId]: current.elements,
        };

        const sourceElements =
          pageId === current.activePageId
            ? current.elements
            : existingPageElements[pageId] || current.elements;

        const clonedElements = JSON.parse(JSON.stringify(sourceElements));

        const updatedPageElements = {
          ...existingPageElements,
          [current.activePageId]: current.elements,
          [newId]: clonedElements,
        };

        const updated: Project = {
          ...current,
          pages: [...current.pages, newPage],
          activePageId: newId,
          elements: clonedElements,
          pageElements: updatedPageElements,
          updatedAt: new Date().toISOString(),
        };

        const next = { ...state.projects, [state.activeProjectId]: updated };
        persistProjects(next);
        return { projects: next };
      });
    },

    deletePage: (pageId: string) => {
      set((state) => {
        const current = state.projects[state.activeProjectId];
        if (!current || current.pages.length <= 1) return state;

        const updatedPages = current.pages.filter((p) => p.id !== pageId);
        let nextActiveId = current.activePageId;
        let nextElements = current.elements;

        const updatedPageElements = { ...(current.pageElements || {}) };
        delete updatedPageElements[pageId];

        if (current.activePageId === pageId) {
          nextActiveId = updatedPages[0].id;
          nextElements =
            updatedPageElements[nextActiveId] ||
            Object.values(updatedPageElements)[0] ||
            current.elements;
        }

        const updated: Project = {
          ...current,
          pages: updatedPages,
          activePageId: nextActiveId,
          elements: nextElements,
          pageElements: updatedPageElements,
          updatedAt: new Date().toISOString(),
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
