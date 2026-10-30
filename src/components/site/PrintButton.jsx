'use client';

export default function PrintButton({ label = 'Print or save as PDF' }) {
  return (
    <button type="button" className="btn solid sm" onClick={() => window.print()}>
      {label}
    </button>
  );
}
