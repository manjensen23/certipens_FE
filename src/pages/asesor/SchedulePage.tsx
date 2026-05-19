import { useQuery } from '@tanstack/react-query';
import { schedulesService } from '@/services/schedules.service';
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function AsesorSchedulePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['asesor-all-schedules'],
    queryFn: () => schedulesService.list({ limit: 50 }),
  });

  const schedules = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-md text-on-surface">Jadwal Uji Kompetensi</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Daftar jadwal uji yang di-assign kepada Anda
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-5 w-3/4 bg-surface-container-high rounded mb-3" />
              <div className="h-4 w-1/2 bg-surface-container-high rounded" />
            </div>
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <div className="card p-12 text-center">
          <CalendarDays size={56} className="mx-auto mb-4 text-on-surface-variant/30" />
          <h3 className="text-title-lg font-semibold text-on-surface mb-2">Belum Ada Jadwal</h3>
          <p className="text-sm text-on-surface-variant">
            Anda belum memiliki jadwal uji kompetensi yang di-assign.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container/30">
                  <th className="px-5 py-3 text-left font-semibold text-on-surface-variant">TANGGAL</th>
                  <th className="px-5 py-3 text-left font-semibold text-on-surface-variant">WAKTU</th>
                  <th className="px-5 py-3 text-left font-semibold text-on-surface-variant">LOKASI</th>
                  <th className="px-5 py-3 text-left font-semibold text-on-surface-variant">JENIS SERTIFIKASI</th>
                  <th className="px-5 py-3 text-left font-semibold text-on-surface-variant">PESERTA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {schedules.map((s) => (
                  <tr key={s.id_jadwal} className="hover:bg-surface-container/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={14} className="text-on-surface-variant" />
                        <span className="text-on-surface">
                          {s.tanggal ? format(new Date(s.tanggal), 'd MMM yyyy', { locale: idLocale }) : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-on-surface-variant" />
                        <span className="text-on-surface">{s.waktu_mulai} — {s.waktu_selesai}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-on-surface-variant" />
                        <span className="text-on-surface">{s.lokasi || '-'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="badge badge-primary text-xs">
                        {s.nama_sertifikasi || '-'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-on-surface-variant" />
                        <span className="text-on-surface">{s.kuota || 0}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
