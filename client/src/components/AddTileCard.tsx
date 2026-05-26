import React from 'react';
import { Plus } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';

export function AddTileCard() {
  const { currentDashboard, createTile } = useDashboard();

  const handleAdd = async () => {
    if (!currentDashboard) return;
    const maxY = currentDashboard.tiles.reduce((max, t) => Math.max(max, t.pos_y + t.row_span), 0);
    await createTile(currentDashboard.id, {
      title: `Tile ${currentDashboard.tiles.length + 1}`,
      pos_x: 0,
      pos_y: maxY,
    });
  };

  return (
    <button
      onClick={handleAdd}
      className="w-full h-full min-h-[120px] bg-surface/50 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-accent-light hover:border-accent/30 transition-all cursor-pointer group"
    >
      <div className="w-10 h-10 rounded-full bg-surface-lighter flex items-center justify-center group-hover:bg-accent/10 transition-colors">
        <Plus size={20} />
      </div>
      <span className="text-xs">Add Tile</span>
    </button>
  );
}
