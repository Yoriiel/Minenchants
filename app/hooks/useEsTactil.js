"use client";

import { useEffect, useState } from "react";

/**
 * Detecta si el dispositivo es táctil (pointer: coarse) — a
 * diferencia de useEsMovil, esto NO depende del ancho de pantalla:
 * una tablet ancha en horizontal (ej. 1024px) sigue dando `true`
 * acá, aunque useEsMovil ya haya dado `false` para ese mismo ancho.
 *
 * Mismo criterio que ya se usa en hud.css/hero.css para distinguir
 * "tablet" con CSS puro (`@media (pointer: coarse)`); este hook
 * existe para poder tomar esa misma decisión desde JS.
 *
 * Empieza en null ("todavía no sabemos", antes del primer efecto en
 * el cliente) para no mostrar algo y sacarlo de golpe un instante
 * después. Quien lo use debería tratar `null` como "esperar".
 */
export function useEsTactil() {
  const [esTactil, setEsTactil] = useState(null);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const evaluar = () => setEsTactil(mq.matches);
    evaluar();
    mq.addEventListener("change", evaluar);
    return () => mq.removeEventListener("change", evaluar);
  }, []);

  return esTactil;
}