"use client";

import { useEffect, useRef } from "react";
import CampoBusqueda from "./CampoBusqueda";
import { useBuscadorAutocompletado } from "../hooks/useBuscadorAutocompletado";
import { useIdioma } from "../context/IdiomaContext";

/**
 * Overlay de búsqueda DENTRO del popup de la mesa de encantamientos:
 * se abre con el botón de lupa (ver InventoryPopup.js) y queda
 * centrado, por encima de TODO, con un fondo oscuro semitransparente
 * (SIN blur — ver .buscador-popup-fondo en popup.css). Comparte la
 * misma lógica de autocompletado que el buscador del header (Parte
 * 3) a través de useBuscadorAutocompletado + CampoBusqueda.
 */
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

  // Escape cierra SOLO este overlay, no todo el popup de la mesa de
  // encantamientos. Por eso se registra en fase de CAPTURA (el 3er
  // argumento `true`) y llama a stopPropagation: así se procesa ANTES
  // que el listener de Escape del popup grande (que está en fase de
  // burbuja, en useInventoryPopup), y lo frena ahí — sin esto, los
  // dos escuchas reaccionarían al mismo Escape y se cerrarían los 2
  // de un solo toque.
  useEffect(() => {
    const alPresionarTecla = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCerrar?.();
      }
    };
    document.addEventListener("keydown", alPresionarTecla, true);
    return () => document.removeEventListener("keydown", alPresionarTecla, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="buscador-popup-fondo"
      onClick={(e) => {
        // stopPropagation: sin esto, este click "sube" hasta el
        // .popup-fondo del popup grande (InventoryPopup.js) y cierra
        // TODO el popup de la mesa de encantamientos, no solo este
        // overlay de búsqueda.
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
