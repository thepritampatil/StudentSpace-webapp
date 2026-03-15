import React, { useState, useEffect, useCallback } from 'react';
import { useWorkspace } from '../hooks/useWorkspace';
import { BLOCK_TYPES } from '../data/initialData';

export default function SearchModal({ onClose }) {
  const { state, dispatch } = useWorkspace();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const search = (q) => {
    if (!q.trim()) return [];
    const lq = q.toLowerCase();
    const results = [];

    Object.values(state.pages).forEach(page => {
      if (page.isDashboard) return;

      // Match title
      if (page.title.toLowerCase().includes(lq)) {
        results.push({
          pageId: page.id,
          type: 'title',
          title: page.title,
          icon: page.icon,
          excerpt: page.tags?.join(', ') || '',
          score: 3,
        });
        return;
      }

      // Match tags
      if (page.tags?.some(t => t.toLowerCase().includes(lq))) {
        results.push({
          pageId: page.id,
          type: 'tag',
          title: page.title,
          icon: page.icon,
          excerpt: `Tagged: ${page.tags.join(', ')}`,
          score: 2,
        });
        return;
      }

      // Match block content
      const matchingBlock = (page.blocks || []).find(b =>
        b.content && b.content.toLowerCase().includes(lq) && b.type !== BLOCK_TYPES.DIVIDER
      );
      if (matchingBlock) {
        results.push({
          pageId: page.id,
          type: 'content',
          title: page.title,
          icon: page.icon,
          excerpt: matchingBlock.content.slice(0, 80) + (matchingBlock.content.length > 80 ? '...' : ''),
          score: 1,
        });
      }
    });

    return results.sort((a, b) => b.score - a.score).slice(0, 12);
  };

  const results = search(query);

  const handleSelect = (pageId) => {
    dispatch({ type: 'SET_ACTIVE_PAGE', id: pageId });
    onClose();
  };

  // Build path for a page
  const getPath = (pageId) => {
    const page = state.pages[pageId];
    if (!page || !page.parentId) return '';
    const parent = state.pages[page.parentId];
    return parent ? `${parent.icon} ${parent.title}` : '';
  };

  return (
    <div className="search-overlay fade-in" onClick={onClose}>
      <div className="search-modal slide-in" onClick={e => e.stopPropagation()}>
        <div className="search-input-row">
          <span className="si">🔍</span>
          <input
            autoFocus
            placeholder="Search pages, notes, tasks..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ fontSize: 14, color: 'var(--text3)', padding: '2px 6px', borderRadius: 4 }}
            >✕</button>
          )}
        </div>

        <div className="search-results">
          {!query ? (
            <div>
              <div style={{ padding: '10px 20px 6px', fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text3)' }}>
                Recent Pages
              </div>
              {Object.values(state.pages)
                .filter(p => !p.isDashboard)
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .slice(0, 7)
                .map(p => (
                  <div key={p.id} className="search-result-item" onClick={() => handleSelect(p.id)}>
                    <span className="search-result-icon">{p.icon}</span>
                    <div className="search-result-info">
                      <div className="search-result-title">{p.title || 'Untitled'}</div>
                      <div className="search-result-path">{getPath(p.id) || 'Workspace'}</div>
                    </div>
                  </div>
                ))}
            </div>
          ) : results.length > 0 ? (
            <>
              <div style={{ padding: '10px 20px 6px', fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text3)' }}>
                {results.length} result{results.length !== 1 ? 's' : ''}
              </div>
              {results.map((r, i) => (
                <div key={i} className="search-result-item" onClick={() => handleSelect(r.pageId)}>
                  <span className="search-result-icon">{r.icon}</span>
                  <div className="search-result-info">
                    <div className="search-result-title">{r.title || 'Untitled'}</div>
                    {r.excerpt && <div className="search-result-excerpt">{r.excerpt}</div>}
                    <div className="search-result-path">
                      {r.type === 'content' ? 'Matched in content' : r.type === 'tag' ? 'Matched by tag' : 'Page title'}
                      {' · '}{getPath(r.pageId) || 'Workspace'}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="search-empty">
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
              No results for "<strong>{query}</strong>"
            </div>
          )}
        </div>

        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>↑↓ navigate</span>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>↵ open</span>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>Esc close</span>
        </div>
      </div>
    </div>
  );
}
