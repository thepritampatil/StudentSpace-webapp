import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useWorkspace } from '../hooks/useWorkspace';
import { BLOCK_TYPES, createBlock } from '../data/initialData';

const BLOCK_OPTIONS = [
  { type: BLOCK_TYPES.PARAGRAPH, icon: '¶', name: 'Paragraph', desc: 'Plain text' },
  { type: BLOCK_TYPES.HEADING1, icon: 'H1', name: 'Heading 1', desc: 'Large section heading' },
  { type: BLOCK_TYPES.HEADING2, icon: 'H2', name: 'Heading 2', desc: 'Medium section heading' },
  { type: BLOCK_TYPES.HEADING3, icon: 'H3', name: 'Heading 3', desc: 'Small section heading' },
  { type: BLOCK_TYPES.BULLET, icon: '•', name: 'Bullet List', desc: 'Unordered list' },
  { type: BLOCK_TYPES.NUMBERED, icon: '1.', name: 'Numbered List', desc: 'Ordered list' },
  { type: BLOCK_TYPES.CHECKLIST, icon: '☐', name: 'Checklist', desc: 'Task with checkbox' },
  { type: BLOCK_TYPES.QUOTE, icon: '"', name: 'Quote', desc: 'Highlighted quote' },
  { type: BLOCK_TYPES.CODE, icon: '</>', name: 'Code', desc: 'Code block' },
  { type: BLOCK_TYPES.LINK, icon: '🔗', name: 'Link', desc: 'Add a link' },
  { type: BLOCK_TYPES.DIVIDER, icon: '—', name: 'Divider', desc: 'Horizontal line' },
];

function AutoResizeTextarea({ value, onChange, onKeyDown, placeholder, className, style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      className={className}
      style={{ ...style, overflow: 'hidden', minHeight: 26 }}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      rows={1}
    />
  );
}

function Block({ block, pageId, index, totalBlocks, numberedIndex }) {
  const { dispatch } = useWorkspace();
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [typeMenuSearch, setTypeMenuSearch] = useState('');
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  const update = useCallback((updates) => {
    dispatch({ type: 'UPDATE_BLOCK', pageId, blockId: block.id, updates });
  }, [dispatch, pageId, block.id]);

  const deleteBlock = useCallback(() => {
    dispatch({ type: 'DELETE_BLOCK', pageId, blockId: block.id });
  }, [dispatch, pageId, block.id]);

  const addAfter = useCallback((type = BLOCK_TYPES.PARAGRAPH) => {
    dispatch({ type: 'ADD_BLOCK', pageId, afterId: block.id, blockType: type });
  }, [dispatch, pageId, block.id]);

  const changeType = useCallback((newType) => {
    update({ type: newType });
    setShowTypeMenu(false);
  }, [update]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && block.type !== BLOCK_TYPES.CODE) {
      e.preventDefault();
      addAfter(
        block.type === BLOCK_TYPES.BULLET ? BLOCK_TYPES.BULLET :
        block.type === BLOCK_TYPES.NUMBERED ? BLOCK_TYPES.NUMBERED :
        block.type === BLOCK_TYPES.CHECKLIST ? BLOCK_TYPES.CHECKLIST :
        BLOCK_TYPES.PARAGRAPH
      );
    }
    if (e.key === 'Backspace' && !block.content && totalBlocks > 1) {
      e.preventDefault();
      deleteBlock();
    }
    if (e.key === '/' && !block.content) {
      e.preventDefault();
      setShowTypeMenu(true);
      setTypeMenuSearch('');
    }
  };

  const [copyLabel, setCopyLabel] = useState('Copy');
  const handleCopy = () => {
    navigator.clipboard.writeText(block.content);
    setCopyLabel('Copied!');
    setTimeout(() => setCopyLabel('Copy'), 1500);
  };

  const filteredOptions = BLOCK_OPTIONS.filter(o =>
    !typeMenuSearch || o.name.toLowerCase().includes(typeMenuSearch.toLowerCase())
  );

  const renderBlockContent = () => {
    switch (block.type) {
      case BLOCK_TYPES.HEADING1:
        return (
          <AutoResizeTextarea
            className="block-h1 inline-editor"
            value={block.content}
            onChange={e => update({ content: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Heading 1"
          />
        );
      case BLOCK_TYPES.HEADING2:
        return (
          <AutoResizeTextarea
            className="block-h2 inline-editor"
            value={block.content}
            onChange={e => update({ content: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Heading 2"
          />
        );
      case BLOCK_TYPES.HEADING3:
        return (
          <AutoResizeTextarea
            className="block-h3 inline-editor"
            value={block.content}
            onChange={e => update({ content: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Heading 3"
          />
        );
      case BLOCK_TYPES.BULLET:
        return (
          <div className="block-bullet">
            <span className="marker">●</span>
            <AutoResizeTextarea
              className="inline-editor"
              value={block.content}
              onChange={e => update({ content: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="List item"
            />
          </div>
        );
      case BLOCK_TYPES.NUMBERED:
        return (
          <div className="block-numbered">
            <span className="marker">{numberedIndex}.</span>
            <AutoResizeTextarea
              className="inline-editor"
              value={block.content}
              onChange={e => update({ content: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="List item"
            />
          </div>
        );
      case BLOCK_TYPES.CHECKLIST:
        return (
          <div className={`block-checklist ${block.checked ? 'checked' : ''}`}>
            <div
              className={`custom-checkbox ${block.checked ? 'checked' : ''}`}
              onClick={() => update({ checked: !block.checked })}
            />
            <AutoResizeTextarea
              className="inline-editor check-text"
              value={block.content}
              onChange={e => update({ content: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="Task item"
            />
          </div>
        );
      case BLOCK_TYPES.QUOTE:
        return (
          <div className="block-quote">
            <AutoResizeTextarea
              className="inline-editor"
              value={block.content}
              onChange={e => update({ content: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="Type a quote..."
            />
          </div>
        );
      case BLOCK_TYPES.CODE:
        return (
          <div className="block-code-wrap">
            <div className="code-header">
              <select
                className="code-lang"
                value={block.language || 'javascript'}
                onChange={e => update({ language: e.target.value })}
              >
                {['javascript','python','java','c','cpp','css','html','sql','bash','json','text','typescript','rust','go'].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <button className="code-copy-btn" onClick={handleCopy}>{copyLabel}</button>
            </div>
            <AutoResizeTextarea
              className="block-code-editor"
              value={block.content}
              onChange={e => update({ content: e.target.value })}
              placeholder="// Write code here..."
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>
        );
      case BLOCK_TYPES.DIVIDER:
        return <hr className="block-divider" />;
      case BLOCK_TYPES.LINK:
        return (
          <div className="block-link-row">
            <span className="link-icon">🔗</span>
            {block.url ? (
              <>
                <a href={block.url} target="_blank" rel="noopener noreferrer">{block.content || block.url}</a>
                <button
                  style={{ fontSize: 12, color: 'var(--text3)', padding: '2px 6px', borderRadius: 4, transition: 'all 0.1s' }}
                  onClick={() => update({ url: '', content: '' })}
                >✕</button>
              </>
            ) : (
              <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); update({ url: fd.get('url'), content: fd.get('title') || fd.get('url') }); }} style={{ display: 'flex', gap: 8, flex: 1 }}>
                <input name="title" placeholder="Link title" className="link-url-input" style={{ flex: 1, background: 'none', fontSize: 13, color: 'var(--text2)' }} />
                <input name="url" placeholder="https://..." className="link-url-input" style={{ flex: 2, background: 'none', fontSize: 13, color: 'var(--text2)' }} />
                <button type="submit" style={{ fontSize: 12, color: 'var(--accent)', padding: '2px 8px', background: 'var(--accent-glow)', borderRadius: 4 }}>Add</button>
              </form>
            )}
          </div>
        );
      default:
        return (
          <AutoResizeTextarea
            className="block-para inline-editor"
            value={block.content}
            onChange={e => update({ content: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder={block.content === '' ? "Type '/' for commands, or start writing..." : 'Type something...'}
          />
        );
    }
  };

  return (
    <div className="block-row" style={{ position: 'relative' }}>
      <div className="block-handle">
        <button className="handle-btn" onClick={() => setShowTypeMenu(!showTypeMenu)} title="Change block type">⊞</button>
        <button className="handle-btn" onClick={deleteBlock} title="Delete block">×</button>
      </div>

      <div className="block-content">
        {renderBlockContent()}
      </div>

      {/* Type menu */}
      {showTypeMenu && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowTypeMenu(false)} />
          <div className="block-type-menu fade-in" style={{ position: 'absolute', left: 44, top: 0, zIndex: 100 }}>
            <input
              autoFocus
              placeholder="Search blocks..."
              value={typeMenuSearch}
              onChange={e => setTypeMenuSearch(e.target.value)}
              style={{
                width: '100%', padding: '6px 10px', background: 'var(--bg4)',
                border: '1px solid var(--border)', borderRadius: 6, fontSize: 12,
                color: 'var(--text)', marginBottom: 4,
              }}
            />
            {filteredOptions.map(opt => (
              <div key={opt.type} className="block-type-option" onClick={() => changeType(opt.type)}>
                <div className="block-type-icon">{opt.icon}</div>
                <div className="block-type-info">
                  <div className="block-type-name">{opt.name}</div>
                  <div className="block-type-desc">{opt.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function BlockEditor({ pageId }) {
  const { state, dispatch } = useWorkspace();
  const page = state.pages[pageId];

  if (!page) return null;

  // calculate numbered index
  const numberedCounters = {};
  const blocks = page.blocks || [];

  let numCounter = 0;
  const numberedIndices = blocks.map(b => {
    if (b.type === BLOCK_TYPES.NUMBERED) {
      numCounter++;
      return numCounter;
    } else {
      numCounter = 0;
      return 0;
    }
  });

  const addBlock = (type) => {
    dispatch({ type: 'ADD_BLOCK', pageId, blockType: type });
  };

  return (
    <div className="blocks-container">
      {blocks.map((block, i) => (
        <Block
          key={block.id}
          block={block}
          pageId={pageId}
          index={i}
          totalBlocks={blocks.length}
          numberedIndex={numberedIndices[i]}
        />
      ))}

      {/* Add block button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '4px 0 4px 44px' }}>
        <button
          onClick={() => addBlock(BLOCK_TYPES.PARAGRAPH)}
          style={{
            fontSize: 13, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 8px', borderRadius: 6, transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg3)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'none'; }}
        >
          + Add block
        </button>
      </div>
    </div>
  );
}
