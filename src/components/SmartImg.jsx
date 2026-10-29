'use client';

import Photo from './Photo';

// Photo in a sized box (used by the sign-in screens). The box sets the shape; the photo covers it.
export default function SmartImg({ name, alt, className = '', eager = false, sizes = '50vw', style, as: Tag = 'div' }) {
  return (
    <Tag className={`smart-img ${className}`} style={style}>
      <Photo k={name} alt={alt} sizes={sizes} priority={eager} />
    </Tag>
  );
}
