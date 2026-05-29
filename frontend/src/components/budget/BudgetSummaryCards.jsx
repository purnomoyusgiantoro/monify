import StatCard from '../StatCard.jsx';

export default function BudgetSummaryCards({ totalBudget, totalUsed, remaining }) {
  return (
    <section className="budget-summary-grid" aria-label="Ringkasan budget">
      <StatCard
        title="Total Budget"
        value={totalBudget}
        description="Total batas budget bulan ini"
        icon="/assets/icon-target.png"
        size="small"
      />
      <StatCard
        title="Terpakai"
        value={totalUsed}
        description="Budget yang sudah terpakai"
        icon="/assets/icon-terpakai.png"
        size="small"
      />
      <StatCard
        title="Sisa"
        value={remaining}
        description="Limit yang bisa digunakan"
        icon="/assets/icon-sisa.png"
        size="small"
      />
    </section>
  );
}
