// Text wordmark used in the header, dashboards and footer.
export default function Brand({ light = false }) {
  return (
    <span className={`brand-mark ${light ? 'light' : ''}`}>
      <b>SEA VIEW</b>
      <small>Hotel · Kanyakumari</small>
    </span>
  );
}
export { Brand };
