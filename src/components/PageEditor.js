import React, { useState, useRef } from 'react';
import { useWorkspace } from '../hooks/useWorkspace';
import BlockEditor from './BlockEditor';
import { PAGE_ICONS } from '../data/initialData';

export default function PageEditor({ pageId }) {
  const { state, dispatch } = useWorkspace();
  const page = state.pages[pageId];
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [addingTag, setAddingTag] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const iconRef = useRef(null);

  if (!page) return (
    <div className="empty-state fade-in">
      <div className="empty-icon">📄</div>
      <div className="empty-title">No page selected</div>
      <div className="empty-desc">Select a page from the sidebar or create a new one.</div>
    </div>
  );

  const updateTitle = (e) => {
    dispatch({ type: 'UPDATE_PAGE', id: pageId, updates: { title: e.target.value } });
  };

  const updateIcon = (icon) => {
    dispatch({ type: 'UPDATE_PAGE', id: pageId, updates: { icon } });
    setShowIconPicker(false);
  };

  const handleTagAdd = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (tag) {
      dispatch({ type: 'ADD_TAG', pageId, tag });
    }
    setTagInput('');
    setAddingTag(false);
  };

  const subpages = page.children?.map(id => state.pages[id]).filter(Boolean) || [];

  return (
    <div className="page-area">
      <div className="editor-container fade-in" key={pageId}>
        {/* Icon */}
        <div className="page-icon-area" ref={iconRef} style={{ position: 'relative' }}>
          <span
            className="page-icon-display"
            onClick={() => setShowIconPicker(!showIconPicker)}
            title="Change icon"
          >
            {page.icon}
          </span>
          {showIconPicker && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setShowIconPicker(false)} />
              <div className="icon-picker fade-in" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 200 }}>
                {PAGE_ICONS.map(ico => (
                  <div key={ico} className="icon-opt" onClick={() => updateIcon(ico)}>{ico}</div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Title */}
        <textarea
          className="page-title-input"
          value={page.title || ''}
          onChange={updateTitle}
          placeholder="Untitled"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              // Focus first block
            }
          }}
        />

        {/* Tags */}
        <div className="page-meta">
          {page.tags?.map(tag => (
            <span key={tag} className="page-tag">
              #{tag}
              <span
                className="remove-tag"
                onClick={() => dispatch({ type: 'REMOVE_TAG', pageId, tag })}
              >×</span>
            </span>
          ))}
          {addingTag ? (
            <input
              autoFocus
              className="tags-input-field"
              placeholder="tag name..."
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleTagAdd();
                if (e.key === 'Escape') { setAddingTag(false); setTagInput(''); }
              }}
              onBlur={handleTagAdd}
            />
          ) : (
            <button className="add-tag-input" onClick={() => setAddingTag(true)}>+ Add tag</button>
          )}

          {/* Updated at */}
          <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
            Edited {new Date(page.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <hr className="page-divider" />

        {/* Blocks */}
        <BlockEditor pageId={pageId} />

        {/* Subpages section */}
        {subpages.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <div style={{
              fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text3)',
              marginBottom: 12,
            }}>
              Subpages ({subpages.length})
            </div>
            <div className="pages-list-grid">
              {subpages.map(sp => (
                <div
                  key={sp.id}
                  className="page-card"
                  onClick={() => dispatch({ type: 'SET_ACTIVE_PAGE', id: sp.id })}
                >
                  <div className="page-card-icon">{sp.icon}</div>
                  <div className="page-card-title">{sp.title || 'Untitled'}</div>
                  <div className="page-card-meta">
                    {new Date(sp.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {sp.tags?.length > 0 && ` · ${sp.tags.slice(0,2).join(', ')}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create subpage button */}
        <div style={{ marginTop: 32 }}>
          <button
            onClick={() => dispatch({ type: 'CREATE_PAGE', parentId: pageId, title: 'Untitled', icon: '📝' })}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', borderRadius: 8,
              border: '1px dashed var(--border2)',
              color: 'var(--text3)', fontSize: 13,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.borderColor = 'var(--border2)'; }}
          >
            + Add subpage
          </button>
        </div>
      </div>
    </div>
  );
}
