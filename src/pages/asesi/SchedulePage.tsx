import { useQuery } from '@tanstack/react-query';
import { schedulesService } from '@/services/schedules.service';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function AsesiSchedulePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['asesi-schedules'],
    queryFn: () => schedulesService.list({ limit: 50 }),
  });

  const schedules = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-md text-on-surface">Jadwal Sertifikasi</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Jadwal ujian sertifikasi yang tersedia
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            Jadwal ujian sertifikasi belum tersedia saat ini.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schedules.map((s) => {
            const daysUntil = s.tanggal ? differenceInDays(new Date(s.tanggal), new Date()) : Infinity;
            const isUpcoming = daysUntil >= 0 && daysUntil <= 7;

            return (
              <div
                key={s.id_jadwal}
                className={`card p-5 transition-all hover:shadow-md ${
                  isUpcoming ? 'border-2 border-primary ring-2 ring-primary/10' : ''
                }`}
              >
                {isUpcoming && (
                  <span className="badge badge-primary text-[10px] mb-3">
                    {daysUntil === 0 ? 'HARI INI' : `${daysUntil} HARI LAGI`}
                  </span>
                )}
                <span className="badge badge-draft text-[10px] mb-2">
                  {s.kategori || 'SERTIFIKASI'}
                </span>
                <h3 className="text-sm font-semibold text-on-surface mb-3">
                  {s.nama_sertifikasi || '-'}
                </h3>
                <div className="space-y-2 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} className="shrink-0" />
                    {s.tanggal ? format(new Date(s.tanggal), 'EEEE, d MMMM yyyy', { locale: idLocale }) : '-'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="shrink-0" />
                    {s.waktu_mulai || '-'} — {s.waktu_selesai || '-'}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="shrink-0" />
                    {s.lokasi || '-'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
