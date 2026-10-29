import { useState } from 'react';
import { img } from '../data/images';

// Lazy, responsive image (#40 fade-in on load). Serves resized copies via srcset,
// and falls back to the original photo on hotelseaview.in if a resized copy fails.
export default function SmartImg({ name, alt, className = '', eager = false, sizes = '(max-width: 600px) 100vw, 50vw', width, style, imgStyle, as: Tag = 'div' }) {
  const meta = img(name, { width });
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  return (
    <Tag className={`smart-img ${className}`} style={style}>
      <img
        src={failed ? meta.fallback : meta.src}
        srcSet={failed ? undefined : meta.srcSet}
        sizes={meta.srcSet && !failed ? sizes : undefined}
        alt={alt ?? meta.alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchpriority={eager ? 'high' : undefined}
        decoding="async"
        className={loaded ? 'loaded' : ''}
        style={imgStyle}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!failed) setFailed(true);
        }}
        ref={(el) => {
          if (el && el.complete && el.naturalWidth && !loaded) setLoaded(true);
        }}
      />
    </Tag>
  );
}
