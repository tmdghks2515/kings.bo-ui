"use client";

import { createContext, useCallback, useMemo, useRef, useState } from "react";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";

export const ConfirmContext = createContext(null);

const defaultConfirmOptions = {
  cancelText: "취소",
  confirmText: "확인",
  content: "",
  icon: null,
  maxWidth: "xs",
  title: "확인",
  variant: "default",
};

export default function ConfirmProvider({ children }) {
  const resolverRef = useRef(null);
  const [options, setOptions] = useState(defaultConfirmOptions);
  const [open, setOpen] = useState(false);

  const close = useCallback((confirmed) => {
    setOpen(false);
    resolverRef.current?.(confirmed);
    resolverRef.current = null;
  }, []);

  const confirm = useCallback((nextOptions) => {
    setOptions({
      ...defaultConfirmOptions,
      ...nextOptions,
    });
    setOpen(true);

    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <ConfirmDialog
        {...options}
        open={open}
        onCancel={() => close(false)}
        onConfirm={() => close(true)}
      />
    </ConfirmContext.Provider>
  );
}
