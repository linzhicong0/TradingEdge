import React, { useState } from 'react';
import { X, BarChart3, Table2 } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { VIEW_TYPES, VIEW_TYPE_LABELS } from '../types';
import type { Tile, ViewType } from '../types';

interface Props {
  tile: Tile;
  onClose: () => void;
}

const VIEW_ICONS: Record<ViewType, React.ReactNode> = {
  table: <Table2 size={20} />,
  bar: <BarChart3 size={20} />,
  line: <BarChart3 size={20} />,
  pie: <BarChart3 size={20} />,
  area: <BarChart3 size={20} />,
  scatter: <BarChart3 size={20} />,
};

const VIEW_DESCRIPTIONS: Record<ViewType, string> = {
  table: 'Display results in a sortable, modern data table with striped rows.',
  bar: 'Vertical bar chart — great for comparing categories.',
  line: 'Line chart — ideal for time series and trends.',
  pie: 'Pie/donut chart — best for part-to-whole relationships.',
  area: 'Area chart — line chart with filled area beneath.',
  scatter: 'Scatter plot — show correlation between two variables.',
};

export function ViewEditorDialog({ tile, onClose }: Props) {
  const { currentDashboard, updateTile } = useDashboard();
  const [selected, setSelected] = useState<ViewType>(tile.view_type);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!currentDashboard) return;
    setSaving(true);
    try {
      await updateTile(currentDashboard.id, tile.id, { view_type: selected });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center dialog-overlay bg-black/60">
      <div className="dialog-content bg-surface border border-gray-700 rounded-xl w-[500px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-accent-light" />
            <h3 className="text-sm font-semibold text-white">View Settings — {tile.title}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-surface-lighter rounded text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* View Type Grid */}
        <div className="px-5 py-4 grid grid-cols-2 gap-3">
          {VIEW_TYPES.map((vt) => (
            <button
              key={vt}
              onClick={() => setSelected(vt)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all text-left ${
                selected === vt
                  ? 'border-accent bg-accent/10'
                  : 'border-gray-800 hover:border-gray-600 bg-surface-lighter'
              }`}
            >
              <div className={`${selected === vt ? 'text-accent-light' : 'text-gray-400'}`}>
                {VIEW_ICONS[vt]}
              </div>
              <span className={`text-sm font-medium ${selected === vt ? 'text-white' : 'text-gray-300'}`}>
                {VIEW_TYPE_LABELS[vt]}
              </span>
              <span className="text-[10px] text-gray-500 text-center leading-relaxed">
                {VIEW_DESCRIPTIONS[vt]}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-800">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || selected === tile.view_type}
            className="px-4 py-1.5 text-sm bg-accent hover:bg-accent-dark text-white rounded disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}
