"use client";

import { useEffect } from "react";

/**
 * Modal de confirmación genérico, con la misma estética pixel-art
 */
export default function ModalConfirmacion({
  mensaje,
  textoConfirmar,
  textoCancelar,
  onConfirmar,
  onCancelar,
}) {
  useEffect(() => {
    const cerrarConEscape = (e) => {
      if (e.key === "Escape") onCancelar();
    };
    window.addEventListener("keydown", cerrarConEscape);
    return () => window.removeEventListener("keydown", cerrarConEscape);
  }, [onCancelar]);

  return (
    <div className="modal-fondo" role="presentation" onClick={onCancelar}>
      <div
        className="modal-caja"
        role="alertdialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="modal-mensaje">{mensaje}</p>
        <div className="modal-botones">
          <button type="button" className="btn-mc modal-boton" onClick={onCancelar}>
            {textoCancelar}
          </button>
          <button type="button" className="btn-mc modal-boton" onClick={onConfirmar}>
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
