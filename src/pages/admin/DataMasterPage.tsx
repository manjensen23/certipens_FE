import { useState } from 'react';
import { Database, Users } from 'lucide-react';
import CertificationsPage from './CertificationsPage';
import UsersPage from './UsersPage';

type Tab = 'sertifikasi' | 'akun';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'sertifikasi', label: 'Sertifikasi', icon: <Database size={18} /> },
  { id: 'akun', label: 'Kelola Akun', icon: <Users size={18} /> },
];

export default function DataMasterPage() {
  const [activeTab, setActiveTab] = useState<Tab>('sertifikasi');

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-headline-md text-on-surface">Data Master</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Kelola sertifikasi dan akun pengguna
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
      {activeTab === 'sertifikasi' && <CertificationsPage />}
      {activeTab === 'akun' && <UsersPage />}
    </div>
  );
}
