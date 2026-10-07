import React, { useState } from 'react';
import {
    User as UserIcon,
    Lock,
    Bell,
    Database,
    Save,
    Download,
    Trash2,
    AlertTriangle,
    LogOut,
    ShieldAlert
} from 'lucide-react';
import { User } from '../../types';
import { storageService } from '../../services/storageService';
import { useNotificationPrefs, NotifType } from '../../hooks/useNotificationPrefs';
import { Modal } from '../ui/Modal';
import { usePageLoader } from '../../hooks/usePageLoader';
import { useToast } from '../ui/Toast';

interface SettingsViewProps {
    currentUser: User;
    onNavigate: (route: string) => void;
    onLogout: () => void;
}

type TabType = 'profile' | 'security' | 'notifications' | 'privacy';

export const SettingsView: React.FC<SettingsViewProps> = ({
    currentUser,
    onNavigate,
    onLogout
}) => {
    const isLoading = usePageLoader(400);
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const { prefs, toggle } = useNotificationPrefs();

    // Profile State
    const [bio, setBio] = useState(currentUser.bio || '');
    const [course, setCourse] = useState(currentUser.course || '');
    const [collegeName, setCollegeName] = useState(currentUser.collegeName || '');
    const [name, setName] = useState(currentUser.name || '');

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Modals
    // Modals
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');

    const toast = useToast();

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        const updated: User = {
            ...currentUser,
            name,
            bio,
            course,
            collegeName
        };
        storageService.saveUser(updated);
        toast.success('Profile updated successfully');
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        // Mock updating password
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        toast.success('Password updated successfully');
    };

    const handleDownloadData = () => {
        const dataJson = storageService.exportUserData(currentUser.id);
        const blob = new Blob([dataJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `skillswap_user_data_${currentUser.id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Data downloaded successfully');
    };

    const handleDeleteAccount = () => {
        if (deleteInput === 'DELETE') {
            setIsDeleteModalOpen(false);
            storageService.deleteAccount(currentUser.id).then(() => {
                onLogout();
            });
        }
    };

    if (isLoading) {
        // If we don't have SettingsSkeleton yet, fallback to something generic or write a basic spinner here
        // Wait, let's use a generic generic rendering if skeleton doesn't have SettingsSkeleton
        return (
            <div className="space-y-6 max-w-4xl mx-auto p-4 animate-pulse">
                <div className="h-8 w-48 bg-[var(--color-soft)] rounded-md mb-8"></div>
                <div className="flex gap-6">
                    <div className="w-64 h-64 bg-[var(--color-soft)] rounded-xl"></div>
                    <div className="flex-1 space-y-4">
                        <div className="h-[400px] bg-[var(--color-surface)] rounded-xl border border-[var(--color-soft)]"></div>
                    </div>
                </div>
            </div>
        );
    }

    const tabs: { id: TabType; label: string; icon: React.FC<any> }[] = [
        { id: 'profile', label: 'Edit Profile', icon: UserIcon },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'privacy', label: 'Data & Privacy', icon: Database },
    ];

    return (
        <div className="space-y-6 pb-12 max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
                <SettingsIcon className="w-6 h-6 text-[var(--color-primary)]" />
                <h1 className="text-2xl font-medium tracking-tight text-[var(--color-text)]">
                    Account Settings
                </h1>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 shrink-0 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors text-left"
                            style={{
                                backgroundColor: activeTab === tab.id ? 'var(--color-soft)' : 'transparent',
                                color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-muted)'
                            }}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Selected View Content */}
                <div
                    className="flex-1 p-6 sm:p-8 rounded-2xl"
                    style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-soft)' }}
                >

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-[var(--color-text)] mb-1">Public Profile</h3>
                                <p className="text-xs text-[var(--color-muted)] mb-6">Update how you appear to peers on campus.</p>
                            </div>

                            <div className="space-y-4 max-w-xl">
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text)] mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--color-soft)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-primary)]"
                                        placeholder="Your Name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text)] mb-1.5">Course / Major</label>
                                    <input
                                        type="text"
                                        value={course}
                                        onChange={e => setCourse(e.target.value)}
                                        className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--color-soft)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-primary)]"
                                        placeholder="Computer Science"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text)] mb-1.5">College</label>
                                    <input
                                        type="text"
                                        value={collegeName}
                                        onChange={e => setCollegeName(e.target.value)}
                                        className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--color-soft)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-primary)]"
                                        placeholder="University Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text)] mb-1.5">Bio</label>
                                    <textarea
                                        value={bio}
                                        onChange={e => setBio(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--color-soft)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-primary)]"
                                        placeholder="Tell peers about your learning journey..."
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[var(--color-soft)] flex justify-end">
                                <button type="submit" className="btn-action px-6 py-2">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <form onSubmit={handleUpdatePassword} className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-[var(--color-text)] mb-1">Security Settings</h3>
                                <p className="text-xs text-[var(--color-muted)] mb-6">Manage your password and authentication.</p>
                            </div>

                            <div className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text)] mb-1.5">Current Password</label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={e => setCurrentPassword(e.target.value)}
                                        className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--color-soft)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-primary)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text)] mb-1.5">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--color-soft)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-primary)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text)] mb-1.5">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2 text-sm rounded-xl border border-[var(--color-soft)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-primary)]"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[var(--color-soft)]">
                                <button
                                    type="submit"
                                    disabled={!newPassword || newPassword !== confirmPassword}
                                    className="btn-action px-6 py-2 disabled:opacity-50"
                                    aria-label="Update password"
                                >
                                    <Lock className="w-4 h-4 mr-2" />
                                    Update Password
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-[var(--color-text)] mb-1">Notification Preferences</h3>
                                <p className="text-xs text-[var(--color-muted)] mb-6">Control what updates you receive via email and push.</p>
                            </div>

                            <div className="space-y-3 max-w-xl">
                                {(['match', 'request', 'message', 'session', 'review', 'badge', 'system'] as NotifType[]).map(type => (
                                    <div key={type} className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-soft)] bg-[var(--color-bg)]">
                                        <div>
                                            <p className="text-sm font-medium text-[var(--color-text)] capitalize">
                                                {type === 'match' ? 'New AI Matches' :
                                                    type === 'request' ? 'Exchange Requests' :
                                                        type === 'session' ? 'Session Reminders' :
                                                            type === 'review' ? 'Peer Reviews' :
                                                                type === 'badge' ? 'Achievement Badges' : type}
                                            </p>
                                            <p className="text-[11px] text-[var(--color-muted)] mt-0.5">
                                                Get notified about {type} activity.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={prefs[type]}
                                            onClick={() => toggle(type)}
                                            className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out"
                                            style={{ backgroundColor: prefs[type] ? 'var(--color-primary)' : 'var(--color-soft)' }}
                                        >
                                            <span
                                                className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5"
                                                style={{ transform: prefs[type] ? 'translateX(16px)' : 'translateX(0)' }}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Privacy & Data Tab */}
                    {activeTab === 'privacy' && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-medium text-[var(--color-text)] mb-1">Data & Privacy</h3>
                                <p className="text-xs text-[var(--color-muted)] mb-6">Manage your exported data and account lifecycle.</p>
                            </div>

                            <div className="p-5 rounded-xl border border-[var(--color-soft)] space-y-3">
                                <div className="flex items-center gap-3 text-[var(--color-text)]">
                                    <Download className="w-5 h-5 text-[var(--color-primary)]" />
                                    <h4 className="font-medium text-sm">Export My Data</h4>
                                </div>
                                <p className="text-xs text-[var(--color-muted)]">
                                    Download a JSON copy of your profile, skills, messages, and session history.
                                </p>
                                <button onClick={handleDownloadData} className="btn-action px-4 py-2 mt-2 text-xs">
                                    <Download className="w-4 h-4 mr-2" />
                                    Request Data Archive
                                </button>
                            </div>

                            <div className="p-5 rounded-xl border border-red-100 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20 space-y-3">
                                <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                                    <AlertTriangle className="w-5 h-5" />
                                    <h4 className="font-medium text-sm">Danger Zone</h4>
                                </div>
                                <p className="text-xs text-red-600/80 dark:text-red-400/80">
                                    Permanently delete your account and all associated data. This action cannot be undone.
                                </p>
                                <button
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="inline-flex items-center px-4 py-2 text-xs font-medium rounded-full bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-200 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title={
                    <div className="flex items-center gap-2 text-red-600">
                        <ShieldAlert className="w-5 h-5" />
                        <span>Delete Account</span>
                    </div>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-[var(--color-text)] leading-relaxed">
                        Are you absolutely sure? This will instantly and permanently delete your profile,
                        skills, messages, and session history from the platform. <strong>This cannot be undone.</strong>
                    </p>

                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl space-y-2">
                        <label className="block text-xs font-medium text-red-800 dark:text-red-300">
                            Type <strong className="select-none inline-block px-1 bg-red-200/50 rounded">DELETE</strong> to confirm
                        </label>
                        <input
                            type="text"
                            value={deleteInput}
                            onChange={e => setDeleteInput(e.target.value)}
                            className="w-full px-4 py-2 text-sm rounded-lg border border-red-200 dark:border-red-900/50 bg-white dark:bg-zinc-900 focus:outline-none focus:border-red-500"
                            placeholder="DELETE"
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium rounded-full text-[var(--color-muted)] hover:bg-[var(--color-soft)]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteAccount}
                            disabled={deleteInput !== 'DELETE'}
                            className="px-4 py-2 text-sm font-medium rounded-full bg-red-600 text-white disabled:opacity-50 transition-colors cursor-pointer"
                        >
                            Permanently Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// Simple stand-in icon for the header until lucide Settings is imported properly just in case
const SettingsIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const CheckCircle2Icon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
);
