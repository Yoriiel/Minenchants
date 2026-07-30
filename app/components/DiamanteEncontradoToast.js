"use client";

import { useEffect, useState } from "react";
import ItemImagen from "./ItemImagen";
import { useIdioma } from "../context/IdiomaContext";
import { ITEM_DIAMANTE_SECRETO } from "../data/easterEggDiamante";

const DURACION_VISIBLE_MS = 5000;
// Tiene que coincidir con la transición definida en
// .diamante-toast / .diamante-toast-saliendo (toast.css).
const DURACION_SALIDA_MS = 400;

/**
 * Cartel de éxito que aparece unos segundos al encontrar el diamante
 * escondido (Parte 2). No es un modal: no bloquea la pantalla ni
 * necesita que el usuario haga nada — se cierra solo. El padre
 * (page.js, Parte 4) decide CUÁNDO montarlo; este componente solo se
 * encarga del tiempito en pantalla y de avisar cuándo ya se puede
 * desmontar (`onCerrar`).
 */
export default function DiamanteEncontradoToast({ onCerrar }) {
  const [saliendo, setSaliendo] = useState(false);
  const { t } = useIdioma();

  useEffect(() => {
    const timerSalida = setTimeout(
      () => setSaliendo(true),
      DURACION_VISIBLE_MS - DURACION_SALIDA_MS
    );
    const timerCierre = setTimeout(() => onCerrar?.(), DURACION_VISIBLE_MS);
    return () => {
      clearTimeout(timerSalida);
      clearTimeout(timerCierre);
    };
    // Solo nos interesa arrancar el temporizador una vez, al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`diamante-toast${saliendo ? " diamante-toast-saliendo" : ""}`}
      role="status"
      aria-live="polite"
    >
      <ItemImagen
        src={ITEM_DIAMANTE_SECRETO.img}
        alt=""
        className="diamante-toast-icono"
      />
      <span className="diamante-toast-texto">{t("diamanteEncontradoMensaje")}</span>
    </div>
  );
}
