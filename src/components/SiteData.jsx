'use client';

import { createContext, useContext } from 'react';
import { SEED_CATEGORIES, SEED_OFFERS, SEED_ROOMS } from '@/data/seed';

// Rooms, offers and room categories from the admin panel, for client components (menu, forms, account).
const fallback = {
  rooms: SEED_ROOMS.map((r) => ({ id: r.id, name: r.name, image: r.images[0], rate: r.rate, category: r.category })),
  offers: SEED_OFFERS.map((o) => ({ code: o.code, title: o.title, image: o.image, room: o.room, type: o.type })),
  categories: SEED_CATEGORIES,
};
const Ctx = createContext(fallback);

export function SiteDataProvider({ value, children }) {
  return <Ctx.Provider value={value || fallback}>{children}</Ctx.Provider>;
}

export const useSiteData = () => useContext(Ctx);
