import React from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export const DashboardLayout = ({ children }) => (
  <div className="flex w-full min-h-[calc(100vh-4rem)] pb-20 lg:pb-0">
    <Sidebar />
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">{children}</main>
    <MobileNav />
  </div>
);

export default DashboardLayout;
