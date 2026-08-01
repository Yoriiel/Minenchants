"use client";

import { useEffect, useRef } from "react";

export default function VueloItem({ item, from, to }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.transition = "none";
    el.style.transform = `translate3d(${from.x}px, ${from.y}px, 0) translate(-50%, -50%)`;

    // Forzamos que el navegador registre esa posición inicial antes
    // de animar al destino (si no, no habría transición que ver).
    void el.offsetHeight;

    requestAnimationFrame(() => {
      el.style.transition = "";
      el.style.transform = `translate3d(${to.x}px, ${to.y}px, 0) translate(-50%, -50%)`;
    });
  }, [from, to]);

  if (!item) return null;

  return <img ref={ref} src={item.img} alt="" className="popup-item-vuelo" draggable={false} />;
}
