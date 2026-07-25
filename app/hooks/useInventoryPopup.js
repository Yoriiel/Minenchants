"use client";

import { useEffect, useState } from "react";

const TOTAL_CASILLAS_POPUP = 36;

/**
 * Maneja la apertura/cierre del popup de la mesa de encantamientos
 * y en qué casilla (principal o de inventario) está cada ítem.
 *
 * popup === null              -> el popup está cerrado.
 * popup === { principal, inventario } -> está abierto:
 *   - principal: id del ítem bajo el libro (o null si se sacó de ahí)
 *   - inventario: { [indice]: id } con los demás ítems repartidos al azar
 */
export function useInventoryPopup(items) {
  const [popup, setPopup] = useState(null);

  const abrirPopup = (item) => {
    const otros = items.filter((i) => i.id !== item.id);

    const posiciones = Array.from({ length: TOTAL_CASILLAS_POPUP }, (_, i) => i);
    for (let i = posiciones.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [posiciones[i], posiciones[j]] = [posiciones[j], posiciones[i]];
    }

    const inventario = {};
    otros.forEach((it, idx) => {
      inventario[posiciones[idx]] = it.id;
    });

    setPopup({ principal: item.id, inventario });
  };

  const cerrarPopup = () => setPopup(null);

  // Bloquea el scroll de la página y permite cerrar con Escape
  // mientras el popup está abierto.
  useEffect(() => {
    if (!popup) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e) => {
      if (e.key === "Escape") cerrarPopup();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [popup]);

  const idEnOrigen = (origen) => {
    if (!popup) return null;
    return origen === "principal" ? popup.principal : popup.inventario[origen] ?? null;
  };

  return { popup, setPopup, abrirPopup, cerrarPopup, idEnOrigen };
}
