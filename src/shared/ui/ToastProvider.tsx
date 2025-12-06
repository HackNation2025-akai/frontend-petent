import { createContext, useContext, useMemo, useState, useEffect, type PropsWithChildren } from "react";

type Toast = { id: string; message: string; type?: "info" | "success" | "error" };

type ToastContextValue = {
  addToast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = () => {
    if (typeof globalThis !== "undefined") {
      const cryptoApi = (globalThis as typeof globalThis & { crypto?: Crypto }).crypto;
      if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();
      if (cryptoApi?.getRandomValues) {
        const buf = new Uint32Array(4);
        cryptoApi.getRandomValues(buf);
        return Array.from(buf)
          .map((n) => n.toString(16).padStart(8, "0"))
          .join("-");
      }
    }
    return Math.random().toString(36).slice(2, 10);
  };

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = generateId();
    const nextToast: Toast = { id, ...toast };
    setToasts((prev) => [...prev, nextToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const value = useMemo(() => ({ addToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type ?? "info"}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

