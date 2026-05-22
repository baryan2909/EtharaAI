import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import ErrorBoundary from './ErrorBoundary';

export const DashboardLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-warm-50 dark:bg-darkbg-900">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className={`flex flex-col flex-1 h-screen overflow-hidden transition-all duration-300 ${
        isCollapsed ? 'ml-[68px]' : 'ml-60'
      }`}>
        <Navbar />
        <main className="flex-1 overflow-y-auto px-6 py-7 md:px-8 bg-warm-50 dark:bg-darkbg-900">
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary key={location.pathname} onReset={() => window.location.reload()}>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};
