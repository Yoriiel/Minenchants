"use client";

import { useEffect, useRef, useState } from "react";

export function useEnVista(threshold = 0.15) {
  const ref = useRef(null);
  const [enVista, setEnVista] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entrada]) => setEnVista(entrada.isIntersecting),
      { threshold }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, enVista];
}