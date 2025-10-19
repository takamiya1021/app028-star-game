import type { ReactNode } from 'react';

interface DetailSectionProps {
  title: string;
  children: ReactNode;
  ariaLabel?: string;
}

export function DetailSection({ title, children, ariaLabel }: DetailSectionProps) {
  return (
    <section aria-label={ariaLabel}>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-200">{title}</h3>
      <div className="mt-2 text-sm text-blue-50">{children}</div>
    </section>
  );
}

export default DetailSection;
