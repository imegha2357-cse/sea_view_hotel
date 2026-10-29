'use client';

import { useMemo, useState } from 'react';
import { todayISO } from '../lib/enquiry';

// Feature #1: two-month calendar. In "range" mode guests pick check-in then check-out and see booked nights;
// in "toggle" mode staff click nights to mark them fully booked.
const iso = (d) => {
  const x = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return x.toISOString().slice(0, 10);
};
const WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function Month({ year, month, renderDay }) {
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(<span key={`b${i}`} />);
  for (let d = 1; d <= days; d++) cells.push(renderDay(iso(new Date(year, month, d)), d));
  return (
    <div className="cal-month">
      <p className="cal-title">{first.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
      <div className="cal-grid" role="grid">
        {WEEK.map((w) => (
          <span key={w} className="cal-wd" aria-hidden="true">
            {w}
          </span>
        ))}
        {cells}
      </div>
    </div>
  );
}

export default function AvailabilityCalendar({ mode = 'range', blocked = [], value = {}, onChange, months = 2 }) {
  const today = todayISO();
  const [offset, setOffset] = useState(0);
  const set = useMemo(() => new Set(blocked), [blocked]);
  const base = new Date();
  const list = Array.from({ length: months }, (_, k) => {
    const d = new Date(base.getFullYear(), base.getMonth() + offset + k, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const click = (day) => {
    if (day < today) return;
    if (mode === 'toggle') {
      const next = set.has(day) ? blocked.filter((b) => b !== day) : [...blocked, day].sort();
      onChange(next);
      return;
    }
    const { check_in: a, check_out: b } = value;
    if (!a || (a && b) || day <= a) onChange({ check_in: day, check_out: '' });
    else onChange({ check_in: a, check_out: day });
  };

  const renderDay = (day, n) => {
    const past = day < today;
    const isBlocked = set.has(day);
    const { check_in: a, check_out: b } = value;
    const inRange = a && b && day > a && day < b;
    const cls = ['cal-day', past && 'past', isBlocked && 'blocked', day === a && 'start', day === b && 'end', inRange && 'range', day === today && 'today'].filter(Boolean).join(' ');
    const label = `${new Date(`${day}T12:00:00`).toDateString()}${isBlocked ? ', fully booked' : ''}`;
    return (
      <button type="button" key={day} className={cls} disabled={past} onClick={() => click(day)} aria-label={label} aria-pressed={mode === 'toggle' ? isBlocked : day === a || day === b}>
        {n}
      </button>
    );
  };

  return (
    <div className={`avail-cal ${mode}`}>
      <div className="cal-nav">
        <button type="button" onClick={() => setOffset((o) => Math.max(0, o - 1))} disabled={offset === 0} aria-label="Earlier months">
          ‹
        </button>
        <button type="button" onClick={() => setOffset((o) => Math.min(12, o + 1))} aria-label="Later months">
          ›
        </button>
      </div>
      <div className="cal-months">
        {list.map(({ y, m }) => (
          <Month key={`${y}-${m}`} year={y} month={m} renderDay={renderDay} />
        ))}
      </div>
      <p className="cal-legend">
        <span>
          <i className="lg-blocked" /> {mode === 'toggle' ? 'Marked fully booked' : 'Fully booked'}
        </span>
        {mode === 'range' && (
          <span>
            <i className="lg-sel" /> Your dates
          </span>
        )}
      </p>
    </div>
  );
}
