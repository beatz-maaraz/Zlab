import React, { useState } from 'react';
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
  Sparkles,
  FileCode,
} from 'lucide-react';
import { ProjectFile, TemplateItem } from '../types';

interface DashboardViewProps {
  recentFiles: ProjectFile[];
  templates: TemplateItem[];
  onOpenFile: (file: ProjectFile) => void;
  onNewDesign: () => void;
  onSelectTemplate: (template: TemplateItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  recentFiles,
  templates,
  onOpenFile,
  onNewDesign,
  onSelectTemplate,
}) => {
  const [activeNav, setActiveNav] = useState<'all' | 'recents' | 'shared' | 'trash'>('all');
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [importNotification, setImportNotification] = useState(false);

  const handleImport = () => {
    setImportNotification(true);
    setTimeout(() => {
      setImportNotification(false);
      onNewDesign();
    }, 1200);
  };

  return (
    <div
      id="dashboard-file-browser"
      className="flex flex-1 relative overflow-hidden bg-[#131313] min-h-[calc(100vh-4rem)] pt-16 select-none"
    >
      {/* Left Navigation in Dashboard */}
      <aside
        id="dashboard-sidebar-nav"
        className="w-64 bg-[#1c1b1b] border-r border-[#353534] flex flex-col p-4 space-y-6 z-20"
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
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Header Greeting & Actions */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-[#e5e2e1]">
              Good afternoon, Creator
            </h1>
            <p className="text-xs text-[#bfc7d5]">
              Pick up where you left off or start something entirely new.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-dashboard-new-design"
              onClick={onNewDesign}
              className="bg-[#9fcaff] text-[#003259] px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-[#0d99ff] hover:text-[#002f55] transition-all shadow-lg shadow-[#9fcaff]/20 hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>New design</span>
            </button>

            <button
              id="btn-dashboard-import"
              onClick={handleImport}
              className="bg-[#201f1f] hover:bg-[#2a2a2a] text-[#e5e2e1] px-4 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2 border border-[#353534] transition-colors"
            >
              <Upload className="w-4 h-4 text-[#9fcaff]" />
              <span>{importNotification ? 'Importing...' : 'Import'}</span>
            </button>
          </div>
        </div>

        {/* Recent Files Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#e5e2e1]">Recent Files</h2>
            <button
              onClick={() => setActiveNav('recents')}
              className="text-xs text-[#9fcaff] hover:underline"
            >
              View all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentFiles.map((file) => (
              <div
                key={file.id}
                id={`recent-file-card-${file.id}`}
                onClick={() => onOpenFile(file)}
                className="bg-[#1c1b1b] rounded-xl border border-[#353534] overflow-hidden group cursor-pointer hover:border-[#9fcaff] transition-all shadow-sm"
              >
                {/* Visual Thumbnail */}
                <div className="h-40 bg-[#201f1f] flex items-center justify-center relative overflow-hidden p-4">
                  <div className="w-full h-full bg-[#131313] rounded-lg shadow-lg flex items-center justify-center text-[#bfc7d5] font-medium text-xs border border-[#353534] group-hover:scale-102 transition-transform">
                    {file.previewType === 'desktop' && (
                      <div className="text-center p-2">
                        <div className="text-xs font-bold text-[#e5e2e1] mb-1">{file.title}</div>
                        <div className="text-[10px] text-[#89919e]">1440 x 900 • Web Artboard</div>
                      </div>
                    )}
                    {file.previewType === 'mobile' && (
                      <div className="text-center p-2">
                        <Smartphone className="w-6 h-6 text-[#9fcaff] mx-auto mb-1" />
                        <div className="text-[10px] text-[#e5e2e1]">{file.title}</div>
                      </div>
                    )}
                    {file.previewType === 'components' && (
                      <div className="text-center p-2">
                        <div className="flex gap-1 justify-center mb-1">
                          <span className="w-3 h-3 bg-[#9fcaff] rounded-sm inline-block"></span>
                          <span className="w-3 h-3 bg-[#d2bbff] rounded-sm inline-block"></span>
                          <span className="w-3 h-3 bg-[#c8c6c5] rounded-sm inline-block"></span>
                        </div>
                        <div className="text-[10px] text-[#e5e2e1]">{file.title}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-4 flex items-center justify-between bg-[#1c1b1b]">
                  <div>
                    <h3 className="text-xs font-semibold text-[#e5e2e1] group-hover:text-[#9fcaff] transition-colors">
                      {file.title}
                    </h3>
                    <p className="text-[11px] text-[#bfc7d5] mt-0.5">{file.lastEdited}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenFile(file);
                    }}
                    className="p-1.5 text-[#bfc7d5] hover:text-[#e5e2e1] rounded hover:bg-[#2a2a2a] transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Templates & Community Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#e5e2e1]">Templates & Community</h2>
            <button className="text-xs text-[#9fcaff] hover:underline">
              Explore community
            </button>
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
                  <h3 className="text-xs font-semibold text-[#e5e2e1]">{tpl.title}</h3>
                  <p className="text-[11px] text-[#bfc7d5] mt-1 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
