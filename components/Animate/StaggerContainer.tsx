'use client';

import { motion, Variants } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { mergeClassNames } from '@/lib/ui/breakpoints';

interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  delayChildren?: number;
  staggerChildren?: number;
}

const defaultVariants: Variants = {
  hidden: {},
  show: {},
};

export function StaggerContainer({
  children,
  delayChildren = 0.05,
  staggerChildren = 0.04,
  className,
  ...rest
}: StaggerContainerProps) {
  return (
    <motion.div
      variants={defaultVariants}
      initial="hidden"
      animate="show"
      transition={{ staggerChildren, delayChildren }}
      data-motion="stagger"
      className={mergeClassNames('contents', className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export default StaggerContainer;
