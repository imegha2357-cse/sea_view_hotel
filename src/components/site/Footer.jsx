'use client';

import Link from 'next/link';
import Brand from './Brand';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { ATTRACTIONS, HOTEL } from '@/data/content';
import { FOOTER_LINKS, LEGAL_LINKS, SOCIAL, slug } from '@/data/nav';
import { analyticsEnabled } from '@/lib/analytics';
import { loadFirebase, firebaseReady } from '@/lib/firebase';
import { openCookieSettings } from '../CookieConsent';
import Feedback from '../Feedback';
import { Preferences } from '../Preferences';
import { EASE, Icon } from './ui';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Taj "Subscribe for latest updates", with an explicit consent tick (PRD 10.4).
function Subscribe() {
  const [email, setEmail] = useState('');
  const [ok, setOk] = useState(false);
  const [state, setState] = useState('idle');
  const [msg, setMsg] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    if (!EMAIL.test(email.trim())) return setMsg('Enter a valid email address.');
    if (!ok) return setMsg('Please tick the box to agree to receive emails.');
    if (!firebaseReady) return setMsg('Sign-up is not available right now.');
    setState('sending');
    setMsg('');
    try {
      const { db, F } = await loadFirebase();
      await F.addDoc(F.collection(db, 'newsletter'), { email: email.trim(), consent: true, created_at: F.serverTimestamp(), lang: (navigator.language || 'en').slice(0, 8) });
      setState('done');
      setMsg('Thank you. You will hear from us about offers and news.');
      setEmail('');
    } catch {
      setState('idle');
      setMsg('That did not work. Please try again later.');
    }
  };
  return (
    <form onSubmit={submit} noValidate aria-labelledby="sub-h">
      <h2 className="ftr-k" id="sub-h">
        Subscribe for latest updates
      </h2>
      <div className="sub-form">
        <label htmlFor="sub-email" className="sr-only">
          Email address
        </label>
        <input id="sub-email" type="email" autoComplete="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="btn solid sm" type="submit" disabled={state === 'sending'}>
          Subscribe
        </button>
      </div>
      <label className="sub-consent">
        <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} />
        <span>
          I agree to receive occasional emails from Hotel Sea View. Unsubscribe at any time. See the <Link href="/privacy">privacy notice</Link>.
        </span>
      </label>
      <p className="sub-msg" role="status" aria-live="polite">
        {msg}
      </p>
    </form>
  );
}

export default function Footer() {
  const [open, setOpen] = useState(false);
  return (
    <footer className="ftr" id="contact">
      <div className="container wide">
        <div className="ftr-top">
          <div>
            <Subscribe />
            <div className="ftr-contacts">
              <div>
                <p className="ftr-k">For bookings contact</p>
                <a href={`tel:${HOTEL.phoneHref}`}>{HOTEL.phone}</a>
                <a href={`https://wa.me/${HOTEL.whatsapp}`} target="_blank" rel="noreferrer">
                  WhatsApp {HOTEL.phone}
                </a>
              </div>
              <div>
                <p className="ftr-k">Email</p>
                <a href={`mailto:${HOTEL.email}`}>{HOTEL.email}</a>
              </div>
              <div>
                <p className="ftr-k">Sea View Restaurant</p>
                <a href={`tel:${HOTEL.restaurantPhoneHref}`}>{HOTEL.restaurantPhone}</a>
              </div>
              <div>
                <p className="ftr-k">Address</p>
                <address style={{ fontStyle: 'normal' }}>{HOTEL.addressLines.slice(0, 2).join(', ')}</address>
              </div>
            </div>
          </div>
          <nav aria-labelledby="ql-h">
            <h2 className="ftr-k" id="ql-h">
              Quick links
            </h2>
            <div className="ftr-links">
              {FOOTER_LINKS.map((col, i) => (
                <ul key={i}>
                  {col.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </nav>
          <div>
            <h2 className="ftr-k">Connect with us</h2>
            <div className="ftr-social">
              {SOCIAL.map((s) => {
                const I = Icon[s.icon];
                return (
                  <a key={s.href} href={s.href} target="_blank" rel="noreferrer" aria-label={`${s.label} (opens in a new tab)`}>
                    <I />
                  </a>
                );
              })}
              <a href={`https://wa.me/${HOTEL.whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp (opens in a new tab)">
                <Icon.chat />
              </a>
            </div>
          </div>
        </div>

        <div className="ftr-acc">
          <button aria-expanded={open} aria-controls="ftr-explore" onClick={() => setOpen((o) => !o)}>
            Explore Kanyakumari <i className="pm" aria-hidden="true" />
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.ul id="ftr-explore" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} style={{ overflow: 'hidden' }}>
                {ATTRACTIONS.map((a) => (
                  <li key={a.name}>
                    <Link href={`/experiences#${slug(a.name)}`}>{a.name}</Link>
                  </li>
                ))}
                <li>
                  <Link href="/plan-your-visit">Sunrise and sunset times</Link>
                </li>
                <li>
                  <Link href="/plan-your-visit#reach">How to reach Kanyakumari</Link>
                </li>
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <div className="ftr-spaces">
          <h2>Our spaces</h2>
          <Link href="/dining#restaurant">Sea View Restaurant</Link>
          <Link href="/dining#bar">Wave Bar</Link>
          <Link href="/meetings">Conference Hall</Link>
        </div>

        <Link href="/" className="ftr-logo" aria-label="Hotel Sea View, home">
          <Brand light stacked />
        </Link>

        <div className="ftr-bottom">
          <span>© {new Date().getFullYear()} Hotel Sea View, Kanyakumari. All rights reserved.</span>
          <ul className="ftr-legal">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
            {analyticsEnabled && (
              <li>
                <button type="button" onClick={openCookieSettings}>
                  Cookie settings
                </button>
              </li>
            )}
            <li>
              <Feedback />
            </li>
            <li>
              <Preferences />
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
