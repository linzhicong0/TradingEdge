import React, { useEffect, useState } from 'react';
import { TableView } from './TableView';
import { ChartView } from './ChartView';
import { api } from '../lib/api';
import type { Tile, QueryResult, ChartConfig } from '../types';

interface Props {
  tile: Tile;
}

export function TileContent({ tile }: Props) {
  const [data, setData] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tile.datasource_id || !tile.query.trim()) {
      setData(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .executeQuery(tile.datasource_id, tile.query)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tile.datasource_id, tile.query]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-gray-500 animate-pulse">
        Running query...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-red-400 px-2 text-center">
        {error}
      </div>
    );
  }

  if (!tile.datasource_id) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-gray-600 text-center px-2">
        Click <span className="mx-1 text-gray-500">✎</span> to configure query & datasource
      </div>
    );
  }

  if (!data || data.rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-gray-600">
        No data
      </div>
    );
  }

  if (tile.view_type === 'table') {
    return <TableView data={data} />;
  }

  return <ChartView data={data} chartType={tile.view_type} config={tile.view_config} />;
}
