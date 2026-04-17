import type { ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, ReactElement } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
};

export function Button({ variant = 'primary', className = '', ...rest }: ButtonProps): ReactElement {
  const base =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';
  const styles =
    variant === 'primary'
      ? 'bg-neutral-900 text-white hover:bg-neutral-700'
      : 'bg-transparent text-neutral-900 hover:bg-neutral-100 border border-neutral-300';
  return <button className={`${base} ${styles} ${className}`} {...rest} />;
}

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>): ReactElement {
  return (
    <input
      className={`w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none ${className}`}
      {...rest}
    />
  );
}

export function Label({ className = '', ...rest }: LabelHTMLAttributes<HTMLLabelElement>): ReactElement {
  return <label className={`mb-1 block text-xs font-medium text-neutral-700 ${className}`} {...rest} />;
}

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}): ReactElement {
  return <div className={`rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm ${className}`}>{children}</div>;
}
