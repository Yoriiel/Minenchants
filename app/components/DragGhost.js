import { forwardRef } from "react";
import ItemImagen from "./ItemImagen";

const DragGhost = forwardRef(function DragGhost({ item, posicionInicial }, ref) {
  if (!item) return null;

  return (
    <ItemImagen
      ref={ref}
      src={item.img}
      alt=""
      className="popup-item-fantasma"
      style={{
        transform: `translate3d(${posicionInicial.x}px, ${posicionInicial.y}px, 0) translate(-50%, -50%) scale(1.25)`,
      }}
    />
  );
});

export default DragGhost;