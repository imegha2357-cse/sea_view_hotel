import { useEffect } from 'react';

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
