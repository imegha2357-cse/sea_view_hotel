import { useEffect } from 'react';
import { SITE_URL } from '../data/site';

function setMeta(attr, key, content) {
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

// PRD 10.1 / FR-11: a unique title and description per page.
export function usePageMeta(title, description, { noindex = false } = {}) {
  useEffect(() => {
    document.title = title;
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.name = 'description';
      document.head.appendChild(tag);
    }
    if (description) tag.setAttribute('content', description);
    // Canonical and social tags follow the page, so each URL describes itself.
    const url = `${SITE_URL}${window.location.pathname === '/' ? '/' : window.location.pathname.replace(/\/$/, '')}`;
    let canon = document.head.querySelector('link[rel="canonical"]');
    if (!canon) {
      canon = document.createElement('link');
      canon.rel = 'canonical';
      document.head.appendChild(canon);
    }
    canon.href = url;
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:title', title.replace(/ \| Hotel Sea View.*$/, '') || title);
    if (description) setMeta('property', 'og:description', description);
    let robots = document.querySelector('meta[name="robots"]');
    if (noindex) {
      if (!robots) {
        robots = document.createElement('meta');
        robots.name = 'robots';
        document.head.appendChild(robots);
      }
      robots.setAttribute('content', 'noindex, nofollow');
    } else if (robots) robots.remove();
  }, [title, description, noindex]);
}

// Structured data for one page (removed again when the page closes). Verified facts only.
export function useJsonLd(id, data) {
  const json = data ? JSON.stringify(data) : '';
  useEffect(() => {
    if (!json) return undefined;
    let el = document.getElementById(`ld-${id}`);
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = `ld-${id}`;
      document.head.appendChild(el);
    }
    el.textContent = json;
    return () => el.remove();
  }, [id, json]);
}
