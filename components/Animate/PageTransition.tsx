'use client';

import { motion } from 'framer-motion';
import type { HTMLAttributes } from 'react';
import { mergeClassNames } from '@/lib/ui/breakpoints';

interface PageTransitionProps extends HTMLAttributes<HTMLElement> {
  as?: 'main' | 'div';
}

export function PageTransition({
  children,
  className,
  as = 'main',
  ...rest
}: PageTransitionProps) {
  const Component = motion[as];

  return (
    <Component
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      data-motion="page"
      className={mergeClassNames('relative', className)}
      {...rest}
    >
      {children}
    </Component>
  );
}

export default PageTransition;
