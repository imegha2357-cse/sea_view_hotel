'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { EASE } from './ui';

// Taj's sticky in-page menu: highlights the section on screen and scrolls the strip to keep it visible.
export default function SectionTabs({ items, cta = { href: '/enquire', label: 'Check availability' } }) {
  const [active, setActive] = useState(items[0]?.id);
  const strip = useRef(null);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  useEffect(() => {
    // Scroll only the tab strip (scrollIntoView would also move the keyboard focus starting point).
    const box = strip.current;
    const el = box?.querySelector(`[data-id="${active}"]`);
    if (box && el) box.scrollTo({ left: el.offsetLeft - box.clientWidth / 2 + el.offsetWidth / 2, behavior: 'smooth' });
  }, [active]);

  return (
    <nav className="tabs-bar" aria-label="On this page">
      <div className="container wide tabs-in">
        <div className="tabs-scroll" ref={strip}>
          {items.map((i) => (
            <Link key={i.id} href={`#${i.id}`} data-id={i.id} className={`tab-link ${active === i.id ? 'on' : ''}`} aria-current={active === i.id ? 'true' : undefined}>
              {i.label}
              {active === i.id && <motion.span layoutId="tab-line" className="tab-line" transition={{ duration: 0.4, ease: EASE }} />}
            </Link>
          ))}
        </div>
        <Link href={cta.href} className="btn solid sm">
          {cta.label}
        </Link>
      </div>
    </nav>
  );
}
