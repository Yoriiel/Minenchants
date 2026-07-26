"use client";

import { useEffect, useState } from "react";

// Chequea si la Sección 2 (id="seccion-marcadores") está a la vista
// ahora mismo: el centro de la ventana tiene que caer dentro de esa
// sección. Así "E" solo abre el popup ahí, no desde el header.
function seccion2EstaALaVista() {
  const seccion = document.getElementById("seccion-marcadores");
  if (!seccion) return false;
  const rect = seccion.getBoundingClientRect();
  const centroVentana = window.innerHeight / 2;
  return rect.top <= centroVentana && rect.bottom >= centroVentana;
}

/**
 * Maneja la tecla "E" para abrir/cerrar el popup (igual que en
 * Minecraft), y si ya se mostró el aviso de "Presioná E" al menos
 * una vez en esta carga de la página (para no volver a mostrarlo
 * hasta que se recargue la web entera).
 *
 * Abrir con "E" solo funciona parado en la Sección 2 (el HUD); cerrar
 * con "E" funciona siempre que el popup ya esté abierto.
 */
export function useTeclaE({ popupAbierto, abrirPopup, cerrarPopup }) {
  const [avisoVisto, setAvisoVisto] = useState(false);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key.toLowerCase() !== "e") return;
      if (popupAbierto) {
        cerrarPopup();
      } else if (seccion2EstaALaVista()) {
        setAvisoVisto(true);
        abrirPopup();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [popupAbierto, abrirPopup, cerrarPopup]);

  // Si el popup se abre por cualquier otra vía (clic en un ítem del
  // HUD), también damos por "visto" el aviso.
  useEffect(() => {
    if (popupAbierto) setAvisoVisto(true);
  }, [popupAbierto]);

  return { avisoVisto };
}