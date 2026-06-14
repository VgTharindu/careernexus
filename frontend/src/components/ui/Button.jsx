import clsx from 'clsx';

export default function Button({
  children, onClick, type = 'button',
  variant = 'primary', size = 'md',
  disabled = false, fullWidth = false,
  icon: Icon, className = ''
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

  const variants = {
    primary: `text-white hover:scale-[1.02] hover:-translate-y-0.5`,
    secondary: `hover:opacity-90`,
    outline: `border-2 font-semibold hover:scale-[1.02]`,
    danger: `text-white hover:opacity-90`,
    success: `text-white hover:opacity-90`,
    ghost: `hover:opacity-80`,
    cyan: `text-white hover:scale-[1.02] hover:-translate-y-0.5`,
  };

  const getStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, #007BFF, #00CCCC)',
          boxShadow:  disabled ? 'none' : '0 4px 15px rgba(0,123,255,0.3)',
          color:      'white',
          border:     'none',
        };
      case 'secondary':
        return {
          background: 'var(--color-bg-card)',
          color:      'var(--color-text-secondary)',
          border:     '1px solid var(--color-border)',
        };
      case 'outline':
        return {
          background: 'transparent',
          color:      '#007BFF',
          border:     '2px solid #007BFF',
        };
      case 'danger':
        return {
          background: 'linear-gradient(135deg, #FF4444, #CC0000)',
          boxShadow:  disabled ? 'none' : '0 4px 15px rgba(255,68,68,0.25)',
          color:      'white',
          border:     'none',
        };
      case 'success':
        return {
          background: 'linear-gradient(135deg, #00C853, #00BCD4)',
          boxShadow:  disabled ? 'none' : '0 4px 15px rgba(0,200,83,0.25)',
          color:      'white',
          border:     'none',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color:      'var(--color-text-muted)',
          border:     'none',
        };
      case 'cyan':
        return {
          background: 'linear-gradient(135deg, #00CCCC, #007BFF)',
          boxShadow:  disabled ? 'none' : '0 4px 15px rgba(0,204,204,0.3)',
          color:      'white',
          border:     'none',
        };
      default:
        return {};
    }
  };

  const sizes = {
    sm:   'text-xs px-3 py-1.5 rounded-lg',
    md:   'text-sm px-4 py-2',
    lg:   'text-base px-6 py-3',
    xl:   'text-lg px-8 py-4',
    icon: 'p-2',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        base,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      style={getStyle()}
    >
      {Icon && <Icon size={size === 'sm' ? 13 : size === 'lg' ? 20 : 15} />}
      {children}
    </button>
  );
}