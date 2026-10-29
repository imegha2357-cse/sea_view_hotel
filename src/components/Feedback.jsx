'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { sendFeedback } from '../lib/errors';
import { EASE } from './Motion';

// Feature #58: "Something not working?" A short note to staff about this page. No personal details asked.
export default function Feedback() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [state, setState] = useState('idle');
  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setState('sending');
    try {
      await sendFeedback(text);
      setState('done');
      setText('');
    } catch {
      setState('error');
    }
  };
  return (
    <span className="feedback">
      <button type="button" className="footer-link" onClick={() => { setOpen((o) => !o); setState('idle'); }} aria-expanded={open}>
        Website feedback
      </button>
      <AnimatePresence>
        {open && (
          <motion.form className="feedback-pop" onSubmit={submit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.25, ease: EASE }}>
            {state === 'done' ? (
              <p role="status">Thank you. Our team will look at it.</p>
            ) : (
              <>
                <label htmlFor="fb-text">Something not working, or hard to find on this page?</label>
                <textarea id="fb-text" value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} rows={3} placeholder="Please do not include personal details." />
                {state === 'error' && <p className="form-alert">Not sent. Try again later.</p>}
                <div className="form-actions">
                  <button className="btn solid" type="submit" disabled={state === 'sending' || !text.trim()}>
                    Send
                  </button>
                  <button className="text-btn" type="button" onClick={() => setOpen(false)}>
                    Close
                  </button>
                </div>
              </>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </span>
  );
}
