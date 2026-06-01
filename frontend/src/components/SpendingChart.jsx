import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/formatters.js';

function buildLinePath(points) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

function formatCompactAxis(value) {
  const number = Number(value) || 0;
  const absolute = Math.abs(number);

  const trim = (result) => result.replace(/\.0$/, '');

  if (absolute >= 1_000_000_000) return `${trim((number / 1_000_000_000).toFixed(1))}B`;
  if (absolute >= 1_000_000) return `${trim((number / 1_000_000).toFixed(1))}M`;
  if (absolute >= 1_000) return `${trim((number / 1_000).toFixed(1))}K`;
  return `${number}`;
}

export default function SpendingChart({ chart }) {
  const navigate = useNavigate();
  const [selectedPoint, setSelectedPoint] = useState(null);

  const pointCount = chart.points.length;
  const width = Math.max(760, pointCount * 68 + 96);
  const height = 250;
  const padding = { top: 18, right: 22, bottom: 34, left: 56 };
  const values = chart.points.map((item) => item.value);
  const rawMaxValue = Math.max(...values, 0);
  const maxValue = rawMaxValue > 0 ? Math.max(400000, Math.ceil(rawMaxValue / 100000) * 100000) : 400000;
  const yTicks = Array.from({ length: 6 }, (_, index) => Math.round((maxValue / 5) * (5 - index)));

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const divisor = Math.max(pointCount - 1, 1);

  const points = chart.points.map((item, index) => ({
    ...item,
    x: padding.left + (plotWidth / divisor) * index,
    y: padding.top + plotHeight - (item.value / maxValue) * plotHeight,
  }));

  const linePath = buildLinePath(points);
  const areaPath = points.length > 0
    ? `${linePath} L ${points.at(-1).x} ${padding.top + plotHeight} L ${points[0].x} ${padding.top + plotHeight} Z`
    : '';

  useEffect(() => {
    setSelectedPoint(null);
  }, [chart.filterValue]);

  function handlePointSelect(point) {
    setSelectedPoint(point);
  }

  function handleOpenTransactions() {
    if (!selectedPoint?.fullDate) return;
    navigate(`/transaksi?date=${selectedPoint.fullDate}`);
  }

  return (
    <section className="chart-card">
      <div className="section-head section-head--chart">
        <div>
          <h2>{chart.title}</h2>
          <p>{chart.subtitle}</p>
        </div>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button type="button" className="filter-button">
            {chart.filterValue === 'month' ? 'Bulan Ini' : chart.filterValue === '30' ? '30 Hari Terakhir' : chart.filterValue === '14' ? '14 Hari Terakhir' : '7 Hari Terakhir'}
          </button>
          <select
            value={chart.filterValue || 'month'}
            onChange={(e) => chart.onFilterChange && chart.onFilterChange(e.target.value)}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
            aria-label="Filter periode grafik"
          >
            <option value="month">Bulan Ini</option>
            <option value="7">7 Hari Terakhir</option>
            <option value="14">14 Hari Terakhir</option>
            <option value="30">30 Hari Terakhir</option>
          </select>
        </div>
      </div>

      <div className="chart-card__canvas" role="img" aria-label={`Grafik pengeluaran ${chart.filterValue || 7} hari terakhir`}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          style={{ width: pointCount > 10 ? `${width}px` : '100%' }}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#8979ff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8979ff" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => {
            const y = padding.top + plotHeight - (tick / maxValue) * plotHeight;
            return (
              <g key={tick}>
                <text className="chart-card__tick" x="8" y={y + 4}>{formatCompactAxis(tick)}</text>
                <line className="chart-card__grid" x1={padding.left} x2={width - padding.right} y1={y} y2={y} />
              </g>
            );
          })}

          {points.map((point) => (
            <line className="chart-card__grid" key={`x-${point.fullDate}`} x1={point.x} x2={point.x} y1={padding.top} y2={padding.top + plotHeight} />
          ))}

          <path d={areaPath} fill="url(#areaGradient)" />
          <path className="chart-card__line" d={linePath} fill="none" />

          {points.map((point) => (
            <g
              key={point.fullDate}
              className="chart-card__point"
              role="button"
              tabIndex="0"
              aria-label={`${formatDate(point.fullDate)}, total pengeluaran ${formatCurrency(point.value)}`}
              onClick={() => handlePointSelect(point)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handlePointSelect(point);
                }
              }}
            >
              <circle className="chart-card__hitarea" cx={point.x} cy={point.y} r="12" />
              <circle className="chart-card__node" cx={point.x} cy={point.y} r="4" />
            </g>
          ))}

          {points.map((point) => (
            <text className="chart-card__label" key={`label-${point.fullDate}`} x={point.x} y={height - 10}>{point.day}</text>
          ))}
        </svg>

        {selectedPoint && (
          <div
            className="chart-card__tooltip"
            style={{
              left: `${Math.min(92, Math.max(8, (selectedPoint.x / width) * 100))}%`,
              top: `${Math.min(78, Math.max(18, (selectedPoint.y / height) * 100))}%`,
            }}
          >
            <strong>{formatDate(selectedPoint.fullDate)}</strong>
            <span>Total pengeluaran: {formatCurrency(selectedPoint.value)}</span>
            <button type="button" onClick={handleOpenTransactions}>Lihat</button>
          </div>
        )}
      </div>

      <div className="chart-card__legend">
        <span className="legend-line" aria-hidden="true" />
        <span>{chart.monthLabel}</span>
      </div>
    </section>
  );
}
