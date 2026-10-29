'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HOTEL } from '@/data/content';
import Photo from '../Photo';
import { EASE, Icon } from './ui';

const STORE = 'sv-chat';
const VOICE_PREF = 'sv-chat-voice';
const WA = `https://wa.me/${HOTEL.whatsapp}?text=${encodeURIComponent(`Hello ${HOTEL.name}, I have a question.`)}`;
const SUGGEST = ['Which room is best for a family?', 'Which rooms face the sea?', 'I want to book this weekend', 'Sunrise time tomorrow', 'How do I get to the hotel?', 'What facilities do you have?'];
const WELCOME = {
  role: 'assistant',
  content: `Hello! I'm the ${HOTEL.name} assistant. Type or tap the microphone and ask me about rooms, dates, facilities, dining or directions.`,
};

// Text for speaking aloud: links read as their words, no list dashes.
const speakable = (t) =>
  t
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/\+91 (\d{5}) (\d{5})/g, (_, a, b) => `plus 91, ${a.split('').join(' ')}, ${b.split('').join(' ')}`)
    .replace(/\s+/g, ' ')
    .trim();

// [text](link) → a safe link; only this site's pages, Google Maps, WhatsApp, phone and email are linked.
function Inline({ text }) {
  const out = [];
  const re = /\[([^\]]{1,80})\]\(([^)\s]{1,600})\)/g;
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

function Message({ m, onSpeak, canSpeak }) {
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
  const bot = m.role !== 'user';
  return (
    <motion.div className={`chat-msg ${bot ? 'bot' : 'me'}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }}>
      <div className="chat-bubble">
        {m.voice && !bot && (
          <span className="chat-voice-tag" aria-label="Spoken">
            🎙
          </span>
        )}
        {blocks}
      </div>
      {bot && canSpeak && m.content && (
        <button type="button" className="chat-listen" onClick={() => onSpeak(m.content)} aria-label="Read this reply aloud">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9v6h4l5 4V5L8 9z M16 9a4 4 0 0 1 0 6 M18.5 6.5a8 8 0 0 1 0 11" />
          </svg>
          Listen
        </button>
      )}
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
      {m.actions?.length > 0 && (
        <div className="chat-actions">
          {m.actions.map((a) =>
            a.kind === 'whatsapp' ? (
              <a key={a.href} className="chat-wa" href={a.href} target="_blank" rel="noreferrer">
                <Icon.chat /> {a.label}
              </a>
            ) : (
              <Link key={a.href} className="chat-act" href={a.href}>
                {a.label}
              </Link>
            )
          )}
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

// Floating chat assistant (bottom right on every public page): type or speak, hear the replies,
// and keep the conversation for this visit when the window is minimised.
export default function ChatWidget({ visible = true }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([WELCOME]);
  const [brain, setBrain] = useState({});
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [canListen, setCanListen] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [readAloud, setReadAloud] = useState(false);
  const [notice, setNotice] = useState('');
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const fabRef = useRef(null);
  const recRef = useRef(null);
  const handsFree = useRef(false);
  const openRef = useRef(false);
  const askRef = useRef(null);

  useEffect(() => {
    setCanListen(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
    setCanSpeak('speechSynthesis' in window);
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE) || 'null');
      if (saved?.msgs?.length) setMsgs(saved.msgs);
      if (saved?.brain) setBrain(saved.brain);
      setReadAloud(localStorage.getItem(VOICE_PREF) === '1');
    } catch {}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(STORE, JSON.stringify({ msgs: msgs.slice(-30), brain }));
    } catch {}
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, busy, brain]);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // ---------- Voice ----------
  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);
  const stopListening = useCallback(() => {
    handsFree.current = false;
    try {
      recRef.current?.abort();
    } catch {}
    setListening(false);
  }, []);

  const listen = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    stopSpeaking();
    setNotice('');
    const rec = new SR();
    recRef.current = rec;
    rec.lang = /^en/i.test(navigator.language || '') ? navigator.language : 'en-IN';
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    let finalText = '';
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      setText((finalText + interim).trim());
    };
    rec.onerror = (e) => {
      handsFree.current = false;
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') setNotice('Microphone access is blocked. Allow the microphone for this site in your browser settings, or type your question.');
      else if (e.error === 'no-speech') setNotice("I didn't hear anything. Tap the microphone and try again.");
      else if (e.error === 'network') setNotice('Voice needs an internet connection. Please type your question.');
      else if (e.error !== 'aborted') setNotice('Voice input stopped. You can type your question instead.');
    };
    rec.onend = () => {
      setListening(false);
      const said = finalText.trim();
      if (said) {
        setText('');
        askRef.current(said, true);
      } else handsFree.current = false;
    };
    try {
      rec.start();
      setListening(true);
      handsFree.current = true;
    } catch {
      setNotice('Voice input could not start. Please type your question.');
    }
  }, [stopSpeaking]);

  const speak = useCallback(
    (content, then) => {
      if (!('speechSynthesis' in window)) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(speakable(content));
      const voices = synth.getVoices();
      const voice = voices.find((v) => v.lang === 'en-IN') || voices.find((v) => /en-GB/.test(v.lang)) || voices.find((v) => /^en/.test(v.lang));
      try {
        if (voice) u.voice = voice;
      } catch {}
      u.lang = voice?.lang || 'en-IN';
      u.rate = 1;
      u.onstart = () => setSpeaking(true);
      u.onend = () => {
        setSpeaking(false);
        then?.();
      };
      u.onerror = () => setSpeaking(false);
      synth.speak(u);
    },
    []
  );

  // ---------- Asking ----------
  const ask = async (q, byVoice = false) => {
    const question = q.trim().slice(0, 600);
    if (!question || busy) return;
    const next = [...msgs, { role: 'user', content: question, voice: byVoice }];
    setMsgs(next);
    setText('');
    setBusy(true);
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ state: brain, messages: next.filter((m) => m.content !== WELCOME.content).map(({ role, content }) => ({ role, content })) }),
      });
      const j = await r.json();
      const reply = { role: 'assistant', content: j.answer || 'Sorry, something went wrong.', whatsapp: Boolean(j.whatsapp || !j.answer), rooms: j.rooms || [], actions: j.actions || [], suggestions: j.suggestions || [] };
      setMsgs((m) => [...m, reply]);
      if (j.state) setBrain(j.state);
      // Spoken question → spoken answer; then listen again for a hands-free conversation.
      if ((byVoice || readAloud) && openRef.current) {
        try {
          speak(reply.content, () => byVoice && handsFree.current && openRef.current && listen());
        } catch {
          handsFree.current = false;
        }
      }
    } catch {
      setMsgs((m) => [...m, { role: 'assistant', content: 'Sorry, I could not connect just now. Please try again, or ask our team on WhatsApp.', whatsapp: true }]);
      handsFree.current = false;
    } finally {
      setBusy(false);
    }
  };

  askRef.current = ask;

  const minimise = useCallback(() => {
    setOpen(false);
    stopListening();
    stopSpeaking();
    setTimeout(() => fabRef.current?.focus(), 50);
  }, [stopListening, stopSpeaking]);
  useEffect(() => {
    if (!open) return undefined;
    setTimeout(() => inputRef.current?.focus(), 250);
    const k = (e) => e.key === 'Escape' && minimise();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, minimise]);
  useEffect(() => () => stopSpeaking(), [stopSpeaking]);

  const reset = () => {
    stopSpeaking();
    setMsgs([WELCOME]);
    setBrain({});
  };
  const toggleRead = () => {
    const v = !readAloud;
    setReadAloud(v);
    if (!v) stopSpeaking();
    try {
      localStorage.setItem(VOICE_PREF, v ? '1' : '0');
    } catch {}
  };
  const started = msgs.length > 1;
  const lastBot = [...msgs].reverse().find((m) => m.role === 'assistant');
  const chips = !started ? SUGGEST : lastBot?.suggestions || [];

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
                <p>{listening ? 'Listening…' : speaking ? 'Speaking…' : 'Ask by text or voice'}</p>
              </div>
              {canSpeak && (
                <button type="button" className={`chat-icon-btn ${readAloud ? 'on' : ''}`} onClick={toggleRead} aria-pressed={readAloud} aria-label={readAloud ? 'Stop reading replies aloud' : 'Read replies aloud'} title={readAloud ? 'Replies are read aloud' : 'Read replies aloud'}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 9v6h4l5 4V5L8 9z" />
                    {readAloud ? <path d="M16 9a4 4 0 0 1 0 6 M18.5 6.5a8 8 0 0 1 0 11" /> : <path d="M17 9l5 6 M22 9l-5 6" />}
                  </svg>
                </button>
              )}
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
                <Message key={i} m={m} canSpeak={canSpeak} onSpeak={(c) => (speaking ? stopSpeaking() : speak(c))} />
              ))}
              {busy && (
                <div className="chat-msg bot">
                  <div className="chat-bubble chat-typing" aria-label="The assistant is thinking">
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              )}
              {!busy && chips.length > 0 && (
                <div className="chat-suggest" aria-label="Suggested questions">
                  {chips.map((s) => (
                    <button key={s} type="button" onClick={() => ask(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <AnimatePresence>
              {listening && (
                <motion.div className="chat-listening" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} role="status">
                  <span className="chat-wave" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="chat-heard">{text || 'Listening… speak now'}</span>
                  <button type="button" className="chat-stop" onClick={stopListening}>
                    Stop
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            {notice && (
              <p className="chat-notice" role="alert">
                {notice}
              </p>
            )}
            <form
              className="chat-form"
              onSubmit={(e) => {
                e.preventDefault();
                ask(text);
              }}
            >
              {canListen && (
                <button type="button" className={`chat-mic ${listening ? 'on' : ''}`} onClick={() => (listening ? stopListening() : listen())} aria-pressed={listening} aria-label={listening ? 'Stop listening' : 'Ask by voice'} title={listening ? 'Stop listening' : 'Ask by voice'}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z M5.5 11a6.5 6.5 0 0 0 13 0 M12 17.5V21 M8.5 21h7" />
                  </svg>
                </button>
              )}
              <label htmlFor="chat-q" className="sr-only">
                Your question
              </label>
              <textarea
                id="chat-q"
                ref={inputRef}
                rows={1}
                value={text}
                maxLength={600}
                placeholder={canListen ? 'Type or tap the mic…' : 'Ask about rooms, dates, directions…'}
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
            aria-label={open ? 'Minimise chat' : 'Open the chat and voice assistant'}
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
