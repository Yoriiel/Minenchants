"use client";

import { useEffect, useRef, useState } from "react";
import Particles from "./Particles";
import Burbuja from "./Burbuja";
import ModalConfirmacion from "./ModalConfirmacion";
import BuscadorHeader from "./BuscadorHeader";
import { useEnVista } from "../hooks/useEnVista";
import { useMusicPlayer } from "../hooks/useMusicPlayer";
import { useConfiguracionContext } from "../context/ConfiguracionContext";
import { useIdioma } from "../context/IdiomaContext";

const PASOS_REAPARICION_HEADER = 15;
const MS_ENTRE_PASOS_REAPARICION_HEADER = 40;

export default function Hero({
  particulasMovil = false,
  cantidadParticulasMovil = 15,
  onBuscarSeleccion,
  mostrarBuscador = false,
}) {
  const [refHeader, enVista] = useEnVista();
  const particulasApiRef = useRef(null);
  const estabaEnVistaRef = useRef(true);

  const {
    particulasApagadas,
    animacionesApagadas,
    setParticulasApagadas,
    setAnimacionesApagadas,
  } = useConfiguracionContext();

  const { idioma, setIdioma, t } = useIdioma();

  const [mostrarConfirmacionPdf, setMostrarConfirmacionPdf] = useState(false);
  const urlPdf = idioma === "en" ? "/pdf/encantamientos-en.pdf" : "/pdf/encantamientos-es.pdf";
  const nombreArchivoPdf = t("nombreArchivoPdf");

  const confirmarDescargaPdf = () => {
    const enlace = document.createElement("a");
    enlace.href = urlPdf;
    enlace.download = nombreArchivoPdf;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    setMostrarConfirmacionPdf(false);
  };

  const {
    activo: musicaActiva,
    volumen: volumenMusica,
    alternarActivo: alternarMusica,
    cambiarVolumen: cambiarVolumenMusica,
    pistaSiguiente,
    pistaAnterior,
  } = useMusicPlayer();

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
          <span className="texto-splash">{t("splash")}</span>
        </div>

        <div className="menu-minecraft">
          <a href="#seccion-marcadores" className="btn-mc btn-largo">{t("encantar")}</a>
          {mostrarBuscador && <BuscadorHeader onSeleccionar={onBuscarSeleccion} />}
          <button
            type="button"
            className="btn-mc btn-largo"
            onClick={() => setMostrarConfirmacionPdf(true)}
          >
            {t("descargarPdf")}
          </button>

          <div className="fila-botones-inferior" ref={filaBotonesRef}>
            <div className="boton-con-burbuja">
              <button
                type="button"
                className="btn-mc btn-cuadrado"
                aria-label={t("idiomaAria")}
                onClick={() => alternarBurbuja("idioma")}
              >
                🌍
              </button>
              <Burbuja abierta={burbujaActiva === "idioma"} posicion="izquierda">
                <button
                  type="button"
                  className={`btn-mc burbuja-boton${idioma === "es" ? " burbuja-boton--activo" : ""}`}
                  onClick={() => setIdioma("es")}
                >
                  Español
                </button>
                <button
                  type="button"
                  className={`btn-mc burbuja-boton${idioma === "en" ? " burbuja-boton--activo" : ""}`}
                  onClick={() => setIdioma("en")}
                >
                  English
                </button>
              </Burbuja>
            </div>

            <div className="grupo-central">
              <button
                type="button"
                className="btn-mc btn-mitad"
                onClick={() => alternarBurbuja("opciones")}
              >
                {t("opciones")}
              </button>
              <button
                type="button"
                className="btn-mc btn-mitad"
                onClick={() => alternarBurbuja("contacto")}
              >
                {t("contacto")}
              </button>

             <Burbuja abierta={burbujaActiva === "opciones"} posicion="abajo" claseExtra="burbuja-opciones">
                <button
                  type="button"
                  className="btn-mc burbuja-boton"
                  onClick={() => setParticulasApagadas(!particulasApagadas)}
                >
                  {particulasApagadas ? t("activarParticulas") : t("apagarParticulas")}
                </button>
                <button
                  type="button"
                  className="btn-mc burbuja-boton"
                  onClick={() => setAnimacionesApagadas(!animacionesApagadas)}
                >
                  {animacionesApagadas ? t("activarAnimaciones") : t("apagarAnimaciones")}
                </button>
              </Burbuja>

              <Burbuja abierta={burbujaActiva === "contacto"} posicion="abajo" claseExtra="burbuja-contacto">
                <a
                  href="https://github.com/Yoriiel/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-mc burbuja-boton"
                >
                  {t("github")}
                </a>
                <a
                  href="mailto:yoriiel.gonzalez@gmail.com"
                  className="btn-mc burbuja-boton"
                >
                  {t("email")}
                </a>
              </Burbuja>
            </div>

            <div className="boton-con-burbuja">
              <button
                type="button"
                className="btn-mc btn-cuadrado"
                aria-label={t("musicaAria")}
                onClick={() => alternarBurbuja("musica")}
              >
                🎵
              </button>
              <Burbuja abierta={burbujaActiva === "musica"} posicion="derecha">
                <button
                  type="button"
                  className="btn-mc burbuja-boton"
                  onClick={alternarMusica}
                >
                  {musicaActiva ? t("desactivarMusica") : t("activarMusica")}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumenMusica}
                  onChange={(e) => cambiarVolumenMusica(Number(e.target.value))}
                  className="burbuja-volumen"
                  aria-label={t("volumenAria")}
                />
                <div className="burbuja-pistas">
                  <button
                    type="button"
                    className="btn-mc burbuja-boton-mitad"
                    onClick={pistaAnterior}
                    aria-label={t("pistaAnteriorAria")}
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    className="btn-mc burbuja-boton-mitad"
                    onClick={pistaSiguiente}
                    aria-label={t("pistaSiguienteAria")}
                  >
                    ▶
                  </button>
                </div>
              </Burbuja>
            </div>
          </div>
        </div>
      </div>

      {mostrarConfirmacionPdf && (
        <ModalConfirmacion
          mensaje={t("confirmarDescargaTitulo").replace("{nombre}", nombreArchivoPdf)}
          textoConfirmar={t("confirmarDescargaSi")}
          textoCancelar={t("confirmarDescargaNo")}
          onConfirmar={confirmarDescargaPdf}
          onCancelar={() => setMostrarConfirmacionPdf(false)}
        />
      )}
    </header>
  );
}
