// ── Helper: build full image URL ────────────────────────
export function getImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url; // Cloudinary or any full URL
  return `http://localhost:5000${url}`;   // legacy local path fallback
}

export default function Avatar({ src, name, size = 'md' }) {
  const sizes = {
    xs:  'w-6  h-6  text-xs',
    sm:  'w-8  h-8  text-xs',
    md:  'w-10 h-10 text-sm',
    lg:  'w-14 h-14 text-lg',
    xl:  'w-20 h-20 text-2xl',
  };

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const fullSrc = getImageUrl(src);

  if (fullSrc) {
    return (
      <img
        src={fullSrc}
        alt={name || 'Avatar'}
        className={`${sizes[size]} rounded-xl object-cover flex-shrink-0`}
        style={{ border: '2px solid rgba(0,123,255,0.3)' }}
        onError={e => {
          // fallback to initials if image fails to load
          e.target.style.display = 'none';
          e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
        }}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{
        background: 'linear-gradient(135deg, #007BFF, #00CCCC)',
        border:     '2px solid rgba(0,123,255,0.3)',
      }}
    >
      {initials}
    </div>
  );
}