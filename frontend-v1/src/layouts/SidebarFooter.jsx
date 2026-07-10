// SidebarFooter.jsx

import { LogOut } from 'lucide-react';
import { ProfileImage } from '@/shared/ui';

export default function SidebarFooter({ user, onLogout }) {
  return (
    <div className="border-t border-border p-4">
      <div className="mb-4 flex items-center gap-3">
        <ProfileImage
          src={user?.avatar}
          name={user?.name}
          title={user?.username || user?.role}
          className="h-10 w-10"
          fallbackClassName="bg-primary text-sm font-semibold text-primary-foreground"
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {user?.name}
          </p>

          <p className="truncate text-xs capitalize text-muted-foreground">
            {user?.role?.replace('_', ' ')}
          </p>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="group flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="h-5 w-5" />

        <span>Logout</span>
      </button>
    </div>
  );
}
