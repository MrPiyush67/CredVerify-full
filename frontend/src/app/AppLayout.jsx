import React from 'react';
import { Outlet } from 'react-router';
import Sidebar from './components/Sidebar.jsx';
import Navbar from './components/Navbar.jsx';
import { SidebarProvider } from '@/components/ui/sidebar.jsx';

const AppLayout = () => {
  return (
    <SidebarProvider>
      <div className="h-screen flex overflow-hidden">
        <Sidebar />
        <div className=" flex flex-1 flex-col">
          <Navbar />
          <div className="px-4 overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
