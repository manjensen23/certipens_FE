import { Link } from 'react-router-dom';
import ShieldLogo from '@/components/ui/ShieldLogo';

export default function PublicNavbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-outline-variant bg-white">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        <Link to="/">
          <ShieldLogo size="sm" />
        </Link>
        <Link
          to="/"
          className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
        >
          Beranda
        </Link>
      </div>
    </header>
  );
}
