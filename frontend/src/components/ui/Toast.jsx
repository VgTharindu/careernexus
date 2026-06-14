import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const config = {
    success: {
      icon:    <CheckCircle size={16} />,
      color:   '#00C853',
      bg:      'rgba(0,200,83,0.12)',
      border:  'rgba(0,200,83,0.25)',
    },
    error: {
      icon:    <XCircle size={16} />,
      color:   '#FF4444',
      bg:      'rgba(255,68,68,0.12)',
      border:  'rgba(255,68,68,0.25)',
    },
    info: {
      icon:    <Info size={16} />,
      color:   '#007BFF',
      bg:      'rgba(0,123,255,0.12)',
      border:  'rgba(0,123,255,0.25)',
    },
    warning: {
      icon:    <AlertTriangle size={16} />,
      color:   '#FFD600',
      bg:      'rgba(255,214,0,0.12)',
      border:  'rgba(255,214,0,0.25)',
    },
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map(toast => {
          const c = config[toast.type] || config.info;
          return (
            <div
              key={toast.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl fade-in min-w-64 max-w-sm"
              style={{
                background:  'var(--color-bg-card)',
                border:      `1px solid ${c.border}`,
                boxShadow:   `0 8px 30px rgba(0,0,0,0.3), 0 0 0 1px ${c.border}`,
              }}
            >
              <div style={{ color: c.color, flexShrink: 0 }}>{c.icon}</div>
              <span
                className="text-sm flex-1 font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {toast.message}
              </span>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 hover:opacity-60 transition-opacity"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);