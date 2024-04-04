import Toast from "@app/components/Toast";
import React, { useState, useCallback, useEffect } from "react";

interface ToastOptions {
  title?: string;
  description: string | JSX.Element;
  duration?: number;
}

const useToast = () => {
  const [toast, setToast] = useState<ToastOptions | null>(null);

  const showToast = useCallback(({ title, description, duration = 5000 }: ToastOptions) => {
    setToast({ title, description, duration });
    const timeoutId = setTimeout(() => {
      setToast(null);
    }, duration);
    return () => clearTimeout(timeoutId);
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const ToastComponent = toast ? (
    <Toast title={toast.title} description={toast.description} onClose={dismissToast} />
  ) : null;

  return { showToast, dismissToast, ToastComponent };
};

export default useToast;
