/**
 * Una sola casilla de la mesa de encantamientos: puede estar vacía
 * o mostrar el ícono del ítem que le corresponde. `data-slot` es lo
 * que el hook useDragAndDrop usa para saber dónde se soltó un ítem.
 */
export default function InventorySlot({
  origen,
  esPrincipal = false,
  item,
  seEstaArrastrando,
  onPointerDown,
}) {
  return (
    <div
      className={esPrincipal ? "popup-casilla-principal" : "popup-casilla"}
      data-slot={origen}
    >
      {item && (
        <img
          src={item.img}
          alt={item.titulo}
          className={`popup-item${seEstaArrastrando ? " popup-item-oculto" : ""}`}
          style={{ touchAction: "none", cursor: "grab" }}
          onPointerDown={onPointerDown}
          draggable={false}
        />
      )}
    </div>
  );
}
