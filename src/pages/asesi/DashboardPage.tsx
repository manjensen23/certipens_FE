import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { registrationsService } from '@/services/registrations.service';
import { schedulesService } from '@/services/schedules.service';
import { announcementsService } from '@/services/announcements.service';
import { certificationsService } from '@/services/certifications.service';
import StatusBadge from '@/components/ui/StatusBadge';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, GraduationCap, Clock, Info, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function AsesiDashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: myRegs } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: () => registrationsService.myRegistrations({ limit: 3 }),
  });

  const { data: certs } = useQuery({
    queryKey: ['certifications-count'],
    queryFn: () => certificationsService.list({ limit: 1 }),
  });

  const { data: schedules } = useQuery({
    queryKey: ['upcoming-schedules'],
    queryFn: () => schedulesService.list({ limit: 3, status: 'published' }),
  });

  const { data: announcements } = useQuery({
    queryKey: ['announcements-asesi'],
    queryFn: () => announcementsService.list({ limit: 3 }),
  });

  const pendingCount = myRegs?.data?.filter((r) => r.status === 'pending' || r.status === 'draft').length || 0;
  const totalCerts = certs?.meta?.total || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1a56db] to-[#7c3aed] p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            Halo, {user?.nama_lengkap || 'Asesi'} 👋
          </h1>
          <p className="text-white/80 text-sm lg:text-base max-w-xl">
            Selamat datang kembali! Pantau progres sertifikasi Anda atau mulai proses pendaftaran baru.
          </p>
        </div>
      </div>

      {/* Main Content: 2 columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Pendaftaran Terakhir */}
          <div className="card">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
              <h2 className="text-title-md font-semibold text-on-surface">Status Pendaftaran Terakhir</h2>
              <Link
                to="/asesi/sertifikasi"
                className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
              >
                Lihat Semua <ChevronRight size={14} />
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {myRegs?.data && myRegs.data.length > 0 ? (
                myRegs.data.map((reg) => (
                  <div
                    key={reg.id_pendaftaran}
                    className="flex items-center justify-between rounded-lg border border-outline-variant p-4 hover:bg-surface-container/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-alpha-10 text-primary shrink-0">
                        <GraduationCap size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-on-surface truncate">
                          {reg.nama_sertifikasi || 'Sertifikasi'}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          REG-{String(reg.id_pendaftaran).padStart(4, '0')} •{' '}
                          {reg.tanggal_daftar
                            ? format(new Date(reg.tanggal_daftar), 'd MMM yyyy', { locale: idLocale })
                            : 'Draft'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={reg.status} />
                      <Link
                        to="/asesi/sertifikasi"
                        className="text-xs font-medium text-primary hover:underline hidden sm:inline"
                      >
                        Lihat Detail
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-on-surface-variant">
                  <GraduationCap size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Belum ada pendaftaran</p>
                </div>
              )}
            </div>
          </div>

          {/* CTA: Daftar Sertifikasi Baru */}
          <Link
            to="/asesi/register-cert"
            className="btn btn-primary w-full py-4 text-base justify-center"
          >
            <GraduationCap size={20} />
            Daftar Sertifikasi Baru
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Right column (1/3) */}
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-status-pending-bg text-status-pending shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-on-surface">{pendingCount}</p>
                  <p className="text-xs text-on-surface-variant">Pendaftaran Aktif</p>
                </div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-alpha-10 text-primary shrink-0">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-on-surface">{totalCerts}</p>
                  <p className="text-xs text-on-surface-variant">Sertifikasi Tersedia</p>
                </div>
              </div>
            </div>
          </div>

          {/* Jadwal Mendatang */}
          <div className="card">
            <div className="px-5 py-4 border-b border-outline-variant">
              <h3 className="text-title-sm font-semibold text-on-surface">Jadwal Mendatang</h3>
            </div>
            <div className="p-4 space-y-3">
              {schedules?.data && schedules.data.length > 0 ? (
                schedules.data.slice(0, 2).map((s) => (
                  <div key={s.id_jadwal} className="rounded-lg bg-surface-container/50 p-3">
                    <span className="badge badge-primary text-[10px] mb-2">{s.kategori || 'SERTIFIKASI'}</span>
                    <p className="text-sm font-medium text-on-surface">
                      {s.nama_sertifikasi || '-'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-on-surface-variant">
                      <CalendarDays size={12} />
                      {s.tanggal
                        ? format(new Date(s.tanggal), 'd MMMM yyyy', { locale: idLocale })
                        : '-'}
                      {s.waktu_mulai && ` • ${s.waktu_mulai}`}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-on-surface-variant text-center py-4">Belum ada jadwal</p>
              )}
            </div>
          </div>

          {/* Pengumuman Terbaru */}
          <div className="card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant">
              <h3 className="text-title-sm font-semibold text-on-surface">Pengumuman Terbaru</h3>
              <Link to="/asesi/notifikasi" className="text-xs font-medium text-primary hover:underline">
                Lihat Semua
              </Link>
            </div>
            <div className="divide-y divide-outline-variant">
              {announcements?.data && announcements.data.length > 0 ? (
                announcements.data.map((a) => (
                  <div key={a.id_pengumuman} className="flex items-start gap-3 px-5 py-3">
                    <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${a.is_published ? 'bg-status-verified' : 'bg-error'}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-on-surface truncate">{a.judul}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {a.created_at ? format(new Date(a.created_at), 'd MMM yyyy', { locale: idLocale }) : '-'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-on-surface-variant text-center py-4">Belum ada pengumuman</p>
              )}
            </div>
          </div>

          {/* Informasi Penting */}
          <div className="card border-l-4 border-l-primary p-4">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-on-surface mb-1">Informasi Penting</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Pastikan profil Anda telah dilengkapi sebelum mendaftar sertifikasi. Berkas yang di-upload
                  harus dalam format PDF/JPG/PNG dengan ukuran maksimal 5MB.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
