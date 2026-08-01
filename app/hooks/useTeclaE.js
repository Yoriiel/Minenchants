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

/*Maneja la tecla "E" para abrir/cerrar el popup*/
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

  // Si el popup se abre por cualquier otra vía (clic en un ítem del HUD), también damos por "visto" el aviso.
  useEffect(() => {
    if (popupAbierto) setAvisoVisto(true);
  }, [popupAbierto]);

  return { avisoVisto };
}