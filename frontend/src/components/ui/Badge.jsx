import clsx from 'clsx';

const variants = {
  blue:   { bg: 'rgba(0,123,255,0.15)',  color: '#007BFF',  border: 'rgba(0,123,255,0.3)'  },
  cyan:   { bg: 'rgba(0,204,204,0.15)',  color: '#00CCCC',  border: 'rgba(0,204,204,0.3)'  },
  green:  { bg: 'rgba(0,200,83,0.15)',   color: '#00C853',  border: 'rgba(0,200,83,0.3)'   },
  yellow: { bg: 'rgba(255,214,0,0.15)',  color: '#FFD600',  border: 'rgba(255,214,0,0.3)'  },
  red:    { bg: 'rgba(255,68,68,0.15)',  color: '#FF4444',  border: 'rgba(255,68,68,0.3)'  },
  purple: { bg: 'rgba(120,80,255,0.15)', color: '#7850FF',  border: 'rgba(120,80,255,0.3)' },
  gray:   { bg: 'rgba(100,150,200,0.15)',color: '#6699CC',  border: 'rgba(100,150,200,0.3)'},
};

export default function Badge({ children, variant = 'blue', className = '' }) {
  const v = variants[variant] || variants.blue;
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        className
      )}
      style={{
        background:   v.bg,
        color:        v.color,
        borderColor:  v.border,
      }}
    >
      {children}
    </span>
  );
}