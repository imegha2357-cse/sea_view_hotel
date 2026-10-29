'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import EnquiryForm from '../EnquiryForm';

// The booking bar and "Book now" buttons pass dates, guests and room in the address; the form starts filled in.
export default function EnquireForm() {
  const q = useSearchParams();
  const prefill = useMemo(() => {
    const p = {};
    for (const k of ['check_in', 'check_out', 'room_type', 'promo_code', 'enquiry_type']) if (q.get(k)) p[k] = q.get(k);
    for (const k of ['adults', 'children']) if (q.get(k) && /^\d+$/.test(q.get(k))) p[k] = +q.get(k);
    if (q.get('rooms') && +q.get('rooms') > 1) p.message = `${q.get('rooms')} rooms please.`;
    return Object.keys(p).length ? p : null;
  }, [q]);
  return <EnquiryForm prefill={prefill} defaultType={prefill?.enquiry_type || 'stay'} />;
}
