import { useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { EXPERIENCES } from '../data/content';
import SmartImg from '../components/SmartImg';
import { EASE, SectionHeading } from '../components/Motion';

// #72 sliding tabs with crossfading content
export default function Experiences() {
  const [tab, setTab] = useState(EXPERIENCES[0].id);
  const e = EXPERIENCES.find((x) => x.id === tab);

  return (
    <section className="section" id="dining">
      <div className="container">
        <SectionHeading eyebrow="Dining and events" titleLines={['Eat, unwind', 'and gather']} />
        <LayoutGroup id="exp-tabs">
          <div className="tabs" role="tablist" aria-label="Dining and events">
            {EXPERIENCES.map((x) => (
              <button key={x.id} role="tab" aria-selected={tab === x.id} className={tab === x.id ? 'on' : ''} onClick={() => setTab(x.id)}>
                {x.tab}
                {tab === x.id && <motion.i className="ind" layoutId="exp-ind" transition={{ duration: 0.4, ease: EASE }} />}
              </button>
            ))}
          </div>
        </LayoutGroup>
        <AnimatePresence mode="wait">
          <motion.div
            key={e.id}
            className="exp"
            role="tabpanel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div className={`exp-media ${e.images.length === 1 ? 'single' : ''}`}>
              {e.images.map((im, k) => (
                <motion.div key={im} initial={{ clipPath: 'inset(100% 0 0 0)' }} animate={{ clipPath: 'inset(0% 0 0 0)' }} transition={{ duration: 0.8, ease: EASE, delay: k * 0.12 }}>
                  <SmartImg name={im} />
                </motion.div>
              ))}
            </div>
            <div className="exp-copy">
              <h3>{e.title}</h3>
              <p>{e.text}</p>
              <ul>
                {e.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
              <div>
                <a href="#enquire" className="link-arrow">
                  Ask about {e.tab.toLowerCase()} <i>→</i>
                </a>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
