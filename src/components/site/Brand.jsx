// Wordmark: round Deep Teal badge with an "S" and a Sand Gold ring, then the hotel's name, "Hotel Sea View".
export default function Brand({ light = false }) {
  return (
    <span className={`brand-mark ${light ? 'light' : ''}`}>
      <span className="brand-badge" aria-hidden="true">
        S
      </span>
      <span className="brand-name">
        <span>
          Hotel <em>Sea View</em>
        </span>
        <small>Kanyakumari</small>
      </span>
    </span>
  );
}
export { Brand };
