'use client';

import { useState } from 'react';
import { HOTEL, mapsEmbed, mapsLink } from '@/data/content';
import { Icon } from './ui';

// The Google map loads only when asked, so the page stays fast and no Google cookies are set until then.
export default function MapEmbed() {
  const [on, setOn] = useState(false);
  return (
    <div className="map">
      {on ? (
        <iframe title={`Map showing ${HOTEL.name}`} src={mapsEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      ) : (
        <div className="map-cover">
          <div>
            <span style={{ width: 44, height: 44, color: 'var(--gold)' }}>
              <Icon.pin />
            </span>
            <b style={{ fontFamily: 'var(--display)', fontSize: 20, color: 'var(--ink)', fontWeight: 400 }}>{HOTEL.addressLines.slice(0, 2).join(', ')}</b>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn solid sm" onClick={() => setOn(true)}>
                Show the map
              </button>
              <a className="btn outline dark sm" href={mapsLink} target="_blank" rel="noreferrer">
                Get directions
              </a>
            </div>
            <small style={{ color: 'var(--muted)' }}>The map is provided by Google.</small>
          </div>
        </div>
      )}
    </div>
  );
}
