import { forwardRef } from "react";

/**
 * Ícono que sigue al cursor/dedo mientras se arrastra un ítem entre
 * casillas. El original se oculta (ver .popup-item-oculto) y este
 * elemento, con position: fixed, es el que realmente se ve moverse.
 */
const DragGhost = forwardRef(function DragGhost({ item, posicionInicial }, ref) {
  if (!item) return null;

  return (
    <img
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
