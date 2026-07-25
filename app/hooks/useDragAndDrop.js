"use client";

import { useEffect, useRef, useState } from "react";

// Hasta este movimiento (en px), un pointerdown+pointerup se sigue
// considerando un TOQUE (para seleccionar/mover sin arrastrar), no
// el inicio de un arrastre.
const UMBRAL_ARRASTRE_PX = 6;

/**
 * Maneja el arrastre (drag & drop) de ítems entre casillas del popup,
 * usando Pointer Events para que funcione igual con mouse y con touch.
 * También distingue un simple TOQUE (sin movimiento) y avisa por
 * `onTap`, para la selección-y-toque como forma alternativa de mover
 * ítems (ver useMoverPorToque).
 *
 * Necesita `idEnOrigen`/`moverItem` (del hook useInventoryPopup) para
 * saber qué hay en cada casilla y poder moverlo cuando se suelta.
 */
export function useDragAndDrop({ idEnOrigen, moverItem, onTap }) {
  // Solo es no-null mientras hay un arrastre YA confirmado (superó el
  // umbral). Un toque simple nunca llega a setear esto.
  const [arrastre, setArrastre] = useState(null);
  const sesionRef = useRef(null);

  const fantasmaRef = useRef(null); // nodo DOM del ícono que sigue al cursor
  const ultimaPosRef = useRef({ x: 0, y: 0 });

  const iniciarArrastre = (e, origen) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    // `id` puede ser null si la casilla está vacía: no hay nada para
    // arrastrar desde ahí, pero igual puede ser el DESTINO de un
    // toque (por eso no cortamos acá como antes).
    const id = idEnOrigen(origen);

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - (rect.left + rect.width / 2);
    const offsetY = e.clientY - (rect.top + rect.height / 2);

    sesionRef.current = {
      origen,
      id,
      offsetX,
      offsetY,
      startX: e.clientX,
      startY: e.clientY,
      pointerType: e.pointerType,
      shiftKey: e.shiftKey,
      arrastrando: false,
      movioMucho: false,
    };
    ultimaPosRef.current = { x: e.clientX - offsetX, y: e.clientY - offsetY };
  };

  useEffect(() => {
    const aplicarTransform = (x, y) => {
      if (fantasmaRef.current) {
        fantasmaRef.current.style.transform =
          `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(1.25)`;
      }
    };

    let rafPendiente = false;
    let ultimoEvento = null;

    const onPointerMove = (e) => {
      if (!sesionRef.current) return;
      ultimoEvento = e;
      if (rafPendiente) return;
      rafPendiente = true;
      requestAnimationFrame(() => {
        rafPendiente = false;
        const sesion = sesionRef.current;
        if (!sesion || !ultimoEvento) return;

        if (!sesion.arrastrando) {
          const dx = ultimoEvento.clientX - sesion.startX;
          const dy = ultimoEvento.clientY - sesion.startY;
          if (Math.hypot(dx, dy) < UMBRAL_ARRASTRE_PX) return;

          sesion.movioMucho = true;
          if (!sesion.id) return; // casilla de origen vacía: no hay nada que arrastrar

          sesion.arrastrando = true;
          document.body.style.cursor = "grabbing";
          setArrastre({ origen: sesion.origen, id: sesion.id });
        }

        const x = ultimoEvento.clientX - sesion.offsetX;
        const y = ultimoEvento.clientY - sesion.offsetY;
        ultimaPosRef.current = { x, y };
        aplicarTransform(x, y);
      });
    };

    const onPointerUp = (e) => {
      const sesion = sesionRef.current;
      sesionRef.current = null;
      if (!sesion) return;

      document.body.style.cursor = "";

      if (!sesion.arrastrando) {
        // No llegó a ser un arrastre: si tampoco se movió mucho, fue
        // un toque simple.
        if (!sesion.movioMucho) {
          onTap?.(sesion.origen, { pointerType: sesion.pointerType, shiftKey: sesion.shiftKey });
        }
        return;
      }

      setArrastre(null);

      const elFantasma = document.querySelector(".popup-item-fantasma");
      if (elFantasma) elFantasma.style.display = "none";
      const elDestino = document.elementFromPoint(e.clientX, e.clientY);
      if (elFantasma) elFantasma.style.display = "";

      const casillaDestino = elDestino?.closest("[data-slot]");
      if (!casillaDestino) return;

      const destinoRaw = casillaDestino.dataset.slot;
      const destino = destinoRaw === "principal" ? "principal" : Number(destinoRaw);

      if (destino === sesion.origen) return;

      moverItem(sesion.origen, destino);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [moverItem, onTap]);

  return { arrastre, iniciarArrastre, fantasmaRef, ultimaPosRef };
}
