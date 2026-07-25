"use client";

import { useEffect, useState } from "react";

/**
 * Detecta si el ancho de pantalla es de "móvil" (a diferencia de
 * useOrientacionMovil, esto NO depende de la orientación: un celular
 * en horizontal sigue siendo "móvil" acá).
 *
 * Empieza en null ("todavía no sabemos", antes del primer efecto en
 * el cliente) para no mostrar algo y sacarlo de golpe un instante
 * después. Quien lo use debería tratar `null` como "esperar".
 */
export function useEsMovil(anchoMaximoPx = 768) {
  const [esMovil, setEsMovil] = useState(null);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${anchoMaximoPx}px)`);
    const evaluar = () => setEsMovil(mq.matches);
    evaluar();
    mq.addEventListener("change", evaluar);
    return () => mq.removeEventListener("change", evaluar);
  }, [anchoMaximoPx]);

  return esMovil;
}
