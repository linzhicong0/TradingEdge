export interface Datasource {
  id: string;
  name: string;
  type: 'singlestore' | 'postgres' | 'mysql' | 's3';
  created_at: string;
  updated_at: string;
}

export interface DatasourceWithSecret extends Datasource {
  connection_string: string;
}

export interface Dashboard {
  id: string;
  name: string;
  tile_count?: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardWithTiles extends Dashboard {
  tiles: Tile[];
}

export interface Tile {
  id: string;
  dashboard_id: string;
  title: string;
  query: string;
  datasource_id: string | null;
  view_type: ViewType;
  pos_x: number;
  pos_y: number;
  col_span: number;
  row_span: number;
  created_at: string;
  updated_at: string;
}

export type ViewType = 'table' | 'bar' | 'line' | 'pie' | 'area' | 'scatter';

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
}

export const VIEW_TYPE_LABELS: Record<ViewType, string> = {
  table: 'Table',
  bar: 'Bar Chart',
  line: 'Line Chart',
  pie: 'Pie Chart',
  area: 'Area Chart',
  scatter: 'Scatter Chart',
};

export const VIEW_TYPES: ViewType[] = ['table', 'bar', 'line', 'pie', 'area', 'scatter'];
