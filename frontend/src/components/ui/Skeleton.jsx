export function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function DashboardSkeleton() {
  return (
    <div className="skeleton-page" aria-label="Memuat dashboard">
      <section className="summary-grid summary-grid--top">
        <SkeletonBlock className="skeleton-card skeleton-card--large" />
        <SkeletonBlock className="skeleton-card skeleton-card--large" />
      </section>
      <section className="summary-grid summary-grid--bottom">
        <SkeletonBlock className="skeleton-card" />
        <SkeletonBlock className="skeleton-card" />
        <SkeletonBlock className="skeleton-card" />
        <SkeletonBlock className="skeleton-card" />
      </section>
      <SkeletonBlock className="skeleton-chart" />
      <section className="dashboard-panels">
        <SkeletonRows rows={4} />
        <SkeletonRows rows={5} />
      </section>
    </div>
  );
}

export function SkeletonRows({ rows = 4 }) {
  return (
    <div className="skeleton-panel" aria-hidden="true">
      <SkeletonBlock className="skeleton-title" />
      {Array.from({ length: rows }).map((_, index) => (
        <div className="skeleton-row" key={index}>
          <SkeletonBlock className="skeleton-dot" />
          <div className="skeleton-row__content">
            <SkeletonBlock className="skeleton-line skeleton-line--wide" />
            <SkeletonBlock className="skeleton-line" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton({ fields = 4 }) {
  return (
    <div className="skeleton-panel skeleton-panel--form" aria-hidden="true">
      <SkeletonBlock className="skeleton-title" />
      {Array.from({ length: fields }).map((_, index) => (
        <SkeletonBlock className="skeleton-input" key={index} />
      ))}
      <SkeletonBlock className="skeleton-button" />
    </div>
  );
}

export function PredictionSkeleton() {
  return (
    <section className="prediction-layout prediction-layout--skeleton" aria-label="Memuat prediksi AI">
      <div className="prediction-left">
        <div className="prediction-card-stack">
          <SkeletonBlock className="skeleton-card skeleton-prediction-card" />
          <SkeletonBlock className="skeleton-card skeleton-prediction-card" />
          <SkeletonBlock className="skeleton-card skeleton-prediction-card" />
        </div>

        <div className="skeleton-panel skeleton-suggestion-card">
          <SkeletonBlock className="skeleton-title" />
          <SkeletonBlock className="skeleton-line skeleton-line--wide" />
          <SkeletonBlock className="skeleton-line skeleton-line--wide" />
          <SkeletonBlock className="skeleton-line" />
        </div>
      </div>

      <div className="skeleton-panel skeleton-bot-card">
        <SkeletonBlock className="skeleton-title" />
        <div className="skeleton-chat-list">
          <SkeletonBlock className="skeleton-chat-bubble skeleton-chat-bubble--bot" />
          <SkeletonBlock className="skeleton-chat-bubble skeleton-chat-bubble--user" />
          <SkeletonBlock className="skeleton-chat-bubble skeleton-chat-bubble--bot" />
        </div>
        <SkeletonBlock className="skeleton-input skeleton-chat-input" />
      </div>
    </section>
  );
}

export function SettingSkeleton() {
  return (
    <section className="setting-grid setting-grid--skeleton" aria-label="Memuat setting">
      <div className="skeleton-panel skeleton-setting-profile">
        <SkeletonBlock className="skeleton-avatar" />
        <SkeletonBlock className="skeleton-line skeleton-line--medium" />
        <SkeletonBlock className="skeleton-line" />
        <SkeletonBlock className="skeleton-button skeleton-button--short" />
      </div>

      <FormSkeleton fields={2} />

      <div className="skeleton-panel skeleton-security-card">
        <SkeletonBlock className="skeleton-title" />
        <SkeletonBlock className="skeleton-input" />
        <SkeletonBlock className="skeleton-input" />
        <SkeletonBlock className="skeleton-input" />
        <SkeletonBlock className="skeleton-button" />
      </div>

      <div className="skeleton-panel skeleton-danger-card">
        <div className="skeleton-danger-header">
          <SkeletonBlock className="skeleton-dot skeleton-dot--danger" />
          <div>
            <SkeletonBlock className="skeleton-title" />
            <SkeletonBlock className="skeleton-line" />
          </div>
        </div>
        <SkeletonBlock className="skeleton-danger-box" />
        <SkeletonBlock className="skeleton-button skeleton-button--danger" />
      </div>
    </section>
  );
}
