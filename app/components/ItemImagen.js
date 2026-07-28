"use client";

import { forwardRef, useEffect, useState } from "react";

import { useConfiguracionContext } from "../context/ConfiguracionContext";

const ItemImagen = forwardRef(function ItemImagen(
  { src, alt = "", className, style, draggable = false },
  ref
) {
  const { animacionesApagadas } = useConfiguracionContext();
  const esGif = typeof src === "string" && src.toLowerCase().endsWith(".gif");
  const [frameEstatico, setFrameEstatico] = useState(null);

  useEffect(() => {
    if (!esGif || !animacionesApagadas) {
      setFrameEstatico(null);
      return;
    }

    let cancelado = false;
    const imagenAuxiliar = new Image();

    imagenAuxiliar.onload = () => {
      if (cancelado) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = imagenAuxiliar.naturalWidth;
        canvas.height = imagenAuxiliar.naturalHeight;
        const contexto = canvas.getContext("2d");
        contexto.drawImage(imagenAuxiliar, 0, 0);
        setFrameEstatico(canvas.toDataURL());
      } catch {
        setFrameEstatico(null);
      }
    };

    imagenAuxiliar.src = src;

    return () => {
      cancelado = true;
    };
  }, [esGif, animacionesApagadas, src]);

  const srcFinal = esGif && animacionesApagadas && frameEstatico ? frameEstatico : src;

  return (
    <img
      ref={ref}
      src={srcFinal}
      alt={alt}
      className={className}
      style={style}
      draggable={draggable}
    />
  );
});

export default ItemImagen;