import { loadFirebase } from './firebase';

// Removes any leftover sample enquiries (marked source: 'demo') created by earlier versions of the admin panel.
export async function removeDemoEnquiries() {
  const { db, F } = await loadFirebase();
  const { collection, deleteDoc, getDocs, query, where } = F;
  const snap = await getDocs(query(collection(db, 'booking_enquiries'), where('source', '==', 'demo')));
  await Promise.all(
    snap.docs.map(async (d) => {
      const [m, h] = await Promise.all([getDocs(collection(d.ref, 'messages')), getDocs(collection(d.ref, 'history'))]);
      await Promise.all([...m.docs, ...h.docs].map((x) => deleteDoc(x.ref)));
      await deleteDoc(d.ref);
    })
  );
  return snap.size;
}
