"use client";

export default function Burbuja({ abierta, posicion = "abajo", claseExtra, children }) {
  if (!abierta) return null;

  const clases = ["burbuja", `burbuja--${posicion}`];
  if (claseExtra) clases.push(claseExtra);

  return (
    <div className={clases.join(" ")} role="menu">
      <div className="burbuja-contenido">{children}</div>
    </div>
  );
}