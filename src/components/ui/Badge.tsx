interface BadgeProps {
  variant: 'gba' | 'jar' | 'vip' | 'new' | 'hot';
  children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  gba: 'bg-red-100 text-red-700 border-2 border-red-300',
  jar: 'bg-blue-100 text-blue-700 border-2 border-blue-300',
  vip: 'vip-badge',
  new: 'bg-green-100 text-green-700 border-2 border-green-300',
  hot: 'bg-orange-100 text-orange-700 border-2 border-orange-300',
};

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}
