import React, { useState, useEffect } from 'react';
import { X, BarChart3, Play, Plus, Trash2, Table2 } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { api } from '../lib/api';
import { ChartView } from './ChartView';
import { VIEW_TYPES, VIEW_TYPE_LABELS, CHART_VIEW_TYPES } from '../types';
import type { Tile, ViewType, QueryResult, ChartConfig } from '../types';

interface Props {
  tile: Tile;
  onClose: () => void;
}

const VIEW_ICONS: Record<string, React.ReactNode> = {
  table: <Table2 size={18} />,
  bar: <BarChart3 size={18} />,
  line: <BarChart3 size={18} />,
  pie: <BarChart3 size={18} />,
  area: <BarChart3 size={18} />,
  scatter: <BarChart3 size={18} />,
};

export function ViewEditorDialog({ tile, onClose }: Props) {
  const { currentDashboard, updateTile, refreshCurrentDashboard } = useDashboard();
  const [viewType, setViewType] = useState<ViewType>(tile.view_type);
  const [config, setConfig] = useState<ChartConfig>(
    typeof tile.view_config === 'string'
      ? (() => { try { return JSON.parse(tile.view_config); } catch { return {}; } })()
      : (tile.view_config || {})
  );
  const [data, setData] = useState<QueryResult | null>(null);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch query data when dialog opens or tile changes
  useEffect(() => {
    if (tile.datasource_id && tile.query.trim()) {
      setFetching(true);
      setFetchError(null);
      api.executeQuery(tile.datasource_id, tile.query)
        .then(setData)
        .catch((err) => setFetchError(err.message))
        .finally(() => setFetching(false));
    } else {
      setData(null);
    }
  }, [tile.datasource_id, tile.query]);

  const columns = data?.columns || [];

  // Auto-detect reasonable defaults if no config set yet
  useEffect(() => {
    if (columns.length > 0 && !config.category && !config.series?.length) {
      const numericCols = columns.filter((c) =>
        data?.rows.some((r) => {
          const v = r[c];
          return v !== null && v !== undefined && !isNaN(Number(v));
        })
      );
      setConfig({
        category: columns[0],
        series: numericCols.length > 1 ? numericCols.slice(1, 2) : (numericCols.length > 0 ? [numericCols[0]] : [columns[1] || columns[0]]),
      });
    }
  }, [columns, data]);

  const addSeries = () => {
    setConfig((prev) => ({
      ...prev,
      series: [...(prev.series || []), ''],
    }));
  };

  const removeSeries = (idx: number) => {
    setConfig((prev) => ({
      ...prev,
      series: (prev.series || []).filter((_, i) => i !== idx),
    }));
  };

  const updateSeries = (idx: number, col: string) => {
    setConfig((prev) => ({
      ...prev,
      series: (prev.series || []).map((s, i) => (i === idx ? col : s)),
    }));
  };

  const handleSave = async () => {
    if (!currentDashboard) return;
    setSaving(true);
    try {
      await updateTile(currentDashboard.id, tile.id, {
        view_type: viewType,
        view_config: viewType === 'table' ? {} : config,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const isChart = CHART_VIEW_TYPES.includes(viewType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center dialog-overlay bg-black/60">
      <div className="dialog-content bg-surface border border-gray-700 rounded-xl w-[720px] max-h-[90vh] flex flex-col shadow-2xl">
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

        <div className="flex-1 overflow-y-auto">
          {/* View Type Selector */}
          <div className="px-5 py-3 border-b border-gray-800">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Display As</label>
            <div className="grid grid-cols-3 gap-2">
              {VIEW_TYPES.map((vt) => (
                <button
                  key={vt}
                  onClick={() => setViewType(vt)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                    viewType === vt
                      ? 'border-accent bg-accent/10 text-white'
                      : 'border-gray-800 hover:border-gray-600 text-gray-400'
                  }`}
                >
                  {VIEW_ICONS[vt]}
                  {VIEW_TYPE_LABELS[vt]}
                </button>
              ))}
            </div>
          </div>

          {/* Column Mapping (charts only) */}
          {isChart && (
            <div className="px-5 py-3 border-b border-gray-800">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">
                Column Mapping
              </label>

              {fetching && (
                <div className="text-xs text-gray-500 py-4 text-center animate-pulse">Running query to detect columns...</div>
              )}
              {fetchError && (
                <div className="text-xs text-red-400 py-2">{fetchError}</div>
              )}
              {!fetching && !fetchError && columns.length === 0 && (
                <div className="text-xs text-gray-600 py-4 text-center">
                  No columns detected. Configure a query first.
                </div>
              )}
              {!fetching && columns.length > 0 && (
                <div className="space-y-3">
                  {/* Category / X-Axis */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-24 flex-shrink-0">
                      {viewType === 'pie' ? 'Labels' : 'X-Axis'}
                    </span>
                    <select
                      value={config.category || ''}
                      onChange={(e) => setConfig((c) => ({ ...c, category: e.target.value }))}
                      className="flex-1 bg-surface-lighter text-white text-xs px-3 py-1.5 rounded border border-gray-700 focus:border-accent outline-none"
                    >
                      {columns.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Series */}
                  {(config.series || []).map((s, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-24 flex-shrink-0">
                        {viewType === 'pie' ? 'Values' : `Series ${idx + 1}`}
                      </span>
                      <select
                        value={s}
                        onChange={(e) => updateSeries(idx, e.target.value)}
                        className="flex-1 bg-surface-lighter text-white text-xs px-3 py-1.5 rounded border border-gray-700 focus:border-accent outline-none"
                      >
                        <option value="">— None —</option>
                        {columns.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeSeries(idx)}
                        className="p-1 text-gray-500 hover:text-red-400 flex-shrink-0"
                        title="Remove series"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}

                  {/* Add Series button (hidden for pie — only one value axis) */}
                  {viewType !== 'pie' && (config.series || []).length < 4 && (
                    <button
                      onClick={addSeries}
                      className="flex items-center gap-1 text-xs text-accent-light hover:text-accent transition-colors"
                    >
                      <Plus size={12} /> Add Series
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Live Chart Preview */}
          {isChart && data && data.rows.length > 0 && config.category && config.series?.length && (
            <div className="px-5 py-3">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                Preview
              </label>
              <div className="bg-[#0d1117] rounded-lg border border-gray-800 overflow-hidden" style={{ height: 220 }}>
                <ChartView data={data} chartType={viewType} config={config} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-800">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 text-sm bg-accent hover:bg-accent-dark text-white rounded disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}
