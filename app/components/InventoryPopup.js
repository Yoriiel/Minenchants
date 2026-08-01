import { useState } from "react";
import InventorySlot from "./InventorySlot";
import EnchantmentPanel from "./EnchantmentPanel";
import BuscadorPopupOverlay from "./BuscadorPopupOverlay";
import { useIdioma } from "../context/IdiomaContext";

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
  onBuscarSeleccion,
  mostrarBuscador = false,
}) {
  const { t } = useIdioma();

  const [busquedaAbierta, setBusquedaAbierta] = useState(false);
  const idPrincipal = idEnOrigen("principal");
  const itemPrincipal = idPrincipal ? itemsPorId[idPrincipal] : null;

  const renderCasilla = (origen, esPrincipal = false) => {
    const id = idEnOrigen(origen);
    const item = id ? itemsPorId[id] : null;
    const oculto = arrastre?.origen === origen || ocultosVuelo.has(origen);

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
      // Ctrl+click: atajo aparte del drag & drop normal (no pasa por iniciarArrastre)
      if (e.ctrlKey) {
        e.preventDefault();
        dispararAtajo();
        return;
      }
      iniciarArrastre(e, origen);
    };

    // Doble click izquierdo: mismo atajo que Ctrl+click, para quien prefiera no usar el teclado.
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
          if (seleccionado !== null && !e.target.closest("[data-slot]")) {
            limpiarSeleccion();
          }
        }}
        role="dialog"
        aria-modal="true"
      >
        {renderCasilla("principal", true)}
        <EnchantmentPanel item={itemPrincipal} />

        {/* Botón de lupa: se quita por completo en dispositivos
            móviles/táctiles (el teclado virtual tapaba el buscador
            ahí), en escritorio queda exactamente igual. */}
        {mostrarBuscador && (
          <button
            type="button"
            className="popup-boton-buscar"
            onClick={() => setBusquedaAbierta(true)}
            aria-label={t("buscarPopupAria")}
          >
            <svg viewBox="0 0 24 24" className="popup-boton-buscar-icono" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
              <line x1="15.3" y1="15.3" x2="21" y2="21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        )}

        <div className="popup-inventario-principal">
          {Array.from({ length: 27 }, (_, i) => renderCasilla(i))}
        </div>
        <div className="popup-inventario-hotbar">
          {Array.from({ length: casillasHotbar }, (_, i) => renderCasilla(27 + i))}
        </div>
      </div>

      {mostrarBuscador && busquedaAbierta && (
        <BuscadorPopupOverlay
          onCerrar={() => setBusquedaAbierta(false)}
          onSeleccionar={onBuscarSeleccion}
        />
      )}
    </div>
  );
}