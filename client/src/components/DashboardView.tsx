import React from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { DashboardGrid } from './DashboardGrid';
import { BarChart3 } from 'lucide-react';

export function DashboardView() {
  const { currentDashboard, loading } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!currentDashboard) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
        <BarChart3 size={48} strokeWidth={1} />
        <p className="text-sm">Select a dashboard from the left panel</p>
        <p className="text-xs text-gray-700">or create a new one with the + button</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">{currentDashboard.name}</h2>
        <span className="text-xs text-gray-500">{currentDashboard.tiles.length} tiles</span>
      </div>
      <DashboardGrid />
    </div>
  );
}
