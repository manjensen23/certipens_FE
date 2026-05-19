import { Menu, Bell, HelpCircle } from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="flex gap-3 px-4 py-5 glass sticky top-0 z-30">
      {/* Left: Mobile menu button + Search */}
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high lg:hidden transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Search bar */}
        {/* <div className="hidden sm:flex items-center gap-2 rounded-lg bg-surface-container px-3 py-2 flex-1 max-w-md">
          <Search size={18} className="text-on-surface-variant shrink-0" />
          <input
            type="text"
            placeholder="Cari data asesi, sertifikasi..."
            className="bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none w-full"
          />
        </div> */}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Notification bell */}
        <button className="relative rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors">
          <Bell size={20} />
        </button>

        {/* Help icon */}
        <button className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors">
          <HelpCircle size={20} />
        </button>
      </div>
    </header>
  );
}
