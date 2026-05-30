import { formatCurrency } from '../utils/formatters.js';

function buildLinePath(points) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

export default function SpendingChart({ chart }) {
  const width = 980;
  const height = 250;
  const padding = { top: 18, right: 22, bottom: 34, left: 48 };
  const values = chart.points.map((item) => item.value);
  const maxValue = Math.max(...values, 400000);
  const step = 80000;
  const yTicks = Array.from({ length: 6 }, (_, index) => maxValue - index * step).filter((tick) => tick >= 0);
  if (!yTicks.includes(0)) yTicks.push(0);

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const divisor = Math.max(chart.points.length - 1, 1);

  const points = chart.points.map((item, index) => ({
    ...item,
    x: padding.left + (plotWidth / divisor) * index,
    y: padding.top + plotHeight - (item.value / maxValue) * plotHeight,
  }));

  const linePath = buildLinePath(points);
  const areaPath = `${linePath} L ${points.at(-1).x} ${padding.top + plotHeight} L ${points[0].x} ${padding.top + plotHeight} Z`;

  return (
    <section className="chart-card">
      <div className="section-head section-head--chart">
        <div>
          <h2>{chart.title}</h2>
          <p>{chart.subtitle}</p>
        </div>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button type="button" className="filter-button">
            {chart.filterValue === '30' ? '30 Hari Terakhir' : chart.filterValue === '14' ? '14 Hari Terakhir' : '7 Hari Terakhir'}
          </button>
          <select
            value={chart.filterValue || '7'}
            onChange={(e) => chart.onFilterChange && chart.onFilterChange(e.target.value)}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
            aria-label="Filter periode grafik"
          >
            <option value="7">7 Hari Terakhir</option>
            <option value="14">14 Hari Terakhir</option>
            <option value="30">30 Hari Terakhir</option>
          </select>
        </div>
      </div>

      <div className="chart-card__canvas" role="img" aria-label="Grafik pengeluaran tujuh hari terakhir">
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
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
                <text className="chart-card__tick" x="8" y={y + 4}>{tick / 1000}</text>
                <line className="chart-card__grid" x1={padding.left} x2={width - padding.right} y1={y} y2={y} />
              </g>
            );
          })}

          {points.map((point) => (
            <line className="chart-card__grid" key={`x-${point.day}`} x1={point.x} x2={point.x} y1={padding.top} y2={padding.top + plotHeight} />
          ))}

          <path d={areaPath} fill="url(#areaGradient)" />
          <path className="chart-card__line" d={linePath} fill="none" />

          {points.map((point) => (
            <g key={point.day}>
              <circle className="chart-card__node" cx={point.x} cy={point.y} r="4" />
              <title>{`${point.day}: ${formatCurrency(point.value)}`}</title>
            </g>
          ))}

          {points.map((point) => (
            <text className="chart-card__label" key={`label-${point.day}`} x={point.x} y={height - 10}>{point.day}</text>
          ))}
        </svg>
      </div>

      <div className="chart-card__legend">
        <span className="legend-line" aria-hidden="true" />
        <span>{chart.monthLabel}</span>
      </div>
    </section>
  );
}
