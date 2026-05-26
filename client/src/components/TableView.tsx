import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import type { QueryResult } from '../types';

interface Props {
  data: QueryResult;
}

export function TableView({ data }: Props) {
  const columnHelper = createColumnHelper<Record<string, unknown>>();

  const columns = useMemo(
    () =>
      data.columns.map((col) =>
        columnHelper.accessor(col, {
          header: () => (
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {col}
            </span>
          ),
          cell: (info) => {
            const val = info.getValue();
            if (val === null || val === undefined) {
              return <span className="text-gray-600 italic">null</span>;
            }
            const str = String(val);
            // Truncate long values
            return (
              <span className="text-xs text-gray-200" title={str}>
                {str.length > 80 ? str.slice(0, 80) + '...' : str}
              </span>
            );
          },
        })
      ),
    [data.columns]
  );

  const table = useReactTable({
    data: data.rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-auto h-full rounded">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="text-left px-3 py-2 bg-surface-lighter border-b border-gray-700 whitespace-nowrap"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, idx) => (
            <tr
              key={row.id}
              className={`${
                idx % 2 === 0 ? 'bg-transparent' : 'bg-surface-lighter/30'
              } hover:bg-accent/10 transition-colors`}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-3 py-1.5 border-b border-gray-800/50 whitespace-nowrap"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 py-1.5 text-[10px] text-gray-600 border-t border-gray-800">
        {data.rows.length} row{data.rows.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
