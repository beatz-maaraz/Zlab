import React, { useState, useEffect } from 'react';
import { X, Layout, Code2, Globe, Laptop, Smartphone, FileText, Check } from 'lucide-react';
import { Project } from '../types';

interface NewDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: Partial<Project>) => void;
}

const PROJECT_TYPES = [
  'Website', 'Mobile App', 'Desktop App', 'AI/Automation', 'UI/UX', 'Dashboard', 'Other'
];

const TECH_STACK_OPTIONS = [
  'Flutter', 'React', 'Node.js', 'MongoDB', 'Firebase', 'Python', 'Next.js', 'Tailwind', 'Vue', 'Swift'
];

const PROJECT_STATUSES = [
  'Planning', 'In Development', 'Testing', 'Completed'
];

export const NewDesignModal: React.FC<NewDesignModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [projectType, setProjectType] = useState('Website');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [projectStatus, setProjectStatus] = useState('Planning');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setProjectType('Website');
      setDescription('');
      setTechStack([]);
      setProjectStatus('Planning');
      setGithubUrl('');
      setLiveDemoUrl('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      projectType,
      description: description.trim(),
      techStack,
      projectStatus,
      githubUrl: githubUrl.trim(),
      liveDemoUrl: liveDemoUrl.trim(),
    });
  };

  const toggleTech = (tech: string) => {
    setTechStack(prev => 
      prev.includes(tech) 
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-[600px] max-h-[90vh] bg-[#0e0e0e] rounded-xl border border-[#353534] shadow-2xl flex flex-col overflow-hidden text-sm text-[#e5e2e1]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#353534] bg-[#1c1b1b]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6001d1]/20 flex items-center justify-center text-[#c9aeff]">
              <Layout className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold">Create New Project</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#bfc7d5] hover:text-[#e5e2e1] rounded-lg hover:bg-[#2a2a2a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="new-design-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Project Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#89919e] uppercase tracking-wider flex items-center gap-1">
                Project Name <span className="text-[#ffb4ab]">*</span>
              </label>
              <input
                autoFocus
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. E-commerce Dashboard"
                className="w-full bg-[#1c1b1b] border border-[#353534] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#9fcaff] transition-colors"
              />
            </div>

            {/* Project Type */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#89919e] uppercase tracking-wider">
                Project Type
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PROJECT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setProjectType(type)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                      projectType === type
                        ? 'bg-[#6001d1]/20 border-[#6001d1] text-[#c9aeff]'
                        : 'bg-[#1c1b1b] border-[#353534] text-[#bfc7d5] hover:bg-[#2a2a2a]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#89919e] uppercase tracking-wider">
                Description <span className="text-[10px] font-normal normal-case">(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe the project..."
                rows={3}
                className="w-full bg-[#1c1b1b] border border-[#353534] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#9fcaff] transition-colors resize-none"
              />
            </div>

            {/* Technology / Stack */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#89919e] uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" />
                Technology Stack
              </label>
              <div className="flex flex-wrap gap-2">
                {TECH_STACK_OPTIONS.map((tech) => {
                  const isSelected = techStack.includes(tech);
                  return (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => toggleTech(tech)}
                      className={`px-2.5 py-1 rounded-md text-xs transition-colors border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#0d99ff]/10 border-[#0d99ff]/40 text-[#9fcaff]'
                          : 'bg-[#1c1b1b] border-[#353534] text-[#89919e] hover:bg-[#2a2a2a]'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {tech}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status and Links */}
            <div className="grid grid-cols-2 gap-6">
              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#89919e] uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={projectStatus}
                  onChange={(e) => setProjectStatus(e.target.value)}
                  className="w-full bg-[#1c1b1b] border border-[#353534] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#9fcaff] transition-colors text-[#e5e2e1] appearance-none cursor-pointer"
                >
                  {PROJECT_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* GitHub */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#89919e] uppercase tracking-wider flex items-center gap-1">
                  GitHub URL <span className="text-[10px] font-normal normal-case">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full bg-[#1c1b1b] border border-[#353534] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#9fcaff] transition-colors"
                />
              </div>

              {/* Live Demo */}
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-semibold text-[#89919e] uppercase tracking-wider flex items-center gap-1">
                  Live Demo URL <span className="text-[10px] font-normal normal-case">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={liveDemoUrl}
                  onChange={(e) => setLiveDemoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#1c1b1b] border border-[#353534] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#9fcaff] transition-colors"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#353534] bg-[#1c1b1b]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#201f1f] text-[#e5e2e1] text-xs font-medium hover:bg-[#2a2a2a] transition-colors border border-[#353534]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="new-design-form"
            disabled={!name.trim()}
            className="px-6 py-2 rounded-lg bg-[#9fcaff] text-[#003259] text-xs font-semibold hover:bg-[#0d99ff] hover:text-[#002f55] transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Project
          </button>
        </div>
        
      </div>
    </div>
  );
};
