import ItemImagen from "./ItemImagen";

export default function InventorySlot({
  origen,
  esPrincipal = false,
  item,
  oculto,
  seleccionado,
  onPointerDown,
  onDoubleClick,
}) {
  return (
    <div
      className={esPrincipal ? "popup-casilla-principal" : "popup-casilla"}
      data-slot={origen}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      style={{ touchAction: "none" }}
    >
      {item && (
        <ItemImagen
          src={item.img}
          alt={item.titulo}
          className={`popup-item${oculto ? " popup-item-oculto" : ""}${
            seleccionado ? " popup-item-seleccionado" : ""
          }`}
          style={{ cursor: "grab" }}
        />
      )}
    </div>
  );
}