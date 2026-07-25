"use client";

import { useEffect, useState } from "react";

const TOTAL_CASILLAS_POPUP = 36;
const STORAGE_KEY = "minenchants-posiciones-inventario";

// Baraja (Fisher-Yates) un array de índices de casilla [0..n).
function barajarCasillas(cantidad) {
  const casillas = Array.from({ length: cantidad }, (_, i) => i);
  for (let i = casillas.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [casillas[i], casillas[j]] = [casillas[j], casillas[i]];
  }
  return casillas;
}

// Genera una distribución nueva: { [idDeItem]: indiceDeCasilla }.
function generarPosicionesAleatorias(items) {
  const casillas = barajarCasillas(TOTAL_CASILLAS_POPUP);
  const posiciones = {};
  items.forEach((item, idx) => {
    posiciones[item.id] = casillas[idx];
  });
  return posiciones;
}

// Lee la distribución guardada. Devuelve null si no existe, está
// corrupta, o le faltan ítems (por ejemplo, se agregó un ítem nuevo
// al catálogo después de guardarla).
function cargarPosicionesGuardadas(items) {
  if (typeof window === "undefined") return null;
  try {
    const guardado = window.localStorage.getItem(STORAGE_KEY);
    if (!guardado) return null;
    const posiciones = JSON.parse(guardado);
    const completa = items.every(
      (item) => typeof posiciones[item.id] === "number"
    );
    return completa ? posiciones : null;
  } catch {
    return null;
  }
}

function guardarPosiciones(posiciones) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posiciones));
  } catch {
    // Si localStorage no está disponible (modo privado, cuota llena,
    // etc.) simplemente no persistimos; el popup sigue funcionando.
  }
}

/**
 * Maneja la apertura/cierre del popup de la mesa de encantamientos
 * y en qué casilla (principal o de inventario) está cada ítem.
 *
 * popup === null              -> el popup está cerrado.
 * popup === { principal, inventario } -> está abierto:
 *   - principal: id del ítem bajo el libro (o null si se sacó de ahí)
 *   - inventario: { [indice]: id } con los demás ítems
 *
 * La distribución de los ítems en las casillas es aleatoria SOLO la
 * primera vez que se abre un popup en este navegador; a partir de
 * ahí queda guardada en LocalStorage y se reutiliza siempre, incluso
 * entre recargas de página.
 */
export function useInventoryPopup(items) {
  const [popup, setPopup] = useState(null);

  // Distribución "canónica": dónde descansa cada ítem cuando no está
  // en la casilla principal. Es la fuente de verdad que se persiste;
  // `popup.inventario` es solo su vista para el ítem abierto ahora.
  const [posiciones, setPosiciones] = useState(() => {
    const guardadas = cargarPosicionesGuardadas(items);
    if (guardadas) return guardadas;
    const nuevas = generarPosicionesAleatorias(items);
    guardarPosiciones(nuevas);
    return nuevas;
  });

  const abrirPopup = (item) => {
    const inventario = {};
    items
      .filter((i) => i.id !== item.id)
      .forEach((i) => {
        inventario[posiciones[i.id]] = i.id;
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

  // Mueve el ítem que está en `origen` hacia `destino` (usado por el
  // drag & drop). Si `destino` ya tiene otro ítem, ambos intercambian
  // de casilla (esto también aplica cuando `origen` o `destino` es la
  // casilla principal).
  const moverItem = (origen, destino) => {
    if (origen === destino) return;

    setPopup((prev) => {
      if (!prev) return prev;

      const idOrigen = origen === "principal" ? prev.principal : prev.inventario[origen];
      if (!idOrigen) return prev;

      const idDestino = destino === "principal" ? prev.principal : prev.inventario[destino];

      const siguiente = {
        principal: prev.principal,
        inventario: { ...prev.inventario },
      };

      // Sacamos el ítem de origen de su casilla actual.
      if (origen === "principal") siguiente.principal = null;
      else delete siguiente.inventario[origen];

      // Si destino tenía algo, también lo sacamos (para reubicarlo en origen).
      if (idDestino) {
        if (destino === "principal") siguiente.principal = null;
        else delete siguiente.inventario[destino];
      }

      // El ítem de origen ocupa la casilla destino.
      if (destino === "principal") siguiente.principal = idOrigen;
      else siguiente.inventario[destino] = idOrigen;

      // Si destino estaba ocupado, ese ítem pasa a ocupar origen: intercambio.
      if (idDestino) {
        if (origen === "principal") siguiente.principal = idDestino;
        else siguiente.inventario[origen] = idDestino;
      }

      // Sincroniza y persiste la distribución canónica para las
      // casillas reales del grid involucradas (la principal no tiene
      // índice numérico propio, así que no se guarda ahí).
      setPosiciones((prevPos) => {
        let cambiaron = false;
        const nuevasPos = { ...prevPos };

        if (destino !== "principal") {
          nuevasPos[idOrigen] = destino;
          cambiaron = true;
        }
        if (idDestino && origen !== "principal") {
          nuevasPos[idDestino] = origen;
          cambiaron = true;
        }

        if (!cambiaron) return prevPos;
        guardarPosiciones(nuevasPos);
        return nuevasPos;
      });

      return siguiente;
    });
  };

  return { popup, abrirPopup, cerrarPopup, idEnOrigen, moverItem };
}
