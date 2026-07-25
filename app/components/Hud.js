/**
 * Sección 2: HUD estilo Minecraft (corazones, hambre, barra de xp
 * y la hotbar donde se hace click para abrir el popup de un ítem).
 */
export default function Hud({ items, casillasHotbar, onSelectItem }) {
  return (
    <section className="seccion seccion-marcadores">
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
            <span className="hud-xp-numero">15</span>
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
            const item = items[i];
            return (
              <button
                key={item ? item.id : `vacio-${i}`}
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
