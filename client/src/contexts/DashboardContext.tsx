import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Dashboard, DashboardWithTiles, Datasource, Tile } from '../types';
import { api } from '../lib/api';

interface DashboardContextType {
  dashboards: Dashboard[];
  currentDashboard: DashboardWithTiles | null;
  datasources: Datasource[];
  loading: boolean;
  error: string | null;
  loadDashboards: () => Promise<void>;
  loadDatasources: () => Promise<void>;
  selectDashboard: (id: string) => Promise<void>;
  createDashboard: (name: string) => Promise<Dashboard>;
  updateDashboard: (id: string, name: string) => Promise<void>;
  deleteDashboard: (id: string) => Promise<void>;
  createTile: (dashboardId: string, tile?: Partial<Tile>) => Promise<Tile>;
  updateTile: (dashboardId: string, tileId: string, updates: Partial<Tile>) => Promise<void>;
  updateTileLayout: (dashboardId: string, tileId: string, layout: { pos_x: number; pos_y: number; col_span: number; row_span: number }) => Promise<void>;
  deleteTile: (dashboardId: string, tileId: string) => Promise<void>;
  refreshCurrentDashboard: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [currentDashboard, setCurrentDashboard] = useState<DashboardWithTiles | null>(null);
  const [datasources, setDatasources] = useState<Datasource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboards = useCallback(async () => {
    try {
      const data = await api.getDashboards();
      setDashboards(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const loadDatasources = useCallback(async () => {
    try {
      const data = await api.getDatasources();
      setDatasources(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const selectDashboard = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const data = await api.getDashboard(id);
      setCurrentDashboard(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDashboard = useCallback(async (name: string) => {
    const dashboard = await api.createDashboard(name);
    await loadDashboards();
    return dashboard;
  }, [loadDashboards]);

  const updateDashboard = useCallback(async (id: string, name: string) => {
    await api.updateDashboard(id, name);
    await loadDashboards();
    if (currentDashboard?.id === id) {
      await selectDashboard(id);
    }
  }, [loadDashboards, currentDashboard, selectDashboard]);

  const deleteDashboard = useCallback(async (id: string) => {
    await api.deleteDashboard(id);
    await loadDashboards();
    if (currentDashboard?.id === id) {
      setCurrentDashboard(null);
    }
  }, [loadDashboards, currentDashboard]);

  const createTile = useCallback(async (dashboardId: string, tile?: Partial<Tile>) => {
    const newTile = await api.createTile(dashboardId, tile || {});
    if (currentDashboard?.id === dashboardId) {
      await selectDashboard(dashboardId);
    }
    return newTile;
  }, [currentDashboard, selectDashboard]);

  const updateTile = useCallback(async (dashboardId: string, tileId: string, updates: Partial<Tile>) => {
    await api.updateTile(dashboardId, tileId, updates);
    if (currentDashboard?.id === dashboardId) {
      await selectDashboard(dashboardId);
    }
  }, [currentDashboard, selectDashboard]);

  const updateTileLayout = useCallback(async (dashboardId: string, tileId: string, layout: { pos_x: number; pos_y: number; col_span: number; row_span: number }) => {
    await api.updateTileLayout(dashboardId, tileId, layout);
    // Don't reload dashboard to avoid disrupting the DnD interaction
    if (currentDashboard?.id === dashboardId) {
      setCurrentDashboard(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tiles: prev.tiles.map(t =>
            t.id === tileId ? { ...t, ...layout } : t
          ),
        };
      });
    }
  }, [currentDashboard]);

  const deleteTile = useCallback(async (dashboardId: string, tileId: string) => {
    await api.deleteTile(dashboardId, tileId);
    if (currentDashboard?.id === dashboardId) {
      await selectDashboard(dashboardId);
    }
  }, [currentDashboard, selectDashboard]);

  const refreshCurrentDashboard = useCallback(async () => {
    if (currentDashboard) {
      await selectDashboard(currentDashboard.id);
    }
  }, [currentDashboard, selectDashboard]);

  useEffect(() => {
    loadDashboards();
    loadDatasources();
  }, [loadDashboards, loadDatasources]);

  return (
    <DashboardContext.Provider value={{
      dashboards, currentDashboard, datasources, loading, error,
      loadDashboards, loadDatasources,
      selectDashboard, createDashboard, updateDashboard, deleteDashboard,
      createTile, updateTile, updateTileLayout, deleteTile,
      refreshCurrentDashboard,
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
