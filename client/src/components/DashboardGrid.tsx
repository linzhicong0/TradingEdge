import React, { useCallback, useMemo } from 'react';
import GridLayout from 'react-grid-layout';
import { useDashboard } from '../contexts/DashboardContext';
import { TileCard } from './TileCard';
import { AddTileCard } from './AddTileCard';
import type { Tile } from '../types';

const GRID_COLS = 12;
const ROW_HEIGHT = 120;
const MARGIN: [number, number] = [12, 12];

export function DashboardGrid() {
  const { currentDashboard, updateTileLayout } = useDashboard();

  const layout = useMemo(() => {
    if (!currentDashboard) return [];
    return currentDashboard.tiles.map((t) => ({
      i: t.id,
      x: t.pos_x,
      y: t.pos_y,
      w: t.col_span,
      h: t.row_span,
      minW: 2,
      minH: 1,
    }));
  }, [currentDashboard]);

  const onLayoutChange = useCallback(
    (newLayout: GridLayout.Layout[]) => {
      if (!currentDashboard) return;
      for (const item of newLayout) {
        const tile = currentDashboard.tiles.find((t) => t.id === item.i);
        if (
          tile &&
          (tile.pos_x !== item.x ||
            tile.pos_y !== item.y ||
            tile.col_span !== item.w ||
            tile.row_span !== item.h)
        ) {
          updateTileLayout(currentDashboard.id, item.i, {
            pos_x: item.x,
            pos_y: item.y,
            col_span: item.w,
            row_span: item.h,
          });
        }
      }
    },
    [currentDashboard, updateTileLayout]
  );

  if (!currentDashboard) return null;

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={GRID_COLS}
      rowHeight={ROW_HEIGHT}
      width={typeof window !== 'undefined' ? window.innerWidth - 240 : 1200}
      margin={MARGIN}
      onLayoutChange={onLayoutChange}
      draggableHandle=".tile-drag-handle"
      isResizable={true}
      compactType="vertical"
    >
      {currentDashboard.tiles.map((tile) => (
        <div key={tile.id} className="group">
          <TileCard tile={tile} />
        </div>
      ))}
      <div key="__add_tile__" className="static">
        <AddTileCard />
      </div>
    </GridLayout>
  );
}
