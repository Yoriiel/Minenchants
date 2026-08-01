"use client";

import { useEffect, useState } from "react";

import { useBloqueoScroll } from "./useBloqueoScroll";

/*Detecta dispositivos en modo vertical. Se usa para pedirles que giren el teléfono*/
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

  // Mientras se muestra el aviso de girar el teléfono, bloqueamos el scroll de la página 
  useBloqueoScroll(necesitaGirar);

  return necesitaGirar;
}