"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Detecta si el elemento (vía `ref`) está actualmente a la vista del
 * usuario, usando IntersectionObserver (mucho más barato que medir
 * scroll a mano en cada evento: el navegador solo nos avisa cuando
 * el elemento entra/sale, no hace falta escuchar "scroll").
 *
 * Arranca en `true` (a la vista) porque al cargar la página el
 * header siempre está arriba de todo, visible.
 *
 * `threshold`: qué % del elemento tiene que verse para considerarlo
 * "a la vista" (0 = con que asome un pixel ya cuenta; 1 = tiene que
 * verse completo). AJUSTAR ACÁ si el apagado se siente muy brusco o
 * muy tardío cerca del borde de la sección.
 */
export function useEnVista(threshold = 0.15) {
  const ref = useRef(null);
  const [enVista, setEnVista] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entrada]) => setEnVista(entrada.isIntersecting),
      { threshold }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, enVista];
}