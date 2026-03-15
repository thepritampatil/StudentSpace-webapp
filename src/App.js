import React, { useState, useEffect, useCallback } from 'react';
import { WorkspaceProvider, useWorkspace } from './hooks/useWorkspace';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import PageEditor from './components/PageEditor';
import SearchModal from './components/SearchModal';
import './styles/global.css';

function AppInner() {
  const { state } = useWorkspace();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    if (isMobile) {
      setMobileSidebarOpen(o => !o);
    } else {
      setSidebarOpen(o => !o);
    }
  }, [isMobile]);

  const activePage = state.pages[state.activePage];
  const isDashboard = activePage?.isDashboard;

  return (
    <div className="app-layout">
      {/* Sidebar */}
      {!isMobile && sidebarOpen && (
        <Sidebar
          mobileOpen={false}
          onCloseMobile={() => {}}
          onOpenSearch={() => setSearchOpen(true)}
        />
      )}
      {isMobile && (
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onOpenSearch={() => setSearchOpen(true)}
        />
      )}

      {/* Main area */}
      <div className="main-area">
        <TopBar
          onToggleSidebar={handleToggleSidebar}
          onOpenSearch={() => setSearchOpen(true)}
        />

        {isDashboard ? (
          <Dashboard />
        ) : (
          <PageEditor pageId={state.activePage} />
        )}
      </div>

      {/* Search modal */}
      {searchOpen && (
        <SearchModal onClose={() => setSearchOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <WorkspaceProvider>
      <AppInner />
    </WorkspaceProvider>
  );
}
