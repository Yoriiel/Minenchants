"use client";

import { useLayoutEffect, useState } from "react";
import ItemImagen from "./ItemImagen";
import { useIdioma } from "../context/IdiomaContext";
import { CLAVE_DIAMANTE_ENCONTRADO, ITEM_DIAMANTE_SECRETO } from "../data/easterEggDiamante";

/**
 * Easter egg: un diamante escondido, asomando apenas desde el borde
 * de la pantalla. Mientras el usuario no lo haya encontrado nunca,
 * se muestra rotado (ver .easter-egg-diamante en hud.css) para que
 * solo se vea "la puntita". Al hacer click, se marca como encontrado
 * (para siempre, vía localStorage) y desaparece de acá — lo que pase
 * después (el cartel de éxito, agregarlo al inventario) se resuelve
 * afuera, a través de `onEncontrado` (Partes 3 y 4).
 */
export default function EasterEggDiamante({ onEncontrado }) {
  // Arranca SIEMPRE visible, tanto en servidor como en cliente (el
  // localStorage no existe en el servidor) — así evitamos el mismo
  // problema de mismatch de hidratación que ya resolvimos en otras
  // partes del proyecto. Si el usuario ya lo había encontrado antes,
  // se oculta enseguida acá abajo, en el cliente, ANTES de que el
  // navegador pinte el primer frame (por eso useLayoutEffect y no
  // useEffect: no queremos ni un parpadeo del diamante para alguien
  // que ya lo tiene).
  const [encontrado, setEncontrado] = useState(false);
  const { t } = useIdioma();

  useLayoutEffect(() => {
    try {
      if (window.localStorage.getItem(CLAVE_DIAMANTE_ENCONTRADO) === "true") {
        setEncontrado(true);
      }
    } catch {
      // Si LocalStorage no está disponible (modo privado, etc.), lo
      // dejamos visible: en el peor caso, se puede "encontrar" más de
      // una vez entre sesiones distintas, no es grave.
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
