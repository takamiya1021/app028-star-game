'use client';

import { motion } from 'framer-motion';
import type { HTMLAttributes } from 'react';

type FadeInElement = 'div' | 'section' | 'article' | 'aside';

const componentMap: Record<FadeInElement, typeof motion.div> = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  aside: motion.aside,
};

interface FadeInProps extends HTMLAttributes<HTMLElement> {
  delay?: number;
  duration?: number;
  as?: FadeInElement;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.4,
  className,
  as = 'div',
  ...rest
}: FadeInProps) {
  const MotionComponent = componentMap[as];
  return (
    <MotionComponent
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      data-motion="fade-in"
      className={className}
      {...rest}
    >
      {children}
    </MotionComponent>
  );
}

export default FadeIn;
