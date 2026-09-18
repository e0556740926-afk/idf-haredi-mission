import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Toast } from '../components/Toast';

const ToastContext = createContext<((message: string) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((msg: string) => {
    clearTimeout(timer.current);
    setMessage(msg);
    timer.current = setTimeout(() => setMessage(null), 4000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <Toast message={message} />
    </ToastContext.Provider>
  );
}

export function useToast(): (message: string) => void {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
