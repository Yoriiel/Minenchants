"use client";

import { useEffect, useState } from "react";

export function useEsMovil(anchoMaximoPx = 768) {
  const [esMovil, setEsMovil] = useState(null);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${anchoMaximoPx}px)`);
    const evaluar = () => setEsMovil(mq.matches);
    evaluar();
    mq.addEventListener("change", evaluar);
    return () => mq.removeEventListener("change", evaluar);
  }, [anchoMaximoPx]);

  return esMovil;
}
