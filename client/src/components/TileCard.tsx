import React, { useState } from 'react';
import { GripVertical, Pencil, BarChart3, Trash2 } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { QueryEditorDialog } from './QueryEditorDialog';
import { ViewEditorDialog } from './ViewEditorDialog';
import { TileContent } from './TileContent';
import type { Tile } from '../types';

interface Props {
  tile: Tile;
}

export function TileCard({ tile }: Props) {
  const { currentDashboard, deleteTile } = useDashboard();
  const [showQueryEditor, setShowQueryEditor] = useState(false);
  const [showViewEditor, setShowViewEditor] = useState(false);

  const handleDelete = async () => {
    if (!currentDashboard) return;
    await deleteTile(currentDashboard.id, tile.id);
  };

  return (
    <>
      <div className="h-full bg-surface border border-gray-800 rounded-lg overflow-hidden flex flex-col hover:border-gray-700 transition-colors">
        {/* Tile Header */}
        <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-gray-800 bg-surface-lighter/50 flex-shrink-0">
          <div className="tile-drag-handle cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400 p-0.5">
            <GripVertical size={12} />
          </div>
          <span className="text-xs font-medium text-gray-300 truncate flex-1">{tile.title}</span>
          <button
            onClick={() => setShowQueryEditor(true)}
            className="p-1 rounded hover:bg-surface-lighter text-gray-500 hover:text-accent-light transition-colors"
            title="Edit Query"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={() => setShowViewEditor(true)}
            className="p-1 rounded hover:bg-surface-lighter text-gray-500 hover:text-accent-light transition-colors"
            title="Edit View"
          >
            <BarChart3 size={12} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 rounded hover:bg-surface-lighter text-gray-500 hover:text-red-400 transition-colors"
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
