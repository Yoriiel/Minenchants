"use client";

import { useEffect, useRef, useState } from "react";
import CampoBusqueda from "./CampoBusqueda";
import { useBuscadorAutocompletado } from "../hooks/useBuscadorAutocompletado";
import { useIdioma } from "../context/IdiomaContext";

/**
 * El botón "Buscar Item" del header, que se transforma en un campo
 * de texto al presionarlo (mismo ancho exacto que el botón: los 2
 * estados son hijos directos de .menu-minecraft con width:100%, así
 * que ya comparten ancho sin necesidad de ninguna variable extra).
 *
 * `onSeleccionar(item)` llega desde afuera (Hero.js → page.js, Parte
 * 5) — acá solo nos encargamos de colapsar de vuelta a botón después
 * de una selección exitosa.
 */
export default function BuscadorHeader({ onSeleccionar }) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef(null);
  const inputRef = useRef(null);
  const { t } = useIdioma();

  const {
    consulta,
    sugerencias,
    error,
    manejarCambioConsulta,
    manejarEnvio,
    seleccionarItem,
    reiniciar,
  } = useBuscadorAutocompletado({
    onSeleccionar: (item) => {
      onSeleccionar?.(item);
      setAbierto(false);
    },
  });

  const abrir = () => setAbierto(true);

  const cerrarSinElegir = () => {
    reiniciar();
    setAbierto(false);
  };

  // Foco automático apenas se transforma en input.
  useEffect(() => {
    if (abierto) inputRef.current?.focus();
  }, [abierto]);

  // Click (o toque) afuera del buscador → colapsa sin elegir nada.
  // Mismo patrón que ya usa este archivo para cerrar las burbujas de
  // idioma/opciones/contacto/música (ver Hero.js), pero acotado a la
  // referencia de ESTE componente.
  useEffect(() => {
    if (!abierto) return;
    const cerrarSiEsAfuera = (e) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        cerrarSinElegir();
      }
    };
    document.addEventListener("pointerdown", cerrarSiEsAfuera);
    return () => document.removeEventListener("pointerdown", cerrarSiEsAfuera);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  if (!abierto) {
    return (
      <button type="button" className="btn-mc btn-largo" onClick={abrir}>
        {t("buscarItemBoton")}
      </button>
    );
  }

  return (
    <div ref={contenedorRef} className="buscador-header">
      <CampoBusqueda
        inputRef={inputRef}
        consulta={consulta}
        sugerencias={sugerencias}
        error={error}
        onCambiarConsulta={manejarCambioConsulta}
        onEnviar={manejarEnvio}
        onSeleccionarSugerencia={seleccionarItem}
        className="buscador-header-campo"
      />
    </div>
  );
}
