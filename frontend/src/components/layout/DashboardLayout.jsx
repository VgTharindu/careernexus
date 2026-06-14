import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar  from './Topbar';

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const current = localStorage.getItem('sidebarCollapsed') === 'true';
      setCollapsed(current);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen" 
      style={{ background: 'var(--color-bg-primary)' }}
    >
      <Sidebar />
      <Topbar collapsed={collapsed} />

      {/* Main content */}
      <main
        className="min-h-screen transition-all"
        style={{
          marginLeft: collapsed ? '64px' : '240px',
          paddingTop: '64px',
          transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div className="p-6 fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}