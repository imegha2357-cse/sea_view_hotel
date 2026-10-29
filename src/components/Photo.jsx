'use client';

import Image from 'next/image';
import { useState } from 'react';
import { photo } from '@/data/images';
import { SITE_URL } from '@/data/site';

// Cloudinary delivery (feature request): set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in Vercel and every photo
// is served from Cloudinary's CDN with automatic format (AVIF/WebP) and quality. Cloudinary fetches the
// HD master from this site the first time, then caches it. Without the setting, Next.js optimises on Vercel.
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export function cloudinaryLoader({ src, width, quality }) {
  const absolute = src.startsWith('http') ? src : `${SITE_URL}${src}`;
  const q = quality ? `q_${quality}` : 'q_auto:good';
  return `https://res.cloudinary.com/${CLOUD}/image/fetch/f_auto,${q},c_limit,w_${width}/${encodeURIComponent(absolute)}`;
}

// One component for every photo on the site: responsive sizes, lazy loading, blur-free fade-in.
export default function Photo({ k, alt, sizes = '100vw', priority = false, fill = true, className = '', quality, style }) {
  const p = photo(k);
  const [loaded, setLoaded] = useState(false);
  if (!p) return null;
  return (
    <Image
      src={p.src}
      alt={alt ?? p.alt}
      {...(fill ? { fill: true } : { width: p.width, height: p.height })}
      unoptimized={false}
      sizes={sizes}
      priority={priority}
      quality={quality || 85}
      loader={CLOUD ? cloudinaryLoader : undefined}
      className={`photo ${loaded ? 'is-loaded' : ''} ${className}`}
      style={style}
      onLoad={() => setLoaded(true)}
    />
  );
}
