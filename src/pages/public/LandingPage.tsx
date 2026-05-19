import { Link } from 'react-router-dom';
import { ClipboardCheck, CalendarClock, ArrowRight, ShieldCheck, Radar } from 'lucide-react';
import ShieldLogo from '@/components/ui/ShieldLogo';
import Copyright from '@/components/layout/Copyright';

const features = [
  {
    icon: <ClipboardCheck size={28} />,
    title: 'Pendaftaran Mudah',
    desc: 'Daftar sertifikasi secara online dengan upload berkas digital.',
  },
  {
    icon: <Radar size={28} />,
    title: 'Tracking Status',
    desc: 'Pantau status pendaftaran dan verifikasi berkas Anda secara real-time.',
  },
  {
    icon: <CalendarClock size={28} />,
    title: 'Jadwal Terintegrasi',
    desc: 'Lihat jadwal sertifikasi dan terima notifikasi otomatis saat jadwal ditetapkan.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background-light">
      {/* Header / Navbar */}
      <header className="glass sticky top-0 z-30">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link to="/">
              <ShieldLogo size="sm" />
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <a href="#beranda" className="text-sm font-medium text-on-surface hover:text-primary transition-colors">
                Beranda
              </a>
              <a href="#tentang" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
                Tentang
              </a>
              <a href="#kontak" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
                Kontak
              </a>
            </nav>

            <nav className="flex items-center gap-3">
              <Link to="/login" className="btn btn-primary btn-sm">
                Masuk
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="beranda" className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-alpha-10" />
        <div className="absolute top-20 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-60 w-60 rounded-full bg-tertiary/5 blur-3xl" />

        <div className="relative mx-auto max-w-[1200px] px-6 py-20 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-alpha-10 px-4 py-2">
              <ShieldCheck size={16} className="text-primary" />
              <span className="text-label-sm text-primary">UPA LAYANAN UJI KOMPETENSI PENS</span>
            </div>

            {/* Title */}
            <h1 className="text-display-lg-mobile lg:text-display-lg text-on-surface mb-6">
              Sistem Pendaftaran Sertifikasi{' '}
              <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
                Terintegrasi
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-body-lg text-on-surface-variant mb-10 max-w-2xl mx-auto">
              Selamat datang di <strong>CertiPENS</strong>, solusi satu pintu untuk pendaftaran Sertifikasi BNSP LSP, Sertifikasi Non BNSP, dan Pelatihan Kompetensi di Politeknik Elektronika Negeri Surabaya (PENS).
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn btn-primary btn-lg">
                Daftar Sekarang
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Masuk ke Akun
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="tentang" className="mx-auto max-w-[1200px] px-6 py-20 lg:py-28">
        <div className="text-center mb-14">
          <h2 className="text-headline-md text-on-surface mb-3">Kenapa CertiPENS?</h2>
          <p className="text-body-md text-on-surface-variant max-w-lg mx-auto">
            Solusi modern untuk proses sertifikasi yang efisien dan transparan.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card card-hover p-8"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-alpha-10 text-primary">
                {feature.icon}
              </div>
              <h3 className="text-title-lg text-on-surface mb-2">{feature.title}</h3>
              <p className="text-body-md text-on-surface-variant">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-[1200px] px-6 pb-20 lg:pb-28">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-container p-10 lg:p-16 text-center">
          <h2 className="text-headline-md text-on-primary mb-4">
            Siap untuk Memulai Sertifikasi Anda?
          </h2>
          <p className="text-body-lg text-on-primary/80 mb-8 max-w-lg mx-auto">
            Gabung sekarang dengan ekosistem sertifikasi digital PENS untuk masa depan karir yang lebih cerah.
          </p>
          <Link
            to="/register"
            className="btn btn-lg bg-white text-primary hover:bg-white/90 font-bold shadow-lg"
          >
            Daftar Sekarang
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="kontak" className="border-t border-outline-variant bg-surface-container-lowest">
        <div className="mx-auto max-w-[1200px] px-6 py-12">
          <div className="grid gap-10 md:grid-cols-3">
            {/* Column 1: Logo + Description */}
            <div>
              <ShieldLogo size="sm" />
              <p className="mt-4 text-sm text-on-surface-variant leading-relaxed">
                CertiPENS adalah platform pendaftaran sertifikasi terintegrasi
                Politeknik Elektronika Negeri Surabaya.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="text-sm font-bold text-on-surface mb-4">Tautan Cepat</h4>
              <ul className="space-y-2.5">
                <li>
                  <a href="#tentang" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                    Tentang Kami
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                    Panduan LSP-P1
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                    Informasi Sertikom
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Help */}
            <div>
              <h4 className="text-sm font-bold text-on-surface mb-4">Bantuan</h4>
              <ul className="space-y-2.5">
                <li>
                  <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                    Pusat Bantuan
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                    Hubungi Kami
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
      <div className="bg-surface-container-lowest py-6">
        <Copyright />
      </div>
    </div>
  );
}
