import { HOTEL } from '../data/content';
import { usePageMeta } from '../lib/seo';

// DRAFT. PRD 10.4 requires a client-approved privacy notice before launch.
export default function Privacy() {
  usePageMeta('Privacy notice | Hotel Sea View', 'How Hotel Sea View, Kanyakumari collects and uses the details you send in a booking enquiry.');
  return (
    <main id="main" className="page">
      <div className="container prose">
        <h1>Privacy notice</h1>
        <p className="flag">Draft for client and legal review. Replace this text with the approved notice before launch.</p>
        <h2>What we collect</h2>
        <p>When you send an enquiry we collect your name, phone or WhatsApp number, optional email address, travel dates, number of guests, room preference and any message you write. If you create an account we also store your email address and password (managed by Google Firebase Authentication).</p>
        <h2>Why we collect it</h2>
        <p>Only to reply to your enquiry, confirm availability and price, and manage a booking you choose to make. We do not sell your details or use them for marketing without your consent.</p>
        <h2>Who can see it</h2>
        <p>Authorised Hotel Sea View staff. Data is stored with Google Firebase (Cloud Firestore), which processes it on our behalf.</p>
        <h2>How long we keep it</h2>
        <p>[Retention period to be confirmed by the hotel.]</p>
        <h2>Your choices</h2>
        <p>
          To see, correct or delete your details, contact {HOTEL.email} or call {HOTEL.phone}.
        </p>
      </div>
    </main>
  );
}
