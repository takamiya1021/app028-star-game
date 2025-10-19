'use client';

import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { mergeClassNames } from '@/lib/ui/breakpoints';
import { motionDurations, motionEasing } from '@/lib/ui/motion';

interface PageTransitionProps extends HTMLMotionProps<'div'> {
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
      transition={{ duration: motionDurations.slow, ease: motionEasing.entrance }}
      data-motion="page"
      className={mergeClassNames('relative', className)}
      {...rest}
    >
      {children}
    </Component>
  );
}

export default PageTransition;
