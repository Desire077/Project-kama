import React from 'react';

const cx = (...classes) => classes.filter(Boolean).join(' ');

const variantStyles = {
  surface: 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-ink)]',
  subtle: 'bg-[var(--color-surface-muted)] border-transparent text-[var(--color-ink)]',
  translucent:
    'bg-white/80 backdrop-blur-md border-white/30 shadow-[0_30px_60px_rgba(6,20,26,0.25)]',
  dark: 'bg-[var(--color-primary-900)] text-white border-white/10'
};

const Card = ({
  as: Component = 'div',
  variant = 'surface',
  interactive = false,
  padded = true,
  className = '',
  children,
  ...props
}) => {
  const classes = cx(
    'rounded-[var(--radius-2xl)] shadow-[0_10px_30px_rgba(6,20,26,0.12)] border transition-all duration-300',
    variantStyles[variant] || variantStyles.surface,
    interactive && 'hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(6,20,26,0.24)] focus-within:-translate-y-1',
    padded && 'p-6',
    className
  );

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

export default Card;

