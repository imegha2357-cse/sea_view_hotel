import { motion } from 'framer-motion';
import { AMENITIES, VIDEO } from '../data/content';
import { FacilityIcon } from '../components/Icons';
import { EASE, Eyebrow, Reveal, SplitWords } from '../components/Motion';
import { playTour } from '../components/VideoModal';

// "Hotel amenities and features" from the original site: four cards and the hotel video.
export default function Amenities() {
  return (
    <section className="section amenities" id="amenities">
      <div className="container amen-grid">
        <div className="amen-intro">
          <Eyebrow>Our benefits</Eyebrow>
          <SplitWords text="Hotel amenities and features" className="amen-title" />
          <Reveal as="p" delay={0.2}>
            Friendly service and practical comforts, steps from the sea.
          </Reveal>
          <Reveal delay={0.3}>
            <button className="play-cta" onClick={playTour}>
              <span className="play-ring">
                <span className="play-core">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
              <span className="play-text">
                <b>Watch hotel video</b>
                <small>Room tour · {VIDEO.duration}</small>
              </span>
            </button>
          </Reveal>
        </div>
        <div className="amen-cards">
          {AMENITIES.map((a, i) => (
            <motion.a
              key={a.title}
              href={a.link}
              className="amen-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.1 }}
            >
              <span className="amen-fill" aria-hidden="true" />
              <span className="amen-icon">
                <FacilityIcon name={a.icon} i={i} />
              </span>
              <h3>{a.title}</h3>
              <p>{a.text}</p>
              <span className="amen-arrow" aria-hidden="true">
                →
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
