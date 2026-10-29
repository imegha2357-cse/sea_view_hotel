'use client';

import { useState } from 'react';
import { whatsappUrl } from '@/lib/enquiry';
import { useAuth } from '@/lib/auth';

// Book, WhatsApp, and (for signed-in guests) save the room to their account.
export default function RoomActions({ room }) {
  const { user, profile, saveProfile } = useAuth();
  const [msg, setMsg] = useState('');
  const saved = profile?.saved_rooms?.includes(room.id);
  const toggle = async () => {
    const list = profile?.saved_rooms || [];
    try {
      await saveProfile({ saved_rooms: saved ? list.filter((x) => x !== room.id) : [...list, room.id].slice(0, 10) });
      setMsg(saved ? 'Removed from saved rooms' : 'Saved to your account');
    } catch {
      setMsg('Could not save. Try again.');
    }
  };
  return (
    <div className="card-actions">
      <a href="#book" className="btn solid">
        Enquire about this room
      </a>
      <a href={whatsappUrl({ room_type: room.name })} className="btn outline dark" target="_blank" rel="noreferrer">
        WhatsApp
      </a>
      {user && (
        <button type="button" className="text-btn" onClick={toggle} aria-pressed={!!saved}>
          {saved ? '★ Saved' : '☆ Save this room'}
        </button>
      )}
      {msg && (
        <span className="saved" role="status">
          {msg}
        </span>
      )}
    </div>
  );
}
