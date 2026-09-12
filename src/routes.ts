import { useEffect, useState, useCallback } from 'react';

export type AppRoute =
  | { type: 'dashboard' }
  | { type: 'editor'; projectId: string }
  | { type: 'prototype'; projectId: string }
  | { type: 'share'; projectId: string }
  | { type: 'login' }
  | { type: 'signup' }
  | { type: 'forgot-password' }
  | { type: 'verify-email' };

export function parseRoute(pathname: string): AppRoute {
  // Support pathname or hash-based paths if hosted in subpaths
  const cleanPath = pathname.replace(/^\/+/, '').split('?')[0];
  const segments = cleanPath.split('/');
  const section = segments[0] || '';
  const param = segments[1] || '';

  if (section === 'editor') {
    return { type: 'editor', projectId: param || 'default' };
  }
  if (section === 'prototype') {
    return { type: 'prototype', projectId: param || 'default' };
  }
  if (section === 'share') {
    return { type: 'share', projectId: param || 'default' };
  }
  if (section === 'login') {
    return { type: 'login' };
  }
  if (section === 'signup') {
    return { type: 'signup' };
  }
  if (section === 'forgot-password') {
    return { type: 'forgot-password' };
  }
  if (section === 'verify-email') {
    return { type: 'verify-email' };
  }

  return { type: 'dashboard' };
}

export function routeToPath(route: AppRoute): string {
  switch (route.type) {
    case 'dashboard':
      return '/';
    case 'editor':
      return `/editor/${route.projectId}`;
    case 'prototype':
      return `/prototype/${route.projectId}`;
    case 'share':
      return `/share/${route.projectId}`;
    case 'login':
      return '/login';
    case 'signup':
      return '/signup';
    case 'forgot-password':
      return '/forgot-password';
    case 'verify-email':
      return '/verify-email';
  }
}

let activeRouteState: AppRoute = parseRoute(typeof window !== 'undefined' ? window.location.pathname : '/');
const routeListeners = new Set<(route: AppRoute) => void>();

export function navigate(route: AppRoute | string) {
  const parsed = typeof route === 'string' ? parseRoute(route) : route;
  const path = typeof route === 'string' ? route : routeToPath(route);

  try {
    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  } catch {
    // Ignore pushState sandbox or security restrictions inside iframes
  }

  activeRouteState = parsed;
  routeListeners.forEach((fn) => fn(parsed));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

export function useRouter() {
  const [route, setRoute] = useState<AppRoute>(() => activeRouteState);

  useEffect(() => {
    const onRouteUpdate = (newRoute: AppRoute) => {
      setRoute(newRoute);
    };

    const onPop = () => {
      const parsed = parseRoute(window.location.pathname);
      activeRouteState = parsed;
      setRoute(parsed);
    };

    routeListeners.add(onRouteUpdate);
    window.addEventListener('popstate', onPop);

    return () => {
      routeListeners.delete(onRouteUpdate);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  const goTo = useCallback((nextRoute: AppRoute | string) => {
    navigate(nextRoute);
  }, []);

  return { route, navigate: goTo };
}
