import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { buildInitialState, createPage, createBlock, generateId, BLOCK_TYPES } from '../data/initialData';

const WorkspaceContext = createContext(null);

function loadState() {
  try {
    const saved = localStorage.getItem('studentspace_v2');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return buildInitialState();
}

function saveState(state) {
  try {
    localStorage.setItem('studentspace_v2', JSON.stringify(state));
  } catch (e) {}
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ACTIVE_PAGE':
      return { ...state, activePage: action.id };

    case 'CREATE_PAGE': {
      const { parentId, title, icon } = action;
      const page = createPage(title || 'Untitled', icon || '📝', parentId || null);
      const newPages = { ...state.pages, [page.id]: page };
      let newOrder = [...state.pageOrder];
      if (parentId && newPages[parentId]) {
        newPages[parentId] = {
          ...newPages[parentId],
          children: [...newPages[parentId].children, page.id],
        };
      } else {
        newOrder = [...newOrder, page.id];
      }
      return { ...state, pages: newPages, pageOrder: newOrder, activePage: page.id };
    }

    case 'UPDATE_PAGE': {
      const { id, updates } = action;
      if (!state.pages[id]) return state;
      return {
        ...state,
        pages: {
          ...state.pages,
          [id]: { ...state.pages[id], ...updates, updatedAt: new Date().toISOString() },
        },
      };
    }

    case 'DELETE_PAGE': {
      const { id } = action;
      const page = state.pages[id];
      if (!page) return state;

      const collectIds = (pageId) => {
        const p = state.pages[pageId];
        if (!p) return [pageId];
        return [pageId, ...(p.children || []).flatMap(collectIds)];
      };
      const toDelete = new Set(collectIds(id));

      const newPages = Object.fromEntries(
        Object.entries(state.pages).filter(([k]) => !toDelete.has(k))
      );

      if (page.parentId && newPages[page.parentId]) {
        newPages[page.parentId] = {
          ...newPages[page.parentId],
          children: newPages[page.parentId].children.filter(c => c !== id),
        };
      }

      const newOrder = state.pageOrder.filter(pid => !toDelete.has(pid));
      const remaining = Object.keys(newPages);
      const newActive = toDelete.has(state.activePage)
        ? (remaining[0] || null)
        : state.activePage;

      return { ...state, pages: newPages, pageOrder: newOrder, activePage: newActive };
    }

    case 'DUPLICATE_PAGE': {
      const { id } = action;
      const orig = state.pages[id];
      if (!orig) return state;

      const dupPage = {
        ...JSON.parse(JSON.stringify(orig)),
        id: generateId(),
        title: orig.title + ' (Copy)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        children: [],
      };
      dupPage.blocks = dupPage.blocks.map(b => ({ ...b, id: generateId() }));

      const newPages = { ...state.pages, [dupPage.id]: dupPage };
      let newOrder = [...state.pageOrder];
      if (orig.parentId && newPages[orig.parentId]) {
        newPages[orig.parentId] = {
          ...newPages[orig.parentId],
          children: [...newPages[orig.parentId].children, dupPage.id],
        };
      } else {
        newOrder = [...newOrder, dupPage.id];
      }
      return { ...state, pages: newPages, pageOrder: newOrder, activePage: dupPage.id };
    }

    case 'MOVE_PAGE': {
      const { id, newParentId } = action;
      const page = state.pages[id];
      if (!page || id === newParentId) return state;

      const newPages = { ...state.pages };
      let newOrder = [...state.pageOrder];

      // Remove from old parent
      if (page.parentId && newPages[page.parentId]) {
        newPages[page.parentId] = {
          ...newPages[page.parentId],
          children: newPages[page.parentId].children.filter(c => c !== id),
        };
      } else {
        newOrder = newOrder.filter(pid => pid !== id);
      }

      // Add to new parent
      if (newParentId && newPages[newParentId]) {
        newPages[newParentId] = {
          ...newPages[newParentId],
          children: [...newPages[newParentId].children, id],
        };
      } else {
        newOrder = [...newOrder, id];
      }

      newPages[id] = { ...page, parentId: newParentId || null };
      return { ...state, pages: newPages, pageOrder: newOrder };
    }

    case 'TOGGLE_FAVORITE': {
      const { id } = action;
      if (!state.pages[id]) return state;
      return {
        ...state,
        pages: {
          ...state.pages,
          [id]: { ...state.pages[id], favorite: !state.pages[id].favorite },
        },
      };
    }

    case 'TOGGLE_PINNED': {
      const { id } = action;
      if (!state.pages[id]) return state;
      return {
        ...state,
        pages: {
          ...state.pages,
          [id]: { ...state.pages[id], pinned: !state.pages[id].pinned },
        },
      };
    }

    case 'ADD_BLOCK': {
      const { pageId, afterId, blockType } = action;
      const page = state.pages[pageId];
      if (!page) return state;
      const newBlock = createBlock(blockType || BLOCK_TYPES.PARAGRAPH, '');
      let blocks;
      if (afterId) {
        const idx = page.blocks.findIndex(b => b.id === afterId);
        blocks = [...page.blocks.slice(0, idx + 1), newBlock, ...page.blocks.slice(idx + 1)];
      } else {
        blocks = [...page.blocks, newBlock];
      }
      return {
        ...state,
        pages: {
          ...state.pages,
          [pageId]: { ...page, blocks, updatedAt: new Date().toISOString() },
        },
      };
    }

    case 'UPDATE_BLOCK': {
      const { pageId, blockId, updates } = action;
      const page = state.pages[pageId];
      if (!page) return state;
      return {
        ...state,
        pages: {
          ...state.pages,
          [pageId]: {
            ...page,
            blocks: page.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b),
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    case 'DELETE_BLOCK': {
      const { pageId, blockId } = action;
      const page = state.pages[pageId];
      if (!page || page.blocks.length <= 1) return state;
      return {
        ...state,
        pages: {
          ...state.pages,
          [pageId]: {
            ...page,
            blocks: page.blocks.filter(b => b.id !== blockId),
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    case 'REORDER_BLOCKS': {
      const { pageId, blocks } = action;
      const page = state.pages[pageId];
      if (!page) return state;
      return {
        ...state,
        pages: {
          ...state.pages,
          [pageId]: { ...page, blocks, updatedAt: new Date().toISOString() },
        },
      };
    }

    case 'ADD_TAG': {
      const { pageId, tag } = action;
      const page = state.pages[pageId];
      if (!page || page.tags.includes(tag)) return state;
      return {
        ...state,
        pages: {
          ...state.pages,
          [pageId]: { ...page, tags: [...page.tags, tag] },
        },
      };
    }

    case 'REMOVE_TAG': {
      const { pageId, tag } = action;
      const page = state.pages[pageId];
      if (!page) return state;
      return {
        ...state,
        pages: {
          ...state.pages,
          [pageId]: { ...page, tags: page.tags.filter(t => t !== tag) },
        },
      };
    }

    default:
      return state;
  }
}

export function WorkspaceProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <WorkspaceContext.Provider value={{ state, dispatch }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
