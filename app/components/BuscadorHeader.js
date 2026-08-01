"use client";

import { useEffect, useRef, useState } from "react";
import CampoBusqueda from "./CampoBusqueda";
import { useBuscadorAutocompletado } from "../hooks/useBuscadorAutocompletado";
import { useIdioma } from "../context/IdiomaContext";

export default function BuscadorHeader({ onSeleccionar }) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef(null);
  const inputRef = useRef(null);
  const { t } = useIdioma();

  const {
    consulta,
    sugerencias,
    error,
    manejarCambioConsulta,
    manejarEnvio,
    seleccionarItem,
    reiniciar,
  } = useBuscadorAutocompletado({
    onSeleccionar: (item) => {
      onSeleccionar?.(item);
      setAbierto(false);
    },
  });

  const abrir = () => setAbierto(true);

  const cerrarSinElegir = () => {
    reiniciar();
    setAbierto(false);
  };

  // Foco automático apenas se transforma en input.
  useEffect(() => {
    if (abierto) inputRef.current?.focus();
  }, [abierto]);

  // Click (o toque) afuera del buscador → colapsa
  useEffect(() => {
    if (!abierto) return;
    const cerrarSiEsAfuera = (e) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        cerrarSinElegir();
      }
    };
    document.addEventListener("pointerdown", cerrarSiEsAfuera);
    return () => document.removeEventListener("pointerdown", cerrarSiEsAfuera);
  }, [abierto]);

  if (!abierto) {
    return (
      <button type="button" className="btn-mc btn-largo" onClick={abrir}>
        {t("buscarItemBoton")}
      </button>
    );
  }

  return (
    <div ref={contenedorRef} className="buscador-header">
      <CampoBusqueda
        inputRef={inputRef}
        consulta={consulta}
        sugerencias={sugerencias}
        error={error}
        onCambiarConsulta={manejarCambioConsulta}
        onEnviar={manejarEnvio}
        onSeleccionarSugerencia={seleccionarItem}
        className="buscador-header-campo"
      />
    </div>
  );
}
