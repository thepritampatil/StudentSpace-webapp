import React, { useState } from 'react';
import { useWorkspace } from '../hooks/useWorkspace';

export default function TopBar({ onToggleSidebar, onOpenSearch }) {
  const { state, dispatch } = useWorkspace();
  const activePage = state.pages[state.activePage];
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Build breadcrumb
  const buildBreadcrumb = (page) => {
    if (!page) return [];
    const trail = [];
    let current = page;
    while (current) {
      trail.unshift(current);
      current = current.parentId ? state.pages[current.parentId] : null;
    }
    return trail;
  };

  const breadcrumb = activePage ? buildBreadcrumb(activePage) : [];

  const handleFavorite = () => {
    if (activePage) dispatch({ type: 'TOGGLE_FAVORITE', id: activePage.id });
  };

  const handlePin = () => {
    if (activePage) dispatch({ type: 'TOGGLE_PINNED', id: activePage.id });
  };

  const handleDuplicate = () => {
    if (activePage) dispatch({ type: 'DUPLICATE_PAGE', id: activePage.id });
  };

  const handleDelete = () => {
    if (activePage && !activePage.isDashboard) {
      if (window.confirm(`Delete "${activePage.title}"?`)) {
        dispatch({ type: 'DELETE_PAGE', id: activePage.id });
      }
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn" onClick={onToggleSidebar} title="Toggle sidebar">
          ☰
        </button>

        {/* Breadcrumb */}
        <nav className="breadcrumb">
          {breadcrumb.map((p, i) => (
            <React.Fragment key={p.id}>
              {i > 0 && <span className="breadcrumb-sep">/</span>}
              <span
                className={`breadcrumb-item ${i === breadcrumb.length - 1 ? 'current' : ''}`}
                onClick={() => i < breadcrumb.length - 1 && dispatch({ type: 'SET_ACTIVE_PAGE', id: p.id })}
              >
                {p.icon} {p.title || 'Untitled'}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="topbar-right">
        {/* Search */}
        <button className="search-trigger" onClick={onOpenSearch}>
          🔍 <span>Search</span>
          <span className="search-kbd">⌘K</span>
        </button>

        {/* Page actions */}
        {activePage && !activePage.isDashboard && (
          <>
            <button
              className="icon-btn"
              onClick={handleFavorite}
              title={activePage.favorite ? 'Remove from favorites' : 'Add to favorites'}
              style={{ color: activePage.favorite ? '#fbbf24' : undefined }}
            >
              {activePage.favorite ? '★' : '☆'}
            </button>

            <button
              className="icon-btn"
              onClick={handlePin}
              title={activePage.pinned ? 'Unpin' : 'Pin'}
              style={{ color: activePage.pinned ? 'var(--accent)' : undefined }}
            >
              📌
            </button>
          </>
        )}

        {/* More actions */}
        {activePage && !activePage.isDashboard && (
          <div style={{ position: 'relative' }}>
            <button
              className="icon-btn"
              onClick={() => setShowProfile(!showProfile)}
              title="Page options"
            >
              ⋯
            </button>
            {showProfile && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 499 }} onClick={() => setShowProfile(false)} />
                <div className="context-menu fade-in" style={{ position: 'absolute', top: '100%', right: 0, zIndex: 500 }}>
                  <div className="ctx-item" onClick={() => { handleDuplicate(); setShowProfile(false); }}>⎘ Duplicate page</div>
                  <div className="ctx-item" onClick={() => { handlePin(); setShowProfile(false); }}>📌 {activePage.pinned ? 'Unpin' : 'Pin'}</div>
                  <div className="ctx-item" onClick={() => { handleFavorite(); setShowProfile(false); }}>
                    {activePage.favorite ? '★ Remove favorite' : '☆ Add to favorites'}
                  </div>
                  <div className="ctx-sep" />
                  <div className="ctx-item" onClick={() => {
                    const date = new Date(activePage.updatedAt);
                    alert(`Last edited: ${date.toLocaleString()}\nCreated: ${new Date(activePage.createdAt).toLocaleString()}`);
                    setShowProfile(false);
                  }}>ℹ Page info</div>
                  <div className="ctx-sep" />
                  <div className="ctx-item danger" onClick={() => { handleDelete(); setShowProfile(false); }}>🗑 Delete page</div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Settings */}
        <div style={{ position: 'relative' }}>
          <button
            className="icon-btn"
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
          >
            ⚙
          </button>
          {showSettings && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 499 }} onClick={() => setShowSettings(false)} />
              <div className="context-menu fade-in" style={{ position: 'absolute', top: '100%', right: 0, zIndex: 500, minWidth: 200 }}>
                <div style={{ padding: '8px 10px', fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Settings</div>
                <div className="ctx-item" onClick={() => {
                  if (window.confirm('Clear all data and reset workspace?')) {
                    localStorage.removeItem('studentspace_v2');
                    window.location.reload();
                  }
                  setShowSettings(false);
                }}>🔄 Reset workspace</div>
                <div className="ctx-sep" />
                <div style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text3)' }}>
                  {Object.keys(state.pages).length} pages • v1.0
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile */}
        <div
          style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white',
            cursor: 'pointer', flexShrink: 0,
          }}
          title="Profile"
        >
          S
        </div>
      </div>
    </header>
  );
}
