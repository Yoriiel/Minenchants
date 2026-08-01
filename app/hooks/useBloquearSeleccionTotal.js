"use client";

import { useEffect } from "react";

/*Evita "Ctrl+A" en toda la página.*/
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