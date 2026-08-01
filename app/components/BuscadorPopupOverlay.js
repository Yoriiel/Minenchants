"use client";

import { useEffect, useRef } from "react";
import CampoBusqueda from "./CampoBusqueda";
import { useBuscadorAutocompletado } from "../hooks/useBuscadorAutocompletado";
import { useIdioma } from "../context/IdiomaContext";

export default function BuscadorPopupOverlay({ onCerrar, onSeleccionar }) {
  const inputRef = useRef(null);
  const { t } = useIdioma();

  const {
    consulta,
    sugerencias,
    error,
    manejarCambioConsulta,
    manejarEnvio,
    seleccionarItem,
  } = useBuscadorAutocompletado({
    onSeleccionar: (item) => {
      onSeleccionar?.(item);
      onCerrar?.();
    },
  });

  // Foco automático apenas se abre.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Escape cierra SOLO este overlay, no todo el popup de la mesa de encantamientos. Por eso se registra en fase de CAPTURA
  useEffect(() => {
    const alPresionarTecla = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCerrar?.();
      }
    };
    document.addEventListener("keydown", alPresionarTecla, true);
    return () => document.removeEventListener("keydown", alPresionarTecla, true);
  }, []);

  return (
    <div
      className="buscador-popup-fondo"
      onClick={(e) => {
        // stopPropagation: sin esto, este click "sube" hasta el .popup-fondo del popup grande
        e.stopPropagation();
        onCerrar?.();
      }}
      role="presentation"
    >
      <div
        className="buscador-popup-caja"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t("buscarPopupAria")}
      >
        <CampoBusqueda
          inputRef={inputRef}
          consulta={consulta}
          sugerencias={sugerencias}
          error={error}
          onCambiarConsulta={manejarCambioConsulta}
          onEnviar={manejarEnvio}
          onSeleccionarSugerencia={seleccionarItem}
          className="buscador-popup-campo"
        />
      </div>
    </div>
  );
}
