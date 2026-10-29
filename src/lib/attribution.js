// Feature #60: remember where a visitor came from (Google, Facebook, an ad link) for the first page of the visit,
// and send it with their enquiry. Nothing personal is stored.
const KEY = 'seaview-source';

export function captureSource() {
  try {
    if (sessionStorage.getItem(KEY)) return;
    const q = new URLSearchParams(window.location.search);
    let ref = '';
    try {
      const r = document.referrer ? new URL(document.referrer) : null;
      if (r && r.hostname !== window.location.hostname) ref = r.hostname;
    } catch {}
    const src = {
      utm_source: (q.get('utm_source') || '').slice(0, 100) || null,
      utm_medium: (q.get('utm_medium') || '').slice(0, 100) || null,
      utm_campaign: (q.get('utm_campaign') || '').slice(0, 100) || null,
      referrer: ref.slice(0, 200) || null,
    };
    sessionStorage.setItem(KEY, JSON.stringify(src));
  } catch {}
}

export function getSource() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

// A readable label for reports: "Google", "Facebook", "Direct" or the campaign source.
export function sourceLabel(e) {
  if (e.utm_source) return e.utm_source;
  const r = e.referrer || '';
  if (/google\./.test(r)) return 'Google';
  if (/facebook|fb\.|instagram/.test(r)) return 'Facebook / Instagram';
  if (/whatsapp|wa\.me/.test(r)) return 'WhatsApp';
  if (r) return r;
  if (e.source && e.source !== 'website_form') return { phone: 'Phone call', walk_in: 'Walk-in', email: 'Email', demo: 'Demo' }[e.source] || e.source;
  return 'Direct';
}
