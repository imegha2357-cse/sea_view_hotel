# Hotel Sea View website: handover notes

PRD section 12 asks for known limitations, third-party dependencies and future recommendations. This file covers them, plus where each PRD requirement lives in the code.

Live site: https://seaviewhotel-8x42.vercel.app/ (deploys automatically from `main`).

## PRD coverage

| PRD item | Where | Status |
| --- | --- | --- |
| WS-01 Header and navigation | `components/Header.jsx`, `sections/SubNav.jsx` | Done |
| WS-02 Hero | `sections/Hero.jsx` | Done |
| WS-03 Booking enquiry | `sections/BookingBar.jsx`, `components/EnquiryForm.jsx` | Done; needs Firebase keys |
| WS-04 About | `sections/About.jsx` | Done |
| WS-05 Rooms | `sections/Rooms.jsx` | Done; rates enquiry-only until client decides |
| WS-06 Facilities | `sections/Facilities.jsx` | Done |
| WS-07 Dining / experiences | `sections/Experiences.jsx` | Done |
| WS-08 Gallery | `sections/Gallery.jsx` | Done |
| WS-09 Reviews / testimonials | `sections/Testimonials.jsx` | Built; hidden until approved quotes are added to `TESTIMONIALS` |
| WS-10 Location | `sections/Location.jsx`, `sections/Attractions.jsx` | Done |
| WS-11 FAQs | `sections/Faq.jsx` | Done; check-in/out and policy answers needed |
| WS-12 Contact and footer | `components/Footer.jsx` | Done |
| FR-01 to FR-11 | across the components above | Done |
| FR-12 Analytics | `lib/analytics.js`, `components/CookieConsent.jsx` | Built; switches on when `VITE_GA_ID` is set |
| 6.x Enquiry workflow and fields | `lib/enquiry.js`, `firestore.rules` | Done |
| 7.x Data model and backend rules | `firestore.rules`, `firestore.indexes.json` | Done; deploy rules with `firebase deploy --only firestore` |
| 8.x UI tokens, states, breakpoints | `styles/global.css` | Done |
| 10.1 SEO | `index.html`, `lib/seo.js`, `public/sitemap.xml`, `public/robots.txt` | Done |
| 10.2 Performance | `data/images.js`, `vercel.json` (`images`) | Resized AVIF/WebP photos via Vercel; scripts split into chunks |
| 10.3 Accessibility | throughout | Keyboard focus, labels, alt text, reduced motion |
| 10.4 Security and privacy | `firestore.rules`, `lib/firebase.js` (App Check), `CookieConsent.jsx` | Done; privacy text needs approval |

## Demo data

Staff can click **Add 15 demo enquiries** in `/admin` to try the dashboard. Demo records are tagged "Demo", use fake `90000` phone numbers and `example.com` emails, and are removed with **Remove demo enquiries**. This needs the current `firestore.rules` published. Remove demo data before launch.

## Media

- `public/media/room-tour.mp4` (73 s room tour, 7 MB) and `public/media/sea-loop.mp4` (12 s silent hero loop, 1.7 MB) were cut from the client's screen recording of the hotel's own room-tour video. Confirm the hotel owns this video.
- Photos still load from hotelseaview.in, resized through Vercel.

## Known limitations

- **Not a booking engine.** The site collects enquiries only; staff confirm availability and price (PRD 2.2).
- **Enquiry flow untested until Firebase is connected.** Run acceptance tests TC-04 to TC-07 and TC-13 after adding the keys.
- **No email alert for new enquiries.** Staff see them live in `/admin`. An email alert needs a Cloud Function on the Firebase Blaze plan (see recommendations).
- **Photos load from hotelseaview.in.** If the old WordPress site is switched off, run `npm run fetch-images`, commit `public/images`, and set `VITE_IMAGE_SOURCE=local`.
- **Resized photos depend on Vercel.** On other hosting set `VITE_IMAGE_CDN=off`. Vercel's free plan includes a monthly image optimisation allowance.
- **Static content.** Text and rooms are edited in `src/data/content.js` and redeployed; there is no CMS (PRD 2.2).
- **Single-page site.** Search engines see one main page; per-room pages would need routes or pre-rendering.
- **Map.** The interactive Google map loads only when a visitor taps "Load interactive map".

## Content still needed from the client

Marked `CONFIRM` in `src/data/content.js`: check-in/check-out times, cancellation and child policies, room sizes (all but Standard), rate display decision, bar hours, conference capacity and equipment, approved testimonials, final privacy notice and data retention period, final logo/brand colours, and written permission to use every photo.

## Third-party services

| Service | Used for | Cost / limits |
| --- | --- | --- |
| Vercel | Hosting, HTTPS, image resizing | Hobby plan free within limits |
| Firebase Authentication | Guest and staff logins | Free tier covers this use |
| Cloud Firestore | Enquiries, guest profiles | Free tier: 50k reads, 20k writes per day |
| Firebase App Check + reCAPTCHA v3 | Bot protection (optional) | Free |
| Google Analytics 4 | Visitor statistics (optional, consent-based) | Free |
| Google Maps embed | Map after a tap | Free embed |
| Google Fonts | Marcellus, Figtree | Free |
| WhatsApp click-to-chat | Enquiries by WhatsApp | Free |

## Acceptance tests (PRD section 13)

| Test | How to check | Result so far |
| --- | --- | --- |
| TC-01 Responsive | Phone, tablet, desktop | Pass at 390 px and 1366 px, no sideways scroll |
| TC-02 Navigation links | Click each link | Pass |
| TC-03 Mobile menu | Open/close, keyboard | Pass |
| TC-04 Missing fields | Submit empty form | Blocks in browser; rules not yet tested live |
| TC-05 Valid enquiry | Submit, see it in /admin | Waiting for Firebase keys |
| TC-06 Date ranges | Check-out before check-in | Blocks in browser and in rules |
| TC-07 WhatsApp | Tap button on a phone | Opens chat with prefilled message |
| TC-08 Call | Tap phone link | Valid `tel:` link |
| TC-09 Directions | Tap Get directions | Opens Google Maps search for the hotel |
| TC-10 Approved content | Review `content.js` | Waiting for client approval |
| TC-11 Metadata and alt text | View page source | Pass |
| TC-12 Console and network | DevTools | No errors; 31 images load |
| TC-13 Privacy and security | HTTPS, rules, no secrets | HTTPS pass; rules to deploy and test |
| TC-14 Handover | Domain and repo access | Repo `imegha2357-cse/sea_view_hotel`; custom domain not yet connected |

## Recommendations for a later phase

1. Email or WhatsApp alert to staff on every new enquiry (Cloud Function, Blaze plan).
2. Connect the `hotelseaview.in` domain in Vercel once the client approves the switch.
3. Turn on App Check enforcement after a week of normal traffic.
4. Separate pages per room for search, with their own titles and descriptions.
5. A booking engine or channel manager only if the hotel wants live availability (PRD 2.2 exclusion).
