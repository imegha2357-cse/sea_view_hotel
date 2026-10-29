'use client';

// Small bridge so the account, sign-in and staff screens (written for react-router) run on Next.js routing.
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { forwardRef, useEffect } from 'react';

export const Link = forwardRef(function Link({ to, href, ...rest }, ref) {
  return <NextLink ref={ref} href={to ?? href} {...rest} />;
});

export function useLocation() {
  const pathname = usePathname();
  const search = typeof window === 'undefined' ? '' : window.location.search;
  const hash = typeof window === 'undefined' ? '' : window.location.hash;
  const from = new URLSearchParams(search).get('from');
  return { pathname, search, hash, state: from ? { from } : null };
}

export function useNavigate() {
  const router = useRouter();
  return (to, opts = {}) => (opts.replace ? router.replace(to) : router.push(to));
}

export function Navigate({ to, state, replace = true }) {
  const router = useRouter();
  const target = state?.from ? `${to}?from=${encodeURIComponent(state.from)}` : to;
  useEffect(() => {
    replace ? router.replace(target) : router.push(target);
  }, [router, target, replace]);
  return null;
}
