"use client";

import { useEffect, useRef, useState } from "react";
import Particles from "./Particles";
import Burbuja from "./Burbuja";
import { useEnVista } from "../hooks/useEnVista";
import { useConfiguracionContext } from "../context/ConfiguracionContext";

const PASOS_REAPARICION_HEADER = 15;
const MS_ENTRE_PASOS_REAPARICION_HEADER = 40;

export default function Hero({ particulasMovil = false, cantidadParticulasMovil = 15 }) {
  const [refHeader, enVista] = useEnVista();
  const particulasApiRef = useRef(null);
  const estabaEnVistaRef = useRef(true);

  const {
    particulasApagadas,
    animacionesApagadas,
    setParticulasApagadas,
    setAnimacionesApagadas,
  } = useConfiguracionContext();

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

  const [burbujaActiva, setBurbujaActiva] = useState(null);
  const filaBotonesRef = useRef(null);

  const alternarBurbuja = (nombre) => {
    setBurbujaActiva((actual) => (actual === nombre ? null : nombre));
  };

  useEffect(() => {
    if (!burbujaActiva) return;

    const cerrarSiEsAfuera = (e) => {
      if (filaBotonesRef.current && !filaBotonesRef.current.contains(e.target)) {
        setBurbujaActiva(null);
      }
    };
    const cerrarConEscape = (e) => {
      if (e.key === "Escape") setBurbujaActiva(null);
    };

    document.addEventListener("pointerdown", cerrarSiEsAfuera);
    window.addEventListener("keydown", cerrarConEscape);
    return () => {
      document.removeEventListener("pointerdown", cerrarSiEsAfuera);
      window.removeEventListener("keydown", cerrarConEscape);
    };
  }, [burbujaActiva]);

  return (
    <header
      ref={refHeader}
      className={`seccion seccion-hero${enVista ? "" : " header-fuera-de-vista"}${
        animacionesApagadas ? " animaciones-apagadas" : ""
      }`}
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
          <button className="btn-mc btn-largo">Descargar PDF</button>
          <button className="btn-mc btn-largo">Java Edition Soon</button>

          <div className="fila-botones-inferior" ref={filaBotonesRef}>
            <div className="boton-con-burbuja">
              <button
                type="button"
                className="btn-mc btn-cuadrado"
                aria-label="Idioma"
                onClick={() => alternarBurbuja("idioma")}
              >
                🌍
              </button>
              <Burbuja abierta={burbujaActiva === "idioma"} posicion="arriba-izquierda">
                <p className="burbuja-placeholder">Próximamente</p>
              </Burbuja>
            </div>

            <div className="grupo-central">
              <button
                type="button"
                className="btn-mc btn-mitad"
                onClick={() => alternarBurbuja("opciones")}
              >
                Opciones...
              </button>
              <button
                type="button"
                className="btn-mc btn-mitad"
                onClick={() => alternarBurbuja("contacto")}
              >
                Contacto...
              </button>

             <Burbuja abierta={burbujaActiva === "opciones"} posicion="abajo">
                <button
                  type="button"
                  className="btn-mc burbuja-boton"
                  onClick={() => setParticulasApagadas(!particulasApagadas)}
                >
                  {particulasApagadas ? "Activar partículas" : "Apagar partículas"}
                </button>
                <button
                  type="button"
                  className="btn-mc burbuja-boton"
                  onClick={() => setAnimacionesApagadas(!animacionesApagadas)}
                >
                  {animacionesApagadas ? "Activar animaciones" : "Apagar animaciones"}
                </button>
              </Burbuja>

              <Burbuja abierta={burbujaActiva === "contacto"} posicion="abajo">
                <p className="burbuja-placeholder">Próximamente</p>
              </Burbuja>
            </div>

            <div className="boton-con-burbuja">
              <button
                type="button"
                className="btn-mc btn-cuadrado"
                aria-label="Música"
                onClick={() => alternarBurbuja("musica")}
              >
                🎵
              </button>
              <Burbuja abierta={burbujaActiva === "musica"} posicion="arriba-derecha">
                <p className="burbuja-placeholder">Próximamente</p>
              </Burbuja>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}