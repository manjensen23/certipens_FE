import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-light text-center p-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-error/10 text-error mb-6">
        <ShieldX size={40} />
      </div>
      <h1 className="text-headline-md text-on-surface mb-3">Akses Ditolak</h1>
      <p className="text-body-md text-on-surface-variant max-w-md mb-8">
        Anda tidak memiliki izin untuk mengakses halaman ini. Silakan login dengan akun yang sesuai.
      </p>
      <Link to="/login" className="btn btn-primary">
        Kembali ke Login
      </Link>
    </div>
  );
}
