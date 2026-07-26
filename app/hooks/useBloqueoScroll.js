"use client";

import { useEffect } from "react";

// Contador global de cuántas cosas están pidiendo bloquear el scroll
// ahora mismo (popup abierto, aviso de girar el teléfono, etc.). Solo
// liberamos `overflow` cuando el contador vuelve a 0, para que dos
// bloqueos simultáneos no se pisen entre sí al cerrarse uno de ellos.
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

/**
 * Bloquea el scroll del body mientras `activo` sea true. Varios
 * llamadores pueden pedir el bloqueo al mismo tiempo (por ejemplo, el
 * popup y el aviso de girar el teléfono); el scroll solo se libera
 * cuando ninguno de ellos lo sigue pidiendo.
 */
export function useBloqueoScroll(activo) {
  useEffect(() => {
    if (!activo) return;
    aplicarBloqueo();
    return () => liberarBloqueo();
  }, [activo]);
}