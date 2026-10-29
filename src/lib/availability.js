import { config } from './firebase';

// Feature #1: dates the hotel has marked fully booked. Read through Firestore's public REST API
// so the home page does not need to download the Firebase SDK.
let cache = null;

export async function fetchBlockedDates() {
  if (cache) return cache;
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/settings/availability?key=${config.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return (cache = []);
    const json = await res.json();
    const values = json?.fields?.blocked?.arrayValue?.values || [];
    cache = values.map((v) => v.stringValue).filter(Boolean).sort();
    return cache;
  } catch {
    return [];
  }
}

export const clearBlockedCache = () => {
  cache = null;
};

// Every night of a stay, as YYYY-MM-DD (check-out day excluded).
export function nightsBetween(checkIn, checkOut) {
  const out = [];
  if (!checkIn || !checkOut) return out;
  const d = new Date(`${checkIn}T12:00:00`);
  const end = new Date(`${checkOut}T12:00:00`);
  while (d < end && out.length < 400) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export function blockedInStay(blocked, checkIn, checkOut) {
  const set = new Set(blocked);
  return nightsBetween(checkIn, checkOut).filter((n) => set.has(n));
}
