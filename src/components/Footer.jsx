import { Link } from 'react-router-dom';
import { HOTEL, mapsLink } from '../data/content';
import { Brand, NAV } from './Header';
import { analyticsEnabled } from '../lib/analytics';
import { openCookieSettings } from './CookieConsent';

export default function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <div className="container footer-grid">
        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          <Brand />
          <p style={{ maxWidth: '36ch' }}>Sea-view rooms facing the sunrise, close to the beach in Kanyakumari.</p>
        </div>
        <div>
          <h4>Visit</h4>
          <address style={{ fontStyle: 'normal' }}>
            {HOTEL.addressLines.map((l) => (
              <div key={l}>{l}</div>
            ))}
          </address>
          <p style={{ marginTop: 10 }}>
            <a href={mapsLink} target="_blank" rel="noreferrer">
              Get directions →
            </a>
          </p>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li>
              <a href={`tel:${HOTEL.phoneHref}`}>Phone {HOTEL.phone}</a>
            </li>
            <li>
              <a href={`https://wa.me/${HOTEL.whatsapp}`} target="_blank" rel="noreferrer">
                WhatsApp {HOTEL.phone}
              </a>
            </li>
            <li>
              <a href={`tel:${HOTEL.restaurantPhoneHref}`}>Restaurant {HOTEL.restaurantPhone}</a>
            </li>
            <li>
              <a href={`mailto:${HOTEL.email}`}>{HOTEL.email}</a>
            </li>
          </ul>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            {NAV.filter((n) => n.id !== 'contact').map((n) => (
              <li key={n.id}>
                <a href={`/#${n.id}`}>{n.label}</a>
              </li>
            ))}
            <li>
              <a href={HOTEL.facebook} target="_blank" rel="noreferrer">
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Hotel Sea View, Kanyakumari</span>
        <span style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          <Link to="/privacy">Privacy notice</Link>
          {analyticsEnabled && (
            <button type="button" className="footer-link" onClick={openCookieSettings}>
              Cookie settings
            </button>
          )}
          <Link to="/login">Guest sign in</Link>
          <Link to="/admin/login">Staff sign in</Link>
        </span>
      </div>
    </footer>
  );
}
