interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-black uppercase tracking-wide transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none border-[3px] border-[#231f20]';

  const variants: Record<string, string> = {
    primary: 'bg-[#ff4757] hover:bg-[#ff2e43] text-white shadow-[4px_4px_0px_#231f20] active:translate-y-0.5 active:shadow-[2px_2px_0px_#231f20] rounded-xl',
    secondary: 'bg-white hover:bg-[#fff8e1] text-[#231f20] shadow-[4px_4px_0px_#231f20] active:translate-y-0.5 active:shadow-[2px_2px_0px_#231f20] rounded-xl',
    outline: 'bg-white text-[#231f20] border-[3px] border-[#231f20] rounded-xl hover:bg-[#fff8e1] active:translate-y-0.5 shadow-[4px_4px_0px_#231f20]',
    ghost: 'text-[#524d4a] hover:bg-[#f8f6ed] hover:text-[#231f20] rounded-xl border-transparent shadow-none',
  };

  const sizes: Record<string, string> = {
    sm: 'text-xs px-4 py-2',
    md: 'text-sm sm:text-base px-6 py-3',
    lg: 'text-base sm:text-lg px-8 py-4',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
