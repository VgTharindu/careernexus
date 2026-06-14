import clsx from 'clsx';

export default function Card({
  children, className = '',
  glass = false, hover = false,
  glow = false, onClick
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-2xl border transition-all duration-200',
        hover && 'cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        background:  'var(--color-bg-card)',
        borderColor: 'var(--color-border)',
        boxShadow:   'var(--shadow-sm)',
        padding:     '20px',
      }}
      onMouseEnter={e => {
        if (hover || onClick) {
          e.currentTarget.style.borderColor = '#007BFF';
          e.currentTarget.style.transform   = 'translateY(-2px)';
          e.currentTarget.style.boxShadow   = '0 8px 25px rgba(0,123,255,0.15)';
        }
      }}
      onMouseLeave={e => {
        if (hover || onClick) {
          e.currentTarget.style.borderColor = 'var(--color-border)';
          e.currentTarget.style.transform   = 'translateY(0)';
          e.currentTarget.style.boxShadow   = 'var(--shadow-sm)';
        }
      }}
    >
      {children}
    </div>
  );
}