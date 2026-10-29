// Sunrise and sunset for Kanyakumari (NOAA approximation, accurate to about a minute).
const RAD = Math.PI / 180;

function times(y, m, d, lat, lon, tz) {
  const n = Math.round((Date.UTC(y, m, d) - Date.UTC(y, 0, 0)) / 864e5);
  const g = ((2 * Math.PI) / 365) * (n - 1);
  const eq = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const ha = Math.acos(Math.cos(90.833 * RAD) / (Math.cos(lat * RAD) * Math.cos(decl)) - Math.tan(lat * RAD) * Math.tan(decl)) / RAD;
  return { rise: 720 - 4 * (lon + ha) - eq + tz * 60, set: 720 - 4 * (lon - ha) - eq + tz * 60 };
}

export function fmtMinutes(mins) {
  const m = Math.round(mins);
  const h = Math.floor(m / 60) % 24;
  const mm = String(m % 60).padStart(2, '0');
  return `${((h + 11) % 12) + 1}:${mm} ${h < 12 ? 'am' : 'pm'}`;
}

// Returns local (hotel) times and how far through the daylight hours we are now.
export function sunNow({ lat, lon, tzHours }, now = new Date()) {
  const local = new Date(now.getTime() + tzHours * 3600e3);
  const y = local.getUTCFullYear();
  const mo = local.getUTCMonth();
  const d = local.getUTCDate();
  const nowMin = local.getUTCHours() * 60 + local.getUTCMinutes();
  const today = times(y, mo, d, lat, lon, tzHours);
  const tmr = times(y, mo, d + 1, lat, lon, tzHours);
  const nextRiseIsToday = nowMin < today.rise;
  const progress = Math.min(1, Math.max(0, (nowMin - today.rise) / (today.set - today.rise)));
  return {
    sunrise: fmtMinutes(nextRiseIsToday ? today.rise : tmr.rise),
    sunriseLabel: nextRiseIsToday ? "Today's sunrise" : "Tomorrow's sunrise",
    sunset: fmtMinutes(today.set),
    isDay: nowMin >= today.rise && nowMin <= today.set,
    progress,
    localTime: fmtMinutes(nowMin),
  };
}
