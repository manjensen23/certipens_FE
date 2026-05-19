import { useState } from 'react';
import { Search, Users } from 'lucide-react';

export default function AsesorParticipantsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-md text-on-surface">Penilaian Peserta</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Kelola dan lihat detail peserta uji kompetensi
        </p>
      </div>

      <div className="card">
        {/* Search bar */}
        <div className="px-6 py-4 border-b border-outline-variant">
          <div className="flex items-center gap-2 rounded-lg bg-surface-container px-3 py-2.5 max-w-md">
            <Search size={18} className="text-on-surface-variant shrink-0" />
            <input
              type="text"
              placeholder="Cari Nama/NIM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none w-full"
            />
          </div>
        </div>

        {/* Participants table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container/30">
                <th className="px-6 py-3 text-left font-semibold text-on-surface-variant">NAMA PESERTA</th>
                <th className="px-6 py-3 text-left font-semibold text-on-surface-variant">NIM/NIP</th>
                <th className="px-6 py-3 text-left font-semibold text-on-surface-variant">SKEMA UJI</th>
                <th className="px-6 py-3 text-left font-semibold text-on-surface-variant">STATUS DOKUMEN</th>
                <th className="px-6 py-3 text-left font-semibold text-on-surface-variant">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {/* Empty state - data will be populated when participants are assigned */}
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-on-surface-variant">
                  <Users size={48} className="mx-auto mb-4 opacity-30" />
                  <h3 className="text-title-md font-semibold text-on-surface mb-2">Belum Ada Peserta</h3>
                  <p className="text-sm">Peserta uji kompetensi belum di-assign kepada Anda.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
