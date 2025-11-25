import React from 'react';

const cx = (...classes) => classes.filter(Boolean).join(' ');

const variantStyles = {
  primary:
    'bg-[var(--color-primary-600)] text-white shadow-[0_12px_28px_rgba(18,51,56,0.22)] hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(18,51,56,0.3)]',
  gold:
    'bg-[var(--color-accent-gold)] text-[var(--color-primary-900)] shadow-[0_14px_32px_rgba(212,175,55,0.35)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(212,175,55,0.45)]',
  secondary:
    'bg-[var(--color-secondary-600)] text-white shadow-[0_12px_24px_rgba(0,191,166,0.35)] hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(0,191,166,0.4)]',
  outline:
    'border border-[var(--color-primary-600)] text-[var(--color-primary-600)] bg-transparent hover:bg-[var(--color-primary-600)] hover:text-white',
  ghost:
    'bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]'
};

const sizeStyles = {
  sm: 'text-sm px-4 py-2',
  md: 'text-base px-5 py-2.5',
  lg: 'text-lg px-6 py-3'
};

const baseClasses =
  'inline-flex items-center justify-center gap-2 font-semibold tracking-tight rounded-[var(--radius-lg)] transition-transform duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-gold)] focus-visible:ring-offset-2 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none';

const Button = React.forwardRef(
  (
    {
      as: Component = 'button',
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      leftIcon,
      rightIcon,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const classes = cx(
      baseClasses,
      variantStyles[variant] || variantStyles.primary,
      sizeStyles[size] || sizeStyles.md,
      fullWidth && 'w-full',
      className
    );

    return (
      <Component ref={ref} className={classes} {...props}>
        {leftIcon && <span className="inline-flex items-center text-current">{leftIcon}</span>}
        <span className="whitespace-nowrap">{children}</span>
        {rightIcon && <span className="inline-flex items-center text-current">{rightIcon}</span>}
      </Component>
    );
  }
);

Button.displayName = 'Button';

export default Button;

