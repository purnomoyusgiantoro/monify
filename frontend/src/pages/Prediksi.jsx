import { useMemo } from 'react';
import Topbar from '../components/Topbar.jsx';
import PredictionCards from '../components/prediction/PredictionCards.jsx';
import MonifySuggestion from '../components/prediction/MonifySuggestion.jsx';
import MonifyBot from '../components/prediction/MonifyBot.jsx';
import { initialBudgets } from '../data/budgetData.js';
import { initialTransactions } from '../data/transactionData.js';
import { getPredictionMetrics, predictionConfig } from '../data/predictionData.js';

export default function PredictionAI({ onAddTransaction = () => {} }) {
  const metrics = useMemo(() => {
    return getPredictionMetrics(initialBudgets, initialTransactions, predictionConfig.currentDate);
  }, []);

  return (
    <main className="page-main prediction-main">
      <Topbar
        title="Prediksi AI"
        description="Analisis AI untuk membantumu belanja lebih aman"
        selectedDate={predictionConfig.currentDate}
        showDate={false}
        action={(
          <button type="button" className="add-transaction-button" onClick={onAddTransaction}>
            <span aria-hidden="true">+</span>
            Tambah Transaksi
          </button>
        )}
      />

      <section className="prediction-layout">
        <div className="prediction-left">
          <PredictionCards metrics={metrics} />
          <MonifySuggestion suggestions={metrics.suggestions} />
        </div>

        <MonifyBot metrics={metrics} />
      </section>
    </main>
  );
}
