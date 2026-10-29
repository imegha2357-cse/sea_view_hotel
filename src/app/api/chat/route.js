// The website chat assistant. With ANTHROPIC_API_KEY set in Vercel, questions are answered by Claude using
// only the hotel's own information (see src/lib/hotel-knowledge.js). Without the key, or if the AI service
// is unavailable, the built-in answerer replies from the same information. Nothing is stored.
import { getRooms } from '@/lib/cms-server';
import { localAnswer, systemPrompt, wantsRoomCards } from '@/lib/hotel-knowledge';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = process.env.CHAT_MODEL || 'claude-haiku-5-5';
const MAX_Q = 600;
const MAX_TURNS = 10;

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

const card = (r) => ({ id: r.id, name: r.name, view: r.view || '', image: r.images?.[0] || null });

async function askClaude(messages, rooms) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20_000);
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 500, temperature: 0.2, system: systemPrompt(rooms), messages }),
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

  const rooms = await getRooms().catch(() => []);
  const ai = await askClaude(messages, rooms);
  const local = ai ? null : localAnswer(last.content, rooms);
  let answer = ai || local.answer;
  const whatsapp = answer.includes('[[WHATSAPP]]');
  answer = answer.replace(/\s*\[\[WHATSAPP\]\]\s*/g, ' ').trim();
  const shown = ai ? wantsRoomCards(last.content, rooms) : local.rooms || [];
  return Response.json({ answer, whatsapp, rooms: shown.slice(0, 6).map(card), source: ai ? 'ai' : 'built-in' }, { headers: { 'Cache-Control': 'no-store' } });
}
