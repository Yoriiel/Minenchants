"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Maneja el arrastre (drag & drop) de ítems entre casillas del popup,
 * usando Pointer Events para que funcione igual con mouse y con touch.
 *
 * Necesita `popup`/`setPopup` (del hook useInventoryPopup) para saber
 * qué hay en cada casilla y poder moverlo cuando se suelta.
 */
export function useDragAndDrop({ popup, setPopup, idEnOrigen }) {
  // Qué se está arrastrando ahora mismo, o null si no hay drag activo.
  const [arrastre, setArrastre] = useState(null);
  const arrastreRef = useRef(null);

  const fantasmaRef = useRef(null); // nodo DOM del ícono que sigue al cursor
  const ultimaPosRef = useRef({ x: 0, y: 0 });

  const iniciarArrastre = (e, origen) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    const id = idEnOrigen(origen);
    if (!id) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - (rect.left + rect.width / 2);
    const offsetY = e.clientY - (rect.top + rect.height / 2);

    const datos = { origen, id, offsetX, offsetY };
    arrastreRef.current = datos;
    ultimaPosRef.current = { x: e.clientX - offsetX, y: e.clientY - offsetY };
    setArrastre(datos);

    document.body.style.cursor = "grabbing";
  };

  useEffect(() => {
    if (!arrastre) return;

    const aplicarTransform = (x, y) => {
      if (fantasmaRef.current) {
        fantasmaRef.current.style.transform =
          `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(1.25)`;
      }
    };

    let rafPendiente = false;
    let ultimoEvento = null;

    const onPointerMove = (e) => {
      ultimoEvento = e;
      if (rafPendiente) return;
      rafPendiente = true;
      requestAnimationFrame(() => {
        rafPendiente = false;
        const d = arrastreRef.current;
        if (!d || !ultimoEvento) return;
        const x = ultimoEvento.clientX - d.offsetX;
        const y = ultimoEvento.clientY - d.offsetY;
        ultimaPosRef.current = { x, y };
        aplicarTransform(x, y);
      });
    };

    const onPointerUp = (e) => {
      const d = arrastreRef.current;
      arrastreRef.current = null;
      setArrastre(null);
      document.body.style.cursor = "";
      if (!d) return;

      const elFantasma = document.querySelector(".popup-item-fantasma");
      if (elFantasma) elFantasma.style.display = "none";
      const elDestino = document.elementFromPoint(e.clientX, e.clientY);
      if (elFantasma) elFantasma.style.display = "";

      const casillaDestino = elDestino?.closest("[data-slot]");
      if (!casillaDestino) return;

      const destinoRaw = casillaDestino.dataset.slot;
      const destino = destinoRaw === "principal" ? "principal" : Number(destinoRaw);

      if (destino === d.origen) return;

      setPopup((prev) => {
        if (!prev) return prev;
        const ocupado = destino === "principal" ? prev.principal : prev.inventario[destino];
        if (ocupado) return prev;

        const siguiente = {
          principal: prev.principal,
          inventario: { ...prev.inventario },
        };

        if (d.origen === "principal") siguiente.principal = null;
        else delete siguiente.inventario[d.origen];

        if (destino === "principal") siguiente.principal = d.id;
        else siguiente.inventario[destino] = d.id;

        return siguiente;
      });
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [arrastre, setPopup]);

  return { arrastre, iniciarArrastre, fantasmaRef, ultimaPosRef };
}
