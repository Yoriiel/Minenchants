"use client";

import { useEffect, useState } from "react";

import { useBloqueoScroll } from "./useBloqueoScroll";

/**
 * Detecta dispositivos "chicos y táctiles" (celulares) en modo
 * vertical. Se usa para pedirles que giren el teléfono antes de usar
 * el popup: la mesa de encantamientos tiene proporciones muy anchas
 * y en vertical las casillas quedan demasiado chicas para tocarlas
 * bien.
 */
export function useOrientacionMovil() {
  const [necesitaGirar, setNecesitaGirar] = useState(false);

  useEffect(() => {
    const mqMovil = window.matchMedia("(pointer: coarse) and (max-width: 900px)");
    const mqVertical = window.matchMedia("(orientation: portrait)");

    const evaluar = () => setNecesitaGirar(mqMovil.matches && mqVertical.matches);
    evaluar();

    mqMovil.addEventListener("change", evaluar);
    mqVertical.addEventListener("change", evaluar);
    return () => {
      mqMovil.removeEventListener("change", evaluar);
      mqVertical.removeEventListener("change", evaluar);
    };
  }, []);

  // Mientras se muestra el aviso de girar el teléfono, bloqueamos el
  // scroll de la página (solo pasa en móvil, que es cuando este aviso
  // puede estar activo).
  useBloqueoScroll(necesitaGirar);

  return necesitaGirar;
}