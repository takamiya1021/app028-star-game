'use client';

import { useEffect, useState } from 'react';
import { BREAKPOINTS } from './breakpoints';

type BreakpointKey = keyof typeof BREAKPOINTS;

export function useBreakpoint(): BreakpointKey {
  const [current, setCurrent] = useState<BreakpointKey>('sm');

  useEffect(() => {
    const queries = Object.entries(BREAKPOINTS).map(([key, minWidth]) => ({
      key: key as BreakpointKey,
      query: window.matchMedia(`(min-width: ${minWidth}px)`),
    }));

    const update = () => {
      const matched = queries
        .filter(({ query }) => query.matches)
        .map(({ key }) => key);
      setCurrent(matched[matched.length - 1] ?? 'sm');
    };

    queries.forEach(({ query }) => query.addEventListener('change', update));
    update();
    return () => {
      queries.forEach(({ query }) => query.removeEventListener('change', update));
    };
  }, []);

  return current;
}
