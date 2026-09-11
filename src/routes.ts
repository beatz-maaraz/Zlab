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

export function navigate(route: AppRoute | string) {
  const path = typeof route === 'string' ? route : routeToPath(route);
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

export function useRouter() {
  const [route, setRoute] = useState<AppRoute>(() => parseRoute(window.location.pathname));

  useEffect(() => {
    const onPop = () => {
      setRoute(parseRoute(window.location.pathname));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const goTo = useCallback((nextRoute: AppRoute | string) => {
    navigate(nextRoute);
  }, []);

  return { route, navigate: goTo };
}
