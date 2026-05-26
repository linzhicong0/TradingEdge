import React from 'react';
import { DashboardProvider } from './contexts/DashboardContext';
import { LeftPanel } from './components/LeftPanel';
import { DashboardView } from './components/DashboardView';

export function App() {
  return (
    <DashboardProvider>
      <div className="h-screen w-screen flex flex-col bg-gray-950 overflow-hidden">
        {/* Top Bar */}
        <header className="h-12 flex items-center justify-between px-4 bg-surface border-b border-gray-800 flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-white tracking-tight">TradingEdge</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="px-2 py-1 rounded bg-surface-lighter">v1.0</span>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          <LeftPanel />
          <main className="flex-1 overflow-auto bg-gray-950">
            <DashboardView />
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
