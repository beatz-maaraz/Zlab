import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Check,
  ShieldAlert,
  Zap,
  CreditCard,
  Users,
  Puzzle,
  Keyboard,
  Palette,
  User,
  Sliders,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  Key,
  LogOut,
} from 'lucide-react';
import { SettingsTab, UserSettings } from '../types';
import { ALL_COMMANDS } from './ShortcutsModal';
import { useRouter } from '../routes';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab?: SettingsTab;
  setActiveTab?: (tab: SettingsTab) => void;
  initialTab?: SettingsTab;
  settings: UserSettings;
  setSettings?: (newSettings: UserSettings) => void;
  onSaveSettings?: (newSettings: UserSettings) => void;
  onOpenShortcutsOverlay?: () => void;
  onExecuteAction?: (actionId: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  activeTab: activeTabProp,
  setActiveTab: setActiveTabProp,
  initialTab = 'general',
  settings,
  setSettings,
  onSaveSettings,
  onOpenShortcutsOverlay,
  onExecuteAction,
}) => {
  const { navigate } = useRouter();
  const { setAuthenticated } = useUIStore();
  const { signOut, deleteAccount, reauthenticateWithGoogleAndDelete, user } = useAuthStore();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [reauthPassword, setReauthPassword] = useState('');
  const [showReauthPassword, setShowReauthPassword] = useState(false);
  const [needsReauth, setNeedsReauth] = useState(false);

  const isGoogleUser = Boolean(user?.providerData?.some((p) => p.providerId === 'google.com'));

  const handleSignOut = async () => {
    onClose();
    await signOut();
    navigate({ type: 'login' });
  };

  const handleDeleteAccount = async (passwordOverride?: string) => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm account deletion.');
      return;
    }

    setIsDeletingAccount(true);
    setDeleteError(null);
    try {
      await deleteAccount(passwordOverride || (reauthPassword ? reauthPassword : undefined));
      setIsDeletingAccount(false);
      setShowDeleteConfirm(false);
      onClose();
      navigate({ type: 'login' });
    } catch (err: any) {
      setIsDeletingAccount(false);
      const msg = err.message || 'Failed to delete account. Please try again.';
      setDeleteError(msg);
      if (
        msg.toLowerCase().includes('recent authentication') ||
        msg.toLowerCase().includes('requires-recent-login')
      ) {
        setNeedsReauth(true);
      }
    }
  };

  const handleGoogleReauthAndDelete = async () => {
    setIsDeletingAccount(true);
    setDeleteError(null);
    try {
      await reauthenticateWithGoogleAndDelete();
      setIsDeletingAccount(false);
      setShowDeleteConfirm(false);
      onClose();
      navigate({ type: 'login' });
    } catch (err: any) {
      setIsDeletingAccount(false);
      setDeleteError(err.message || 'Failed to re-authenticate with Google.');
    }
  };

  const [internalActiveTab, setInternalActiveTab] = useState<SettingsTab>(
    activeTabProp || initialTab
  );
  const activeTab = activeTabProp || internalActiveTab;
  const [shortcutCategory, setShortcutCategory] = useState<string>('All');

  const handleSelectTab = (tab: SettingsTab) => {
    setInternalActiveTab(tab);
    if (setActiveTabProp) {
      setActiveTabProp(tab);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [savedNotification, setSavedNotification] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(settings);
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
      setDeleteError(null);
      if (activeTabProp) {
        setInternalActiveTab(activeTabProp);
      }
    }
  }, [isOpen, settings, activeTabProp]);

  if (!isOpen) return null;

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(settings);

  const handleSave = () => {
    if (onSaveSettings) onSaveSettings(formData);
    if (setSettings) setSettings(formData);
    setSavedNotification(true);
    setTimeout(() => {
      setSavedNotification(false);
      onClose();
    }, 600);
  };

  return (
    <div
      id="modal-settings-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md select-none animate-in fade-in duration-150 p-3 sm:p-4"
    >
      <div
        id="modal-settings-container"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl h-[92vh] md:h-[580px] bg-[#0e0e0e] rounded-xl border border-[#353534] shadow-2xl flex flex-col md:flex-row overflow-hidden text-xs text-[#e5e2e1]"
      >
        {/* Left Modal Sidebar */}
        <div className="w-full md:w-56 bg-[#1c1b1b] border-b md:border-b-0 md:border-r border-[#353534] flex flex-col p-3 md:p-4 shrink-0">
          <div className="flex items-center justify-between md:mb-4">
            <div className="text-sm font-semibold text-[#e5e2e1]">Settings</div>
            <button
              onClick={onClose}
              className="md:hidden p-1 text-[#bfc7d5] hover:text-[#e5e2e1] rounded-lg hover:bg-[#2a2a2a] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <nav className="flex flex-row md:flex-col gap-1 md:space-y-1 overflow-x-auto md:overflow-x-visible no-scrollbar pt-2 md:pt-0">
            <button
              id="settings-nav-general"
              onClick={() => handleSelectTab('general')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors whitespace-nowrap ${
                activeTab === 'general'
                  ? 'bg-[#6001d1] text-[#c9aeff] font-medium'
                  : 'text-[#bfc7d5] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>General</span>
            </button>

            <button
              id="settings-nav-account"
              onClick={() => handleSelectTab('account')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors whitespace-nowrap ${
                activeTab === 'account'
                  ? 'bg-[#6001d1] text-[#c9aeff] font-medium'
                  : 'text-[#bfc7d5] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Account</span>
            </button>

            <button
              id="settings-nav-appearance"
              onClick={() => handleSelectTab('appearance')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors whitespace-nowrap ${
                activeTab === 'appearance'
                  ? 'bg-[#6001d1] text-[#c9aeff] font-medium'
                  : 'text-[#bfc7d5] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Appearance</span>
            </button>

            <button
              id="settings-nav-shortcuts"
              onClick={() => handleSelectTab('shortcuts')}
              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left transition-colors whitespace-nowrap ${
                activeTab === 'shortcuts'
                  ? 'bg-[#6001d1] text-[#c9aeff] font-medium'
                  : 'text-[#bfc7d5] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Keyboard className="w-3.5 h-3.5" />
                <span>Shortcuts</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2a2a2a] text-[#89919e] font-mono hidden md:inline-block">
                {ALL_COMMANDS.length}
              </span>
            </button>

            <button
              id="settings-nav-plugins"
              onClick={() => handleSelectTab('plugins')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors whitespace-nowrap ${
                activeTab === 'plugins'
                  ? 'bg-[#6001d1] text-[#c9aeff] font-medium'
                  : 'text-[#bfc7d5] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]'
              }`}
            >
              <Puzzle className="w-3.5 h-3.5" />
              <span>Plugins</span>
            </button>

            <button
              id="settings-nav-team"
              onClick={() => handleSelectTab('team')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors whitespace-nowrap ${
                activeTab === 'team'
                  ? 'bg-[#6001d1] text-[#c9aeff] font-medium'
                  : 'text-[#bfc7d5] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Team</span>
            </button>

            <button
              id="settings-nav-billing"
              onClick={() => handleSelectTab('billing')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors whitespace-nowrap ${
                activeTab === 'billing'
                  ? 'bg-[#6001d1] text-[#c9aeff] font-medium'
                  : 'text-[#bfc7d5] hover:bg-[#2a2a2a] hover:text-[#e5e2e1]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Billing</span>
            </button>
          </nav>
        </div>

        {/* Right Content Pane */}
        <div className="flex-1 flex flex-col bg-[#1c1b1b] min-h-0">
          {/* Top Search & Close Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#353534] gap-2">
            <div className="flex items-center gap-2 bg-[#201f1f] px-3 py-1.5 rounded-lg flex-1 max-w-xs border border-[#353534]/50">
              <Search className="w-3.5 h-3.5 text-[#89919e]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search settings..."
                className="bg-transparent border-none outline-none text-xs text-[#e5e2e1] w-full placeholder:text-[#89919e]"
              />
            </div>
            <button
              id="btn-close-settings-modal"
              onClick={onClose}
              className="hidden md:flex p-1 text-[#bfc7d5] hover:text-[#e5e2e1] rounded-lg hover:bg-[#2a2a2a] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content by Tab */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* GENERAL TAB (matches Image 7) */}
            {activeTab === 'general' && (
              <>
                {/* Theme Preference */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-[#89919e] uppercase tracking-wider block">
                    Theme Preference
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setFormData({ ...formData, theme: 'dark' })}
                      className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                        formData.theme === 'dark'
                          ? 'bg-[#6001d1] text-[#c9aeff]'
                          : 'bg-[#201f1f] text-[#e5e2e1] hover:bg-[#2a2a2a]'
                      }`}
                    >
                      Dark
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, theme: 'light' })}
                      className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                        formData.theme === 'light'
                          ? 'bg-[#6001d1] text-[#c9aeff]'
                          : 'bg-[#201f1f] text-[#e5e2e1] hover:bg-[#2a2a2a]'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, theme: 'system' })}
                      className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                        formData.theme === 'system'
                          ? 'bg-[#6001d1] text-[#c9aeff]'
                          : 'bg-[#201f1f] text-[#e5e2e1] hover:bg-[#2a2a2a]'
                      }`}
                    >
                      System
                    </button>
                  </div>
                </div>

                {/* Language & Region */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-[#89919e] uppercase tracking-wider block">
                    Language & Region
                  </label>
                  <div className="flex items-center justify-between bg-[#201f1f] p-3 rounded-lg border border-[#353534]/50">
                    <span className="text-xs text-[#e5e2e1]">Display Language</span>
                    <span className="text-xs text-[#d2bbff] font-mono">{formData.language}</span>
                  </div>
                </div>

                {/* Canvas Performance */}
                <div className="space-y-3">
                  <label className="text-[10px] font-semibold text-[#89919e] uppercase tracking-wider block">
                    Canvas Performance
                  </label>
                  <div className="flex items-center justify-between bg-[#201f1f] p-3 rounded-lg border border-[#353534]/50">
                    <div className="space-y-0.5">
                      <div className="text-xs text-[#e5e2e1] font-medium">Hardware Acceleration</div>
                      <div className="text-[11px] text-[#bfc7d5]">Use WebGPU rendering pipeline</div>
                    </div>
                    {/* Toggle Switch */}
                    <div
                      onClick={() =>
                        setFormData({
                          ...formData,
                          hardwareAcceleration: !formData.hardwareAcceleration,
                        })
                      }
                      className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${
                        formData.hardwareAcceleration ? 'bg-[#9fcaff]' : 'bg-[#353534]'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                          formData.hardwareAcceleration
                            ? 'right-0.5 bg-[#003259]'
                            : 'left-0.5 bg-[#89919e]'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Auto-save Interval */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-[#89919e] uppercase tracking-wider block">
                    Auto-save Interval
                  </label>
                  <div className="bg-[#201f1f] p-3 rounded-lg space-y-2.5 border border-[#353534]/50">
                    <div className="flex justify-between text-xs text-[#e5e2e1]">
                      <span>Every {formData.autoSaveInterval} seconds</span>
                      <span className="font-mono text-[#d2bbff]">{formData.autoSaveInterval}s</span>
                    </div>
                    {/* Slider input */}
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      value={formData.autoSaveInterval}
                      onChange={(e) =>
                        setFormData({ ...formData, autoSaveInterval: Number(e.target.value) })
                      }
                      className="w-full accent-[#9fcaff] cursor-pointer h-1.5 bg-[#353534] rounded-lg"
                    />
                  </div>
                </div>
              </>
            )}

            {/* ACCOUNT TAB (matches Image 5) */}
            {activeTab === 'account' && (
              <>
                {/* Profile Information */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-[#89919e] uppercase tracking-wider block">
                    Profile Information
                  </label>
                  <div className="flex items-center gap-4 bg-[#201f1f] p-4 rounded-lg border border-[#353534]/50">
                    <div className="w-12 h-12 rounded-full bg-[#9fcaff] text-[#003259] font-bold flex items-center justify-center text-sm shadow-md">
                      {formData.avatarText}
                    </div>
                    <div>
                      <div className="text-xs text-[#e5e2e1] font-medium">{formData.fullName}</div>
                      <div className="text-[11px] text-[#bfc7d5]">{formData.email}</div>
                    </div>
                    <button className="ml-auto px-3 py-1.5 rounded-lg bg-[#2a2a2a] text-[#e5e2e1] text-xs hover:bg-[#353534] transition-colors border border-[#353534]">
                      Change Avatar
                    </button>
                  </div>
                </div>

                {/* Account Details */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-[#89919e] uppercase tracking-wider block">
                    Account Details
                  </label>
                  <div className="space-y-3 bg-[#201f1f] p-4 rounded-lg border border-[#353534]/50">
                    <div>
                      <label className="text-[11px] text-[#bfc7d5] mb-1 block">Full Name</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full bg-[#2a2a2a] border border-[#353534] rounded px-3 py-2 text-xs text-[#e5e2e1] outline-none focus:border-[#9fcaff]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#bfc7d5] mb-1 block">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-[#2a2a2a] border border-[#353534] rounded px-3 py-2 text-xs text-[#e5e2e1] outline-none focus:border-[#9fcaff]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-[#bfc7d5] mb-1 block">Username</label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="w-full bg-[#2a2a2a] border border-[#353534] rounded px-3 py-2 text-xs text-[#e5e2e1] outline-none focus:border-[#9fcaff]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#bfc7d5] mb-1 block">Role</label>
                        <input
                          type="text"
                          value={formData.role || ''}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full bg-[#2a2a2a] border border-[#353534] rounded px-3 py-2 text-xs text-[#e5e2e1] outline-none focus:border-[#9fcaff]"
                          placeholder="e.g. Designer"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-[#bfc7d5] mb-1 block">Company</label>
                      <input
                        type="text"
                        value={formData.company || ''}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full bg-[#2a2a2a] border border-[#353534] rounded px-3 py-2 text-xs text-[#e5e2e1] outline-none focus:border-[#9fcaff]"
                        placeholder="Company name"
                      />
                    </div>
                  </div>
                </div>

                {/* Subscription / Plan */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-[#89919e] uppercase tracking-wider block">
                    Subscription / Plan
                  </label>
                  <div className="flex items-center justify-between bg-[#201f1f] p-4 rounded-lg border border-[#353534]/50">
                    <div>
                      <div className="text-xs text-[#e5e2e1] font-medium flex items-center gap-2">
                        <span>{formData.plan}</span>
                        <span className="px-2 py-0.5 rounded bg-[#0d99ff] text-[#002f55] text-[10px] font-semibold">
                          Active
                        </span>
                      </div>
                      <div className="text-[11px] text-[#bfc7d5] mt-0.5">
                        Renews on {formData.planRenewal}
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-[#2a2a2a] text-[#e5e2e1] text-xs hover:bg-[#353534] transition-colors border border-[#353534]">
                      Manage Billing
                    </button>
                  </div>
                </div>

                {/* Session Management */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-[#89919e] uppercase tracking-wider block">
                    Session
                  </label>
                  <div className="flex items-center justify-between bg-[#201f1f] p-4 rounded-lg border border-[#353534]/50">
                    <div className="text-xs text-[#e5e2e1]">
                      Sign out of your current session on this device.
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="px-3 py-1.5 rounded-lg bg-[#2a2a2a] text-[#e5e2e1] text-xs font-medium hover:bg-[#353534] transition-colors border border-[#353534]"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-[#ffb4ab] uppercase tracking-wider block">
                    Danger Zone
                  </label>
                  {!showDeleteConfirm ? (
                    <div className="border border-[#93000a]/40 bg-[#93000a]/10 p-4 rounded-lg flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="text-xs font-medium text-[#ffdad6]">
                          Permanently delete your account
                        </div>
                        <div className="text-[11px] text-[#ffb4ab]/80">
                          Deletes your user credentials, Firestore profile, and all saved vector design files.
                        </div>
                      </div>
                      <button
                        type="button"
                        id="btn-trigger-delete-account"
                        onClick={() => {
                          setShowDeleteConfirm(true);
                          setDeleteConfirmText('');
                          setDeleteError(null);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#93000a] text-[#ffdad6] text-xs font-medium hover:bg-[#ba1a1a] transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Account
                      </button>
                    </div>
                  ) : (
                    <div className="border border-[#93000a]/60 bg-[#93000a]/15 p-4 rounded-lg space-y-3">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-[#ffb4ab] shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-[#ffdad6]">
                            Are you absolutely sure you want to delete your account?
                          </div>
                          <div className="text-[11px] text-[#e5e2e1]/80 leading-relaxed">
                            This action is <span className="font-semibold text-[#ffb4ab]">irreversible</span>.
                            All your authentication records, profile details, and vector canvas projects stored in Firestore will be permanently deleted.
                          </div>
                        </div>
                      </div>

                      {deleteError && (
                        <div className="bg-[#ba1a1a]/20 border border-[#ffb4ab]/30 p-2.5 rounded text-xs text-[#ffdad6] flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#ffb4ab] shrink-0 mt-0.5" />
                          <div className="space-y-1 flex-1">
                            <div>{deleteError}</div>
                            {needsReauth && (
                              <div className="text-[11px] text-[#ffb4ab]/90 pt-0.5">
                                Re-authentication is required by Firebase security before account deletion.
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5 pt-1">
                        <label className="text-[11px] text-[#ffdad6]/90 block">
                          Type <span className="font-mono font-bold text-white bg-[#93000a]/40 px-1 py-0.5 rounded">DELETE</span> to confirm:
                        </label>
                        <input
                          id="input-delete-account-confirm"
                          type="text"
                          disabled={isDeletingAccount}
                          value={deleteConfirmText}
                          onChange={(e) => {
                            setDeleteConfirmText(e.target.value);
                            if (deleteError) setDeleteError(null);
                          }}
                          placeholder="DELETE"
                          className="w-full bg-[#1b0808] border border-[#93000a]/60 focus:border-[#ffb4ab] rounded px-3 py-2 text-xs text-[#ffdad6] outline-none font-mono placeholder-[#ffb4ab]/40"
                        />
                      </div>

                      {/* Optional or Required Password Confirmation for Email/Password users */}
                      {(!isGoogleUser || needsReauth) && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] text-[#ffdad6]/90 flex items-center gap-1.5">
                              <Key className="w-3 h-3 text-[#ffb4ab]" />
                              {needsReauth ? 'Enter account password to verify:' : 'Account Password (optional if recent):'}
                            </label>
                            {needsReauth && (
                              <span className="text-[10px] text-[#ffb4ab] font-medium">Required for verification</span>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              id="input-delete-reauth-password"
                              type={showReauthPassword ? 'text' : 'password'}
                              disabled={isDeletingAccount}
                              value={reauthPassword}
                              onChange={(e) => {
                                setReauthPassword(e.target.value);
                                if (deleteError) setDeleteError(null);
                              }}
                              placeholder="Enter your account password"
                              className="w-full bg-[#1b0808] border border-[#93000a]/60 focus:border-[#ffb4ab] rounded px-3 py-2 text-xs text-[#ffdad6] outline-none font-sans placeholder-[#ffb4ab]/40 pr-9"
                            />
                            <button
                              type="button"
                              onClick={() => setShowReauthPassword(!showReauthPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#ffb4ab]/70 hover:text-[#ffdad6] transition-colors p-0.5"
                              title={showReauthPassword ? 'Hide password' : 'Show password'}
                            >
                              {showReauthPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#93000a]/30">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="text-[11px] text-[#9fcaff] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <LogOut className="w-3 h-3" /> Or sign out first
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            id="btn-cancel-delete-account"
                            disabled={isDeletingAccount}
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              setDeleteConfirmText('');
                              setReauthPassword('');
                              setDeleteError(null);
                              setNeedsReauth(false);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#2a2a2a] text-[#e5e2e1] text-xs font-medium hover:bg-[#353534] transition-colors border border-[#353534] disabled:opacity-50 cursor-pointer"
                          >
                            Cancel
                          </button>

                          {isGoogleUser && needsReauth ? (
                            <button
                              type="button"
                              id="btn-google-reauth-delete"
                              disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE' || isDeletingAccount}
                              onClick={handleGoogleReauthAndDelete}
                              className="px-3.5 py-1.5 rounded-lg bg-[#ba1a1a] hover:bg-[#de3730] text-[#ffffff] text-xs font-semibold transition-colors disabled:opacity-40 disabled:hover:bg-[#ba1a1a] flex items-center gap-1.5 cursor-pointer"
                            >
                              {isDeletingAccount ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  Verifying with Google...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Verify with Google & Delete
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              id="btn-confirm-delete-account"
                              disabled={
                                deleteConfirmText.trim().toUpperCase() !== 'DELETE' ||
                                (needsReauth && !reauthPassword.trim()) ||
                                isDeletingAccount
                              }
                              onClick={() => handleDeleteAccount()}
                              className="px-3.5 py-1.5 rounded-lg bg-[#ba1a1a] hover:bg-[#de3730] text-[#ffffff] text-xs font-semibold transition-colors disabled:opacity-40 disabled:hover:bg-[#ba1a1a] flex items-center gap-1.5 cursor-pointer"
                            >
                              {isDeletingAccount ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  Deleting Account...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Permanently Delete Account
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-[#89919e] uppercase tracking-wider block">
                    Canvas Preferences
                  </label>
                  
                  <div className="bg-[#201f1f] p-4 rounded-lg border border-[#353534]/50 space-y-4">
                    {/* Grid Density */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs text-[#e5e2e1]">
                        <span>Grid Spacing</span>
                        <span className="font-mono text-[#d2bbff]">{formData.gridDensity}px</span>
                      </div>
                      <input
                        type="range"
                        min="8"
                        max="64"
                        step="8"
                        value={formData.gridDensity}
                        onChange={(e) =>
                          setFormData({ ...formData, gridDensity: Number(e.target.value) })
                        }
                        className="w-full accent-[#9fcaff] cursor-pointer h-1.5 bg-[#353534] rounded-lg"
                      />
                      <p className="text-[10px] text-[#89919e]">
                        Adjust the size of the background canvas dot grid.
                      </p>
                    </div>

                    {/* Snap to grid */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#353534]/50">
                      <div className="space-y-0.5">
                        <div className="text-xs text-[#e5e2e1] font-medium">Snap to Grid</div>
                        <div className="text-[10px] text-[#89919e]">Automatically align elements to the grid</div>
                      </div>
                      <div
                        onClick={() =>
                          setFormData({
                            ...formData,
                            snapToGrid: !formData.snapToGrid,
                          })
                        }
                        className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${
                          formData.snapToGrid ? 'bg-[#9fcaff]' : 'bg-[#353534]'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                            formData.snapToGrid
                              ? 'right-0.5 bg-[#003259]'
                              : 'left-0.5 bg-[#89919e]'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-[#89919e] uppercase tracking-wider block">
                    Interface Settings
                  </label>
                  <div className="bg-[#201f1f] p-4 rounded-lg border border-[#353534]/50 space-y-4">
                    {/* UI Scale */}
                    <div className="space-y-2">
                      <label className="text-xs text-[#e5e2e1] block">Interface Scale</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['small', 'medium', 'large'] as const).map((scale) => (
                          <button
                            key={scale}
                            onClick={() => setFormData({ ...formData, interfaceScale: scale })}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium capitalize transition-colors ${
                              formData.interfaceScale === scale
                                ? 'bg-[#6001d1] text-[#c9aeff]'
                                : 'bg-[#2a2a2a] text-[#bfc7d5] hover:bg-[#353534]'
                            }`}
                          >
                            {scale}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* High Contrast */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#353534]/50">
                      <div className="space-y-0.5">
                        <div className="text-xs text-[#e5e2e1] font-medium">High Contrast Mode</div>
                        <div className="text-[10px] text-[#89919e]">Increase contrast for better legibility</div>
                      </div>
                      <div
                        onClick={() =>
                          setFormData({
                            ...formData,
                            highContrast: !formData.highContrast,
                          })
                        }
                        className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${
                          formData.highContrast ? 'bg-[#9fcaff]' : 'bg-[#353534]'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                            formData.highContrast
                              ? 'right-0.5 bg-[#003259]'
                              : 'left-0.5 bg-[#89919e]'
                          }`}
                        />
                      </div>
                    </div>
                    {/* Toolbar Drag & Drop */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#353534]/50">
                      <div className="space-y-0.5">
                        <div className="text-xs text-[#e5e2e1] font-medium">Toolbar Drag & Drop</div>
                        <div className="text-[10px] text-[#89919e]">Enable drag and drop reordering of the 7 main toolbar components</div>
                      </div>
                      <div
                        onClick={() =>
                          setFormData({
                            ...formData,
                            enableToolbarDrag: !formData.enableToolbarDrag,
                          })
                        }
                        className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${
                          formData.enableToolbarDrag ? 'bg-[#9fcaff]' : 'bg-[#353534]'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                            formData.enableToolbarDrag
                              ? 'right-0.5 bg-[#003259]'
                              : 'left-0.5 bg-[#89919e]'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SHORTCUTS TAB */}
            {activeTab === 'shortcuts' && (() => {
              const isMac =
                typeof window !== 'undefined' &&
                /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent || navigator.platform);

              const formatKey = (k: string) => {
                if (k === '⌘') return isMac ? '⌘' : 'Ctrl';
                if (k === '⌥') return isMac ? '⌥' : 'Alt';
                if (k === '⇧') return isMac ? '⇧' : 'Shift';
                return k;
              };

              const categories = ['All', 'Tools', 'Edit', 'View & Canvas', 'Prototype & Export', 'General'];

              const filtered = ALL_COMMANDS.filter((cmd) => {
                const matchesCat = shortcutCategory === 'All' || cmd.category === shortcutCategory;
                if (!matchesCat) return false;

                if (!searchQuery.trim()) return true;

                const q = searchQuery.trim().toLowerCase();
                const titleMatch = cmd.title.toLowerCase().includes(q);
                const descMatch = cmd.description.toLowerCase().includes(q);
                const categoryMatch = cmd.category.toLowerCase().includes(q);
                const keysMatch = cmd.keys.some(
                  (k) =>
                    k.toLowerCase().includes(q) ||
                    (k === '⌘' && (q.includes('cmd') || q.includes('ctrl') || q.includes('command'))) ||
                    (k === '⇧' && q.includes('shift')) ||
                    (k === '⌥' && (q.includes('alt') || q.includes('opt')))
                );
                return titleMatch || descMatch || categoryMatch || keysMatch;
              });

              return (
                <div className="space-y-4">
                  {/* Top Banner with Quick Overlay Trigger */}
                  <div className="bg-[#201f1f] p-4 rounded-xl border border-[#353534]/60 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-[#e5e2e1] font-semibold flex items-center gap-2">
                        <Keyboard className="w-4 h-4 text-[#9fcaff]" />
                        <span>Application Shortcuts & Commands</span>
                      </div>
                      <p className="text-[11px] text-[#bfc7d5] mt-1">
                        Full searchable directory of keyboard shortcuts for tools, selection, zoom, and exports.
                      </p>
                    </div>

                    {onOpenShortcutsOverlay && (
                      <button
                        onClick={onOpenShortcutsOverlay}
                        className="px-3 py-1.5 rounded-lg bg-[#0d99ff] text-[#002f55] hover:bg-[#9fcaff] text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                        title="Open interactive overlay modal (? or ⌘/)"
                      >
                        <span>Open Cheat-Sheet</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {categories.map((cat) => {
                      const count =
                        cat === 'All'
                          ? ALL_COMMANDS.length
                          : ALL_COMMANDS.filter((c) => c.category === cat).length;
                      const isActive = shortcutCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setShortcutCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-[#6001d1] text-[#c9aeff] font-semibold'
                              : 'bg-[#201f1f] text-[#89919e] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]'
                          }`}
                        >
                          <span>{cat}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                              isActive
                                ? 'bg-[#c9aeff]/20 text-[#c9aeff]'
                                : 'bg-[#2a2a2a] text-[#89919e]'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Commands List */}
                  <div className="space-y-1.5">
                    {filtered.length > 0 ? (
                      filtered.map((s) => {
                        const hasAction = Boolean(s.actionId && onExecuteAction);
                        return (
                          <div
                            key={s.id}
                            onClick={() => {
                              if (hasAction && s.actionId && onExecuteAction) {
                                onExecuteAction(s.actionId);
                                onClose();
                              }
                            }}
                            className={`flex items-center justify-between bg-[#201f1f] px-3 py-2.5 rounded-lg border border-[#353534]/40 transition-colors group ${
                              hasAction ? 'hover:bg-[#2a2a2a] cursor-pointer hover:border-[#0d99ff]/30' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              <div className="w-6 h-6 rounded-md bg-[#2a2a2a] flex items-center justify-center shrink-0 text-[#89919e] group-hover:text-[#9fcaff]">
                                {s.icon || <Keyboard className="w-3 h-3" />}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-[#e5e2e1] font-medium truncate">
                                    {s.title}
                                  </span>
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#2a2a2a] text-[#89919e] font-mono shrink-0">
                                    {s.category}
                                  </span>
                                </div>
                                <div className="text-[10px] text-[#89919e] truncate mt-0.5">
                                  {s.description}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <div className="flex items-center gap-1">
                                {s.keys.map((k, kIdx) => (
                                  <kbd
                                    key={kIdx}
                                    className="bg-[#2a2a2a] px-2 py-0.5 rounded text-[11px] font-mono text-[#9fcaff] border border-[#353534] shadow-inner inline-flex items-center justify-center min-w-[20px]"
                                  >
                                    {formatKey(k)}
                                  </kbd>
                                ))}
                              </div>
                              {hasAction && (
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-[#9fcaff] flex items-center gap-0.5 ml-1">
                                  <span>Run</span>
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-[#89919e] bg-[#201f1f] rounded-lg border border-[#353534]/40">
                        <Keyboard className="w-6 h-6 mx-auto mb-2 text-[#353534]" />
                        <p className="text-xs text-[#e5e2e1]">No shortcuts matching "{searchQuery}"</p>
                        <p className="text-[11px] text-[#89919e] mt-1">Try searching by command name, tool, or shortcut key.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* PLUGINS TAB */}
            {activeTab === 'plugins' && (
              <div className="space-y-3">
                <div className="text-[10px] font-semibold text-[#89919e] uppercase tracking-wider">
                  Installed Studio Plugins
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-[#201f1f] p-3 rounded-lg border border-[#353534]/50">
                    <div>
                      <div className="text-xs text-[#e5e2e1] font-medium">WebGPU Vector Pipeline</div>
                      <div className="text-[11px] text-[#bfc7d5]">GPU accelerated Bézier calculations</div>
                    </div>
                    <span className="text-[10px] bg-[#9fcaff]/20 text-[#9fcaff] px-2 py-0.5 rounded font-mono">
                      v2.4 Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-[#201f1f] p-3 rounded-lg border border-[#353534]/50">
                    <div>
                      <div className="text-xs text-[#e5e2e1] font-medium">SVG Clean Exporter</div>
                      <div className="text-[11px] text-[#bfc7d5]">Optimized clean SVG vector exporting</div>
                    </div>
                    <span className="text-[10px] bg-[#d2bbff]/20 text-[#d2bbff] px-2 py-0.5 rounded font-mono">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TEAM TAB */}
            {activeTab === 'team' && (
              <div className="space-y-3">
                <div className="text-[10px] font-semibold text-[#89919e] uppercase tracking-wider">
                  Studio Workspace Members
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'Alex Creator', role: 'Owner', email: 'alex.creator@zlab.io', color: '#9fcaff' },
                    { name: 'Sarah Chen', role: 'Editor', email: 'sarah.c@zlab.io', color: '#d2bbff' },
                    { name: 'Alex Rivera', role: 'Editor', email: 'alex.r@zlab.io', color: '#c8c6c5' },
                  ].map((m) => (
                    <div
                      key={m.email}
                      className="flex items-center justify-between bg-[#201f1f] p-3 rounded-lg border border-[#353534]/50"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          style={{ backgroundColor: m.color }}
                          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-[#002f55]"
                        >
                          {m.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-xs text-[#e5e2e1] font-medium">{m.name}</div>
                          <div className="text-[10px] text-[#89919e]">{m.email}</div>
                        </div>
                      </div>
                      <span className="text-[11px] text-[#bfc7d5] font-medium">{m.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BILLING TAB */}
            {activeTab === 'billing' && (
              <div className="space-y-3">
                <div className="text-[10px] font-semibold text-[#89919e] uppercase tracking-wider">
                  Payment & Plan Details
                </div>
                <div className="bg-[#201f1f] p-4 rounded-lg border border-[#353534]/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#e5e2e1] font-medium">Creator Pro Yearly</span>
                    <span className="text-xs text-[#9fcaff] font-mono">$192 / year</span>
                  </div>
                  <p className="text-[11px] text-[#bfc7d5]">
                    Includes unlimited projects, real-time sync, WebGPU pipelines, and team sharing.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-[#353534]">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#201f1f] text-[#e5e2e1] text-xs font-medium hover:bg-[#2a2a2a] transition-colors border border-[#353534]"
            >
              {hasChanges ? 'Cancel' : 'Close'}
            </button>
            {(hasChanges || savedNotification) && (
              <button
                id="btn-save-settings"
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-[#9fcaff] text-[#003259] text-xs font-semibold hover:bg-[#0d99ff] hover:text-[#002f55] transition-colors shadow"
              >
                {savedNotification ? 'Saved!' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
