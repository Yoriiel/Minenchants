"use client";

import { useLayoutEffect, useState } from "react";
import ItemImagen from "./ItemImagen";
import { useIdioma } from "../context/IdiomaContext";
import { CLAVE_DIAMANTE_ENCONTRADO, ITEM_DIAMANTE_SECRETO } from "../data/easterEggDiamante";

export default function EasterEggDiamante({ onEncontrado }) {

  const [encontrado, setEncontrado] = useState(false);
  const { t } = useIdioma();

  useLayoutEffect(() => {
    try {
      if (window.localStorage.getItem(CLAVE_DIAMANTE_ENCONTRADO) === "true") {
        setEncontrado(true);
      }
    } catch {
    }
  }, []);

  if (encontrado) return null;

  const handleClick = () => {
    try {
      window.localStorage.setItem(CLAVE_DIAMANTE_ENCONTRADO, "true");
    } catch {
      // Si falla el guardado, igual lo ocultamos para esta sesión.
    }
    setEncontrado(true);
    onEncontrado?.(ITEM_DIAMANTE_SECRETO);
  };

  return (
    <button
      type="button"
      className="easter-egg-diamante"
      onClick={handleClick}
      aria-label={t("diamanteEscondidoAria")}
    >
      <ItemImagen
        src={ITEM_DIAMANTE_SECRETO.img}
        alt=""
        className="easter-egg-diamante-img"
      />
    </button>
  );
}
