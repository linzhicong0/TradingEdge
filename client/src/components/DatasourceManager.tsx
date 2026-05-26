import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, Circle } from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { api } from '../lib/api';
import type { Datasource } from '../types';

export function DatasourceManager({ onClose }: { onClose: () => void }) {
  const { datasources, loadDatasources } = useDashboard();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('singlestore');
  const [connStr, setConnStr] = useState('');
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    loadDatasources();
  }, [loadDatasources]);

  const handleAdd = async () => {
    if (!name.trim() || !connStr.trim()) return;
    await api.createDatasource({ name: name.trim(), type, connection_string: connStr.trim() });
    await loadDatasources();
    setName('');
    setConnStr('');
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    await api.deleteDatasource(id);
    await loadDatasources();
  };

  const handleTest = async (id: string) => {
    setTesting(id);
    setTestResult(null);
    try {
      await api.testConnection(id);
      setTestResult({ id, ok: true, msg: 'Connection OK' });
    } catch (err: any) {
      setTestResult({ id, ok: false, msg: err.message });
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center dialog-overlay bg-black/60">
      <div className="dialog-content bg-surface border border-gray-700 rounded-xl w-[560px] max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white">Data Sources</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-lighter rounded text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {datasources.map((ds) => (
            <div key={ds.id} className="flex items-center gap-3 px-3 py-2.5 bg-surface-lighter rounded-lg">
              <div className={`w-2 h-2 rounded-full ${ds.type === 'singlestore' ? 'bg-purple-400' : ds.type === 'postgres' ? 'bg-blue-400' : ds.type === 'mysql' ? 'bg-orange-400' : 'bg-green-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{ds.name}</p>
                <p className="text-xs text-gray-500">{ds.type}</p>
              </div>
              {testResult?.id === ds.id && (
                <span className={`text-xs ${testResult.ok ? 'text-green-400' : 'text-red-400'}`}>
                  {testResult.msg}
                </span>
              )}
              <button
                onClick={() => handleTest(ds.id)}
                disabled={testing === ds.id}
                className="text-xs px-2 py-1 rounded bg-surface hover:bg-accent/20 text-gray-400 hover:text-accent-light transition-colors disabled:opacity-50"
              >
                {testing === ds.id ? 'Testing...' : 'Test'}
              </button>
              <button onClick={() => handleDelete(ds.id)} className="p-1 hover:text-red-400 text-gray-500">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {datasources.length === 0 && (
            <p className="text-sm text-gray-600 text-center py-6">No data sources configured.</p>
          )}
        </div>

        {/* Add Form */}
        <div className="px-5 py-4 border-t border-gray-800">
          {!adding ? (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-2 text-sm text-accent-light hover:text-accent transition-colors"
            >
              <Plus size={16} /> Add Data Source
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  placeholder="Name (e.g. Prod SingleStore)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-surface-lighter text-white text-sm px-3 py-1.5 rounded border border-gray-700 focus:border-accent outline-none placeholder-gray-600"
                  autoFocus
                />
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="bg-surface-lighter text-white text-sm px-2 py-1.5 rounded border border-gray-700 focus:border-accent outline-none"
                >
                  <option value="singlestore">SingleStore</option>
                  <option value="postgres">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                  <option value="s3">S3</option>
                </select>
              </div>
              <input
                placeholder="Connection string (e.g. singlestore://user:pass@host:3306/db)"
                value={connStr}
                onChange={(e) => setConnStr(e.target.value)}
                className="w-full bg-surface-lighter text-white text-sm px-3 py-1.5 rounded border border-gray-700 focus:border-accent outline-none placeholder-gray-600 font-mono"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setAdding(false)} className="px-3 py-1 text-sm text-gray-400 hover:text-white">Cancel</button>
                <button
                  onClick={handleAdd}
                  disabled={!name.trim() || !connStr.trim()}
                  className="px-3 py-1 text-sm bg-accent hover:bg-accent-dark text-white rounded disabled:opacity-50 transition-colors"
                >
                  Save & Encrypt
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
