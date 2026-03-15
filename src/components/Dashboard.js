import React from 'react';
import { useWorkspace } from '../hooks/useWorkspace';
import { BLOCK_TYPES } from '../data/initialData';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Dashboard() {
  const { state, dispatch } = useWorkspace();

  const navigate = (id) => dispatch({ type: 'SET_ACTIVE_PAGE', id });

  const allPages = Object.values(state.pages).filter(p => !p.isDashboard);

  // Recent pages (sorted by updatedAt)
  const recentPages = [...allPages]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 6);

  // Pinned pages
  const pinnedPages = allPages.filter(p => p.pinned);

  // Favorite pages
  const favoritePages = allPages.filter(p => p.favorite);

  // All tasks from all pages
  const allTasks = [];
  allPages.forEach(page => {
    (page.blocks || []).forEach(block => {
      if (block.type === BLOCK_TYPES.CHECKLIST) {
        allTasks.push({ ...block, pageId: page.id, pageName: page.title, pageIcon: page.icon });
      }
    });
  });

  const pendingTasks = allTasks.filter(t => !t.checked).slice(0, 5);
  const completedTasks = allTasks.filter(t => t.checked).slice(0, 3);

  // Learning streak (simple calculation based on journal pages updated recently)
  const streak = 5; // Would normally calculate from journal entries

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Project pages
  const projectPages = allPages.filter(p =>
    p.tags?.includes('project') || p.title.toLowerCase().includes('project')
  ).slice(0, 4);

  return (
    <div className="page-area">
      <div className="dashboard fade-in">
        {/* Greeting */}
        <div className="dashboard-greeting">
          <div className="greeting-label">Workspace</div>
          <div className="greeting-title">{greeting}, Student 👋</div>
          <div className="greeting-date">
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Pages', value: allPages.length, icon: '📄' },
            { label: 'Tasks Done', value: completedTasks.length + ' / ' + allTasks.length, icon: '✅' },
            { label: 'Favorites', value: favoritePages.length, icon: '⭐' },
            { label: 'Learning Streak', value: streak + ' days', icon: '🔥' },
          ].map(stat => (
            <div
              key={stat.label}
              style={{
                flex: '1 1 120px',
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '16px',
                minWidth: 110,
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--text)', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="dash-grid">
          {/* Recent Pages */}
          <div className="dash-card">
            <div className="dash-card-header">
              <span className="dash-card-title">Recent</span>
              <span className="dash-card-count">{recentPages.length}</span>
            </div>
            {recentPages.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text3)', padding: '8px 0' }}>No pages yet</div>
            ) : (
              recentPages.map(p => (
                <div key={p.id} className="dash-page-item" onClick={() => navigate(p.id)}>
                  <span className="page-ico">{p.icon}</span>
                  <div className="page-inf">
                    <div className="page-name">{p.title || 'Untitled'}</div>
                    <div className="page-time">{timeAgo(p.updatedAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Today's Tasks */}
          <div className="dash-card">
            <div className="dash-card-header">
              <span className="dash-card-title">Tasks</span>
              <span className="dash-card-count">{allTasks.filter(t => !t.checked).length} pending</span>
            </div>
            {pendingTasks.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text3)', padding: '8px 0' }}>All caught up! 🎉</div>
            ) : (
              pendingTasks.map(t => (
                <div key={t.id} className="dash-task-item" onClick={() => navigate(t.pageId)}>
                  <div className={`custom-checkbox ${t.checked ? 'checked' : ''}`} style={{ flexShrink: 0 }} />
                  <div>
                    <div className="task-text">{t.content || 'Task'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>
                      {t.pageIcon} {t.pageName}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Favorites */}
          <div className="dash-card">
            <div className="dash-card-header">
              <span className="dash-card-title">⭐ Favorites</span>
              <span className="dash-card-count">{favoritePages.length}</span>
            </div>
            {favoritePages.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text3)', padding: '8px 0' }}>Star pages to pin them here</div>
            ) : (
              favoritePages.map(p => (
                <div key={p.id} className="dash-page-item" onClick={() => navigate(p.id)}>
                  <span className="page-ico">{p.icon}</span>
                  <div className="page-inf">
                    <div className="page-name">{p.title || 'Untitled'}</div>
                    <div className="page-time">{p.tags?.join(', ') || 'No tags'}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Projects */}
          <div className="dash-card">
            <div className="dash-card-header">
              <span className="dash-card-title">💻 Projects</span>
              <span className="dash-card-count">{projectPages.length}</span>
            </div>
            {projectPages.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text3)', padding: '8px 0' }}>No projects yet</div>
            ) : (
              projectPages.map(p => (
                <div key={p.id} className="dash-page-item" onClick={() => navigate(p.id)}>
                  <span className="page-ico">{p.icon}</span>
                  <div className="page-inf">
                    <div className="page-name">{p.title || 'Untitled'}</div>
                    <div className="page-time">{timeAgo(p.updatedAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Streak section */}
        <div className="streak-display">
          <div className="streak-flame">🔥</div>
          <div className="streak-info">
            <div className="streak-num">{streak}</div>
            <div className="streak-label">Day learning streak — Keep it up!</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 20, height: 20,
                    background: i < streak ? 'var(--accent)' : 'var(--bg4)',
                    borderRadius: 4,
                    opacity: i < streak ? (0.4 + (i / streak) * 0.6) : 1,
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>Last 7 days</div>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text3)', marginBottom: 12 }}>
            Quick Actions
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: 'New Note', icon: '📝', action: () => dispatch({ type: 'CREATE_PAGE', title: 'New Note', icon: '📝' }) },
              { label: 'Journal Entry', icon: '✍️', action: () => dispatch({ type: 'CREATE_PAGE', parentId: Object.values(state.pages).find(p => p.title === 'Learning Journal')?.id, title: `Entry — ${new Date().toLocaleDateString()}`, icon: '✍️' }) },
              { label: 'New Project', icon: '🚀', action: () => dispatch({ type: 'CREATE_PAGE', title: 'New Project', icon: '🚀' }) },
              { label: 'Study Notes', icon: '📚', action: () => dispatch({ type: 'CREATE_PAGE', title: 'Study Notes', icon: '📚' }) },
            ].map(action => (
              <button
                key={action.label}
                onClick={action.action}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  fontSize: 13, color: 'var(--text2)',
                  cursor: 'pointer', transition: 'all 0.15s',
                  fontFamily: 'var(--font-display)', fontWeight: 600,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}
              >
                {action.icon} {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* All pages grid */}
        {allPages.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text3)', marginBottom: 12 }}>
              All Pages ({allPages.length})
            </div>
            <div className="pages-list-grid">
              {allPages
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .map(p => (
                  <div key={p.id} className="page-card" onClick={() => navigate(p.id)}>
                    <div className="page-card-icon">{p.icon}</div>
                    <div className="page-card-title">{p.title || 'Untitled'}</div>
                    <div className="page-card-meta">
                      {timeAgo(p.updatedAt)}
                      {p.tags?.length > 0 && ` · ${p.tags.slice(0, 2).join(', ')}`}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
