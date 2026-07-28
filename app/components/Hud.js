"use client";

import Particles from "./Particles";
import ItemImagen from "./ItemImagen";
import { useIdioma } from "../context/IdiomaContext";

const HOTBAR_INICIO = 27;

export default function Hud({
  itemsPorId,
  posiciones,
  casillasHotbar,
  popupAbierto,
  mostrarAviso,
  onSelectItem,
  particulasMovil = false,
  cantidadParticulasMovil = 12,
}) {
  const { t } = useIdioma();

  // Invertimos posiciones -> qué idItem hay en cada casillero de la hotbar.
  const idsPorCasillero = {};
  for (const idItem in posiciones) {
    idsPorCasillero[posiciones[idItem]] = idItem;
  }

  return (
    <section id="seccion-marcadores" className="seccion seccion-marcadores">
      {particulasMovil && !popupAbierto && (
        <Particles
          className="canvas-particulas-movil"
          cantidadBase={cantidadParticulasMovil}
        />
      )}

      {!popupAbierto && (
        <button
          type="button"
          className="btn-mc btn-cuadrado hud-boton-menu"
          onClick={() => onSelectItem()}
          aria-label={t("abrirInventarioAria")}
        >
          <span aria-hidden="true">&bull;&bull;&bull;</span>
        </button>
      )}

      {mostrarAviso && (
        <p className="hud-aviso-tecla-e" aria-hidden="true">
          {t("avisoTeclaELinea1")}
          <br />
          {t("avisoTeclaELinea2")}
        </p>
      )}

      <div className="hud" aria-label={t("inventarioAria")}>
        <div className="hud-barras">
          <div className="hud-fila-iconos">
            <div className="hud-grupo-izquierda">
              {Array.from({ length: 10 }, (_, i) => (
                <span className="hud-corazon" key={i}>
                  ❤
                </span>
              ))}
            </div>
            <span className="hud-xp-numero">32</span>
            <div className="hud-grupo-derecha">
              {Array.from({ length: 10 }, (_, i) => (
                <span className="hud-muslito" key={i}>
                  🍗
                </span>
              ))}
            </div>
          </div>
          <div className="hud-barra-xp">
            <div className="hud-barra-xp-relleno" />
          </div>
        </div>

        <div className="hud-hotbar">
          {Array.from({ length: casillasHotbar }, (_, i) => {
            const casillero = HOTBAR_INICIO + i;
            const idItem = idsPorCasillero[casillero];
            // Con el popup abierto, el mismo ítem ya se ve ahí adentro:
            // acá lo "apagamos" (ni lo mostramos ni queda clickeable),
            // y al desmontar el <img> el gif deja de ocupar memoria.
            const item = !popupAbierto && idItem ? itemsPorId[idItem] : null;
            const etiqueta = item
              ? t("verEncantamientosDe").replace("{titulo}", item.titulo)
              : t("casillaVacia");
            return (
              <button
                key={idItem ?? `vacio-${i}`} 
                type="button"
                className="hud-casilla"
                disabled={!item}
                onClick={() => item && onSelectItem(item)}
                aria-label={etiqueta}
              >
                {item && <ItemImagen src={item.img} alt={item.titulo} />}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}