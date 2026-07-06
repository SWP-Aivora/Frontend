import { useMemo } from 'react';
import { WalletTransactionType } from '../types';
import type { Transaction } from '../types';

const CHART_WIDTH = 700;
const CHART_HEIGHT = 220;
const PLOT_LEFT = 56;
const PLOT_RIGHT = 34;
const PLOT_TOP = 44;
const PLOT_BOTTOM = 44;
const FIRST_POINT_OFFSET = 34;
const AXIS_END_PADDING = 32;
const GRID_STEP = 25;

interface SpendingChartProps {
  transactions: Transaction[];
  isClient: boolean;
}

const getTransactionDescription = (transaction: Transaction): string =>
  (transaction.description ?? '').toLowerCase();

const isClientReleasedPayment = (transaction: Transaction): boolean =>
  transaction.type === WalletTransactionType.PAYMENT &&
  getTransactionDescription(transaction).includes('released');

const getSignedAmount = (transaction: Transaction, isClient: boolean): number => {
  if (transaction.type === WalletTransactionType.DEPOSIT || transaction.type === WalletTransactionType.REFUND) {
    return transaction.amount;
  }

  if (transaction.type === WalletTransactionType.WITHDRAWAL) {
    return -transaction.amount;
  }

  if (transaction.type === WalletTransactionType.PAYMENT) {
    return isClient ? -transaction.amount : transaction.amount;
  }

  return 0;
};

const getStartOfWeek = (date: Date): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  start.setDate(start.getDate() - daysFromMonday);
  return start;
};

const formatChartDate = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}`;
};

const getPointFillClass = (total: number): string => {
  if (total > 0) return 'fill-emerald-500';
  if (total < 0) return 'fill-rose-500';
  return 'fill-brand-blue-dark';
};

const getSegmentStrokeClass = (total: number): string => {
  if (total > 0) return 'stroke-emerald-500';
  if (total < 0) return 'stroke-rose-500';
  return 'stroke-brand-blue-dark';
};

const getValueTextClass = (total: number): string => {
  if (total > 0) return 'fill-emerald-600';
  if (total < 0) return 'fill-rose-600';
  return 'fill-brand-blue-dark';
};

export const SpendingChart = ({ transactions, isClient }: SpendingChartProps) => {
  const chartData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentDayIndex = Math.min(6, Math.floor((today.getTime() - getStartOfWeek(today).getTime()) / 86400000));
    const startOfWeek = getStartOfWeek(today);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    const totals = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);

      return {
        date,
        label: formatChartDate(date),
        total: 0,
      };
    });

    transactions
      .filter(t => !isClient || !getTransactionDescription(t).includes('funding') || isClientReleasedPayment(t))
      .forEach(t => {
        const date = new Date(t.createdAt);
        if (!isNaN(date.getTime()) && date >= startOfWeek && date < endOfWeek) {
          const transactionDayIndex = Math.floor((date.getTime() - startOfWeek.getTime()) / 86400000);
          if (transactionDayIndex >= 0 && transactionDayIndex <= currentDayIndex) {
            totals[transactionDayIndex].total += getSignedAmount(t, isClient);
          }
        }
      });

    const visibleTotals = totals.slice(0, currentDayIndex + 1);
    const values = visibleTotals.map(entry => Math.abs(entry.total));
    const maxValue = Math.max(...values, 0);
    const yAxisMax = Math.max(100, Math.ceil(maxValue / GRID_STEP) * GRID_STEP);
    const plotWidth = CHART_WIDTH - PLOT_LEFT - PLOT_RIGHT - FIRST_POINT_OFFSET - AXIS_END_PADDING;
    const plotHeight = CHART_HEIGHT - PLOT_TOP - PLOT_BOTTOM;
    const points = totals.map((entry, index) => {
      const value = Math.abs(entry.total);
      const x = PLOT_LEFT + FIRST_POINT_OFFSET + (plotWidth / 6) * index;
      const y = PLOT_TOP + plotHeight - (value / yAxisMax) * plotHeight;

      return {
        ...entry,
        value,
        x,
        y,
        isFuture: index > currentDayIndex,
      };
    });

    const visiblePoints = points.filter(point => !point.isFuture);
    const lineSegments = visiblePoints.slice(1).map((point, index) => ({
      from: visiblePoints[index],
      to: point,
    }));

    const gridValues = Array.from({ length: yAxisMax / GRID_STEP + 1 }, (_, index) => {
      const value = GRID_STEP * index;
      const y = PLOT_TOP + plotHeight - (value / yAxisMax) * plotHeight;

      return {
        label: Math.round(value).toLocaleString(),
        y,
      };
    }).reverse();

    return {
      gridValues,
      lineSegments,
      points,
    };
  }, [isClient, transactions]);

  const hasActivity = chartData.points.some(point => !point.isFuture && point.value > 0);

  return (
    <div className="h-full min-h-[318px] bg-white rounded-lg p-6 border border-slate-100 shadow-sm flex flex-col">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-black text-slate-900">{isClient ? 'Weekly Spending Flow' : 'Weekly Earning Flow'}</h3>
        <span className="shrink-0 text-xs font-black text-slate-400 uppercase tracking-widest">Current week</span>
      </div>

      <div className="relative flex-1 min-w-0">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          role="img"
          aria-label={`${isClient ? 'Weekly spending' : 'Weekly earning'} line chart for the current week`}
          preserveAspectRatio="none"
          className="w-full h-full min-h-[250px]"
        >
          <defs>
            <marker
              id="wallet-chart-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L8,4 L0,8 Z" className="fill-brand-blue-dark" />
            </marker>
          </defs>

          {chartData.gridValues.map(gridLine => (
            <g key={gridLine.label}>
              <text
                x={PLOT_LEFT - 16}
                y={gridLine.y + 4}
                textAnchor="end"
                className="fill-blue-900/50 text-[11px] font-bold"
              >
                {gridLine.label}
              </text>
              <line
                x1={PLOT_LEFT}
                x2={CHART_WIDTH - PLOT_RIGHT - AXIS_END_PADDING}
                y1={gridLine.y}
                y2={gridLine.y}
                className="stroke-blue-100"
                strokeWidth="1"
              />
            </g>
          ))}

          <line
            x1={PLOT_LEFT}
            x2={PLOT_LEFT}
            y1={CHART_HEIGHT - PLOT_BOTTOM}
            y2={PLOT_TOP - AXIS_END_PADDING}
            className="stroke-brand-blue-dark"
            strokeWidth="1.75"
            markerEnd="url(#wallet-chart-arrow)"
          />
          <line
            x1={PLOT_LEFT}
            x2={CHART_WIDTH - PLOT_RIGHT}
            y1={CHART_HEIGHT - PLOT_BOTTOM}
            y2={CHART_HEIGHT - PLOT_BOTTOM}
            className="stroke-brand-blue-dark"
            strokeWidth="1.75"
            markerEnd="url(#wallet-chart-arrow)"
          />

          {chartData.lineSegments.map(segment => (
            <line
              key={`${segment.from.label}-${segment.to.label}`}
              x1={segment.from.x}
              y1={segment.from.y}
              x2={segment.to.x}
              y2={segment.to.y}
              className={getSegmentStrokeClass(segment.to.total)}
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}

          {chartData.points.map(point => (
            <g key={point.label}>
              {!point.isFuture && (
                <>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="4.5"
                    className={`${getPointFillClass(point.total)} stroke-white`}
                    strokeWidth="2"
                  />
                  {point.value > 0 && (
                    <text
                      x={point.x}
                      y={point.y - 12}
                      textAnchor="middle"
                      className={`${getValueTextClass(point.total)} text-[12px] font-black`}
                    >
                      {point.total.toLocaleString()}
                    </text>
                  )}
                </>
              )}
              <line
                x1={point.x}
                x2={point.x}
                y1={CHART_HEIGHT - PLOT_BOTTOM}
                y2={CHART_HEIGHT - PLOT_BOTTOM + 8}
                className="stroke-brand-blue-dark/35"
                strokeWidth="1.5"
              />
              <text
                x={point.x}
                y={CHART_HEIGHT - 18}
                textAnchor="middle"
                className="fill-brand-blue-dark text-[12px] font-black"
              >
                {point.label}
              </text>
              <title>{`${point.label}: ${point.total.toLocaleString()} Aivora Coin`}</title>
            </g>
          ))}
        </svg>

        {!hasActivity && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-400 shadow-sm border border-slate-100">
              No activity this week
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
