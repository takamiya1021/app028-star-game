'use client';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  align?: 'center' | 'start';
}

export default function PageHeader({
  eyebrow,
  title,
  description,
  children,
  align = 'center',
}: PageHeaderProps) {
  const alignment = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <header className={`flex flex-col gap-3 ${alignment}`}>
      {eyebrow && (
        <p className="text-sm uppercase tracking-[0.4em] text-blue-200">{eyebrow}</p>
      )}
      <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
      {description && (
        <p className="text-sm text-blue-100 sm:text-base">{description}</p>
      )}
      {children}
    </header>
  );
}
