import clsx from 'clsx';

export default function Input({
  label, type = 'text', value, onChange,
  placeholder, required, error,
  icon: Icon, className = '', disabled = false
}) {
  return (
    <div className="w-full">
      {label && (
        <label
          className="block text-sm font-medium mb-1.5"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {label}
          {required && <span style={{ color: '#FF4444' }}> *</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Icon size={16} />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={clsx(
            'w-full rounded-xl border px-3 py-2.5 text-sm transition-all duration-200',
            'focus:outline-none',
            Icon && 'pl-10',
            error ? 'border-red-500' : '',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          style={{
            background:   'var(--color-bg-secondary)',
            color:        'var(--color-text-primary)',
            borderColor:  error ? '#FF4444' : 'var(--color-border)',
            boxShadow:    'none',
            transition:   'all 0.2s ease',
          }}
          onFocus={e => {
            e.target.style.borderColor = '#007BFF';
            e.target.style.boxShadow   = '0 0 0 3px rgba(0,123,255,0.12)';
          }}
          onBlur={e => {
            e.target.style.borderColor = error ? '#FF4444' : 'var(--color-border)';
            e.target.style.boxShadow   = 'none';
          }}
        />
      </div>
      {error && (
        <p className="text-xs mt-1" style={{ color: '#FF4444' }}>{error}</p>
      )}
    </div>
  );
}