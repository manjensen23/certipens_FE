import { Link } from 'react-router-dom';
import { Construction } from 'lucide-react';

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-alpha-10 text-primary mb-6">
        <Construction size={40} />
      </div>
      <h1 className="text-headline-md text-on-surface mb-3">Coming Soon</h1>
      <p className="text-body-md text-on-surface-variant max-w-md mb-8">
        Halaman ini sedang dalam tahap pengembangan dan akan tersedia pada update selanjutnya.
      </p>
      <Link to="/" className="btn btn-secondary">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
