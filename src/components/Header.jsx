import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { useHeaderScroll, useActiveSection } from '../hooks/useScroll';
import { HOTEL } from '../data/content';
import { useAuth } from '../lib/auth';
import { UserIcon } from './Icons';
import { EASE } from './Motion';
import { lockScroll, unlockScroll } from '../lib/scroll';

export const NAV = [
  { id: 'rooms', label: 'Rooms' },
  { id: 'dining', label: 'Dining' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'location', label: 'Location' },
  { id: 'faq', label: 'FAQs' },
  { id: 'contact', label: 'Contact' },
];

export function Brand() {
  return (
    <span className="brand-mark">
      <b>SEA VIEW</b>
      <small>Hotel · Kanyakumari</small>
    </span>
  );
}

export default function Header() {
  const { pathname } = useLocation();
  const onHome = pathname === '/';
  const { solid, hidden } = useHeaderScroll(80);
  const active = useActiveSection(NAV.map((n) => n.id));
  const [open, setOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });

  useEffect(() => {
    if (!open) return undefined;
    lockScroll();
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      unlockScroll();
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const href = (id) => (onHome ? `#${id}` : `/#${id}`);
  const isSolid = solid || !onHome;
  const accountLink = user ? (isAdmin ? '/admin' : '/account') : '/login';

  return (
    <>
      <header className={`site-header ${isSolid ? 'solid' : ''} ${hidden && !open ? 'hidden' : ''}`}>
        <div className="container bar">
          <Link to="/" className="brand" aria-label={`${HOTEL.name} home`}>
            <Brand />
          </Link>
          <nav className="nav" aria-label="Main">
            {NAV.map((n) => (
              <a key={n.id} href={href(n.id)} className={onHome && active === n.id ? 'active' : ''}>
                {n.label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <Link to={accountLink} className="account">
              <UserIcon />
              <span>{user ? (isAdmin ? 'Dashboard' : 'My account') : 'Sign in'}</span>
            </Link>
            <a href={href('enquire')} className="btn solid">
              Enquire now
            </a>
            <button className={`burger ${open ? 'open' : ''}`} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              <i />
              <i />
              <i />
            </button>
          </div>
        </div>
        {onHome && <motion.i className="progress" style={{ scaleX: progress }} aria-hidden="true" />}
      </header>

      {/* #17 full-screen mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            data-lenis-prevent
          >
            <button className="close" aria-label="Close menu" onClick={() => setOpen(false)}>
              ×
            </button>
            <nav>
              {[...NAV, { id: 'enquire', label: 'Enquire' }].map((n, i) => (
                <motion.a
                  key={n.id}
                  href={href(n.id)}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: EASE, delay: 0.18 + i * 0.06 }}
                >
                  {n.label}
                </motion.a>
              ))}
            </nav>
            <motion.div className="mm-foot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              <a href={`tel:${HOTEL.phoneHref}`}>{HOTEL.phone}</a>
              <span>{HOTEL.addressLines.slice(0, 2).join(', ')}</span>
              <Link to={accountLink} onClick={() => setOpen(false)}>
                {user ? (isAdmin ? 'Admin dashboard' : 'My account') : 'Guest sign in'}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
