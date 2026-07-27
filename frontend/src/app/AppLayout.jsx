import { Outlet } from 'react-router';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function AppLayout() {
  return (
    <SidebarProvider>
      <Sidebar />

      <SidebarInset className="flex flex-col h-svh overflow-hidden">
        <Navbar />

        <main className="flex-1 h-full overflow-y-auto p-4">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
