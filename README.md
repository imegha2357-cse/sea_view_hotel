# Hotel Sea View website

React (Vite) front end with a Firebase back end (Authentication + Cloud Firestore + Hosting), built to the SeaView Hotel PRD.

- **Public site**: one-page landing with hero slideshow, booking bar, sticky section nav, rooms, facilities, dining and events, gallery with lightbox, nearby places, map, FAQs, enquiry form, footer.
- **Guest login** (`/login`): guests create an account, send enquiries and track their status at `/account`.
- **Admin login** (`/admin/login`): staff only, no public sign-up. The dashboard at `/admin` shows every enquiry live, with filters, search, status updates, private notes, call/WhatsApp/email shortcuts and CSV export.
- **Animations**: the Core set from the motion library (framer-motion), all respecting the visitor's reduced-motion setting.

> Scope note: the PRD (section 2.2) lists customer accounts and an admin dashboard as excluded from V1 unless separately approved. They are included here at the client's request; log this under the PRD change-control process (section 16).

## 1. Install

```bash
npm install
cp .env.example .env
```

## 2. Create the Firebase project

1. In the [Firebase console](https://console.firebase.google.com) create a project.
2. **Build > Authentication > Get started**, and enable **Email/Password**.
3. **Build > Firestore Database > Create database** (production mode, region `asia-south1` Mumbai recommended).
4. **Project settings > Your apps > Web app**: register an app and copy its config values into `.env` (`VITE_FIREBASE_*`).
5. Install the CLI and link the project:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add        # pick your project
   firebase deploy --only firestore   # uploads security rules + indexes
   ```

## 3. Create the two logins

1. **Project settings > Service accounts > Generate new private key**. Save the file as `service-account.json` in this folder. It is git-ignored; never commit or share it.
2. In `.env` fill `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `GUEST_EMAIL`, `GUEST_PASSWORD` (passwords of at least 10 characters).
3. Run:
   ```bash
   npm run create-users
   ```
   This creates both accounts, adds the admin to the `admins` collection, and creates the guest profile. Run it again any time to reset those passwords.

| Login | URL | Can do |
| --- | --- | --- |
| Admin (staff) | `/admin/login` | See and manage all enquiries |
| Guest | `/login` | Send enquiries, see only their own |

To add more staff later, create the user in **Authentication** and add a document `admins/{their uid}` in Firestore (any field, e.g. `email`). Guests can also self-register at `/login`.

## 4. Photos

All photos come from hotelseaview.in (listed in `src/data/images.js`). By default the site loads them from there. To serve them from your own hosting (faster, recommended):

```bash
npm run fetch-images      # downloads into public/images
# then in .env:
VITE_IMAGE_SOURCE=local
```

Confirm with the hotel that every photo is authorised for use (PRD section 11).

## 5. Run and deploy

```bash
npm run dev       # http://localhost:5173
npm run build
npm run deploy    # builds and deploys hosting + rules to Firebase
```

Local testing without touching production: set `VITE_USE_EMULATORS=true`, run `firebase emulators:start`, then `npm run dev`.

## How enquiries work (PRD section 6)

1. The guest fills the form (or the booking bar pre-fills dates). Validation runs in the browser and again in `firestore.rules` on the server.
2. The success panel appears only after Firestore confirms the write.
3. The enquiry appears instantly on the admin dashboard with status **New**.
4. Staff call or WhatsApp the guest, then move the status through Contacted, Availability Checked, Awaiting Guest, Confirmed, Cancelled or Closed. Signed-in guests see their timeline update live.

The site never confirms a booking or shows live availability. A honeypot field blocks simple bots. For stronger protection add [Firebase App Check](https://firebase.google.com/docs/app-check) with reCAPTCHA Enterprise before launch.

## Content still needed from the client

Marked `CONFIRM` in `src/data/content.js`:

- Check-in and check-out times, cancellation and child policies (add to FAQs)
- Room sizes for all rooms except Standard, and a distinct Corner Deluxe description
- Rate display decision (currently enquiry-only)
- Bar opening hours, conference hall capacity and equipment
- Approved testimonials (section stays hidden while the list is empty)
- Final privacy notice (`src/pages/Privacy.jsx` is a draft), data retention period
- Final logo files, brand colours and fonts (current tokens are the PRD proposal)

## Project map

```
src/
  data/content.js        hotel facts, rooms, FAQs (edit text here)
  data/images.js         photo list from hotelseaview.in
  lib/firebase.js        Firebase setup
  lib/auth.jsx           sign-in, sign-up, admin check
  lib/enquiry.js         validation, Firestore write, WhatsApp message
  components/            header, footer, motion helpers, enquiry form
  sections/              each landing-page section
  pages/                 home, logins, guest account, admin dashboard, privacy
firestore.rules          server-side validation and access control
scripts/create-users.mjs creates the admin and guest logins
scripts/fetch-images.mjs downloads the hotel photos
```
