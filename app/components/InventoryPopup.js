import InventorySlot from "./InventorySlot";
import EnchantmentPanel from "./EnchantmentPanel";

/**
 * Popup modal de la mesa de encantamientos: casilla principal (bajo
 * el libro) + panel de encantamientos a la derecha + grid de 27
 * casillas + fila de hotbar (casillasHotbar casillas, la misma fila
 * que la barra HUD real).
 */
export default function InventoryPopup({
  itemsPorId,
  idEnOrigen,
  moverConAnimacion,
  siguienteCasilleroDesdeAbajo,
  arrastre,
  iniciarArrastre,
  ocultosVuelo,
  seleccionado,
  limpiarSeleccion,
  casillasHotbar,
  onClose,
}) {
  // El panel de encantamientos siempre refleja lo que hay AHORA en la
  // casilla principal, así que se recalcula en cada render del popup
  // (por ejemplo, al soltar/sacar un ítem de esa casilla).
  const idPrincipal = idEnOrigen("principal");
  const itemPrincipal = idPrincipal ? itemsPorId[idPrincipal] : null;

  const renderCasilla = (origen, esPrincipal = false) => {
    const id = idEnOrigen(origen);
    const item = id ? itemsPorId[id] : null;
    const oculto = arrastre?.origen === origen || ocultosVuelo.has(origen);

    // Atajo para mover un ítem desde/hacia la casilla principal, sin
    // pasar por el drag & drop normal. Antes solo se activaba con
    // Ctrl+click; ahora también con doble click izquierdo (misma
    // lógica exacta para los dos casos).
    const dispararAtajo = () => {
      if (origen === "principal") {
        // El ítem de la principal sale a la primera casilla libre
        // desde abajo hacia arriba, izquierda a derecha.
        const destino = siguienteCasilleroDesdeAbajo();
        if (destino !== null) moverConAnimacion("principal", destino);
      } else {
        // Cualquier otro ítem salta directo a la principal (si ya
        // había algo ahí, se intercambian). Si la casilla está vacía
        // o el ítem es de relleno, moverConAnimacion no hace nada.
        moverConAnimacion(origen, "principal");
      }
    };

    const onPointerDown = (e) => {
      // Ctrl+click: atajo aparte del drag & drop normal (no pasa por
      // iniciarArrastre), con la misma animación de "vuelo" que la
      // selección con Shift/toque.
      if (e.ctrlKey) {
        e.preventDefault();
        dispararAtajo();
        return;
      }
      iniciarArrastre(e, origen);
    };

    // Doble click izquierdo: mismo atajo que Ctrl+click, para quien
    // prefiera no usar el teclado.
    const onDoubleClick = (e) => {
      e.preventDefault();
      dispararAtajo();
    };

    return (
      <InventorySlot
        key={origen}
        origen={origen}
        esPrincipal={esPrincipal}
        item={item}
        oculto={oculto}
        seleccionado={seleccionado === origen}
        onPointerDown={onPointerDown}
        onDoubleClick={onDoubleClick}
      />
    );
  };

  return (
    <div className="popup-fondo" onClick={onClose}>
      <div
        className="popup-ventana"
        onClick={(e) => {
          e.stopPropagation();
          // Si hay una selección activa (Shift/toque) y el click NO
          // fue sobre una casilla (otro ítem o una vacía), la
          // cancelamos. Click sobre una casilla ya lo maneja
          // alTocarCasilla vía onPointerDown/onTap, así que acá solo
          // limpiamos cuando el click cayó fuera de todas ellas.
          if (seleccionado !== null && !e.target.closest("[data-slot]")) {
            limpiarSeleccion();
          }
        }}
        role="dialog"
        aria-modal="true"
      >
        {renderCasilla("principal", true)}
        <EnchantmentPanel item={itemPrincipal} />

        <div className="popup-inventario-principal">
          {Array.from({ length: 27 }, (_, i) => renderCasilla(i))}
        </div>
        <div className="popup-inventario-hotbar">
          {Array.from({ length: casillasHotbar }, (_, i) => renderCasilla(27 + i))}
        </div>
      </div>
    </div>
  );
}