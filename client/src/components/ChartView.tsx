import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { QueryResult, ViewType, ChartConfig } from '../types';

interface Props {
  data: QueryResult;
  chartType: ViewType;
  config?: ChartConfig;
}

const COLORS = ['#6c5ce7', '#00cec9', '#fd79a8', '#fdcb6e', '#e17055', '#74b9ff'];

export function ChartView({ data, chartType, config }: Props) {
  const option = useMemo(() => {
    const { columns, rows } = data;
    if (columns.length === 0 || rows.length === 0) return null;

    // Determine which columns to use
    const categoryCol = config?.category || columns[0];
    const seriesCols = config?.series?.filter(Boolean) ||
      columns.filter((c) => c !== categoryCol).slice(0, 1) ||
      [columns[columns.length - 1]];

    if (seriesCols.length === 0) return null;

    const labels = rows.map((r) => String(r[categoryCol] ?? ''));

    if (chartType === 'pie') {
      const valCol = seriesCols[0];
      const pieData = rows.map((r, i) => ({
        name: String(r[categoryCol] ?? ''),
        value: Number(r[valCol]) || 0,
        itemStyle: { color: COLORS[i % COLORS.length] },
      }));
      return {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
          textStyle: { fontSize: 11 },
        },
        series: [{
          type: 'pie',
          radius: ['40%', '68%'],
          center: ['50%', '50%'],
          data: pieData,
          label: { color: '#9ca3af', fontSize: 10 },
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' },
          },
        }],
      };
    }

    // Bar, Line, Area, Scatter
    const series = seriesCols.map((col, idx) => {
      const base: any = {
        name: col,
        type: chartType === 'area' ? 'line' : chartType,
        data: rows.map((r) => Number(r[col]) || 0),
        smooth: chartType !== 'scatter' && chartType !== 'bar',
        itemStyle: { color: COLORS[idx % COLORS.length] },
        lineStyle: { color: COLORS[idx % COLORS.length], width: 2 },
      };
      if (chartType === 'area') {
        base.areaStyle = { color: COLORS[idx % COLORS.length], opacity: 0.15 };
      }
      return base;
    });

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        textStyle: { fontSize: 11 },
      },
      legend: {
        data: seriesCols,
        textStyle: { color: '#9ca3af', fontSize: 10 },
        bottom: 0,
      },
      grid: { left: '3%', right: '4%', top: 8, bottom: 28, containLabel: true },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: { color: '#6b7280', fontSize: 10, rotate: labels.length > 8 ? 30 : 0 },
        axisLine: { lineStyle: { color: '#374151' } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#6b7280', fontSize: 10 },
        splitLine: { lineStyle: { color: '#1f2937', type: 'dashed' } },
      },
      series,
    };
  }, [data, chartType, config]);

  if (!option) {
    return <div className="flex items-center justify-center h-full text-xs text-gray-600">Insufficient data for chart</div>;
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: '100%', width: '100%' }}
      opts={{ renderer: 'svg' }}
      notMerge
    />
  );
}
