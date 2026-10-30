// Tells the admin panel which optional services are switched on (never the keys themselves).
import { staffFrom } from '@/lib/staff-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  if (!(await staffFrom(req))) return Response.json({}, { status: 401 });
  const on = (k) => Boolean(process.env[k]);
  return Response.json({
    ai: on('ANTHROPIC_API_KEY'),
    mail: on('RESEND_API_KEY') && on('MAIL_FROM'),
    staffEmail: on('STAFF_EMAIL'),
    serviceAccount: on('FIREBASE_SERVICE_ACCOUNT'),
    push: on('NEXT_PUBLIC_VAPID_PUBLIC_KEY') && on('VAPID_PRIVATE_KEY'),
    recaptcha: on('NEXT_PUBLIC_RECAPTCHA_SITE_KEY'),
    cloudinary: on('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'),
    analytics: on('NEXT_PUBLIC_GA_ID'),
    whatsapp: on('NEXT_PUBLIC_WHATSAPP_NUMBER'),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '',
  });
}
