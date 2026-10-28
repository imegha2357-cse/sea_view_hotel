import { LayoutGroup, motion } from 'framer-motion';
import { useActiveSection } from '../hooks/useScroll';

const LINKS = [
  { id: 'about', label: 'Overview' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'dining', label: 'Dining & events' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'nearby', label: 'Nearby' },
  { id: 'location', label: 'Location' },
  { id: 'faq', label: 'FAQs' },
  { id: 'enquire', label: 'Enquire' },
];

// Sticky in-page navigation with a sliding gold indicator (#19)
export default function SubNav() {
  const active = useActiveSection(LINKS.map((l) => l.id));
  return (
    <div className="subnav">
      <LayoutGroup id="subnav">
        <nav className="container" aria-label="On this page">
          {LINKS.map((l) => (
            <a key={l.id} href={`#${l.id}`} className={active === l.id ? 'active' : ''} aria-current={active === l.id ? 'true' : undefined}>
              {l.label}
              {active === l.id && <motion.i className="ind" layoutId="subnav-ind" transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} />}
            </a>
          ))}
        </nav>
      </LayoutGroup>
    </div>
  );
}
