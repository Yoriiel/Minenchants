// Debe coincidir con TOTAL_GRID_PRINCIPAL en useInventoryPopup.js:
// la fila de abajo del popup empieza en el casillero 27, y esa fila
// es exactamente la misma que esta barra HUD (casilla i <-> 27 + i).
const HOTBAR_INICIO = 27;

/**
 * Sección 2: HUD estilo Minecraft (corazones, hambre, barra de xp
 * y la hotbar donde se hace click para abrir el popup de un ítem).
 *
 * Qué ítem aparece en cada casilla sale de `posiciones` (la misma
 * fuente de verdad que usa el popup): si el jugador saca un ítem de
 * esta fila y lo sube a alguna de las 3 de arriba, acá queda vacío.
 */
export default function Hud({
  itemsPorId,
  posiciones,
  casillasHotbar,
  popupAbierto,
  mostrarAviso,
  onSelectItem,
}) {
  // Invertimos posiciones -> qué idItem hay en cada casillero de la hotbar.
  const idsPorCasillero = {};
  for (const idItem in posiciones) {
    idsPorCasillero[posiciones[idItem]] = idItem;
  }

  return (
    <section id="seccion-marcadores" className="seccion seccion-marcadores">
      {mostrarAviso && (
        <p className="hud-aviso-tecla-e" aria-hidden="true">
          Presiona la tecla &quot;E&quot;
          <br />
          para abrir el inventario
        </p>
      )}

      <div className="hud" aria-label="Inventario de equipamiento">
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
            return (
              <button
                key={idItem ?? `vacio-${i}`}
                type="button"
                className="hud-casilla"
                disabled={!item}
                onClick={() => item && onSelectItem(item)}
                aria-label={item ? `Ver encantamientos de ${item.titulo}` : "Casilla vacía"}
              >
                {item && <img src={item.img} alt={item.titulo} />}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}