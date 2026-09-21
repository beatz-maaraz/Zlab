import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Layout,
  Code2,
  Check,
  CheckCircle2,
  Monitor,
  Smartphone,
  Sparkles,
  Loader2,
  ArrowRight,
} from 'lucide-react';
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
  'React', 'Next.js', 'Tailwind', 'Flutter', 'Swift', 'TypeScript', 'Node.js', 'Firebase', 'Python', 'Vue'
];

const PROJECT_STATUSES = [
  'Planning', 'In Development', 'Testing', 'Completed'
];

export const NewDesignModal: React.FC<NewDesignModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [projectType, setProjectType] = useState('Website');
  const [previewType, setPreviewType] = useState<'desktop' | 'mobile'>('desktop');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [projectStatus, setProjectStatus] = useState('Planning');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setProjectType('Website');
      setPreviewType('desktop');
      setDescription('');
      setTechStack([]);
      setProjectStatus('Planning');
      setGithubUrl('');
      setLiveDemoUrl('');
      setIsSubmitting(false);
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProjectTypeSelect = (type: string) => {
    setProjectType(type);
    if (type === 'Mobile App') {
      setPreviewType('mobile');
    } else if (type === 'Website' || type === 'Desktop App' || type === 'Dashboard') {
      setPreviewType('desktop');
    }
  };

  const handleFinalSubmit = () => {
    onSubmit({
      name: name.trim(),
      projectType,
      previewType,
      description: description.trim(),
      techStack,
      projectStatus,
      githubUrl: githubUrl.trim(),
      liveDemoUrl: liveDemoUrl.trim(),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting || isSuccess) return;

    setIsSubmitting(true);
    // Smooth transition into success confirmation state
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Auto-launch canvas workspace after brief celebratory feedback
      setTimeout(() => {
        handleFinalSubmit();
      }, 750);
    }, 380);
  };

  const toggleTech = (tech: string) => {
    setTechStack(prev =>
      prev.includes(tech)
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm select-none p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[580px] max-h-[90vh] bg-[#0e0e0e] rounded-2xl border border-[#353534] shadow-2xl flex flex-col overflow-hidden text-sm text-[#e5e2e1] transform-gpu"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#353534] bg-[#181818]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0d99ff] to-[#6001d1] flex items-center justify-center text-white shadow-md shadow-[#0d99ff]/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Create New Design</h2>
              <p className="text-[11px] text-[#89919e]">Set up your design project and target canvas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting || isSuccess}
            className="p-1.5 text-[#bfc7d5] hover:text-[#e5e2e1] rounded-lg hover:bg-[#2a2a2a] transition-colors cursor-pointer disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 relative">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              /* Success Screen */
              <motion.div
                key="create-design-success"
                initial={{ opacity: 0, scale: 0.92, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="py-10 px-4 text-center flex flex-col items-center justify-center transform-gpu"
              >
                {/* Pulsing Success Badge */}
                <div className="relative w-20 h-20 mb-5 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.4, 1.7], opacity: [0.4, 0.15, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 rounded-full bg-emerald-500/20 transform-gpu"
                  />
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/10 relative z-10">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-1.5">Design Created Successfully!</h3>
                <p className="text-xs text-[#89919e] max-w-xs mb-6">
                  Workspace configured and ready. Initializing design canvas...
                </p>

                {/* Summary Card */}
                <div className="w-full max-w-sm bg-[#181818] border border-[#353534] rounded-xl p-4 mb-6 text-left space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#89919e]">Design Title</span>
                    <span className="text-xs font-semibold text-[#e5e2e1]">{name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#89919e]">Canvas Size</span>
                    <span className="text-xs font-mono text-[#9fcaff] px-2 py-0.5 rounded bg-[#0d99ff]/10 border border-[#0d99ff]/25">
                      {previewType === 'mobile' ? 'Mobile • 390 × 844' : 'Desktop • 1440 × 900'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#89919e]">Category</span>
                    <span className="text-xs text-[#bfc7d5]">{projectType}</span>
                  </div>
                </div>

                {/* Auto Progress Bar */}
                <div className="w-full max-w-sm h-1.5 bg-[#201f1f] rounded-full overflow-hidden mb-4">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-[#0d99ff]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#0d99ff] hover:bg-[#3fb1ff] text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
                >
                  <span>Open Canvas Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ) : (
              /* Design Creation Form */
              <form id="new-design-form" onSubmit={handleSubmit} className="space-y-5">
                {/* Design Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#89919e] uppercase tracking-wider flex items-center gap-1">
                    Design Name <span className="text-[#ffb4ab]">*</span>
                  </label>
                  <input
                    autoFocus
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Analytics Platform v2"
                    className="w-full bg-[#1c1b1b] border border-[#353534] rounded-lg px-3 py-2.5 text-sm text-[#e5e2e1] outline-none focus:border-[#0d99ff] transition-colors placeholder-[#4a4a4a]"
                  />
                </div>

                {/* Canvas Target Layout */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#89919e] uppercase tracking-wider">
                    Target Canvas Format
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPreviewType('desktop')}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                        previewType === 'desktop'
                          ? 'bg-[#0d99ff]/10 border-[#0d99ff] text-white'
                          : 'bg-[#181818] border-[#353534] text-[#89919e] hover:border-[#4a4a4a]'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${previewType === 'desktop' ? 'bg-[#0d99ff] text-white' : 'bg-[#252525] text-[#bfc7d5]'}`}>
                        <Monitor className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold">Desktop Web</div>
                        <div className="text-[10px] text-[#89919e] font-mono">1440 × 900 px</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreviewType('mobile')}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                        previewType === 'mobile'
                          ? 'bg-[#0d99ff]/10 border-[#0d99ff] text-white'
                          : 'bg-[#181818] border-[#353534] text-[#89919e] hover:border-[#4a4a4a]'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${previewType === 'mobile' ? 'bg-[#0d99ff] text-white' : 'bg-[#252525] text-[#bfc7d5]'}`}>
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold">Mobile Screen</div>
                        <div className="text-[10px] text-[#89919e] font-mono">390 × 844 px</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Project Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#89919e] uppercase tracking-wider">
                    Design Category
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {PROJECT_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleProjectTypeSelect(type)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border cursor-pointer ${
                          projectType === type
                            ? 'bg-[#6001d1]/20 border-[#6001d1] text-[#c9aeff]'
                            : 'bg-[#181818] border-[#353534] text-[#bfc7d5] hover:bg-[#252525]'
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
                    placeholder="Brief overview or requirements..."
                    rows={2}
                    className="w-full bg-[#1c1b1b] border border-[#353534] rounded-lg px-3 py-2 text-sm text-[#e5e2e1] outline-none focus:border-[#0d99ff] transition-colors resize-none placeholder-[#4a4a4a]"
                  />
                </div>

                {/* Technology / Stack */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#89919e] uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-[#0d99ff]" />
                    Design Tags & Framework
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {TECH_STACK_OPTIONS.map((tech) => {
                      const isSelected = techStack.includes(tech);
                      return (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => toggleTech(tech)}
                          className={`px-2.5 py-1 rounded-md text-xs transition-colors border flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-[#0d99ff]/15 border-[#0d99ff]/40 text-[#9fcaff]'
                              : 'bg-[#181818] border-[#353534] text-[#89919e] hover:bg-[#252525]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-[#0d99ff]" />}
                          {tech}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status and Links */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#89919e] uppercase tracking-wider">
                      Design Stage
                    </label>
                    <select
                      value={projectStatus}
                      onChange={(e) => setProjectStatus(e.target.value)}
                      className="w-full bg-[#1c1b1b] border border-[#353534] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d99ff] transition-colors text-[#e5e2e1] cursor-pointer"
                    >
                      {PROJECT_STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#89919e] uppercase tracking-wider flex items-center gap-1">
                      Repository URL <span className="text-[10px] font-normal normal-case">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full bg-[#1c1b1b] border border-[#353534] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d99ff] transition-colors placeholder-[#4a4a4a]"
                    />
                  </div>
                </div>
              </form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer (only in form state) */}
        {!isSuccess && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#353534] bg-[#181818]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-[#201f1f] text-[#e5e2e1] text-xs font-medium hover:bg-[#2a2a2a] transition-colors border border-[#353534] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="new-design-form"
              disabled={!name.trim() || isSubmitting}
              className="px-6 py-2 rounded-lg bg-[#0d99ff] text-white text-xs font-semibold hover:bg-[#3fb1ff] transition-colors shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating Design...</span>
                </>
              ) : (
                <>
                  <span>Create Design</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
