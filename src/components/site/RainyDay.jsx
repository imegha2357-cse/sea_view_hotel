'use client';

import { useEffect, useState } from 'react';
import { GEO } from '@/data/content';

const IDEAS = [
  ['Gandhi Memorial Mandapam', 'Covered memorial by the shore, a short walk from the hotel.'],
  ['Kamarajar Mani Mandapam', 'Memorial hall next to the Gandhi Mandapam.'],
  ['Bhagavathy Amman Temple', 'The ancient shore temple at the tip of India.'],
  ['Suchindram Thanumalayan Temple', 'Large temple with musical pillars, about 13 km away.'],
  ['Padmanabhapuram Palace', 'Wooden palace of the Travancore kings, about 35 km away (closed on Mondays).'],
  ['Sea View Restaurant', 'A long lunch under the carved wooden ceiling, or room service.'],
];

// Shown only when rain is likely today (Open-Meteo forecast): indoor ideas instead of the beach.
export default function RainyDay() {
  const [rain, setRain] = useState(null);
  useEffect(() => {
    const save = navigator.connection?.saveData;
    if (save) return;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${GEO.lat}&longitude=${GEO.lon}&daily=precipitation_probability_max&timezone=Asia%2FKolkata&forecast_days=1`)
      .then((r) => r.json())
      .then((j) => setRain(j?.daily?.precipitation_probability_max?.[0] ?? null))
      .catch(() => {});
  }, []);
  if (rain === null || rain < 50) return null;
  return (
    <section className="sec rainy" aria-labelledby="rainy-h">
      <div className="container wide">
        <h2 id="rainy-h">Rain is likely today ({rain}%)</h2>
        <p>The ferry to the Vivekananda Rock can stop in rough weather. Some ideas under a roof:</p>
        <ul className="rainy-list" role="list">
          {IDEAS.map(([t, d]) => (
            <li key={t}>
              <b>{t}</b>
              <span>{d}</span>
            </li>
          ))}
        </ul>
        <p>
          <a href="/request/tour">Ask our travel desk for a car</a>
        </p>
      </div>
    </section>
  );
}
