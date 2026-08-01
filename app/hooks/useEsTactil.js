"use client";

import { useEffect, useState } from "react";

export function useEsTactil() {
  const [esTactil, setEsTactil] = useState(null);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const evaluar = () => setEsTactil(mq.matches);
    evaluar();
    mq.addEventListener("change", evaluar);
    return () => mq.removeEventListener("change", evaluar);
  }, []);

  return esTactil;
}