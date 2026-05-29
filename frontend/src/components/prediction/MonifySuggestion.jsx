export default function MonifySuggestion({ suggestions }) {
  return (
    <section className="prediction-suggestion-card">
      <h2>Saran Monify</h2>
      <ul>
        {suggestions.map((suggestion) => (
          <li key={suggestion}>{suggestion}</li>
        ))}
      </ul>
    </section>
  );
}
