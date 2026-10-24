import React, { useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

/**
 * Universal Next.js Link component that supports both 'href' and 'to'
 */
export function Link({ to, href, children, className, ...props }) {
  const target = href || to || '#';
  return (
    <NextLink href={target} className={className} {...props}>
      {children}
    </NextLink>
  );
}

export const NavLink = ({ to, href, children, className, ...props }) => {
  const router = useRouter();
  const target = href || to || '#';
  const isActive = router?.pathname === target;
  const computedClass = typeof className === 'function' ? className({ isActive }) : className;

  return (
    <NextLink href={target} className={computedClass} {...props}>
      {children}
    </NextLink>
  );
};

export function useNavigate() {
  const router = useRouter();
  return (path, options = {}) => {
    if (!router) return;
    if (typeof path === 'number') {
      if (typeof window !== 'undefined') window.history.go(path);
      return;
    }
    if (options.replace) {
      router.replace(path);
    } else {
      router.push(path);
    }
  };
}

export function useParams() {
  const router = useRouter();
  return router?.query || {};
}

export function useSearchParams() {
  const router = useRouter();
  const queryString = (router?.asPath || '').split('?')[1] || '';
  const searchParams = new URLSearchParams(queryString);
  return [searchParams, (newParams) => {
    if (!router) return;
    const currentBase = (router.asPath || '').split('?')[0];
    router.push(`${currentBase}?${newParams.toString()}`);
  }];
}

export function useLocation() {
  const router = useRouter();
  return {
    pathname: router?.pathname || '/',
    search: (router?.asPath || '').split('?')[1] ? `?${(router?.asPath || '').split('?')[1]}` : '',
    state: {},
  };
}

export function Navigate({ to, replace = true }) {
  const router = useRouter();
  useEffect(() => {
    if (router && to) {
      if (replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    }
  }, [to, replace, router]);
  return null;
}

export function Outlet({ children }) {
  return children || null;
}

export function BrowserRouter({ children }) {
  return <>{children}</>;
}

export function Routes({ children }) {
  return <>{children}</>;
}

export function Route() {
  return null;
}

export default {
  Link,
  NavLink,
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
  Navigate,
  Outlet,
  BrowserRouter,
  Routes,
  Route,
};
