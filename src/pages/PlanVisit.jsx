import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GEO, HOTEL, HOW_TO_REACH, ITINERARIES, mapsLink } from '../data/content';
import { pageMeta } from '../data/routes';
import { usePageMeta } from '../lib/seo';
import { sunOn } from '../lib/sun';
import { Eyebrow, Reveal, SplitWords } from '../components/Motion';
import { DirectionsIcon } from '../components/Icons';

// Open-Meteo weather codes, grouped into plain words.
const WMO = (c) =>
  c === 0 ? 'Clear' : c <= 2 ? 'Partly cloudy' : c === 3 ? 'Cloudy' : c <= 48 ? 'Fog' : c <= 57 ? 'Drizzle' : c <= 67 ? 'Rain' : c <= 77 ? 'Snow' : c <= 82 ? 'Showers' : 'Thunderstorms';

// Feature #66: a 7-day forecast from Open-Meteo (free, no key, no cookies).
function Weather() {
  const [days, setDays] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${GEO.lat}&longitude=${GEO.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FKolkata&forecast_days=7`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) =>
        setDays(
          j.daily.time.map((t, i) => ({
            t,
            code: j.daily.weather_code[i],
            hi: Math.round(j.daily.temperature_2m_max[i]),
            lo: Math.round(j.daily.temperature_2m_min[i]),
            rain: j.daily.precipitation_probability_max?.[i],
          }))
        )
      )
      .catch(() => setErr(true));
  }, []);
  if (err) return <p className="meta">The forecast is not available right now.</p>;
  if (!days) return <p className="meta">Loading the forecast…</p>;
  return (
    <ul className="weather">
      {days.map((d) => (
        <li key={d.t}>
          <b>{new Date(`${d.t}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })}</b>
          <span>{WMO(d.code)}</span>
          <span className="temp">
            {d.hi}° / {d.lo}°C
          </span>
          {d.rain != null && <small>{d.rain}% rain</small>}
        </li>
      ))}
    </ul>
  );
}

export default function PlanVisit() {
  const meta = pageMeta('/plan-your-visit');
  usePageMeta(meta.title, meta.description);
  const [start, setStart] = useState(() => new Date().toISOString().slice(0, 10));
  const sun = useMemo(() => {
    const d0 = new Date(`${start}T12:00:00`);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(d0);
      d.setDate(d.getDate() + i);
      return { d, ...sunOn(GEO, d) };
    });
  }, [start]);

  return (
    <main id="main" className="page sub-page">
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden="true">/</span> <span aria-current="page">Plan your visit</span>
        </nav>
        <Eyebrow onMount>Kanyakumari</Eyebrow>
        <SplitWords as="h1" text="Plan your visit" className="sub-title" onMount />
        <p className="sub-lead">Kanyakumari is known for its sunrise over the sea. Here are the times, the weather and the easiest ways to get to the hotel.</p>

        <div className="plan-grid">
          <Reveal as="section" className="panel-soft" aria-labelledby="sun-h">
            <h2 id="sun-h">Sunrise and sunset</h2>
            <label className="lbl" htmlFor="sun-from">
              From
            </label>
            <input id="sun-from" type="date" value={start} onChange={(e) => e.target.value && setStart(e.target.value)} className="plain-input" />
            <table className="sun-table">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Sunrise</th>
                  <th scope="col">Sunset</th>
                </tr>
              </thead>
              <tbody>
                {sun.map((s) => (
                  <tr key={s.d.toISOString()}>
                    <td>{s.d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                    <td>{s.sunrise}</td>
                    <td>{s.sunset}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="meta">Calculated for Kanyakumari, accurate to about a minute. Be on the shore or your balcony 15 minutes early.</p>
          </Reveal>

          <Reveal as="section" className="panel-soft" aria-labelledby="wx-h" i={1}>
            <h2 id="wx-h">Weather this week</h2>
            <Weather />
            <p className="meta">
              Forecast from <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>.
            </p>
          </Reveal>
        </div>

        <Reveal as="section" className="compare reach" aria-labelledby="reach-h">
          <div className="reach-head">
            <h2 id="reach-h">How to reach us</h2>
            <div className="form-actions no-print">
              <a href={mapsLink} className="btn solid" target="_blank" rel="noreferrer">
                <DirectionsIcon /> Directions
              </a>
              <button className="btn outline" onClick={() => window.print()}>
                Print directions
              </button>
            </div>
          </div>
          <address className="reach-address">
            <b>{HOTEL.name}</b>
            {HOTEL.addressLines.map((l) => (
              <span key={l}>{l}</span>
            ))}
            <span>
              Phone / WhatsApp: <a href={`tel:${HOTEL.phoneHref}`}>{HOTEL.phone}</a>
            </span>
          </address>
          <div className="policy-grid">
            {HOW_TO_REACH.map((h) => (
              <div key={h.mode} className="policy">
                <h3>{h.mode}</h3>
                <p>{h.text}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal as="section" className="compare no-print" aria-labelledby="it-h">
          <h2 id="it-h">Suggested plans</h2>
          <div className="itins">
            {ITINERARIES.map((it) => (
              <article key={it.title} className="itin">
                <h3>{it.title}</h3>
                <ol>
                  {it.steps.map((s) => (
                    <li key={s.time}>
                      <b>{s.time}</b>
                      <span>{s.text}</span>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
          <p className="meta">Ferry and monument timings change with the season. Ask our travel desk before you set out.</p>
        </Reveal>
      </div>
    </main>
  );
}
