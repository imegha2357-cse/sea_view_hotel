import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HOTEL, mapsEmbed, mapsLink } from '../data/content';
import { DirectionsIcon } from '../components/Icons';
import { EASE, Reveal, SectionHeading } from '../components/Motion';

// #77 click-to-load map (no Google scripts until asked), #79 pin drop, #78 directions nudge
export default function Location() {
  const [live, setLive] = useState(false);
  return (
    <section className="section white" id="location">
      <div className="container loc">
        <div className="loc-info">
          <SectionHeading eyebrow="Location" title="Find us on East Car Street" />
          <Reveal className="row">
            <span className="label">Address</span>
            <address>
              {HOTEL.addressLines.map((l) => (
                <div key={l}>{l}</div>
              ))}
            </address>
          </Reveal>
          <Reveal className="row" i={1}>
            <span className="label">Phone and WhatsApp</span>
            <a href={`tel:${HOTEL.phoneHref}`}>{HOTEL.phone}</a>
          </Reveal>
          <Reveal className="row" i={2}>
            <span className="label">Email</span>
            <a href={`mailto:${HOTEL.email}`}>{HOTEL.email}</a>
          </Reveal>
          <Reveal i={3}>
            <a className="btn solid directions" href={mapsLink} target="_blank" rel="noreferrer">
              <motion.span whileHover={{ rotate: -12, x: 2, y: -2 }} style={{ display: 'inline-flex' }}>
                <DirectionsIcon />
              </motion.span>
              Get directions
            </a>
          </Reveal>
        </div>
        <div className="map-box">
          <AnimatePresence>
            {live ? (
              <motion.iframe key="map" title={`Map showing ${HOTEL.name}`} src={mapsEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} />
            ) : (
              <motion.div key="static" exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0 }}>
                <motion.i className="pin-shadow" initial={{ scale: 0.3, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE }} />
                <motion.i
                  className="pin"
                  initial={{ y: -70, opacity: 0, rotate: -45 }}
                  whileInView={{ y: [-70, 4, -3, 0], opacity: 1, rotate: -45 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, times: [0, 0.55, 0.8, 1], ease: 'easeOut' }}
                />
                <motion.span className="map-label" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 }}>
                  {HOTEL.name}
                </motion.span>
                <button className="btn solid load" onClick={() => setLive(true)}>
                  Load interactive map
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
