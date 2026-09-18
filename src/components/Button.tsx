import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'text';

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'bg-blue text-white py-3 px-4 rounded-[10px]',
  secondary: 'bg-soft text-blue py-2.5 px-3 rounded-[10px] text-[12px]',
  text: 'text-blue text-[12px] font-medium bg-transparent p-0',
};

export function Button({
  variant = 'primary',
  full,
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; full?: boolean }) {
  return (
    <button
      type="button"
      className={`${VARIANT_CLASS[variant]} ${full ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
