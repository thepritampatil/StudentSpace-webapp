import React, { useState, useCallback } from 'react';
import { useWorkspace } from '../hooks/useWorkspace';
import { PAGE_ICONS } from '../data/initialData';

function NavItem({ pageId, depth = 0, onContextMenu }) {
  const { state, dispatch } = useWorkspace();
  const page = state.pages[pageId];
  const [expanded, setExpanded] = useState(depth < 1);

  if (!page) return null;
  const isActive = state.activePage === pageId;
  const hasChildren = page.children && page.children.length > 0;

  const handleClick = (e) => {
    e.stopPropagation();
    dispatch({ type: 'SET_ACTIVE_PAGE', id: pageId });
  };

  const handleAddChild = (e) => {
    e.stopPropagation();
    dispatch({ type: 'CREATE_PAGE', parentId: pageId, title: 'Untitled', icon: '📝' });
  };

  return (
    <div>
      <div
        className={`nav-item ${isActive ? 'active' : ''}`}
        onContextMenu={(e) => onContextMenu(e, pageId)}
      >
        <button
          className={`nav-item-toggle ${hasChildren ? (expanded ? 'expanded' : '') : 'leaf'}`}
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        >
          ▶
        </button>
        <div className="nav-item-inner" onClick={handleClick}>
          <span className="nav-item-icon">{page.icon}</span>
          <span className="nav-item-title">{page.title || 'Untitled'}</span>
        </div>
        <div className="nav-item-actions">
          <button className="nav-action-btn" onClick={handleAddChild} title="Add subpage">＋</button>
          <button
            className="nav-action-btn"
            onClick={(e) => { e.stopPropagation(); onContextMenu(e, pageId); }}
            title="More options"
          >⋯</button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="nav-children">
          {page.children.map(cid => (
            <NavItem key={cid} pageId={cid} depth={depth + 1} onContextMenu={onContextMenu} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ mobileOpen, onCloseMobile, onOpenSearch }) {
  const { state, dispatch } = useWorkspace();
  const [search, setSearch] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageIcon, setNewPageIcon] = useState('📝');

  const handleContextMenu = useCallback((e, pageId) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, pageId });
  }, []);

  const closeMenu = useCallback(() => setContextMenu(null), []);

  const favorites = Object.values(state.pages).filter(p => p.favorite && !p.isDashboard);
  const pinnedPages = Object.values(state.pages).filter(p => p.pinned && !p.isDashboard);

  // filter pages by search
  const searchResults = search.trim()
    ? Object.values(state.pages).filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : null;

  const handleCreatePage = () => {
    if (newPageTitle.trim()) {
      dispatch({ type: 'CREATE_PAGE', title: newPageTitle.trim(), icon: newPageIcon });
      setNewPageTitle('');
      setShowNewModal(false);
    }
  };

  const handleContextAction = (action) => {
    const { pageId } = contextMenu;
    closeMenu();
    if (action === 'open') dispatch({ type: 'SET_ACTIVE_PAGE', id: pageId });
    if (action === 'addChild') dispatch({ type: 'CREATE_PAGE', parentId: pageId, title: 'Untitled', icon: '📝' });
    if (action === 'duplicate') dispatch({ type: 'DUPLICATE_PAGE', id: pageId });
    if (action === 'favorite') dispatch({ type: 'TOGGLE_FAVORITE', id: pageId });
    if (action === 'pin') dispatch({ type: 'TOGGLE_PINNED', id: pageId });
    if (action === 'delete') dispatch({ type: 'DELETE_PAGE', id: pageId });
    if (action === 'moveToRoot') dispatch({ type: 'MOVE_PAGE', id: pageId, newParentId: null });
  };

  const dashId = state.pageOrder.find(id => state.pages[id]?.isDashboard);
  const rootPages = state.pageOrder.filter(id => {
    const p = state.pages[id];
    return p && !p.parentId && !p.isDashboard;
  });

  return (
    <>
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={onCloseMobile} />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="workspace-brand">
            <div className="brand-icon">S</div>
            <span className="brand-name">StudentSpace</span>
          </div>
        </div>

        <div className="sidebar-search">
          <span className="search-icon">🔍</span>
          <input
            placeholder="Search pages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onClick={() => onOpenSearch()}
          />
        </div>

        <nav className="sidebar-nav">
          {/* Dashboard */}
          {dashId && (
            <div
              className={`nav-item ${state.activePage === dashId ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_ACTIVE_PAGE', id: dashId })}
            >
              <button className="nav-item-toggle leaf">▶</button>
              <div className="nav-item-inner">
                <span className="nav-item-icon">🏠</span>
                <span className="nav-item-title">Dashboard</span>
              </div>
            </div>
          )}

          {/* Favorites */}
          {favorites.length > 0 && (
            <>
              <div className="sidebar-section-label">Favorites</div>
              {favorites.map(p => (
                <NavItem key={p.id} pageId={p.id} depth={0} onContextMenu={handleContextMenu} />
              ))}
            </>
          )}

          {/* Workspace pages */}
          <div className="sidebar-section-label">Workspace</div>
          {searchResults ? (
            searchResults.length > 0 ? searchResults.map(p => (
              <div
                key={p.id}
                className={`nav-item ${state.activePage === p.id ? 'active' : ''}`}
                onClick={() => { dispatch({ type: 'SET_ACTIVE_PAGE', id: p.id }); setSearch(''); }}
              >
                <button className="nav-item-toggle leaf">▶</button>
                <div className="nav-item-inner">
                  <span className="nav-item-icon">{p.icon}</span>
                  <span className="nav-item-title">{p.title}</span>
                </div>
              </div>
            )) : (
              <div style={{ padding: '12px 16px', color: 'var(--text3)', fontSize: 13 }}>No pages found</div>
            )
          ) : (
            rootPages.map(id => (
              <NavItem key={id} pageId={id} depth={0} onContextMenu={handleContextMenu} />
            ))
          )}

          <button className="nav-add-btn" onClick={() => setShowNewModal(true)}>
            + New page
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="new-page-btn" onClick={() => setShowNewModal(true)}>
            ＋ New Page
          </button>
        </div>
      </aside>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 499 }} onClick={closeMenu} />
          <div
            className="context-menu fade-in"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <div className="ctx-item" onClick={() => handleContextAction('open')}>📄 Open</div>
            <div className="ctx-item" onClick={() => handleContextAction('addChild')}>＋ Add subpage</div>
            <div className="ctx-item" onClick={() => handleContextAction('duplicate')}>⎘ Duplicate</div>
            <div className="ctx-sep" />
            <div className="ctx-item" onClick={() => handleContextAction('favorite')}>
              {state.pages[contextMenu.pageId]?.favorite ? '★ Remove favorite' : '☆ Add to favorites'}
            </div>
            <div className="ctx-item" onClick={() => handleContextAction('pin')}>
              {state.pages[contextMenu.pageId]?.pinned ? '📌 Unpin' : '📌 Pin page'}
            </div>
            <div className="ctx-item" onClick={() => handleContextAction('moveToRoot')}>↑ Move to root</div>
            <div className="ctx-sep" />
            <div className="ctx-item danger" onClick={() => handleContextAction('delete')}>🗑 Delete</div>
          </div>
        </>
      )}

      {/* New Page Modal */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal-box slide-in" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Create New Page</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8, fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Choose Icon</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {PAGE_ICONS.map(ico => (
                  <button
                    key={ico}
                    onClick={() => setNewPageIcon(ico)}
                    style={{
                      width: 36, height: 36, borderRadius: 6, fontSize: 18,
                      background: newPageIcon === ico ? 'var(--accent-glow)' : 'var(--bg3)',
                      border: newPageIcon === ico ? '2px solid var(--accent)' : '1px solid var(--border)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.1s ease',
                    }}
                  >{ico}</button>
                ))}
              </div>
            </div>
            <input
              className="modal-input"
              placeholder="Page title..."
              value={newPageTitle}
              onChange={e => setNewPageTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreatePage()}
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowNewModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreatePage}>Create Page</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
