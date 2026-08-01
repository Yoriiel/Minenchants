"use client";

import { useEffect } from "react";

let bloqueosActivos = 0;

function aplicarBloqueo() {
  bloqueosActivos++;
  if (bloqueosActivos === 1) {
    document.body.style.overflow = "hidden";
  }
}

function liberarBloqueo() {
  bloqueosActivos = Math.max(0, bloqueosActivos - 1);
  if (bloqueosActivos === 0) {
    document.body.style.overflow = "";
  }
}

export function useBloqueoScroll(activo) {
  useEffect(() => {
    if (!activo) return;
    aplicarBloqueo();
    return () => liberarBloqueo();
  }, [activo]);
}