import { useState } from 'react';
import { img } from '../data/images';

// Lazy image with fade-in on load (#40) and automatic fallback to the hotel's site if a local copy is missing.
export default function SmartImg({ name, alt, className = '', eager = false, sizes, style, imgStyle }) {
  const meta = img(name);
  const [src, setSrc] = useState(meta.src);
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`smart-img ${className}`} style={style}>
      <img
        src={src}
        alt={alt ?? meta.alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchpriority={eager ? 'high' : undefined}
        decoding="async"
        sizes={sizes}
        className={loaded ? 'loaded' : ''}
        style={imgStyle}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (src !== meta.fallback) setSrc(meta.fallback);
        }}
        ref={(el) => {
          if (el && el.complete && el.naturalWidth && !loaded) setLoaded(true);
        }}
      />
    </div>
  );
}
