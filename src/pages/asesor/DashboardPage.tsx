import { useQuery } from '@tanstack/react-query';
import { schedulesService } from '@/services/schedules.service';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, MapPin, Users, ChevronRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function AsesorDashboardPage() {
  const { data: schedulesData } = useQuery({
    queryKey: ['asesor-schedules'],
    queryFn: () => schedulesService.list({ limit: 10 }),
  });

  const schedules = schedulesData?.data || [];
  const upcomingSchedules = schedules.slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1a56db] to-[#2563eb] p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              Halo, Bapak/Ibu Asesor 👋
            </h1>
            <p className="text-white/80 text-sm lg:text-base max-w-xl">
              Selamat datang kembali! Kelola jadwal uji kompetensi dan pantau perkembangan peserta Anda.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-lg bg-white/15 backdrop-blur-sm px-4 py-2 text-sm font-medium">
            <Users size={16} />
            Sesi Aktif: {schedules.length} Jadwal
          </div>
        </div>
      </div>

      {/* Jadwal Uji Mendatang */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-title-lg font-semibold text-on-surface">Jadwal Uji Mendatang</h2>
          <Link to="/asesor/schedule" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
            Lihat Semua <ChevronRight size={14} />
          </Link>
        </div>

        {upcomingSchedules.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {upcomingSchedules.map((s) => (
              <div key={s.id_jadwal} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <span className="badge badge-primary text-[10px]">
                    {s.kategori || 'SERTIFIKASI'}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-on-surface mb-3">
                  {s.nama_sertifikasi || '-'}
                </h3>
                <div className="space-y-2 text-sm text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={15} className="shrink-0" />
                    {s.tanggal ? format(new Date(s.tanggal), 'EEEE, d MMMM yyyy', { locale: idLocale }) : '-'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="shrink-0" />
                    {s.waktu_mulai || '-'} — {s.waktu_selesai || '-'}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={15} className="shrink-0" />
                    {s.lokasi || '-'}
                  </div>
                </div>
                <Link
                  to="/asesor/schedule"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Lihat Detail Sesi <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <CalendarDays size={40} className="mx-auto mb-3 text-on-surface-variant/30" />
            <p className="text-sm text-on-surface-variant">Belum ada jadwal uji yang dijadwalkan</p>
          </div>
        )}
      </div>

      {/* Daftar Peserta Uji */}
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <h2 className="text-title-md font-semibold text-on-surface">Daftar Peserta Uji</h2>
          <Link to="/asesor/penilaian" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
            Lihat Semua <ChevronRight size={14} />
          </Link>
        </div>

        {/* Search bar */}
        <div className="px-6 py-3 border-b border-outline-variant">
          <div className="flex items-center gap-2 rounded-lg bg-surface-container px-3 py-2 max-w-sm">
            <Search size={16} className="text-on-surface-variant" />
            <input
              type="text"
              placeholder="Cari Nama/NIM..."
              className="bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none w-full"
              disabled
            />
          </div>
        </div>

        {/* Placeholder table */}
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
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Belum ada peserta yang di-assign</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
