'use client';

import { FACILITIES } from '@/data/content';
import { FacilityIcon } from '../Icons';
import { Reveal } from './ui';

export default function Facilities() {
  return (
    <div className="fac-grid">
      {FACILITIES.map((f, i) => (
        <Reveal key={f.label} i={i % 4} className="fac">
          <FacilityIcon name={f.icon} i={i % 4} />
          <span>{f.label}</span>
        </Reveal>
      ))}
    </div>
  );
}
