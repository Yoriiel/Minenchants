import { useState } from "react";
import InventorySlot from "./InventorySlot";
import EnchantmentPanel from "./EnchantmentPanel";
import BuscadorPopupOverlay from "./BuscadorPopupOverlay";
import { useIdioma } from "../context/IdiomaContext";

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
  onBuscarSeleccion,
}) {
  const { t } = useIdioma();

  // Overlay de búsqueda del popup: es un estado 100% local (solo le
  // interesa a este componente si está abierto o cerrado). Lo único
  // que sale hacia afuera es la selección exitosa, vía
  // `onBuscarSeleccion` (mismo handler que usa el buscador del
  // header — se conecta de verdad en la Parte 5, en page.js).
  const [busquedaAbierta, setBusquedaAbierta] = useState(false);

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

        {/* Botón de lupa: abre el buscador DENTRO del popup (Parte 4).
            AJUSTAR POSICIÓN/TAMAÑO: ver ".popup-boton-buscar" en
            popup.css (mismas coordenadas 1:1 con Popup-mesa.png que
            el resto del popup). */}
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

        <div className="popup-inventario-principal">
          {Array.from({ length: 27 }, (_, i) => renderCasilla(i))}
        </div>
        <div className="popup-inventario-hotbar">
          {Array.from({ length: casillasHotbar }, (_, i) => renderCasilla(27 + i))}
        </div>
      </div>

      {busquedaAbierta && (
        <BuscadorPopupOverlay
          onCerrar={() => setBusquedaAbierta(false)}
          onSeleccionar={onBuscarSeleccion}
        />
      )}
    </div>
  );
}