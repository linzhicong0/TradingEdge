import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { QueryResult, ViewType } from '../types';

interface Props {
  data: QueryResult;
  chartType: ViewType;
}

const DARK_THEME = {
  textStyle: { color: '#9ca3af' },
  backgroundColor: 'transparent',
};

export function ChartView({ data, chartType }: Props) {
  const option = useMemo(() => {
    const columns = data.columns;
    const rows = data.rows;

    if (columns.length < 1) return null;

    // Try to auto-detect: first col = category/label, rest = values
    const labelCol = columns[0];
    const valueCols = columns.length > 1 ? columns.slice(1) : [columns[0]];

    const labels = rows.map((r) => String(r[labelCol] ?? ''));
    const isNumeric = (v: unknown) => v !== null && v !== undefined && !isNaN(Number(v));

    // Common ECharts base config
    const baseGrid = { left: '3%', right: '4%', top: 8, bottom: 24, containLabel: true };

    if (chartType === 'pie') {
      const pieData = rows.map((r) => ({
        name: String(r[labelCol] ?? ''),
        value: Number(r[valueCols[0]] ?? 0),
      }));
      return {
        ...DARK_THEME,
        tooltip: { trigger: 'item' },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '50%'],
            data: pieData,
            label: { color: '#9ca3af', fontSize: 10 },
            emphasis: {
              itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' },
            },
          },
        ],
      };
    }

    // Bar, Line, Area, Scatter
    const series = valueCols.map((col, idx) => {
      const colors = ['#6c5ce7', '#00cec9', '#fd79a8', '#fdcb6e', '#e17055', '#74b9ff'];
      const base: any = {
        name: col,
        type: chartType === 'area' ? 'line' : chartType,
        data: rows.map((r) => Number(r[col]) || 0),
        smooth: chartType !== 'scatter',
        itemStyle: { color: colors[idx % colors.length] },
        lineStyle: { color: colors[idx % colors.length] },
      };
      if (chartType === 'area') {
        base.areaStyle = { opacity: 0.15 };
        base.lineStyle = { ...base.lineStyle, width: 2 };
      }
      return base;
    });

    return {
      ...DARK_THEME,
      tooltip: { trigger: 'axis' },
      legend: {
        data: valueCols,
        textStyle: { color: '#9ca3af', fontSize: 10 },
        bottom: 0,
      },
      grid: baseGrid,
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: { color: '#6b7280', fontSize: 10, rotate: labels.length > 8 ? 30 : 0 },
        axisLine: { lineStyle: { color: '#374151' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#6b7280', fontSize: 10 },
        splitLine: { lineStyle: { color: '#1f2937' } },
      },
      series,
    };
  }, [data, chartType]);

  if (!option) return <div className="text-xs text-gray-600 p-4">Insufficient data for chart</div>;

  return (
    <ReactECharts
      option={option}
      style={{ height: '100%', width: '100%' }}
      opts={{ renderer: 'svg' }}
      theme="dark"
    />
  );
}
