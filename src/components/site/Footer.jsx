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
    <form onSubmit={submit} noValidate aria-label="Subscribe for latest updates">
      <p className="ftr-note">Offers and news from Kanyakumari, now and then.</p>
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

const contactRows = [
  { k: 'Reservations', v: HOTEL.phone, href: `tel:${HOTEL.phoneHref}`, icon: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z' },
  { k: 'WhatsApp', v: HOTEL.phone, href: `https://wa.me/${HOTEL.whatsapp}`, ext: true, icon: 'M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12z' },
  { k: 'Email', v: HOTEL.email, href: `mailto:${HOTEL.email}`, icon: 'M3 5h18v14H3z M3 6l9 7 9-7' },
  { k: 'Sea View Restaurant', v: HOTEL.restaurantPhone, href: `tel:${HOTEL.restaurantPhoneHref}`, icon: 'M3 17h18 M5 17a7 7 0 0 1 14 0 M12 7V5 M10 5h4' },
];

const rise = (i) => ({ initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.6, ease: EASE, delay: i * 0.08 } });

export default function Footer() {
  const [open, setOpen] = useState(false);
  return (
    <footer className="ftr" id="contact">
      <div className="container wide">
        <motion.div className="ftr-hero" {...rise(0)}>
          <Link href="/" className="ftr-brand" aria-label="Hotel Sea View, home">
            <Brand light />
          </Link>
          <p className="ftr-tag">Sea-facing rooms on East Car Street, a short walk from the shore where three seas meet.</p>
          <div className="ftr-cta">
            <Link href="/enquire" className="btn solid sm ghost-light">
              Check availability
            </Link>
            <a href={`https://wa.me/${HOTEL.whatsapp}`} className="btn outline light sm" target="_blank" rel="noreferrer">
              WhatsApp us
            </a>
          </div>
        </motion.div>

        <div className="ftr-cols">
          <motion.section aria-labelledby="ftr-contact-h" {...rise(1)}>
            <h2 className="ftr-k" id="ftr-contact-h">
              Contact
            </h2>
            <ul className="ftr-contact">
              {contactRows.map((c) => (
                <li key={c.k}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d={c.icon} />
                  </svg>
                  <span>
                    <small>{c.k}</small>
                    <a href={c.href} {...(c.ext ? { target: '_blank', rel: 'noreferrer' } : {})}>
                      {c.v}
                    </a>
                  </span>
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.section aria-labelledby="ftr-visit-h" {...rise(2)}>
            <h2 className="ftr-k" id="ftr-visit-h">
              Visit us
            </h2>
            <address className="ftr-addr">
              {HOTEL.addressLines.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </address>
            <a className="ftr-more" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(HOTEL.mapQuery)}`} target="_blank" rel="noreferrer">
              Get directions <span aria-hidden="true">→</span>
            </a>
          </motion.section>

          <motion.nav aria-labelledby="ftr-stay-h" {...rise(3)}>
            <h2 className="ftr-k" id="ftr-stay-h">
              Explore
            </h2>
            <ul className="ftr-list">
              {FOOTER_LINKS[0].map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </motion.nav>

          <motion.nav aria-labelledby="ftr-hotel-h" {...rise(4)}>
            <h2 className="ftr-k" id="ftr-hotel-h">
              The hotel
            </h2>
            <ul className="ftr-list">
              {FOOTER_LINKS[1].map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </motion.nav>

          <motion.section className="ftr-touch" aria-labelledby="ftr-touch-h" {...rise(5)}>
            <h2 className="ftr-k" id="ftr-touch-h">
              Stay in touch
            </h2>
            <Subscribe />
            <div className="ftr-social">
              {SOCIAL.map((x) => {
                const I = Icon[x.icon];
                return (
                  <a key={x.href} href={x.href} target="_blank" rel="noreferrer" aria-label={`${x.label} (opens in a new tab)`}>
                    <I />
                  </a>
                );
              })}
              <a href={`https://wa.me/${HOTEL.whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp (opens in a new tab)">
                <Icon.chat />
              </a>
            </div>
          </motion.section>
        </div>

        <div className="ftr-spaces">
          <h2 className="ftr-k">Our spaces</h2>
          <div>
            <Link href="/dining#restaurant">Sea View Restaurant</Link>
            <Link href="/dining#bar">Wave Bar</Link>
            <Link href="/meetings">Conference Hall</Link>
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
