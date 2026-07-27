"use client";

import { useEffect, useRef } from "react";
import Particles from "./Particles";
import { useEnVista } from "../hooks/useEnVista";

// Cuántos pasos da la reaparición gradual de las partículas del
// header al volver a él, y cuánto se espera entre paso y paso: más
// pasos/ms = más lenta y suave (mismo patrón que ya se usa en
// page.js para las partículas al cerrar el popup). AJUSTAR ACÁ la
// velocidad de esa reaparición.
const PASOS_REAPARICION_HEADER = 15;
const MS_ENTRE_PASOS_REAPARICION_HEADER = 40;

/**
 * En escritorio, page.js monta un canvas de partículas grande y
 * fijo a la página (cubre header + sección 2). En móvil ese NO se
 * monta; en su lugar, Hero monta acá su propio canvas de partículas
 * más chico y absoluto — queda acotado al recuadro del header
 * (gracias a `.seccion { position: relative; overflow: hidden }`),
 * así que nunca se ve sobre la sección 2.
 *
 * Optimización: mientras el header está FUERA de la vista (el
 * usuario ya scrolleó a la Sección 2), apagamos el splash (letras
 * amarillas, que tienen una animación infinita) y, en móvil/tablet,
 * las partículas propias del header — nada de esto se ve en ese
 * momento, así que no tiene sentido seguir gastando CPU/GPU en
 * animarlo. Al volver: el splash se reactiva DE UNA (togglear una
 * clase es instantáneo), y las partículas van reapareciendo de a
 * poco (mismo efecto ya usado para el popup).
 */
export default function Hero({ particulasMovil = false, cantidadParticulasMovil = 15 }) {
  const [refHeader, enVista] = useEnVista();
  const particulasApiRef = useRef(null);
  const estabaEnVistaRef = useRef(true);

  useEffect(() => {
    const api = particulasApiRef.current;
    if (!api) return; // no hay partículas montadas acá (estamos en escritorio)

    const estabaEnVista = estabaEnVistaRef.current;
    estabaEnVistaRef.current = enVista;
    if (enVista === estabaEnVista) return; // sin cambio real

    let cancelado = false;
    let idIntervalo = null;

    if (!enVista) {
      // Se fue del header: apagamos de una, no hay nada que suavizar
      // si de todos modos no se ve.
      api.setCantidad(0);
    } else {
      let actual = 0;
      const paso = Math.max(
        1,
        Math.ceil(cantidadParticulasMovil / PASOS_REAPARICION_HEADER)
      );
      idIntervalo = window.setInterval(() => {
        if (cancelado) return;
        actual += paso;
        if (actual >= cantidadParticulasMovil) {
          api.setCantidad(cantidadParticulasMovil);
          clearInterval(idIntervalo);
        } else {
          api.setCantidad(actual);
        }
      }, MS_ENTRE_PASOS_REAPARICION_HEADER);
    }

    return () => {
      cancelado = true;
      if (idIntervalo) clearInterval(idIntervalo);
    };
  }, [enVista, cantidadParticulasMovil]);

  return (
    <header
      ref={refHeader}
      className={`seccion seccion-hero${enVista ? "" : " header-fuera-de-vista"}`}
    >
      {particulasMovil && (
        <Particles
          ref={particulasApiRef}
          className="canvas-particulas-movil"
          cantidadBase={cantidadParticulasMovil}
        />
      )}

      <div className="hero-contenido">
        <div className="contenedor-logo">
          <img
            src="/img/Minenchants-bedrock.png"
            alt="Minenchants Bedrock Edition"
            className="hero-logo"
          />
          <span className="texto-splash">Estos son los Mejores!</span>
        </div>

        <div className="menu-minecraft">
          <a href="#seccion-marcadores" className="btn-mc btn-largo">Encantar!</a>
          <button className="btn-mc btn-largo">Multiplayer</button>
          <button className="btn-mc btn-largo">Minecraft Realms</button>

          <div className="fila-botones-inferior">
            <button className="btn-mc btn-cuadrado" aria-label="Language">
              🌍
            </button>
            <button className="btn-mc btn-mitad">Opciones...</button>
            <button className="btn-mc btn-mitad">Contacto...</button>
            <button className="btn-mc btn-cuadrado" aria-label="Accessibility">
              ♿
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}