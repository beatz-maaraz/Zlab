import React, { useState, useRef, useEffect } from 'react';
import {
  Folder,
  Clock,
  Users,
  Trash2,
  FolderOpen,
  Plus,
  Upload,
  MoreVertical,
  LayoutDashboard,
  Smartphone,
  ShoppingCart,
  ChevronRight,
  FileCode,
  Copy,
  ExternalLink,
  RefreshCw,
  LayoutTemplate,
  Monitor,
  LogOut,
  Settings as SettingsIcon,
} from 'lucide-react';
import { ProjectFile, TemplateItem, CanvasElement } from '../types';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useRouter } from '../routes';

const MiniCanvasPreview = ({ elements, previewType }: { elements?: Record<string, CanvasElement>, previewType: string }) => {
  if (!elements) return null;
  const rootId = previewType === 'mobile' ? 'mobile-app-view' : 'desktop-1440';
  const rootEl = elements[rootId];
  if (!rootEl) return null;

  const children = Object.values(elements).filter(el => el.parentId === rootId && el.visible !== false);
  const scale = Math.min(140 / rootEl.height, 260 / rootEl.width); 

  return (
    <div 
      className="absolute top-1/2 left-1/2 overflow-hidden shadow-sm pointer-events-none" 
      style={{
        width: rootEl.width, 
        height: rootEl.height,
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: 'top left',
        backgroundColor: rootEl.fill,
        borderRadius: rootEl.borderRadius,
      }}
    >
      {children.map(el => (
        <div key={el.id} style={{
          position: 'absolute',
          left: el.x,
          top: el.y,
          width: el.width,
          height: el.height,
          backgroundColor: el.fill,
          borderRadius: el.borderRadius,
          border: el.stroke && el.stroke !== 'none' ? `${el.strokeWidth}px solid ${el.stroke}` : undefined,
          opacity: (el.fillOpacity ?? 100) / 100,
          transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
        }}>
          {el.type === 'text' && (
            <div style={{
              width: '100%',
              height: '100%',
              color: el.textColor || '#000',
              fontSize: el.fontSize || 14,
              fontWeight: el.fontWeight || 400,
              display: 'flex',
              alignItems: el.textAlign === 'center' ? 'center' : 'flex-start',
              justifyContent: el.textAlign === 'center' ? 'center' : (el.textAlign === 'right' ? 'flex-end' : 'flex-start'),
              padding: '4px'
            }}>
              {el.textContent}
            </div>
          )}
          {(el as any).type === 'image' && (el as any).src && (
            <img src={(el as any).src} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: (el as any).objectFit || 'cover', borderRadius: el.borderRadius }} />
          )}
        </div>
      ))}
    </div>
  );
};

interface DashboardViewProps {
  recentFiles: ProjectFile[];
  templates: TemplateItem[];
  onOpenFile: (file: ProjectFile) => void;
  onNewDesign: () => void;
  onSelectTemplate: (template: TemplateItem) => void;
  onDuplicateFile?: (id: string) => void;
  onDeleteFile?: (id: string) => void;
  onRestoreFile?: (id: string) => void;
  onPermanentDeleteFile?: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  recentFiles,
  templates,
  onOpenFile,
  onNewDesign,
  onSelectTemplate,
  onDuplicateFile,
  onDeleteFile,
  onRestoreFile,
  onPermanentDeleteFile,
}) => {
  const [activeNav, setActiveNav] = useState<'all' | 'recents' | 'shared' | 'trash'>('all');
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [importNotification, setImportNotification] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { user, profile, signOut } = useAuthStore();
  const { navigate } = useRouter();
  const { openModal, setSettingsTab, showToast } = useUIStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      showToast('Signed out successfully', 'info');
      navigate({ type: 'login' });
    } catch (e: any) {
      console.warn('Sign out error:', e);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImport = () => {
    setImportNotification(true);
    setTimeout(() => {
      setImportNotification(false);
      onNewDesign();
    }, 1000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayedFiles = recentFiles.filter(file => {
    if (activeNav === 'trash') return file.status === 'trash';
    if (activeNav === 'shared') return file.status === 'shared';
    return file.status !== 'trash';
  });

  return (
    <div
      id="dashboard-file-browser"
      className="flex flex-1 relative overflow-hidden bg-[#131313] min-h-[calc(100vh-4rem)] pt-16 select-none"
    >
      {/* Left Navigation in Dashboard */}
      <aside
        id="dashboard-sidebar-nav"
        className="hidden md:flex w-64 bg-[#1c1b1b] border-r border-[#353534] flex-col p-4 space-y-6 z-20 shrink-0"
      >
        <div className="space-y-1">
          <button
            onClick={() => {
              setActiveNav('all');
              setActiveFolder(null);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
              activeNav === 'all' && !activeFolder
                ? 'bg-[#0d99ff] text-[#002f55] shadow-sm'
                : 'text-[#bfc7d5] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]'
            }`}
          >
            <Folder className="w-4 h-4 text-inherit" />
            <span>All Files</span>
          </button>

          <button
            onClick={() => {
              setActiveNav('recents');
              setActiveFolder(null);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left ${
              activeNav === 'recents'
                ? 'bg-[#0d99ff] text-[#002f55] font-medium'
                : 'text-[#bfc7d5] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]'
            }`}
          >
            <Clock className="w-4 h-4 text-inherit" />
            <span>Recents</span>
          </button>

          <button
            onClick={() => {
              setActiveNav('shared');
              setActiveFolder(null);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left ${
              activeNav === 'shared'
                ? 'bg-[#0d99ff] text-[#002f55] font-medium'
                : 'text-[#bfc7d5] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]'
            }`}
          >
            <Users className="w-4 h-4 text-inherit" />
            <span>Shared with You</span>
          </button>

          <button
            onClick={() => {
              setActiveNav('trash');
              setActiveFolder(null);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left ${
              activeNav === 'trash'
                ? 'bg-[#0d99ff] text-[#002f55] font-medium'
                : 'text-[#bfc7d5] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]'
            }`}
          >
            <Trash2 className="w-4 h-4 text-inherit" />
            <span>Trash</span>
          </button>
        </div>

        {/* Team Folders */}
        <div className="pt-4 border-t border-[#353534] space-y-2">
          <div className="text-[10px] font-semibold text-[#89919e] uppercase tracking-wider px-3">
            Team Folders
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setActiveFolder('Design System v2')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                activeFolder === 'Design System v2'
                  ? 'bg-[#2a2a2a] text-[#9fcaff] font-medium'
                  : 'text-[#bfc7d5] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]'
              }`}
            >
              <FolderOpen className="w-4 h-4 text-[#9fcaff]" />
              <span>Design System v2</span>
            </button>

            <button
              onClick={() => setActiveFolder('Marketing')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                activeFolder === 'Marketing'
                  ? 'bg-[#2a2a2a] text-[#d2bbff] font-medium'
                  : 'text-[#bfc7d5] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]'
              }`}
            >
              <FolderOpen className="w-4 h-4 text-[#d2bbff]" />
              <span>Marketing</span>
            </button>

            <button
              onClick={() => setActiveFolder('Mobile App')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                activeFolder === 'Mobile App'
                  ? 'bg-[#2a2a2a] text-[#c8c6c5] font-medium'
                  : 'text-[#bfc7d5] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]'
              }`}
            >
              <FolderOpen className="w-4 h-4 text-[#c8c6c5]" />
              <span>Mobile App</span>
            </button>
          </div>
        </div>

        {/* User Account & Sign Out Footer */}
        <div className="pt-4 border-t border-[#353534] space-y-2 mt-auto">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-[#141414] border border-[#2a2a2a]">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                loading="lazy"
                className="w-7 h-7 rounded-full object-cover border border-[#444746]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#004a77] text-[#c2e7ff] text-[11px] font-bold flex items-center justify-center shrink-0">
                {(profile?.displayName || user?.displayName || user?.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-[#e5e2e1] truncate">
                {profile?.displayName || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Designer')}
              </div>
              <div className="text-[10px] text-[#89919e] truncate">
                {user?.email || 'Signed in'}
              </div>
            </div>
            <button
              onClick={() => {
                setSettingsTab('account');
                openModal('settings');
              }}
              title="Account & Danger Zone Settings"
              className="p-1 rounded text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a] transition-colors shrink-0 cursor-pointer"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            id="btn-dashboard-sign-out"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[#ffb4ab] hover:text-[#ffdad6] hover:bg-[#93000a]/20 border border-transparent hover:border-[#93000a]/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        {/* Header Greeting & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#e5e2e1]">
              {getGreeting()}, Creator
            </h1>
            <p className="text-xs text-[#bfc7d5]">
              Pick up where you left off or create a new design project.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              id="btn-dashboard-new-design"
              onClick={onNewDesign}
              className="bg-[#9fcaff] text-[#003259] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-[#0d99ff] hover:text-[#002f55] transition-all shadow-lg shadow-[#9fcaff]/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New design</span>
            </button>

            <button
              id="btn-dashboard-import"
              onClick={handleImport}
              className="bg-[#201f1f] hover:bg-[#2a2a2a] text-[#e5e2e1] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs font-medium flex items-center gap-2 border border-[#353534] transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#9fcaff]" />
              <span>{importNotification ? 'Opening...' : 'Import JSON'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs (visible only on mobile) */}
        <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-2 border-b border-[#2d2d32] no-scrollbar">
          {[
            { id: 'all', label: 'All Files', icon: Folder },
            { id: 'recents', label: 'Recents', icon: Clock },
            { id: 'shared', label: 'Shared', icon: Users },
            { id: 'trash', label: 'Trash', icon: Trash2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeNav === tab.id && !activeFolder;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveNav(tab.id as any);
                  setActiveFolder(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#0d99ff] text-[#002f55] font-semibold'
                    : 'bg-[#201f1f] text-[#bfc7d5] hover:text-[#e5e2e1]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {(!activeFolder) && (
          <>
            {/* Files Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-[#e5e2e1]">
                  {activeNav === 'all' ? 'All Designs' : activeNav === 'trash' ? 'Deleted Files' : activeNav === 'shared' ? 'Shared Files' : 'Recent Files'}
                </h2>
                <button
                  onClick={() => setActiveNav('all')}
                  className="text-xs text-[#9fcaff] hover:underline"
                >
                  {displayedFiles.length} {displayedFiles.length === 1 ? 'project' : 'projects'}
                </button>
              </div>

              {displayedFiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedFiles.map((file) => (
                    <div
                      key={file.id}
                      id={`recent-file-card-${file.id}`}
                      className="bg-[#1c1b1b] rounded-xl border border-[#353534] overflow-hidden group hover:border-[#9fcaff] transition-all shadow-sm relative"
                    >
                      {/* Visual Thumbnail */}
                      <div 
                        id={`card-thumb-${file.id}`}
                        className="h-40 bg-[#201f1f] flex items-center justify-center relative overflow-hidden p-4 cursor-pointer"
                        onClick={() => {
                          if (activeNav !== 'trash') onOpenFile(file);
                        }}
                      >
                        <div className="w-full h-full bg-[#131313] rounded-lg shadow-lg flex items-center justify-center text-[#bfc7d5] font-medium text-xs border border-[#353534] group-hover:scale-102 transition-transform relative overflow-hidden">
                          {file.elements ? (
                            <MiniCanvasPreview elements={file.elements} previewType={file.previewType} />
                          ) : (
                            <>
                              {file.previewType === 'desktop' && (
                                <div className="text-center p-2">
                                  <div className="text-xs font-bold text-[#e5e2e1] mb-1">{file.title}</div>
                                  <div className="text-[10px] text-[#89919e]">1440 × 900 • Desktop Canvas</div>
                                </div>
                              )}
                              {file.previewType === 'mobile' && (
                                <div className="text-center p-2">
                                  <Smartphone className="w-6 h-6 text-[#9fcaff] mx-auto mb-1" />
                                  <div className="text-xs font-bold text-[#e5e2e1] mb-1">{file.title}</div>
                                  <div className="text-[10px] text-[#89919e]">390 × 844 • Mobile Screen</div>
                                </div>
                              )}
                              {file.previewType === 'components' && (
                                <div className="text-center p-2">
                                  <div className="flex gap-1.5 justify-center mb-1.5">
                                    <span className="w-3 h-3 bg-[#9fcaff] rounded-sm inline-block"></span>
                                    <span className="w-3 h-3 bg-[#d2bbff] rounded-sm inline-block"></span>
                                    <span className="w-3 h-3 bg-[#c8c6c5] rounded-sm inline-block"></span>
                                  </div>
                                  <div className="text-xs font-bold text-[#e5e2e1] mb-1">{file.title}</div>
                                  <div className="text-[10px] text-[#89919e]">Component Library</div>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Hover Overlay: Go to Project Button */}
                        {activeNav !== 'trash' && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none group-hover:pointer-events-auto z-10">
                            <button
                              id={`btn-card-go-to-project-${file.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenFile(file);
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-[#0d99ff] hover:bg-[#0b85e0] text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105 cursor-pointer"
                              title={`Open ${file.title} in Editor`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Go to Project</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Card Info */}
                      <div className="p-4 flex items-center justify-between bg-[#1c1b1b] relative">
                        <div 
                          id={`card-info-${file.id}`}
                          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                          onClick={() => {
                            if (activeNav !== 'trash') onOpenFile(file);
                          }}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            file.previewType === 'mobile' 
                              ? 'bg-[#d2bbff]/10 text-[#d2bbff]' 
                              : file.previewType === 'components'
                              ? 'bg-[#34d399]/10 text-[#34d399]'
                              : 'bg-[#0d99ff]/10 text-[#0d99ff]'
                          }`}>
                            {file.previewType === 'mobile' ? (
                              <Smartphone className="w-4 h-4" />
                            ) : file.previewType === 'components' ? (
                              <LayoutTemplate className="w-4 h-4" />
                            ) : (
                              <Monitor className="w-4 h-4" />
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <h3 className="text-sm font-medium text-[#e5e2e1] truncate group-hover:text-[#9fcaff] transition-colors">{file.title}</h3>
                            <p className="text-[11px] text-[#89919e] truncate mt-0.5">
                              Edited {file.lastEdited}
                            </p>
                          </div>
                        </div>

                        {/* More Menu */}
                        <div className="relative" ref={openMenuId === file.id ? menuRef : null}>
                          <button
                            id={`btn-menu-${file.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === file.id ? null : file.id);
                            }}
                            className="p-1.5 text-[#bfc7d5] hover:text-[#e5e2e1] rounded hover:bg-[#2a2a2a] transition-colors"
                            title="File Options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openMenuId === file.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 bottom-full mb-1 w-44 bg-[#201f1f] border border-[#353534] rounded-lg shadow-2xl py-1 z-50 text-xs text-[#e5e2e1]"
                            >
                              {activeNav !== 'trash' && (
                                <button
                                  id={`btn-dropdown-go-project-${file.id}`}
                                  onClick={() => {
                                    onOpenFile(file);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#2a2a2a] text-[#9fcaff] font-medium"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" /> Go to Project
                                </button>
                              )}
                              
                              {activeNav !== 'trash' && onDuplicateFile && (
                                <button
                                  onClick={() => {
                                    onDuplicateFile(file.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#2a2a2a]"
                                >
                                  <Copy className="w-3.5 h-3.5 text-[#d2bbff]" /> Duplicate Project
                                </button>
                              )}

                              {activeNav === 'trash' && onRestoreFile && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRestoreFile(file.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#2a2a2a] text-[#34d399]"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" /> Restore Project
                                </button>
                              )}

                              {onDeleteFile && activeNav !== 'trash' && (
                                <button
                                  onClick={() => {
                                    onDeleteFile(file.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#2a2a2a] text-[#ffb4ab]"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Move to Trash
                                </button>
                              )}

                              {onPermanentDeleteFile && activeNav === 'trash' && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onPermanentDeleteFile(file.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#2a2a2a] text-[#ffb4ab]"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete Forever
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-[#1c1b1b] rounded-xl border border-[#353534] border-dashed">
                  {activeNav === 'trash' ? (
                    <>
                      <Trash2 className="w-12 h-12 text-[#353534] mb-4" />
                      <h3 className="text-[#e5e2e1] font-medium text-sm mb-1">Trash is empty</h3>
                      <p className="text-[#89919e] text-xs">Deleted files will be kept here for 30 days.</p>
                    </>
                  ) : activeNav === 'shared' ? (
                    <>
                      <Users className="w-12 h-12 text-[#353534] mb-4" />
                      <h3 className="text-[#e5e2e1] font-medium text-sm mb-1">No shared files</h3>
                      <p className="text-[#89919e] text-xs">Files shared with you will appear here.</p>
                    </>
                  ) : (
                    <>
                      <Folder className="w-12 h-12 text-[#353534] mb-4" />
                      <h3 className="text-[#e5e2e1] font-medium text-sm mb-1">No files found</h3>
                      <p className="text-[#89919e] text-xs">Create a new design to get started.</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Templates & Community Grid */}
            {activeNav === 'all' && (
              <div className="space-y-4 mt-8 pt-8 border-t border-[#353534]">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-[#e5e2e1]">Templates & Starter Kits</h2>
                  <span className="text-xs text-[#89919e]">Click any template to start</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      id={`template-card-${tpl.id}`}
                      onClick={() => onSelectTemplate(tpl)}
                      className={`bg-[#1c1b1b] rounded-xl border border-[#353534] overflow-hidden group cursor-pointer transition-all p-4 space-y-3 ${
                        tpl.colorVariant === 'secondary'
                          ? 'hover:border-[#d2bbff]'
                          : tpl.colorVariant === 'primary'
                          ? 'hover:border-[#9fcaff]'
                          : 'hover:border-[#c8c6c5]'
                      }`}
                    >
                      <div
                        className={`h-32 rounded-lg flex items-center justify-center transition-transform group-hover:scale-102 ${
                          tpl.colorVariant === 'secondary'
                            ? 'bg-[#6001d1]/20 text-[#d2bbff]'
                            : tpl.colorVariant === 'primary'
                            ? 'bg-[#0d99ff]/20 text-[#9fcaff]'
                            : 'bg-[#969594]/20 text-[#c8c6c5]'
                        }`}
                      >
                        {tpl.icon === 'dashboard' && <LayoutDashboard className="w-8 h-8" />}
                        {tpl.icon === 'phone_iphone' && <Smartphone className="w-8 h-8" />}
                        {tpl.icon === 'shopping_cart' && <ShoppingCart className="w-8 h-8" />}
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-[#e5e2e1] group-hover:text-[#9fcaff] transition-colors">
                          {tpl.title}
                        </h3>
                        <p className="text-[11px] text-[#bfc7d5] mt-1 leading-relaxed">
                          {tpl.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeFolder && (
          <div className="flex flex-col items-center justify-center h-64 bg-[#1c1b1b] rounded-xl border border-[#353534] border-dashed">
            <FolderOpen className="w-12 h-12 text-[#353534] mb-4" />
            <h3 className="text-[#e5e2e1] font-medium text-sm mb-1">Folder: {activeFolder}</h3>
            <p className="text-[#89919e] text-xs">This folder is currently empty.</p>
          </div>
        )}
      </main>
    </div>
  );
};
