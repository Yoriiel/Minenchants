"use client";

import { useIdioma } from "../context/IdiomaContext";

export default function GiroDispositivo() {
  const { t } = useIdioma();

  return (
    <div className="giro-fondo" role="alert">
      <svg className="giro-icono" viewBox="0 0 100 100" aria-hidden="true">
        <rect
          x="30"
          y="10"
          width="40"
          height="70"
          rx="6"
          fill="none"
          stroke="#ffffff"
          strokeWidth="5"
        />
        <circle cx="50" cy="72" r="2.5" fill="#ffffff" />
      </svg>
      <p className="giro-texto">{t("giraTuTelefono")}</p>
    </div>
  );
}