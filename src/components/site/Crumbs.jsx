'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { EASE, Icon } from './ui';

function Share({ title }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const out = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const k = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', out);
    window.addEventListener('keydown', k);
    return () => {
      document.removeEventListener('pointerdown', out);
      window.removeEventListener('keydown', k);
    };
  }, [open]);
  const click = async () => {
    const data = { title, url: window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {}
    }
    setOpen((o) => !o);
  };
  const url = typeof window === 'undefined' ? '' : encodeURIComponent(window.location.href);
  return (
    <div className="share" ref={ref}>
      <button className="share-btn" onClick={click} aria-expanded={open}>
        <Icon.share /> Share
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="share-pop" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: EASE }}>
            <a href={`https://wa.me/?text=${encodeURIComponent(title)}%20${url}`} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${url}`} target="_blank" rel="noreferrer">
              Facebook
            </a>
            <a href={`mailto:?subject=${encodeURIComponent(title)}&body=${url}`}>Email</a>
            <button
              onClick={async () => {
                await navigator.clipboard?.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? 'Link copied' : 'Copy link'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Breadcrumbs on the left, Share on the right (Taj hotel pages).
export default function Crumbs({ trail, title }) {
  return (
    <div className="container wide crumb-row">
      <nav aria-label="Breadcrumb">
        <ol className="crumbs">
          <li>
            <Link href="/">Home</Link>
          </li>
          {trail.map((t, i) => (
            <li key={t.label}>{i === trail.length - 1 ? <span aria-current="page">{t.label}</span> : <Link href={t.href}>{t.label}</Link>}</li>
          ))}
        </ol>
      </nav>
      <Share title={title} />
    </div>
  );
}
