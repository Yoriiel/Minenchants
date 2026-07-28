"use client";

export default function Burbuja({ abierta, posicion = "abajo", children }) {
  if (!abierta) return null;

  return (
    <div className={`burbuja burbuja--${posicion}`} role="menu">
      <span className="burbuja-puntita" aria-hidden="true" />
      <div className="burbuja-contenido">{children}</div>
    </div>
  );
}