import { useEffect, useState } from 'react';

// Header state: solid after 80 px (#13), hidden when scrolling down and shown on scroll up (#15)
export function useHeaderScroll(threshold = 80) {
  const [state, setState] = useState({ solid: false, hidden: false, y: 0 });
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const goingDown = y > last + 4;
      const goingUp = y < last - 4;
      setState((s) => ({
        y,
        solid: y > threshold,
        hidden: y > 400 ? (goingDown ? true : goingUp ? false : s.hidden) : false,
      }));
      last = y;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return state;
}

// Active section for nav indicators (#19)
export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids.join(',')]);
  return active;
}
