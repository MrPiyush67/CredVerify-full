import { useLocation } from 'react-router';

import SidebarBrand from './SidebarBrand';
import SidebarItem from './SidebarItem';
import SidebarSection from './SidebarSection';
import SidebarFooter from './SidebarFooter';
import { useGetMe, useLogout } from '@/features/auth/index.js';
import { useState } from 'react';

import MobileHeader from './MobileHeader.jsx';
import { navigationItems } from './navigationItems.js';

export default function Sidebar({ children }) {
  const location = useLocation();
  const { data: user, isPending } = useGetMe();
  const { mutateAsync: logoutMutation } = useLogout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigation = navigationItems[user.role];

  const handleLogout = async (e) => {
    e.preventDefault();

    try {
      await logoutMutation();
    } catch (error) {
      console.error('Logout failed:', error);

      toast.error('Logout failed:', error);
    }

    localStorage.clear();

    sessionStorage.clear();
  };

  if (isPending) return <Loader type="page" />;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden h-full w-72 shrink-0 border-r border-border/80 bg-card/95 md:flex md:flex-col">
        <SidebarBrand />

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <SidebarSection title="Main">
            {navigation.main.map((item) => (
              <SidebarItem
                key={item.href}
                to={item.href}
                label={item.label}
                icon={item.icon}
                active={location.pathname === item.href}
              />
            ))}
          </SidebarSection>

          {navigation.workspace?.length > 0 && (
            <SidebarSection title="Workspace">
              {navigation.workspace.map((item) => (
                <SidebarItem
                  key={item.href}
                  to={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={location.pathname === item.href}
                />
              ))}
            </SidebarSection>
          )}

          {navigation.account?.length > 0 && (
            <SidebarSection title="Account">
              {navigation.account.map((item) => (
                <SidebarItem
                  key={item.href}
                  to={
                    item.href === '/profile'
                      ? `/profile/${user.username}`
                      : item.href
                  }
                  label={item.label}
                  icon={item.icon}
                  active={location.pathname === item.href}
                />
              ))}
            </SidebarSection>
          )}
        </div>

        <SidebarFooter user={user} onLogout={handleLogout} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MobileHeader
          isOpen={isMobileMenuOpen}
          onToggle={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
