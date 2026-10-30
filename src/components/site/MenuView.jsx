'use client';

import { useMemo, useState } from 'react';

const DIET = { Veg: 'veg', 'Non-veg': 'nonveg', Egg: 'egg', Vegan: 'veg', Jain: 'veg' };

// Menu from the admin panel (Website → Lists → Restaurant menu), with a vegetarian filter and search.
export default function MenuView({ items }) {
  const [veg, setVeg] = useState(false);
  const [q, setQ] = useState('');
  const shown = items.filter((i) => (!veg || DIET[i.diet] === 'veg') && (!q || `${i.name} ${i.note}`.toLowerCase().includes(q.toLowerCase())));
  const sections = useMemo(() => [...new Set(items.map((i) => i.section || 'Menu'))], [items]);
  return (
    <div className="menu">
      <div className="menu-tools">
        <input className="cm-input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the menu" aria-label="Search the menu" />
        <label className="check">
          <input type="checkbox" checked={veg} onChange={(e) => setVeg(e.target.checked)} />
          <span>Vegetarian only</span>
        </label>
      </div>
      <nav className="menu-jump" aria-label="Menu sections">
        {sections.map((s) => (
          <a key={s} href={`#m-${s.replace(/\W+/g, '-')}`}>
            {s}
          </a>
        ))}
      </nav>
      {sections.map((s) => {
        const list = shown.filter((i) => (i.section || 'Menu') === s);
        if (!list.length) return null;
        return (
          <section key={s} id={`m-${s.replace(/\W+/g, '-')}`} className="menu-sec">
            <h2>{s}</h2>
            <ul>
              {list.map((i, n) => (
                <li key={`${i.name}-${n}`}>
                  <span className={`diet ${DIET[i.diet] || 'veg'}`} title={i.diet || 'Veg'} aria-label={i.diet || 'Veg'} />
                  <div>
                    <b>{i.name}</b>
                    {i.note && <p>{i.note}</p>}
                  </div>
                  {i.price && <span className="price">₹{String(i.price).replace(/^₹/, '')}</span>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {!shown.length && <p className="meta">No dishes match.</p>}
    </div>
  );
}
