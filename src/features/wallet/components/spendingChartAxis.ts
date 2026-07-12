const DEFAULT_AXIS_MAX = 100;
const TARGET_POSITIVE_INTERVALS = 3;

const trimNumber = (value: number): string => {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, '');
};

const roundUpToNiceInterval = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_AXIS_MAX / TARGET_POSITIVE_INTERVALS;

  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;

  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 5) return 5 * magnitude;

  const interval = 10 * magnitude;
  return Number.isFinite(interval) ? interval : value;
};

export const formatCompactAxisValue = (value: number): string => {
  if (!Number.isFinite(value)) return '0';
  if (value === 0) return '0';

  const sign = value < 0 ? '-' : '';
  const absoluteValue = Math.abs(value);
  const units = [
    { value: 1_000_000_000_000_000_000, suffix: 'Qi' },
    { value: 1_000_000_000_000_000, suffix: 'Q' },
    { value: 1_000_000_000_000, suffix: 'T' },
    { value: 1_000_000_000, suffix: 'B' },
    { value: 1_000_000, suffix: 'M' },
    { value: 1_000, suffix: 'K' },
  ];
  const unit = units.find(candidate => absoluteValue >= candidate.value);

  if (!unit) {
    return `${sign}${trimNumber(absoluteValue)}`;
  }

  return `${sign}${trimNumber(absoluteValue / unit.value)}${unit.suffix}`;
};

export const getNiceYAxisScale = (values: number[]) => {
  const finiteValues = values.filter(Number.isFinite);
  const maxMagnitude = finiteValues.reduce((maximum, value) => Math.max(maximum, Math.abs(value)), 0);
  const safeMagnitude = maxMagnitude > 0 ? maxMagnitude : DEFAULT_AXIS_MAX;
  const interval = roundUpToNiceInterval(safeMagnitude / TARGET_POSITIVE_INTERVALS);
  const roundedAxisMax = Math.ceil(safeMagnitude / interval) * interval;
  const axisMax = Number.isFinite(roundedAxisMax) ? Math.max(interval, roundedAxisMax) : safeMagnitude;
  const positiveIntervalCount = Math.max(1, Math.round(axisMax / interval));
  const ticks = Array.from(
    { length: positiveIntervalCount * 2 + 1 },
    (_, index) => (index - positiveIntervalCount) * interval
  );

  return {
    axisMin: -axisMax,
    axisMax,
    interval,
    ticks,
  };
};
