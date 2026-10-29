import { GOOGLE_REVIEW_URL, HOTEL, TESTIMONIALS } from '@/data/content';
import { HeroIcon } from './HeroIcons';
import { LineTitle, Reveal } from './ui';

// PRD WS-09: only approved, attributed guest quotes are shown. Until the hotel approves some,
// the section points to where real reviews already live, and never invents ratings or quotes.
export default function Reviews() {
  return (
    <section className="sec cream" id="reviews" aria-labelledby="reviews-h">
      <div className="container wide">
        <div className="sec-head center">
          <LineTitle id="reviews-h" center>
            Guest reviews
          </LineTitle>
          {!TESTIMONIALS.length && <p>Read what guests say about their stay, or share your own experience.</p>}
        </div>
        {TESTIMONIALS.length > 0 ? (
          <div className="review-grid">
            {TESTIMONIALS.map((t, i) => (
              <Reveal as="figure" key={t.quote.slice(0, 20)} i={i % 3} className="review">
                <blockquote>“{t.quote}”</blockquote>
                <figcaption>
                  <b>{t.name}</b>
                  <span>{[t.from, t.date, t.source].filter(Boolean).join(' · ')}</span>
                </figcaption>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal className="review-links">
            <a className="cta-pill outline" href={HOTEL.facebook} target="_blank" rel="noreferrer">
              <HeroIcon name="star" /> Guest posts on Facebook
            </a>
            {GOOGLE_REVIEW_URL && (
              <a className="cta-pill outline" href={GOOGLE_REVIEW_URL} target="_blank" rel="noreferrer">
                <HeroIcon name="star" /> Reviews on Google
              </a>
            )}
          </Reveal>
        )}
      </div>
    </section>
  );
}
