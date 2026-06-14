import { useState } from 'react';
import { X, Download, FileText, AlertCircle } from 'lucide-react';

// ── Build correct URL from stored path ──────────────────
function buildCvUrl(cvUrl) {
  if (!cvUrl) return null;

  // Cloudinary URL or any full URL — use directly
  if (cvUrl.startsWith('http')) return cvUrl;

  // Legacy local path — fallback for old applications
  if (cvUrl.startsWith('/uploads/')) {
    return `http://localhost:5000${cvUrl}`;
  }

  const filename = cvUrl.replace(/\\/g, '/').split('/').pop();
  return `http://localhost:5000/uploads/${filename}`;
}

export default function CVPreview({ cvUrl, onClose, studentName }) {
  const [loadError, setLoadError] = useState(false);
  const [loaded,    setLoaded   ] = useState(false);

  if (!cvUrl) return null;

  const fullUrl = buildCvUrl(cvUrl);

  // Google Docs viewer URL as fallback for iframe
  const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fullUrl)}&embedded=true`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl flex flex-col rounded-2xl overflow-hidden fade-in"
        style={{
          background:  'var(--color-bg-card)',
          border:      '1px solid var(--color-border)',
          maxHeight:   '90vh',
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── Header ─────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-2">
            <FileText size={18} style={{ color: '#007BFF' }} />
            <span
              className="font-semibold text-sm"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {studentName ? `${studentName}'s CV` : 'CV Preview'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct open in new tab */}
            <a
              href={fullUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: 'rgba(0,123,255,0.08)',
                color:      '#007BFF',
                border:     '1px solid rgba(0,123,255,0.2)',
              }}
            >
              <FileText size={13} />
              Open in Tab
            </a>

            {/* Download */}
            <a
              href={fullUrl}
              download={studentName ? `${studentName}_CV.pdf` : 'CV.pdf'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: 'linear-gradient(135deg, #007BFF, #00CCCC)',
                color:      'white',
              }}
            >
              <Download size={13} />
              Download CV
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── PDF Viewer ──────────────────────────────────── */}
        <div
          className="flex-1 relative"
          style={{ minHeight: '500px', background: '#1a1a2e' }}
        >
          {/* Loading state */}
          {!loaded && !loadError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div
                  className="w-10 h-10 border-2 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"
                  style={{ borderColor: 'rgba(0,123,255,0.2)', borderTopColor: '#007BFF' }}
                />
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Loading CV...
                </p>
              </div>
            </div>
          )}

          {/* Error state */}
          {loadError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <AlertCircle size={40} className="mx-auto mb-3"
                             style={{ color: '#FF4444' }} />
                <h3
                  className="font-semibold mb-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Cannot preview this CV
                </h3>
                <p
                  className="text-sm mb-4"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  The file may have been uploaded before the URL fix. Use the buttons above to open or download.
                </p>
                <div className="flex gap-3 justify-center">
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl text-sm font-medium"
                    style={{
                      background: 'linear-gradient(135deg, #007BFF, #00CCCC)',
                      color:      'white',
                    }}
                  >
                    Open in New Tab
                  </a>
                  <a
                    href={fullUrl}
                    download
                    className="px-4 py-2 rounded-xl text-sm font-medium"
                    style={{
                      background: 'var(--color-bg-hover)',
                      color:      'var(--color-text-primary)',
                      border:     '1px solid var(--color-border)',
                    }}
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* PDF iframe */}
          <iframe
            src={fullUrl}
            title="CV Preview"
            className="w-full"
            style={{
              height:     '600px',
              border:     'none',
              display:    loadError ? 'none' : 'block',
              opacity:    loaded ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
            onLoad={() => setLoaded(true)}
            onError={() => setLoadError(true)}
          />
        </div>

        {/* ── Footer hint ─────────────────────────────────── */}
        <div
          className="px-5 py-2 flex-shrink-0 text-xs"
          style={{
            borderTop: '1px solid var(--color-border)',
            color:     'var(--color-text-muted)',
          }}
        >
          If the preview is blank, click <strong>Open in Tab</strong> or <strong>Download CV</strong> above.
        </div>

      </div>
    </div>
  );
}