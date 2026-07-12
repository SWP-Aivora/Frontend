import { useMemo } from 'react';
import { WalletTransactionType } from '../types';
import type { Transaction } from '../types';
import { formatCompactAxisValue, getNiceYAxisScale } from './spendingChartAxis';

const CHART_WIDTH = 700;
const CHART_HEIGHT = 220;
const PLOT_LEFT = 76;
const PLOT_RIGHT = 34;
const PLOT_TOP = 44;
const PLOT_BOTTOM = 44;
const FIRST_POINT_OFFSET = 34;
const AXIS_END_PADDING = 32;
const NEGATIVE_COLOR = '#E11D48';
const ZERO_COLOR = '#1F5AA6';
const POSITIVE_COLOR = '#16A34A';

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
  if (transaction.amount < 0) {
    return transaction.amount;
  }

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

const getSignColor = (total: number): string => {
  if (total > 0) return POSITIVE_COLOR;
  if (total < 0) return NEGATIVE_COLOR;
  return ZERO_COLOR;
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
    const values = visibleTotals.map(entry => entry.total);
    const yAxisScale = getNiceYAxisScale(values);
    const yAxisRange = yAxisScale.axisMax - yAxisScale.axisMin;
    const plotWidth = CHART_WIDTH - PLOT_LEFT - PLOT_RIGHT - FIRST_POINT_OFFSET - AXIS_END_PADDING;
    const plotHeight = CHART_HEIGHT - PLOT_TOP - PLOT_BOTTOM;
    const getYPosition = (value: number): number => PLOT_TOP + ((yAxisScale.axisMax - value) / yAxisRange) * plotHeight;
    const zeroY = getYPosition(0);
    const points = totals.map((entry, index) => {
      const x = PLOT_LEFT + FIRST_POINT_OFFSET + (plotWidth / 6) * index;
      const y = getYPosition(entry.total);

      return {
        ...entry,
        x,
        y,
        isFuture: index > currentDayIndex,
      };
    });

    const visiblePoints = points.filter(point => !point.isFuture);
    const lineSegments = visiblePoints.slice(1).flatMap((point, index) => {
      const from = visiblePoints[index];
      const to = point;

      if (from.total === 0 && to.total === 0) {
        return [{ from, to, color: ZERO_COLOR }];
      }

      if ((from.total < 0 && to.total > 0) || (from.total > 0 && to.total < 0)) {
        const crossingRatio = Math.abs(from.total) / (Math.abs(from.total) + Math.abs(to.total));
        const zeroPoint = {
          ...from,
          total: 0,
          x: from.x + (to.x - from.x) * crossingRatio,
          y: zeroY,
        };

        return [
          { from, to: zeroPoint, color: getSignColor(from.total) },
          { from: zeroPoint, to, color: getSignColor(to.total) },
        ];
      }

      return [{
        from,
        to,
        color: getSignColor(from.total || to.total),
      }];
    });

    const gridValues = yAxisScale.ticks.map(value => {
      const y = getYPosition(value);

      return {
        value,
        label: formatCompactAxisValue(value),
        y,
      };
    }).reverse();

    return {
      gridValues,
      lineSegments,
      points,
      zeroY,
    };
  }, [isClient, transactions]);

  const hasActivity = chartData.points.some(point => !point.isFuture && point.total !== 0);

  return (
    <div className="flex h-full min-h-[300px] w-full min-w-0 flex-col rounded-md border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="text-base font-black text-slate-900">{isClient ? 'Weekly Spending Flow' : 'Weekly Earning Flow'}</h3>
        <span className="shrink-0 text-[11px] font-black uppercase tracking-widest text-slate-400">Current week</span>
      </div>

      <div className="relative flex-1 min-w-0">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          role="img"
          aria-label={`${isClient ? 'Weekly spending' : 'Weekly earning'} line chart for the current week`}
          preserveAspectRatio="none"
          className="h-full min-h-[226px] w-full"
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
              <path d="M0,0 L8,4 L0,8 Z" fill={ZERO_COLOR} />
            </marker>
          </defs>

          {chartData.gridValues.map(gridLine => (
            <g key={gridLine.value}>
              <text
                x={PLOT_LEFT - 16}
                y={gridLine.y + 4}
                textAnchor="end"
                className="fill-blue-900/50 text-[10px] font-bold"
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
            stroke={ZERO_COLOR}
            strokeWidth="1.75"
            markerEnd="url(#wallet-chart-arrow)"
          />
          <line
            x1={PLOT_LEFT}
            x2={CHART_WIDTH - PLOT_RIGHT}
            y1={chartData.zeroY}
            y2={chartData.zeroY}
            stroke={ZERO_COLOR}
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
              stroke={segment.color}
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
                    fill={getSignColor(point.total)}
                    className="stroke-white"
                    strokeWidth="2"
                  />
                  {point.total !== 0 && (
                    <text
                      x={point.x}
                      y={point.y - 12}
                      textAnchor="middle"
                      fill={getSignColor(point.total)}
                      className="text-[11px] font-black"
                    >
                      {point.total.toLocaleString()}
                    </text>
                  )}
                </>
              )}
              <line
                x1={point.x}
                x2={point.x}
                y1={chartData.zeroY}
                y2={chartData.zeroY + 8}
                className="stroke-brand-blue-dark/35"
                strokeWidth="1.5"
              />
              <text
                x={point.x}
                y={CHART_HEIGHT - 18}
                textAnchor="middle"
                className="fill-brand-blue-dark text-[11px] font-black"
              >
                {point.label}
              </text>
              <title>{`${point.label}: ${point.total.toLocaleString()} Aivora Coin`}</title>
            </g>
          ))}
        </svg>

        {!hasActivity && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="rounded-lg border border-slate-100 bg-white/90 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-400 shadow-sm">
              No activity this week
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
