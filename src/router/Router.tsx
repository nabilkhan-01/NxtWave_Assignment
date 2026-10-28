import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppRoute = '/' | '/diagnose' | '/growth' | '/campaign';

interface RouterContextType {
  currentRoute: AppRoute;
  navigate: (to: AppRoute, options?: { replace?: boolean }) => void;
  searchParams: string;
}

const RouterContext = createContext<RouterContextType | null>(null);

export function normalizePath(path: string): AppRoute {
  if (!path) return '/';
  let clean = path;

  // Handle hash-based URLs if accessed via /#/diagnose
  if (clean.startsWith('#/')) {
    clean = clean.slice(1);
  } else if (clean.startsWith('#')) {
    clean = clean.slice(1);
  }

  // Strip query parameters for route matching
  if (clean.includes('?')) {
    clean = clean.split('?')[0];
  }

  // Normalize trailing slash
  if (clean.endsWith('/') && clean.length > 1) {
    clean = clean.slice(0, -1);
  }

  if (clean === '/diagnose' || clean === '/growth' || clean === '/campaign') {
    return clean;
  }
  return '/';
}

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#/')) {
        return normalizePath(hash.slice(1));
      }
      return normalizePath(window.location.pathname);
    }
    return '/';
  });

  const [searchParams, setSearchParams] = useState<string>(() => {
    return typeof window !== 'undefined' ? window.location.search : '';
  });

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#/')) {
        setCurrentRoute(normalizePath(hash.slice(1)));
      } else {
        setCurrentRoute(normalizePath(window.location.pathname));
      }
      setSearchParams(window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = (to: AppRoute, options?: { replace?: boolean }) => {
    const targetRoute = normalizePath(to);
    setCurrentRoute(targetRoute);

    if (typeof window !== 'undefined') {
      const currentSearch = window.location.search;
      const newUrl = `${targetRoute}${currentSearch}`;

      if (options?.replace) {
        window.history.replaceState({}, '', newUrl);
      } else {
        window.history.pushState({}, '', newUrl);
      }

      window.scrollTo(0, 0);
    }
  };

  return (
    <RouterContext.Provider value={{ currentRoute, navigate, searchParams }}>
      {children}
    </RouterContext.Provider>
  );
};

export function useRouter(): RouterContextType {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return ctx;
}

export const Link: React.FC<{
  to: AppRoute;
  className?: string;
  children: ReactNode;
  'aria-label'?: string;
  'aria-current'?: 'page' | undefined;
}> = ({ to, className, children, 'aria-label': ariaLabel, 'aria-current': ariaCurrent }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Allow default browser behavior for modifier keys (e.g. open in new tab)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to);
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      className={className}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
    >
      {children}
    </a>
  );
};
