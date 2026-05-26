import React, { useState } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { Plus, ChevronLeft, ChevronRight, Database, LayoutDashboard, Pencil, Trash2, Check, X } from 'lucide-react';
import { DatasourceManager } from './DatasourceManager';

export function LeftPanel() {
  const {
    dashboards, currentDashboard, datasources,
    selectDashboard, createDashboard, updateDashboard, deleteDashboard,
    loadDashboards,
  } = useDashboard();
  const [collapsed, setCollapsed] = useState(false);
  const [showDatasources, setShowDatasources] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = async () => {
    const name = `Dashboard ${dashboards.length + 1}`;
    const dashboard = await createDashboard(name);
    selectDashboard(dashboard.id);
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const saveEdit = async (id: string) => {
    if (editName.trim()) {
      await updateDashboard(id, editName.trim());
    }
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    await deleteDashboard(id);
  };

  if (collapsed) {
    return (
      <aside className="w-10 bg-surface border-r border-gray-800 flex flex-col items-center py-3 flex-shrink-0">
        <button onClick={() => setCollapsed(false)} className="p-1 hover:bg-surface-lighter rounded text-gray-400 hover:text-white transition-colors">
          <ChevronRight size={16} />
        </button>
        <button onClick={handleCreate} className="mt-2 p-1 hover:bg-surface-lighter rounded text-gray-400 hover:text-accent-light transition-colors" title="New Dashboard">
          <Plus size={16} />
        </button>
        {dashboards.map((d) => (
          <button
            key={d.id}
            onClick={() => selectDashboard(d.id)}
            className={`mt-1 p-1 rounded text-xs ${currentDashboard?.id === d.id ? 'bg-accent/20 text-accent-light' : 'text-gray-500 hover:text-gray-300'}`}
            title={d.name}
          >
            {d.name.charAt(0).toUpperCase()}
          </button>
        ))}
      </aside>
    );
  }

  return (
    <>
      <aside className="w-56 bg-surface border-r border-gray-800 flex flex-col flex-shrink-0">
        {/* Panel Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dashboards</span>
          <div className="flex items-center gap-1">
            <button onClick={handleCreate} className="p-1 hover:bg-surface-lighter rounded text-gray-400 hover:text-accent-light transition-colors" title="New Dashboard">
              <Plus size={15} />
            </button>
            <button onClick={() => setCollapsed(true)} className="p-1 hover:bg-surface-lighter rounded text-gray-400 hover:text-white transition-colors">
              <ChevronLeft size={15} />
            </button>
          </div>
        </div>

        {/* Dashboard List */}
        <div className="flex-1 overflow-y-auto py-1">
          {dashboards.map((d) => (
            <div
              key={d.id}
              className={`group flex items-center px-3 py-1.5 mx-1 rounded cursor-pointer transition-colors ${
                currentDashboard?.id === d.id
                  ? 'bg-accent/20 text-white'
                  : 'text-gray-400 hover:bg-surface-lighter hover:text-gray-200'
              }`}
            >
              {editingId === d.id ? (
                <div className="flex items-center gap-1 flex-1">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(d.id)}
                    className="flex-1 bg-surface-lighter text-white text-sm px-1 py-0.5 rounded border border-gray-700 focus:border-accent outline-none"
                    autoFocus
                  />
                  <button onClick={() => saveEdit(d.id)} className="p-0.5 hover:text-green-400"><Check size={12} /></button>
                  <button onClick={() => setEditingId(null)} className="p-0.5 hover:text-red-400"><X size={12} /></button>
                </div>
              ) : (
                <>
                  <LayoutDashboard size={14} className="mr-2 flex-shrink-0" />
                  <span
                    className="text-sm truncate flex-1"
                    onClick={() => selectDashboard(d.id)}
                  >
                    {d.name}
                  </span>
                  <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
                    <button onClick={(e) => { e.stopPropagation(); startEdit(d.id, d.name); }} className="p-0.5 hover:text-accent-light rounded">
                      <Pencil size={11} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }} className="p-0.5 hover:text-red-400 rounded">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {dashboards.length === 0 && (
            <p className="text-xs text-gray-600 px-3 py-4 text-center">
              No dashboards yet.<br/>Click + to create one.
            </p>
          )}
        </div>

        {/* Datasources Toggle */}
        <button
          onClick={() => setShowDatasources(!showDatasources)}
          className="flex items-center gap-2 px-3 py-2 border-t border-gray-800 text-sm text-gray-400 hover:text-white hover:bg-surface-lighter transition-colors"
        >
          <Database size={14} />
          <span>Data Sources</span>
          <span className="ml-auto text-xs text-gray-600">{datasources.length}</span>
        </button>
      </aside>

      {/* Datasource Manager Dialog */}
      {showDatasources && (
        <DatasourceManager
          onClose={() => { setShowDatasources(false); loadDashboards(); }}
        />
      )}
    </>
  );
}
