# Hotel Sea View website: handover notes

Live site: https://seaviewhotel-8x42.vercel.app/ (Vercel deploys every push to `main`).
Source code: https://github.com/imegha2357-cse/sea_view_hotel
Stack: Next.js 14 (App Router, every public page pre-built as HTML), React 18, Framer Motion, Firebase Authentication and Cloud Firestore, Vercel hosting.

## Delivery checklist

| Item | Where on the site | Where in the code | Status |
| --- | --- | --- | --- |
| Header and responsive navigation | Every page. Hover menus on desktop; full-screen menu with accordions on phones | `src/components/site/Header.jsx`, `src/data/nav.js` | Done |
| Hero banner and enquiry CTA | Home: photo slideshow, headline, Check availability / Explore rooms / WhatsApp buttons, amenity strip, booking bar | `src/components/site/Hero.jsx`, `BookingBar.jsx` | Done |
| About the hotel | Home "Overview" (Read more), `/about` | `src/app/(site)/page.jsx`, `about/page.jsx` | Done |
| Rooms and accommodation | Home "Rooms" grid, `/rooms` (grid and comparison table), `/rooms/[room]` for each of the 5 rooms | `RoomMosaic.jsx`, `rooms/` | Done; sizes, rates and distinct details need the hotel |
| Facilities and amenities | Home "Hotel information", hero strip, `/about` | `Facilities.jsx`, `FACILITIES` in `content.js` | Done |
| Dining and experiences | Home "Dining" and "Around Kanyakumari", `/dining`, `/experiences`, Highlights carousel | `dining/`, `experiences/`, `Highlights.jsx` | Done; bar hours needed |
| Gallery with image viewing | Home "Gallery", `/gallery` (filters), full-screen viewer with arrows, swipe and keyboard | `GalleryGrid.jsx`, `Lightbox.jsx` | Done |
| Reviews and testimonials, if approved | Home "Guest reviews" | `Reviews.jsx`, `TESTIMONIALS` in `content.js` | Built. Shows approved quotes only; until then it links to the hotel's Facebook page. No ratings or quotes are invented |
| Location, map and directions | Home "Location", `/contact`, `/plan-your-visit` (how to reach, printable) | `MapEmbed.jsx`, `ReachTabs.jsx` | Done. Map loads on tap (privacy and speed) |
| FAQs | Home "FAQs", `/policies#faqs` | `Faq.jsx`, `FAQS` | Done; policy answers needed |
| Contact section and footer | Footer on every page, `/contact` | `Footer.jsx`, `contact/page.jsx` | Done. Copyright year is automatic |
| Booking enquiry form or WhatsApp CTA | `/enquire`, each room page, `/meetings`, guest account; WhatsApp buttons site-wide | `EnquiryForm.jsx`, `lib/enquiry.js` | Done |
| Form validation and enquiry delivery | Required fields, phone and email format, date range, booked nights; success shown only after Firestore saves; staff see it live in `/admin` | `validateEnquiry`, `firestore.rules`, `views/admin/` | Done. Email alerts optional (`/api/notify`, needs keys) |
| Click-to-call | Header menu, footer, contact page, hotel information, staff dashboard | `tel:` links | Done |
| SEO metadata and image alt text | Unique title, description, canonical and social tags per page; structured data; `sitemap.xml`, `robots.txt` | `src/lib/meta.js`, `src/lib/ld.jsx`, `src/app/sitemap.js`, `robots.js` | Done |
| Accessibility and responsive testing | Keyboard, skip link, focus styles, labels, contrast AA, reduced motion, larger text, dark mode | throughout; `/accessibility` | axe-core (WCAG 2.1 AA): 0 violations on all 22 pages. No sideways scroll at 320, 375, 768 and 1366 px |
| Security and privacy configuration | HTTPS, security headers and CSP, Firestore rules, honeypot, App Check (optional), consent for analytics, privacy notice, download/delete my data | `next.config.mjs`, `firestore.rules`, `CookieConsent.jsx` | Done; privacy text needs approval |
| Optional analytics | Google Analytics 4, loads only after consent | `lib/analytics.js` | Done (`NEXT_PUBLIC_GA_ID`, or `off`) |
| Deployment, source code and handover | Vercel from GitHub; this file | | Done |

## Defect audit of hotelseaview.in, checked against this site

| # | Defect on the old site | This site |
| --- | --- | --- |
| 1 | Generic or misleading claims ("The Best Hotel on the Beach Side") | Copy states only published facts; no rankings |
| 2 | Unclear booking journey ("Online Booking", "Book now") | Every button says "Check availability" or "Enquire"; the hero, form and success panel say staff confirm availability and price |
| 3 | Repeated paragraphs | None; checked |
| 4 | Unsupported statistics (8600+, 7500+, 97%) | Removed. Only "3 seas", "5 room types", "24-hour room service" |
| 5 | Template/demo links to gaviaspreview.com | None; every link is checked in testing |
| 6 | Duplicate room descriptions; "Executive Suit" | Each room has its own description and features; the name is "Executive Suite" everywhere |
| 7 | Spelling errors ("Ameneties", "ROOM AND SUITS") | Spell-checked |
| 8 | Unrelated copy ("colonial ambience", "piano recitals") | Not used |
| 9 | Navigation | Every menu and footer link leads to a working page; unknown addresses return a real 404 page |
| 10-16 | Form rendering, required fields, date range, honest success, delivery, CAPTCHA, mobile | Validation in the browser and again in Firestore rules; success only after the save; hidden honeypot field plus optional reCAPTCHA v3 (App Check), so guests never solve a puzzle |
| 17 | Responsive layout | No sideways scroll at 320, 375, 768, 1366 px |
| 18 | Images | All HD (1360-2560 px masters), served as AVIF/WebP at the right size, lazy-loaded |
| 19 | Accessibility | See checklist above |
| 20 | SEO | See checklist above |
| 21 | Privacy and spam | See checklist above |
| 22 | Footer © 2025 | Year is automatic |
| 23 | Mobile contact actions | `tel:` and `wa.me` links with a prefilled message |

## Colours (PRD 8.1)

Deep Teal `#173B3A` (headings, buttons, navigation), Ivory `#F4F0E7` (light sections), Sand Gold `#B58A55` (decoration and large text only: 3.1:1 on white is too low for small text), Charcoal `#25302F` (body text), White `#FFFFFF` (cards). Defined once in `src/styles/coast.css`; every other colour is a tint of these, except red for form errors.

## Settings in Vercel (Project → Settings → Environment Variables)

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Serve photos through Cloudinary (fetch mode; allow "Fetched URL" in Cloudinary security settings) |
| `NEXT_PUBLIC_SITE_URL` | Set to `https://hotelseaview.in` when the domain moves here |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID, or `off` |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Turns on App Check |
| `FIREBASE_SERVICE_ACCOUNT`, `RESEND_API_KEY`, `MAIL_FROM`, `STAFF_EMAIL` | Optional email alert and morning digest |

## Content still needed from the client

Marked `CONFIRM` in `src/data/content.js`: check-in/check-out times, cancellation and child policies, room sizes and rates, distinct details per room, bar hours, conference capacity and equipment, approved testimonials and Google review link, final privacy notice and retention period, and written permission to use every photo. Twelve photos were enlarged with AI (listed in `src/data/images.js`); camera originals would be better.

## Demo data

Staff can click **Add 15 demo enquiries** in `/admin`. Demo records are tagged "Demo", use fake `90000` numbers and `example.com` emails, and are removed with **Remove demo enquiries**. Remove them before launch.

## Commands

`npm run dev` (local), `npm run build`, `npm test` (unit tests), GitHub Actions runs tests and a build on every push.

## Features from the 100-feature plan that are live (61)

Numbers refer to Part 5 of the planning doc. Features that need the hotel's accounts or data (email keys, room rates, menus, translations and so on) are not counted until they are switched on.

| Area | Live features | Where |
| --- | --- | --- |
| Booking and enquiries | 1 availability calendar · 5 offers and codes · 6 event and meeting enquiries · 7 pick-up request · 8 add-ons · 9 callback time · 10 unsent-form recovery · 19 WhatsApp message with room and dates · 20 offers sign-up | `/enquire`, footer, `/offers` |
| Guest communication | 15 pre-arrival message · 17 staff reply templates | `/admin` enquiry drawer |
| Rooms and content | 21 page per room · 22 comparison table · 25 in-room amenity icons · 28 conference hall page · 29 policies page | `/rooms`, `/rooms/[room]`, `/meetings`, `/policies` |
| Guest account | 32 book again · 34 saved preferences · 35 messages with the hotel · 37 online check-in · 38 saved rooms · 40 download or delete my data | `/account` |
| Staff dashboard | 41 roles · 42 assign · 43 follow-ups and overdue · 45 reports · 46 phone and walk-in entries · 47 duplicate warning · 48 change history · 50 installable app | `/admin` |
| Marketing and SEO | 52 pre-built pages · 54 travel guides · 55 offers page · 56 share images · 57 rich results · 60 enquiry source tracking | every page, `/guides`, `/offers` |
| Local experience | 61 sunrise calendar · 63 weather · 64 day plans · 68 tour packages · 69 how to reach | `/plan-your-visit`, `/experiences`, `/offers` |
| Speed and reliability | 71 login code loads only when needed · 72 photos hosted here · 73 sized hero image · 74 self-hosted fonts · 75 works offline · 77 error reporting · 78 automatic tests · 79 preview links before publishing (Vercel) | throughout |
| Security and privacy | 82 enquiry rate limit · 84 auto sign-out · 86 consent record · 87 strict security headers · 90 blocked-spam log | form, `/admin` Inbox |
| Accessibility and convenience | 93 dark mode · 94 WCAG AA audit · 96 FAQ question search · 97 add to calendar · 98 printable directions · 99 feedback button · 100 larger text | footer, FAQs, `/plan-your-visit` |

Ready but waiting for the hotel: 2/3 prices and estimate (room rates), 11/13/18 email alerts, auto-reply and digest (email keys), 16 review request (Google review link), 31 Google sign-in (switch on in Firebase), 81 bot protection (reCAPTCHA key).

## Offers

`OFFERS` in `src/data/content.js` holds five packages built only from services the hotel already publishes (sea-view rooms, interconnected rooms, travel desk, conference hall). None states a price or a discount. Confirm each with the hotel before launch; add a rate or "valid until" when they approve.
