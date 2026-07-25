import InventorySlot from "./InventorySlot";
import EnchantmentPanel from "./EnchantmentPanel";

/**
 * Popup modal de la mesa de encantamientos: casilla principal (bajo
 * el libro) + panel de encantamientos a la derecha + grid de 27
 * casillas + fila de hotbar de 9 casillas.
 */
export default function InventoryPopup({
  popup,
  itemsPorId,
  idEnOrigen,
  arrastre,
  iniciarArrastre,
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
    const seEstaArrastrando = arrastre?.origen === origen;

    return (
      <InventorySlot
        key={origen}
        origen={origen}
        esPrincipal={esPrincipal}
        item={item}
        seEstaArrastrando={seEstaArrastrando}
        onPointerDown={(e) => iniciarArrastre(e, origen)}
      />
    );
  };

  return (
    <div className="popup-fondo" onClick={onClose}>
      <div
        className="popup-ventana"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {renderCasilla("principal", true)}
        <EnchantmentPanel item={itemPrincipal} />

        <div className="popup-inventario-principal">
          {Array.from({ length: 27 }, (_, i) => renderCasilla(i))}
        </div>
        <div className="popup-inventario-hotbar">
          {Array.from({ length: 9 }, (_, i) => renderCasilla(27 + i))}
        </div>
      </div>
    </div>
  );
}
