import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, Database } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { api } from '../lib/api';
import { TableView } from './TableView';
import type { Tile, QueryResult } from '../types';

interface Props {
  tile: Tile;
  onClose: () => void;
}

export function QueryEditorDialog({ tile, onClose }: Props) {
  const { currentDashboard, datasources, updateTile, refreshCurrentDashboard } = useDashboard();
  const [query, setQuery] = useState(tile.query);
  const [datasourceId, setDatasourceId] = useState(tile.datasource_id || '');
  const [previewData, setPreviewData] = useState<QueryResult | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Tab handling in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = ta.value.substring(0, start) + '  ' + ta.value.substring(end);
      setQuery(newVal);
      // Restore cursor after React re-render
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  };

  const handlePreview = async () => {
    if (!datasourceId || !query.trim()) return;
    setRunning(true);
    setPreviewError(null);
    try {
      const result = await api.executeQuery(datasourceId, query.trim());
      setPreviewData(result);
    } catch (err: any) {
      setPreviewError(err.message);
      setPreviewData(null);
    } finally {
      setRunning(false);
    }
  };

  const handleSave = async () => {
    if (!currentDashboard) return;
    setSaving(true);
    try {
      await updateTile(currentDashboard.id, tile.id, {
        query: query.trim(),
        datasource_id: datasourceId || null,
      });
      onClose();
    } catch (err: any) {
      setPreviewError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Keyboard shortcut: Ctrl/Cmd+Enter to preview
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    handleKeyDown(e);
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handlePreview();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center dialog-overlay bg-black/60">
      <div className="dialog-content bg-surface border border-gray-700 rounded-xl w-[800px] max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-accent-light" />
            <h3 className="text-sm font-semibold text-white">Query Editor — {tile.title}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-surface-lighter rounded text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Controls */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-800">
            <select
              value={datasourceId}
              onChange={(e) => setDatasourceId(e.target.value)}
              className="flex-1 bg-surface-lighter text-white text-sm px-3 py-1.5 rounded border border-gray-700 focus:border-accent outline-none"
            >
              <option value="">— Select Data Source —</option>
              {datasources.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.name} ({ds.type})
                </option>
              ))}
            </select>
            <button
              onClick={handlePreview}
              disabled={running || !datasourceId || !query.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-accent hover:bg-accent-dark text-white rounded disabled:opacity-50 transition-colors"
            >
              <Play size={14} />
              {running ? 'Running...' : 'Preview'}
            </button>
          </div>

          {/* SQL Editor */}
          <div className="px-5 py-3 flex-1 min-h-0">
            <div className="relative h-full rounded-lg overflow-hidden border border-gray-700 bg-[#0d1117]">
              {/* Line numbers gutter */}
              <div className="flex h-full">
                <div className="select-none bg-[#161b22] text-gray-600 text-xs font-mono py-2 text-right pr-2 border-r border-gray-800 overflow-hidden" style={{ minWidth: 40 }}>
                  {query.split('\n').map((_, i) => (
                    <div key={i} className="leading-[1.6]" style={{ fontSize: '11px' }}>
                      {i + 1}
                    </div>
                  ))}
                </div>
                <textarea
                  ref={editorRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                  spellCheck={false}
                  className="flex-1 bg-transparent text-green-300 font-mono text-xs p-2 resize-none outline-none leading-[1.6]"
                  style={{ tabSize: 2, fontSize: '12px' }}
                  placeholder="SELECT * FROM ..."
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-600 mt-1 text-right">Ctrl+Enter to preview</p>
          </div>

          {/* Preview */}
          {(previewData || previewError) && (
            <div className="border-t border-gray-800 max-h-[250px] overflow-auto">
              <div className="px-5 py-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Preview Results
                </span>
                {previewData && (
                  <span className="text-[10px] text-gray-600">
                    {previewData.rows.length} rows
                  </span>
                )}
              </div>
              {previewError ? (
                <div className="px-5 pb-3 text-xs text-red-400">{previewError}</div>
              ) : previewData ? (
                <div className="px-2 pb-2 max-h-[180px] overflow-auto">
                  <TableView data={previewData} />
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800">
          <span className="text-[10px] text-gray-600">Changes are saved per tile</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 text-sm bg-accent hover:bg-accent-dark text-white rounded disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save & Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
