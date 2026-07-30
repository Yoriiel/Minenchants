"use client";

import { useMemo, useState } from "react";
import { buscarItems } from "../utils/buscarItems";

/**
 * Lógica de búsqueda/autocompletado, compartida por el buscador del
 * header (Parte 3) y el del popup (Parte 4). No sabe nada de CSS ni
 * de cómo se ve cada uno — solo maneja: lo que el usuario escribió,
 * las sugerencias en tiempo real, el error de "no encontrado", y qué
 * pasa al elegir un ítem (por sugerencia, Enter, o el botón de
 * flecha).
 *
 * `onSeleccionar(item)` es lo único que cada consumidor define para
 * sí mismo: qué hacer con el ítem elegido (en la Parte 5 va a ser
 * "abrirlo en la casilla principal + scrollear a la Sección 2").
 */
export function useBuscadorAutocompletado({ onSeleccionar }) {
  const [consulta, setConsulta] = useState("");
  const [error, setError] = useState(false);

  // Filtrar ~21 ítems en cada tecla es prácticamente gratis — no
  // hace falta debounce acá (ver Parte 1, buscarItems.js).
  const sugerencias = useMemo(() => buscarItems(consulta), [consulta]);

  const manejarCambioConsulta = (texto) => {
    setConsulta(texto);
    if (error) setError(false);
  };

  const seleccionarItem = (item) => {
    setConsulta("");
    setError(false);
    onSeleccionar?.(item);
  };

  // Se dispara con Enter o con el botón de flecha: si hay alguna
  // coincidencia, toma la más relevante (la primera del ranking de
  // buscarItems); si no hay ninguna y el usuario sí escribió algo,
  // muestra el error.
  const manejarEnvio = () => {
    if (sugerencias.length > 0) {
      seleccionarItem(sugerencias[0]);
    } else if (consulta.trim()) {
      setError(true);
    }
  };

  // Vuelve todo a cero sin disparar `onSeleccionar` — la usa cada
  // consumidor cuando se cierra/colapsa sin haber elegido nada (click
  // afuera, cerrar el overlay, etc.).
  const reiniciar = () => {
    setConsulta("");
    setError(false);
  };

  return {
    consulta,
    sugerencias,
    error,
    manejarCambioConsulta,
    manejarEnvio,
    seleccionarItem,
    reiniciar,
  };
}
