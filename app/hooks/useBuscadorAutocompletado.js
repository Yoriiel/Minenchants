"use client";

import { useMemo, useState } from "react";
import { buscarItems } from "../utils/buscarItems";

export function useBuscadorAutocompletado({ onSeleccionar }) {
  const [consulta, setConsulta] = useState("");
  const [error, setError] = useState(false);

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

  const manejarEnvio = () => {
    if (sugerencias.length > 0) {
      seleccionarItem(sugerencias[0]);
    } else if (consulta.trim()) {
      setError(true);
    }
  };

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
