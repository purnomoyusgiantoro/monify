import PredictionCard from './PredictionCard.jsx';
import ProgressBar from '../ProgressBar.jsx';

export default function PredictionCards({ metrics }) {
  return (
    <section className="prediction-card-stack" aria-label="Ringkasan prediksi AI">
      <PredictionCard
        title="Prediksi Akhir Bulan"
        description="Estimasi total pengeluaran jika pola harian tetap sama."
        value={metrics.monthlyPrediction}
      />

      <PredictionCard
        title="Batas Aman Belanja Hari Ini"
        description="Nominal aman yang masih bisa digunakan hari ini."
        value={metrics.safeToSpendToday}
      />

      <PredictionCard
        title="Risiko Over Budget"
        description="Semakin tinggi, semakin besar peluang pengeluaran melewati budget."
        value={metrics.riskPercent}
        valueType="percent"
      >
        <div className="prediction-risk-line">
          <ProgressBar
            value={Math.min(metrics.riskPercent, 100)}
            max={100}
            tone={metrics.status.tone}
            label={`Risiko over budget ${metrics.riskPercent}%`}
          />
          <span className={`status-pill status-pill--${metrics.status.tone}`}>{metrics.status.label}</span>
        </div>
      </PredictionCard>
    </section>
  );
}
