'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HOTEL } from '@/data/content';
import Photo from '../Photo';
import { EASE, Icon } from './ui';

const STORE = 'sv-chat';
const WA = `https://wa.me/${HOTEL.whatsapp}?text=${encodeURIComponent(`Hello ${HOTEL.name}, I have a question.`)}`;
const SUGGEST = ['What room types do you have?', 'Which rooms face the sea?', 'Show me room photos', 'How do I get to the hotel?', 'What facilities do you have?', 'What time is check-in?'];
const WELCOME = {
  role: 'assistant',
  content: `Hello! I'm the ${HOTEL.name} assistant. Ask me about rooms, facilities, dining, directions or how to enquire.`,
};

// [text](link) → a safe link; only this site's pages, Google Maps, WhatsApp, phone and email are linked.
function Inline({ text }) {
  const out = [];
  const re = /\[([^\]]{1,80})\]\(([^)\s]{1,400})\)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const [, label, href] = m;
    if (href.startsWith('/') && !href.startsWith('//')) out.push(<Link key={m.index} href={href}>{label}</Link>);
    else if (/^https:\/\/(www\.google\.com\/maps|wa\.me)\//.test(href) || /^(tel|mailto):/.test(href))
      out.push(
        <a key={m.index} href={href} target="_blank" rel="noreferrer">
          {label}
        </a>
      );
    else out.push(label);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Message({ m }) {
  const lines = m.content.split('\n').filter((l) => l.trim());
  const blocks = [];
  let list = null;
  lines.forEach((l, i) => {
    if (/^\s*[-•]\s+/.test(l)) {
      if (!list) {
        list = [];
        blocks.push(<ul key={`u${i}`}>{list}</ul>);
      }
      list.push(
        <li key={i}>
          <Inline text={l.replace(/^\s*[-•]\s+/, '')} />
        </li>
      );
    } else {
      list = null;
      blocks.push(
        <p key={i}>
          <Inline text={l} />
        </p>
      );
    }
  });
  return (
    <motion.div className={`chat-msg ${m.role === 'user' ? 'me' : 'bot'}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }}>
      <div className="chat-bubble">{blocks}</div>
      {m.rooms?.length > 0 && (
        <div className="chat-rooms" role="list" aria-label="Rooms">
          {m.rooms.map((r) => (
            <Link key={r.id} href={`/rooms/${r.id}`} className="chat-room" role="listitem">
              <span className="frame">{r.image && <Photo k={r.image} sizes="160px" alt="" />}</span>
              <b>{r.name}</b>
              {r.view && <small>{r.view}</small>}
            </Link>
          ))}
        </div>
      )}
      {m.whatsapp && (
        <a className="chat-wa" href={WA} target="_blank" rel="noreferrer">
          <Icon.chat /> Ask our team on WhatsApp
        </a>
      )}
    </motion.div>
  );
}

// Floating chat assistant (bottom right on every public page). Minimise keeps the conversation for this visit.
export default function ChatWidget({ visible = true }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([WELCOME]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const fabRef = useRef(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE) || 'null');
      if (Array.isArray(saved) && saved.length) setMsgs(saved);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(STORE, JSON.stringify(msgs.slice(-30)));
    } catch {}
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, busy]);

  const minimise = useCallback(() => {
    setOpen(false);
    setTimeout(() => fabRef.current?.focus(), 50);
  }, []);
  useEffect(() => {
    if (!open) return undefined;
    setTimeout(() => inputRef.current?.focus(), 250);
    const k = (e) => e.key === 'Escape' && minimise();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, minimise]);

  const ask = async (q) => {
    const question = q.trim().slice(0, 600);
    if (!question || busy) return;
    const next = [...msgs, { role: 'user', content: question }];
    setMsgs(next);
    setText('');
    setBusy(true);
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: next.filter((m) => m !== WELCOME && m.content !== WELCOME.content).map(({ role, content }) => ({ role, content })) }),
      });
      const j = await r.json();
      setMsgs((m) => [...m, { role: 'assistant', content: j.answer || 'Sorry, something went wrong.', whatsapp: Boolean(j.whatsapp || !j.answer), rooms: j.rooms || [] }]);
    } catch {
      setMsgs((m) => [...m, { role: 'assistant', content: 'Sorry, I could not connect just now. Please try again, or ask our team on WhatsApp.', whatsapp: true }]);
    } finally {
      setBusy(false);
    }
  };

  const reset = () => setMsgs([WELCOME]);
  const started = msgs.length > 1;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.section
            key="chat"
            className="chat"
            role="dialog"
            aria-modal="false"
            aria-labelledby="chat-h"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.3, ease: EASE }}
            data-lenis-prevent
          >
            <header className="chat-head">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/s-mark.png" width={256} height={171} alt="" className="chat-logo" />
              <div>
                <h2 id="chat-h">Sea View assistant</h2>
                <p>Answers from the hotel&rsquo;s own information</p>
              </div>
              {started && (
                <button type="button" className="chat-icon-btn" onClick={reset} aria-label="Start a new conversation" title="New conversation">
                  ↺
                </button>
              )}
              <button type="button" className="chat-icon-btn" onClick={minimise} aria-label="Minimise chat" title="Minimise">
                <span aria-hidden="true">–</span>
              </button>
            </header>
            <div className="chat-log" ref={logRef} aria-live="polite" aria-busy={busy}>
              {msgs.map((m, i) => (
                <Message key={i} m={m} />
              ))}
              {busy && (
                <div className="chat-msg bot">
                  <div className="chat-bubble chat-typing" aria-label="The assistant is typing">
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              )}
              {!started && (
                <div className="chat-suggest" aria-label="Suggested questions">
                  {SUGGEST.map((s) => (
                    <button key={s} type="button" onClick={() => ask(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <form
              className="chat-form"
              onSubmit={(e) => {
                e.preventDefault();
                ask(text);
              }}
            >
              <label htmlFor="chat-q" className="sr-only">
                Your question
              </label>
              <textarea
                id="chat-q"
                ref={inputRef}
                rows={1}
                value={text}
                maxLength={600}
                placeholder="Ask about rooms, directions, dining…"
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    ask(text);
                  }
                }}
              />
              <button type="submit" className="chat-send" disabled={busy || !text.trim()} aria-label="Send">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 12l16-8-6 16-2.5-6.5z" />
                </svg>
              </button>
            </form>
            <p className="chat-foot">
              Bookings and prices are confirmed by our team.{' '}
              <a href={WA} target="_blank" rel="noreferrer">
                Chat on WhatsApp
              </a>
            </p>
          </motion.section>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {(visible || open) && (
          <motion.button
            key="fab"
            ref={fabRef}
            type="button"
            className={`fab-chat ${open ? 'is-open' : ''}`}
            aria-label={open ? 'Minimise chat' : 'Open the chat assistant'}
            aria-expanded={open}
            onClick={() => (open ? minimise() : setOpen(true))}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            whileHover={{ scale: 1.08 }}
          >
            {!open && <span className="ping" aria-hidden="true" />}
            {open ? <span className="fab-x" aria-hidden="true">×</span> : <Icon.chat />}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
