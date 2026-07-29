"use client";

import { useEffect, useState } from "react";
import { agruparEncantamientos } from "../utils/agruparEncantamientos";
import { useIdioma } from "../context/IdiomaContext";

export default function EnchantmentPanel({ item }) {
  const [indiceVersion, setIndiceVersion] = useState(0);
  const { t } = useIdioma();

  useEffect(() => {
    setIndiceVersion(0);
  }, [item?.id]);

  if (!item) return null;

  const versiones = item.versiones ?? [[]];
  const indiceSeguro = Math.min(indiceVersion, versiones.length - 1);
  const grupos = agruparEncantamientos(versiones[indiceSeguro]);

  const tieneVarias = versiones.length > 1;

  return (
    <>
      <div className="popup-encantamientos">
        {grupos.map((grupo, indice) => (
          <div className="popup-encantamiento-recuadro" key={indice}>
            {grupo.map((encantamiento) => (
              <span className="popup-encantamiento-linea" key={encantamiento}>
                {encantamiento}
              </span>
            ))}
          </div>
        ))}
      </div>

      {tieneVarias && (

        <div className="popup-selector-version" role="group" aria-label={t("cambiarVersionAria")}>
          {versiones.map((_, indice) => (
            <button
              key={indice}
              type="button"
              className={`popup-selector-version-mitad${
                indice === indiceSeguro ? " popup-selector-version-activa" : ""
              }`}
              onClick={() => setIndiceVersion(indice)}
              aria-pressed={indice === indiceSeguro}
              aria-label={t("verVersionAria").replace("{numero}", String(indice + 1))}
            >
              {indice + 1}
            </button>
          ))}
        </div>
      )}
    </>
  );
}