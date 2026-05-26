const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data;
}

export const api = {
  // Datasources
  getDatasources: () => request<any[]>('/datasources'),
  getDatasource: (id: string) => request<any>(`/datasources/${id}`),
  createDatasource: (body: { name: string; type: string; connection_string: string }) =>
    request<any>('/datasources', { method: 'POST', body: JSON.stringify(body) }),
  updateDatasource: (id: string, body: { name?: string; connection_string?: string }) =>
    request<any>(`/datasources/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteDatasource: (id: string) =>
    request<any>(`/datasources/${id}`, { method: 'DELETE' }),

  // Dashboards
  getDashboards: () => request<any[]>('/dashboards'),
  getDashboard: (id: string) => request<any>(`/dashboards/${id}`),
  createDashboard: (name: string) =>
    request<any>('/dashboards', { method: 'POST', body: JSON.stringify({ name }) }),
  updateDashboard: (id: string, name: string) =>
    request<any>(`/dashboards/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  deleteDashboard: (id: string) =>
    request<any>(`/dashboards/${id}`, { method: 'DELETE' }),

  // Tiles
  createTile: (dashboardId: string, tile: {
    title?: string; query?: string; datasource_id?: string | null;
    view_type?: string; pos_x?: number; pos_y?: number; col_span?: number; row_span?: number;
  }) => request<any>(`/dashboards/${dashboardId}/tiles`, { method: 'POST', body: JSON.stringify(tile) }),
  updateTile: (dashboardId: string, tileId: string, updates: any) =>
    request<any>(`/dashboards/${dashboardId}/tiles/${tileId}`, { method: 'PUT', body: JSON.stringify(updates) }),
  updateTileLayout: (dashboardId: string, tileId: string, layout: {
    pos_x: number; pos_y: number; col_span: number; row_span: number;
  }) => request<any>(`/dashboards/${dashboardId}/tiles/${tileId}/layout`, {
    method: 'PATCH', body: JSON.stringify(layout)
  }),
  deleteTile: (dashboardId: string, tileId: string) =>
    request<any>(`/dashboards/${dashboardId}/tiles/${tileId}`, { method: 'DELETE' }),

  // Query
  executeQuery: (datasource_id: string, query: string) =>
    request<{ columns: string[]; rows: Record<string, unknown>[] }>('/query/execute', {
      method: 'POST', body: JSON.stringify({ datasource_id, query })
    }),
  testConnection: (datasource_id: string) =>
    request<any>('/query/test', { method: 'POST', body: JSON.stringify({ datasource_id }) }),
};
