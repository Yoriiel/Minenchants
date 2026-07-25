/**
 * Una sola casilla de la mesa de encantamientos: puede estar vacía
 * o mostrar el ícono del ítem que le corresponde. `data-slot` es lo
 * que el hook useDragAndDrop usa para saber dónde se soltó/tocó un
 * ítem. El `onPointerDown` va en el div (no en el <img>) para que
 * las casillas vacías también se puedan tocar como destino.
 */
export default function InventorySlot({
  origen,
  esPrincipal = false,
  item,
  oculto,
  seleccionado,
  onPointerDown,
}) {
  return (
    <div
      className={esPrincipal ? "popup-casilla-principal" : "popup-casilla"}
      data-slot={origen}
      onPointerDown={onPointerDown}
      style={{ touchAction: "none" }}
    >
      {item && (
        <img
          src={item.img}
          alt={item.titulo}
          className={`popup-item${oculto ? " popup-item-oculto" : ""}${
            seleccionado ? " popup-item-seleccionado" : ""
          }`}
          style={{ cursor: "grab" }}
          draggable={false}
        />
      )}
    </div>
  );
}
