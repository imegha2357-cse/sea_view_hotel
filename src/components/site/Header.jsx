'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildNav, MENU_PROMO } from '@/data/nav';
import { useSiteData } from '@/components/SiteData';
import { HOTEL } from '@/data/content';
import { useAuth } from '@/lib/auth';
import { lockScroll, unlockScroll } from '@/lib/scroll';
import Brand from './Brand';
import Photo from '../Photo';
import { Chevron, EASE, Icon } from './ui';

function MegaPanel({ item, onNavigate }) {
  const list = { hide: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } } };
  const el = { hide: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } } };
  return (
    <motion.div className="mega" id={`mega-${item.id}`} initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.25 } }} transition={{ duration: 0.45, ease: EASE }}>
      <div className="mega-in">
        <div className="mega-promo">
          <h2>{MENU_PROMO.title}</h2>
          <p>{MENU_PROMO.text}</p>
          <Link href={MENU_PROMO.href} onClick={onNavigate}>
            {MENU_PROMO.cta} ›
          </Link>
        </div>
        <motion.div className="mega-body" variants={list} initial="hide" animate="show">
          {item.href && (
            <motion.p variants={el} className="mega-all">
              <Link href={item.href} onClick={onNavigate} className="more-link">
                {item.id === 'stay' ? 'All rooms and suites' : item.id === 'events' ? 'Meetings and events' : `All ${item.label.toLowerCase()}`} <Chevron />
              </Link>
            </motion.p>
          )}
          {item.columns && (
            <div className="mega-cols">
              {item.columns.map((col, ci) => (
                <ul key={ci}>
                  {col.map((l) => (
                    <motion.li key={l.href + l.label} variants={el}>
                      <Link href={l.href} onClick={onNavigate}>
                        {l.arrow && <Chevron />} {l.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              ))}
            </div>
          )}
          {item.tiles && (
            <div className="mega-tiles">
              {item.tiles.map((t) => (
                <motion.div key={t.href} variants={el}>
                  <Link href={t.href} className="mega-tile zoom-hover" onClick={onNavigate}>
                    <span className="frame">
                      <Photo k={t.image} sizes="140px" alt="" />
                    </span>
                    {t.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

function MobileDrawer({ onClose, account, nav }) {
  const [open, setOpen] = useState(null);
  useEffect(() => {
    lockScroll();
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => {
      unlockScroll();
      window.removeEventListener('keydown', k);
    };
  }, [onClose]);
  return (
    <motion.div className="drawer-nav" role="dialog" aria-modal="true" aria-label="Menu" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.4, ease: EASE }} data-lenis-prevent>
      <div className="drawer-head">
        <Brand />
        <button className="drawer-close" onClick={onClose} aria-label="Close menu">
          ×
        </button>
      </div>
      <nav aria-label="Main">
        {nav.map((item, i) => {
          const subs = [...(item.tiles || []), ...(item.columns || []).flat()];
          const uniq = subs.filter((s, k) => subs.findIndex((x) => x.href === s.href) === k);
          return (
            <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05, duration: 0.4, ease: EASE }}>
              {uniq.length ? (
                <>
                  <button className="drawer-link" aria-expanded={open === item.id} onClick={() => setOpen(open === item.id ? null : item.id)}>
                    {item.label} <i className="pm" aria-hidden="true" />
                  </button>
                  <AnimatePresence initial={false}>
                    {open === item.id && (
                      <motion.ul className="drawer-sub" initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.3, ease: EASE }}>
                        {item.href && (
                          <li>
                            <Link href={item.href} onClick={onClose}>
                              All {item.label.toLowerCase()}
                            </Link>
                          </li>
                        )}
                        {uniq.map((s) => (
                          <li key={s.href}>
                            <Link href={s.href} onClick={onClose}>
                              {s.label}
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link className="drawer-link" href={item.href} onClick={onClose}>
                  {item.label}
                </Link>
              )}
            </motion.div>
          );
        })}
      </nav>
      <div className="drawer-foot">
        <Link href="/enquire" className="btn solid" onClick={onClose}>
          Check availability
        </Link>
        <Link href={account.href} className="btn outline dark" onClick={onClose}>
          {account.label}
        </Link>
        <a href={`tel:${HOTEL.phoneHref}`} className="more-link">
          Call {HOTEL.phone}
        </a>
      </div>
    </motion.div>
  );
}

export default function Header() {
  const { rooms, offers } = useSiteData();
  const MAIN_NAV = useMemo(() => buildNav({ rooms, offers }), [rooms, offers]);
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  const [hero, setHero] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const timer = useRef(null);
  const ref = useRef(null);

  // Is there a full-bleed photo under the header on this page?
  useEffect(() => {
    setHero(Boolean(document.querySelector('[data-hero]')));
    setOpenId(null);
    setDrawer(false);
  }, [pathname]);

  // Solid after a little scroll; slides away on the way down once the section tabs take over (Taj).
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 40);
        const hasTabs = Boolean(document.querySelector('.tabs-bar'));
        if (!hasTabs || y < window.innerHeight * 0.85) setHidden(false);
        else if (y > last + 4) setHidden(true);
        else if (y < last - 4) setHidden(false);
        last = y;
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  const isHidden = hidden && !openId && !drawer;
  useEffect(() => {
    document.documentElement.dataset.hdr = isHidden ? 'hidden' : 'shown';
  }, [isHidden]);

  const close = useCallback(() => setOpenId(null), []);
  useEffect(() => {
    if (!openId) return undefined;
    const k = (e) => {
      if (e.key === 'Escape') {
        setOpenId(null);
        ref.current?.querySelector(`[aria-controls="mega-${openId}"]`)?.focus();
      }
    };
    const out = (e) => !ref.current?.contains(e.target) && setOpenId(null);
    window.addEventListener('keydown', k);
    document.addEventListener('pointerdown', out);
    return () => {
      window.removeEventListener('keydown', k);
      document.removeEventListener('pointerdown', out);
    };
  }, [openId]);

  // Hover intent on desktop; click and keyboard always work.
  const hoverOpen = (id) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpenId(id), 120);
  };
  const hoverClose = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpenId(null), 220);
  };

  const solid = !hero || scrolled || Boolean(openId);
  const account = user ? { href: isAdmin ? '/admin' : '/account', label: isAdmin ? 'Dashboard' : 'My account' } : { href: '/login', label: 'Login / Join' };
  const active = (item) => item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`));

  return (
    <>
      <header ref={ref} className={`hdr ${solid ? 'solid' : ''} ${isHidden ? 'hide' : ''}`} onMouseLeave={hoverClose}>
        <div className="container wide hdr-bar">
          <Link href="/" className="brand" aria-label={`${HOTEL.name}, home`}>
            <Brand />
          </Link>
          <ul className="hdr-nav" role="list">
            {MAIN_NAV.map((item) => {
              const hasMenu = Boolean(item.columns || item.tiles);
              return (
                <li key={item.id} onMouseEnter={() => (hasMenu ? hoverOpen(item.id) : hoverClose())}>
                  {hasMenu ? (
                    <button className={`nav-item ${active(item) ? 'active' : ''}`} aria-expanded={openId === item.id} aria-controls={`mega-${item.id}`} onClick={() => setOpenId(openId === item.id ? null : item.id)}>
                      {item.label} <Chevron dir="down" />
                    </button>
                  ) : (
                    <Link href={item.href} className={`nav-item ${active(item) ? 'active' : ''}`} aria-current={active(item) ? 'page' : undefined}>
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="hdr-actions">
            <Link href={account.href} className="hdr-login">
              <Icon.user />
              <span>{account.label}</span>
            </Link>
            <Link href="/enquire" className="btn solid">
              Check availability
            </Link>
            <button className="burger" aria-label="Open menu" aria-expanded={drawer} onClick={() => setDrawer(true)}>
              <i />
              <i />
              <i />
            </button>
          </div>
        </div>
        <AnimatePresence>
          {openId && (
            <div onMouseEnter={() => clearTimeout(timer.current)}>
              <MegaPanel key={openId} item={MAIN_NAV.find((n) => n.id === openId)} onNavigate={close} />
            </div>
          )}
        </AnimatePresence>
        <AnimatePresence>{openId && <motion.div className="mega-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} onMouseEnter={hoverClose} aria-hidden="true" />}</AnimatePresence>
      </header>
      <AnimatePresence>{drawer && <MobileDrawer onClose={() => setDrawer(false)} account={account} nav={MAIN_NAV} />}</AnimatePresence>
    </>
  );
}
