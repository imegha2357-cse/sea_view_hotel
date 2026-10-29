import { Link } from 'react-router-dom';
import { HOTEL, MEETINGS } from '../data/content';
import { pageMeta } from '../data/routes';
import { usePageMeta } from '../lib/seo';
import { Eyebrow, Reveal, SplitWords, CurtainReveal } from '../components/Motion';
import EnquiryForm from '../components/EnquiryForm';
import { Photo } from './RoomsPage';

// Feature #28: meetings, weddings and family functions, with an event enquiry form.
export default function Meetings() {
  const meta = pageMeta('/meetings');
  usePageMeta(meta.title, meta.description);
  return (
    <main id="main" className="page sub-page">
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden="true">/</span> <span aria-current="page">Meetings and events</span>
        </nav>
        <div className="room-detail">
          <CurtainReveal className="room-detail-img">
            <Photo k={MEETINGS.image} width={1920} sizes="(max-width: 900px) 100vw, 60vw" eager />
          </CurtainReveal>
          <div className="room-detail-body">
            <Eyebrow onMount>Meetings and events</Eyebrow>
            <SplitWords as="h1" text={MEETINGS.title} className="sub-title" onMount />
            <p className="sub-lead">{MEETINGS.text}</p>
            <ul className="tick-list">
              {MEETINGS.facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <p className="meta">
              For dates, capacity and menus, call {HOTEL.phone} or send the form below.
            </p>
          </div>
        </div>
        <Reveal as="section" className="room-enquire" aria-labelledby="ev-h">
          <h2 id="ev-h">Plan your event</h2>
          <EnquiryForm defaultType="meeting" />
        </Reveal>
      </div>
    </main>
  );
}
