"use client";

import { useEffect, useState } from "react";

// Debe coincidir con la duración de transición de .popup-item-vuelo
// en popup.css.
const DURACION_VUELO_MS = 220;

function centroDeRect(rect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function rectDeCasilla(origen) {
  return document.querySelector(`[data-slot="${origen}"]`)?.getBoundingClientRect() ?? null;
}

/**
 * Segunda forma de mover ítems, sin arrastrar: tocás un ítem (queda
 * "seleccionado", con un resalte amarillo), y después tocás la
 * casilla destino (vacía u ocupada). El ítem viaja hasta ahí con una
 * animación corta; si la casilla destino ya tenía otro ítem, ambos
 * se cruzan e intercambian lugar. Tocar el mismo ítem otra vez
 * cancela la selección.
 *
 * En PC este modo se activa solo manteniendo Shift, para no pisar el
 * arrastre normal con mouse (que ya funciona sin Shift).
 */
export function useMoverPorToque({ idEnOrigen, moverItem, popupAbierto }) {
  const [seleccionado, setSeleccionado] = useState(null);
  const [vuelos, setVuelos] = useState([]);
  const [ocultosVuelo, setOcultosVuelo] = useState(() => new Set());

  // Si se cierra el popup con algo seleccionado o a mitad de un
  // vuelo, no queremos que quede "colgado" para la próxima apertura.
  useEffect(() => {
    if (popupAbierto) return;
    setSeleccionado(null);
    setVuelos([]);
    setOcultosVuelo(new Set());
  }, [popupAbierto]);

  // Mueve el ítem de `origen` a `destino` con la animación de "vuelo"
  // corta (si `destino` ya tenía otro ítem, ambos se cruzan). La usa
  // tanto la selección con Shift/toque como el atajo de Ctrl+click.
  const moverConAnimacion = (origen, destino) => {
    const idOrigen = idEnOrigen(origen);
    if (!idOrigen) return;
    const idDestino = idEnOrigen(destino);

    const rectOrigen = rectDeCasilla(origen);
    const rectDestino = rectDeCasilla(destino);
    if (!rectOrigen || !rectDestino) {
      moverItem(origen, destino); // no se pudo medir; igual lo movemos, sin animación
      return;
    }

    const desde = centroDeRect(rectOrigen);
    const hasta = centroDeRect(rectDestino);

    const nuevosVuelos = [{ key: `${origen}->${destino}`, id: idOrigen, from: desde, to: hasta }];
    if (idDestino) {
      // Intercambio: el ítem de destino vuela de vuelta hacia origen.
      nuevosVuelos.push({ key: `${destino}->${origen}`, id: idDestino, from: hasta, to: desde });
    }

    setOcultosVuelo(new Set([origen, destino]));
    setVuelos(nuevosVuelos);

    window.setTimeout(() => {
      moverItem(origen, destino);
      setVuelos([]);
      setOcultosVuelo(new Set());
    }, DURACION_VUELO_MS);
  };

  const alTocarCasilla = (origen, { pointerType, shiftKey } = {}) => {
    const esTactil = pointerType !== "mouse";
    if (!esTactil && !shiftKey) return; // en PC, este modo pide mantener Shift

    setSeleccionado((actual) => {
      if (actual === null) {
        return idEnOrigen(origen) ? origen : null; // no hay nada que seleccionar en una casilla vacía
      }
      if (actual === origen) return null; // tocar lo mismo de nuevo cancela

      moverConAnimacion(actual, origen);
      return null;
    });
  };

  // Cancela la selección activa (sin mover nada). Se usa cuando el
  // usuario, con un ítem seleccionado por Shift/toque, hace click en
  // cualquier punto del popup que no sea otra casilla (fondo del
  // popup, panel de encantamientos, etc.).
  const limpiarSeleccion = () => setSeleccionado(null);

  return { seleccionado, vuelos, ocultosVuelo, alTocarCasilla, moverConAnimacion, limpiarSeleccion };
}