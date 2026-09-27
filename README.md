# ZLab Design Workspace

A high-performance, full-featured design tool built with React, TypeScript, and Tailwind CSS. ZLab provides a professional-grade environment for creating user interfaces, featuring advanced layout engines, design system integrations, and real-time collaboration tools.

## 🚀 Core Features

- **Smart Snapping Engine**: Precise alignment with real-time horizontal/vertical guides. Supports edge/center snapping, artboard boundaries, and equidistant gap detection with visual distance markers.
- **Full-Featured Designer**: Robust canvas with support for grouping/ungrouping, nesting, z-index management, and complex property editing (transforms, fills, shadows, etc.).
- **Design Systems**: One-click import for Material Design 3 (M3) and Apple iOS 18 (HIG) system kits.
- **Infinite Canvas**: Zoomable workspace with support for multiple pages and artboards.
- **State Persistence**: Secure user accounts and project storage powered by Firebase Authentication and Cloud Firestore.
- **Keyboard-First Workflow**: Comprehensive shortcut system for fast tool switching, zooming, and element manipulation.
- **Undo/Redo History**: Granular state tracking for non-destructive editing.
- **Cyberpunk UI Theme**: Optional high-fidelity cyberpunk design kits and cursor systems for creative explorations.

## 📂 Project Structure

```text
src/
├── App.tsx             # Main application orchestrator (routing, shortcuts, global state)
├── main.tsx            # React entry point
├── types.ts            # Core TypeScript definitions (Elements, Projects, Pages)
├── routes.ts           # Route configuration
├── components/         # Modular UI components
│   ├── Canvas.tsx      # Central editing area and interaction logic
│   ├── Inspector/      # Right-side property editor panel
│   ├── LeftSidebar.tsx # Layers panel, asset library, and page manager
│   ├── Header/         # Navigation, project title, and tool selection
│   ├── FloatingToolbar.ts # Context-aware tool overlay
│   ├── DashboardView.ts# File browser and template selector
│   └── Modals/         # Modals for Export, Prototype, Settings, and Shortcuts
├── store/              # Zustand state management
│   ├── editorStore.ts  # Canvas state (zoom, tools, selection, grid, snapping)
│   ├── projectStore.ts # Project & Page CRUD operations
│   ├── authStore.ts    # Firebase Authentication session state
│   ├── historyStore.ts # Undo/Redo snapshot management
│   └── uiStore.ts      # UI state (modals, sidebar widths, toasts)
├── utils/              # Core logic and helper functions
│   ├── smartSnapping.ts# The Smart Snapping & Alignment Engine
│   ├── layoutEngine.ts # Sizing, positioning, and group logic
│   └── exportUtils.ts  # Logic for exporting designs to images/code
├── lib/                # External library integrations
│   ├── firebase.ts     # Firebase SDK initialization
│   └── firestoreProjects.ts # Persistence layer for projects
└── data/               # Static assets and design kit definitions
    ├── designKits.ts   # Material 3 & iOS kit element schemas
    └── cyberpunkCursors.ts # Specialized cyberpunk HUD assets
```

## 🛠️ Technical Stack

- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS for high-performance, modular UI
- **State Management**: Zustand (Modular stores with history tracking)
- **Animations**: Framer Motion for fluid UI transitions
- **Icons**: Lucide React
- **Backend**: Firebase (Auth & Firestore)
- **Build Tool**: Vite

## ⚡ Key Workflows

### Smart Snapping
The snapping engine (`src/utils/smartSnapping.ts`) runs during drag and resize operations. It computes the "best" snap candidate based on a threshold (default 6px) by checking:
1. **Neighbor Alignment**: Edges (L/R/T/B) and Centers (X/Y) of all visible elements.
2. **Artboard Alignment**: Center and edge boundaries of the current artboard.
3. **Equal Gaps**: Automatically detects when an element is centered between two others with equal spacing.

### State Synchronization
The application uses a centralized store pattern with Zustand. `App.tsx` synchronizes project updates to the store, which then triggers auto-saves and updates the undo/redo history stack via `historyStore.ts`.

### Persistence
Project data is stored as normalized JSON objects in Firestore. The schema supports nested elements, page hierarchies, and user-specific project ownership.
