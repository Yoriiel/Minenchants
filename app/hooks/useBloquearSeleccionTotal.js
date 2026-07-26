"use client";

import { useEffect } from "react";

/**
 * Evita "Ctrl+A" (o "Cmd+A" en Mac) en toda la página. El CSS
 * (user-select: none) ya deja todo sin nada seleccionable, pero esto
 * es un respaldo por si algún navegador igual dispara el intento de
 * selección.
 */
export function useBloquearSeleccionTotal() {
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}