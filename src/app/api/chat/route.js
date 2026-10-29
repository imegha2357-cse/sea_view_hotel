// The website chat assistant (text and voice). Every message goes through the assistant's reasoning
// (src/lib/chat-brain.js): it reads dates, guests and rooms, remembers them, checks the nights the hotel
// has marked fully booked, recommends and compares rooms, and prepares a pre-filled enquiry.
// With ANTHROPIC_API_KEY set in Vercel, Claude writes the reply from the hotel's information plus those
// findings; otherwise the reasoning's own reply is used. Nothing is stored on the server.
import { getRooms } from '@/lib/cms-server';
import { systemPrompt } from '@/lib/hotel-knowledge';
import { think } from '@/lib/chat-brain';
import { config } from '@/lib/firebase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = process.env.CHAT_MODEL || 'claude-haiku-5-5';
const MAX_Q = 600;
const MAX_TURNS = 12;

// Light abuse protection: 20 questions a minute per visitor (per server instance).
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 20;
}

// Nights the hotel has marked fully booked (Admin → Fully booked nights). Public data, cached briefly.
async function blockedNights() {
  try {
    const r = await fetch(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/settings/availability?key=${config.apiKey}`, { next: { revalidate: 120 } });
    if (!r.ok) return [];
    const j = await r.json();
    return (j.fields?.blocked?.arrayValue?.values || []).map((v) => v.stringValue).filter(Boolean);
  } catch {
    return [];
  }
}

const card = (r) => ({ id: r.id, name: r.name, view: r.view || '', image: r.images?.[0] || null });

// Only the remembered details travel between the browser and the server, checked here.
function cleanState(s) {
  if (!s || typeof s !== 'object') return {};
  const iso = (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
  const id = (v) => (typeof v === 'string' && /^[a-z0-9-]{1,60}$/.test(v) ? v : null);
  const n = (v) => (Number.isInteger(v) && v >= 0 && v <= 50 ? v : null);
  const b = s.booking || {};
  return {
    room: id(s.room),
    flow: s.flow === 'booking' ? 'booking' : null,
    last: s.last === 'sun' ? 'sun' : null,
    booking: { check_in: iso(b.check_in), check_out: iso(b.check_out), adults: n(b.adults), children: n(b.children), room: id(b.room) },
  };
}

async function askClaude(messages, rooms, brain) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20_000);
  const context = `\n\nWHAT THE WEBSITE WORKED OUT FOR THIS MESSAGE (reliable; use it):\n${brain.facts || '(nothing extra)'}\nThe page already shows these buttons under your reply, so you can refer to them: ${brain.actions.map((a) => a.label).join('; ') || 'none'}.${brain.rooms.length ? ` Room cards shown: ${brain.rooms.map((r) => r.name).join(', ')}.` : ''}\nIf the guest is planning a stay, ask for any missing detail (dates, number of adults and children) one question at a time.`;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 600, temperature: 0.2, system: systemPrompt(rooms) + context, messages }),
      cache: 'no-store',
    });
    if (!r.ok) {
      console.warn('Chat: AI service replied', r.status);
      return null;
    }
    const j = await r.json();
    const text = (j.content || [])
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('')
      .trim();
    return text || null;
  } catch (e) {
    console.warn('Chat: AI service not reachable', e?.name);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req) {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
  if (limited(ip)) return Response.json({ answer: 'You are sending questions very quickly. Please wait a minute, or message us on WhatsApp.', whatsapp: true }, { status: 429 });

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Bad request' }, { status: 400 });
  }
  const history = Array.isArray(body?.messages) ? body.messages : [];
  const messages = history
    .slice(-MAX_TURNS)
    .filter((m) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_Q) }));
  while (messages.length && messages[0].role !== 'user') messages.shift();
  const last = messages[messages.length - 1];
  if (!last || last.role !== 'user') return Response.json({ error: 'Ask a question' }, { status: 400 });

  const [rooms, blocked] = await Promise.all([getRooms().catch(() => []), blockedNights()]);
  const brain = think(last.content, rooms, cleanState(body.state), { blocked });
  const ai = await askClaude(messages, rooms, brain);
  let answer = ai || brain.answer;
  const whatsapp = (ai ? answer.includes('[[WHATSAPP]]') : brain.whatsapp) && !brain.actions.some((a) => a.kind === 'whatsapp');
  answer = answer.replace(/\s*\[\[WHATSAPP\]\]\s*/g, ' ').trim();
  return Response.json(
    { answer, whatsapp, rooms: brain.rooms.slice(0, 6).map(card), actions: brain.actions, suggestions: brain.suggestions, state: brain.state, source: ai ? 'ai' : 'built-in' },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
