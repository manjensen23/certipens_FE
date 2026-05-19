import { useState } from 'react';
import { Megaphone, User } from 'lucide-react';
import AnnouncementsPage from './AnnouncementsPage';
import ProfilePage from './ProfilePage';

type Tab = 'pengumuman' | 'profil';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'pengumuman', label: 'Pengumuman', icon: <Megaphone size={18} /> },
  { id: 'profil', label: 'Profil', icon: <User size={18} /> },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pengumuman');

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-headline-md text-on-surface">Pengaturan</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Kelola pengumuman dan informasi akun Anda
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-outline-variant">
        <nav className="flex gap-0" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'pengumuman' && <AnnouncementsPage />}
      {activeTab === 'profil' && <ProfilePage />}
    </div>
  );
}
