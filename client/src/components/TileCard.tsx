import React, { useState, useRef, useEffect } from 'react';
import { GripVertical, Pencil, BarChart3, Trash2, Check, X } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { QueryEditorDialog } from './QueryEditorDialog';
import { ViewEditorDialog } from './ViewEditorDialog';
import { TileContent } from './TileContent';
import type { Tile } from '../types';

interface Props {
  tile: Tile;
}

export function TileCard({ tile }: Props) {
  const { currentDashboard, deleteTile, updateTile } = useDashboard();
  const [showQueryEditor, setShowQueryEditor] = useState(false);
  const [showViewEditor, setShowViewEditor] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(tile.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleDraft(tile.title);
  }, [tile.title]);

  useEffect(() => {
    if (editingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTitle]);

  const saveTitle = async () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== tile.title && currentDashboard) {
      await updateTile(currentDashboard.id, tile.id, { title: trimmed });
    }
    setEditingTitle(false);
  };

  const handleDelete = async () => {
    if (!currentDashboard) return;
    await deleteTile(currentDashboard.id, tile.id);
  };

  // Stop react-grid-layout from intercepting clicks on action buttons
  const stopEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <>
      <div className="h-full bg-surface border border-gray-800 rounded-lg overflow-hidden flex flex-col hover:border-gray-700 transition-colors">
        {/* Tile Header */}
        <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-gray-800 bg-surface-lighter/50 flex-shrink-0">
          <div className="tile-drag-handle cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400 p-0.5 flex-shrink-0">
            <GripVertical size={12} />
          </div>

          {/* Editable title */}
          {editingTitle ? (
            <div className="flex items-center gap-1 flex-1 min-w-0" onMouseDown={stopEvent}>
              <input
                ref={inputRef}
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveTitle();
                  if (e.key === 'Escape') { setEditingTitle(false); setTitleDraft(tile.title); }
                }}
                onBlur={saveTitle}
                className="flex-1 bg-surface-lighter text-white text-xs px-1.5 py-0.5 rounded border border-accent outline-none min-w-0"
              />
              <button onClick={saveTitle} className="p-0.5 text-green-400 hover:text-green-300"><Check size={11} /></button>
              <button onClick={() => { setEditingTitle(false); setTitleDraft(tile.title); }} className="p-0.5 text-gray-500 hover:text-red-400"><X size={11} /></button>
            </div>
          ) : (
            <span
              className="text-xs font-medium text-gray-300 truncate flex-1 cursor-pointer hover:text-white transition-colors"
              title="Click to rename"
              onClick={(e) => { stopEvent(e); setEditingTitle(true); }}
            >
              {tile.title}
            </span>
          )}

          {/* Action buttons — stopPropagation so grid doesn't swallow clicks */}
          <button
            onMouseDown={stopEvent}
            onClick={(e) => { stopEvent(e); setShowQueryEditor(true); }}
            className="p-1 rounded hover:bg-surface-lighter text-gray-500 hover:text-accent-light transition-colors flex-shrink-0"
            title="Edit Query"
          >
            <Pencil size={12} />
          </button>
          <button
            onMouseDown={stopEvent}
            onClick={(e) => { stopEvent(e); setShowViewEditor(true); }}
            className="p-1 rounded hover:bg-surface-lighter text-gray-500 hover:text-accent-light transition-colors flex-shrink-0"
            title="Edit View"
          >
            <BarChart3 size={12} />
          </button>
          <button
            onMouseDown={stopEvent}
            onClick={(e) => { stopEvent(e); handleDelete(); }}
            className="p-1 rounded hover:bg-surface-lighter text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
            title="Delete Tile"
          >
            <Trash2 size={12} />
          </button>
        </div>

        {/* Tile Body */}
        <div className="flex-1 overflow-auto p-2">
          <TileContent tile={tile} />
        </div>
      </div>

      {showQueryEditor && (
        <QueryEditorDialog
          tile={tile}
          onClose={() => setShowQueryEditor(false)}
        />
      )}

      {showViewEditor && (
        <ViewEditorDialog
          tile={tile}
          onClose={() => setShowViewEditor(false)}
        />
      )}
    </>
  );
}
