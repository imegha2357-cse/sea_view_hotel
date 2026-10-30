'use client';

import { useEffect, useState } from 'react';
import { useSiteData } from '../SiteData';
import Photo from '../Photo';
import { readRecent } from './RoomExtras';

// "Recently viewed" rooms on this device (nothing is sent anywhere).
export default function RecentRooms() {
  const { rooms } = useSiteData();
  const [ids, setIds] = useState([]);
  useEffect(() => setIds(readRecent()), []);
  const list = ids.map((id) => rooms.find((r) => r.id === id)).filter(Boolean).slice(0, 4);
  if (!list.length) return null;
  return (
    <section className="sec recent-rooms" aria-labelledby="recent-h">
      <div className="container wide">
        <h2 id="recent-h" className="recent-h">
          Recently viewed
        </h2>
        <ul role="list">
          {list.map((r) => (
            <li key={r.id}>
              <a href={`/rooms/${r.id}`}>
                <span className="frame">
                  <Photo k={r.image} sizes="160px" alt="" />
                </span>
                <span>{r.name}</span>
              </a>
            </li>
          ))}
        </ul>
        <p>
          <a href="/rooms/compare">Compare rooms side by side</a> · <a href="/room-finder">Help me choose</a>
        </p>
      </div>
    </section>
  );
}
