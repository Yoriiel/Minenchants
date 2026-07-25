"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/*
  Sistema de partículas ambientales con física interactiva
  (paseo aleatorio multidireccional, viento por scroll, repulsión de mouse)
  + control externo de cantidad activa vía ref, para poder bajarla al
  mínimo mientras se está en la Sección 3 sin desmontar el componente.
*/

const TAMANIO_SPRITE = 24;

const RADIO_MOUSE = 90;
const RADIO_MOUSE_CUADRADO = RADIO_MOUSE * RADIO_MOUSE;
const FUERZA_MOUSE = 1.6;

const FACTOR_VIENTO = 0.045;
const DECAIMIENTO_VIENTO = 0.94;
const VIENTO_MAXIMO = 9;

function crearSpritePartícula() {
  const c = document.createElement("canvas");
  c.width = TAMANIO_SPRITE;
  c.height = TAMANIO_SPRITE;
  const cx = c.getContext("2d");
  const centro = TAMANIO_SPRITE / 2;

  const gradiente = cx.createRadialGradient(centro, centro, 0, centro, centro, centro);
  gradiente.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradiente.addColorStop(0.4, "rgba(255, 255, 255, 0.7)");
  gradiente.addColorStop(1, "rgba(255, 255, 255, 0)");

  cx.fillStyle = gradiente;
  cx.fillRect(0, 0, TAMANIO_SPRITE, TAMANIO_SPRITE);
  return c;
}

function crearParticula(ancho, alto) {
  const angulo = Math.random() * Math.PI * 2;
  const velocidad = Math.random() * 0.3 + 0.05;
  return {
    x: Math.random() * ancho,
    y: Math.random() * alto,
    radio: Math.random() * 1.6 + 0.6,
    angulo,
    velocidad,
    velocidadAngular: (Math.random() - 0.5) * 0.02,
    opacidadBase: Math.random() * 0.5 + 0.25,
    fase: Math.random() * Math.PI * 2,
  };
}

const Particles = forwardRef(function Particles(
  { className, cantidadBase = 40 },
  ref
) {
  const canvasRef = useRef(null);
  const spriteRef = useRef(null);
  const particulasRef = useRef([]);
  const frameRef = useRef(0);
  const cantidadActivaRef = useRef(cantidadBase);

  const vientoRef = useRef(0);
  const ultimoScrollYRef = useRef(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  // Permite al padre subir/bajar cuántas partículas se simulan y dibujan,
  // sin desmontar el canvas (así no se "resetean" al cambiar de sección).
  useImperativeHandle(ref, () => ({
    setCantidad(n) {
      cantidadActivaRef.current = Math.max(
        0,
        Math.min(particulasRef.current.length, n)
      );
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    spriteRef.current = crearSpritePartícula();

    let ancho = (canvas.width = window.innerWidth);
    let alto = (canvas.height = window.innerHeight);

    // El pool se crea con el máximo (cantidadBase); "activar menos" solo
    // deja de simular/dibujar las últimas del array, sin recrearlas.
    particulasRef.current = Array.from({ length: cantidadBase }, () =>
      crearParticula(ancho, alto)
    );

    ultimoScrollYRef.current = window.scrollY;

    const onResize = () => {
      ancho = canvas.width = window.innerWidth;
      alto = canvas.height = window.innerHeight;
    };

    const onScroll = () => {
      const actual = window.scrollY;
      const deltaY = actual - ultimoScrollYRef.current;
      ultimoScrollYRef.current = actual;

      const impulso = deltaY * FACTOR_VIENTO;
      vientoRef.current = Math.max(
        -VIENTO_MAXIMO,
        Math.min(VIENTO_MAXIMO, vientoRef.current + impulso)
      );
    };

    const onMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const onMouseLeave = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave, { passive: true });

    let tiempo = 0;
    const sprite = spriteRef.current;

    const animar = () => {
      tiempo += 0.016;
      vientoRef.current *= DECAIMIENTO_VIENTO;

      ctx.clearRect(0, 0, ancho, alto);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const cantidad = cantidadActivaRef.current;

      for (let i = 0; i < cantidad; i++) {
        const p = particulasRef.current[i];

        p.angulo += p.velocidadAngular;
        p.x += Math.cos(p.angulo) * p.velocidad;
        p.y += Math.sin(p.angulo) * p.velocidad + vientoRef.current * 0.3;

        const dx = p.x - mx;
        const dy = p.y - my;
        const distCuadrado = dx * dx + dy * dy;
        if (distCuadrado < RADIO_MOUSE_CUADRADO) {
          const dist = Math.sqrt(distCuadrado) || 1;
          const fuerza = (1 - dist / RADIO_MOUSE) * FUERZA_MOUSE;
          p.x += (dx / dist) * fuerza;
          p.y += (dy / dist) * fuerza;
        }

        if (p.y < -10) p.y = alto + 10;
        if (p.y > alto + 10) p.y = -10;
        if (p.x < -10) p.x = ancho + 10;
        if (p.x > ancho + 10) p.x = -10;

        const parpadeo = (Math.sin(tiempo * 2 + p.fase) + 1) / 2;
        const opacidad = p.opacidadBase * (0.5 + parpadeo * 0.5);
        const diametro = p.radio * 8;

        ctx.globalAlpha = opacidad;
        ctx.drawImage(
          sprite,
          p.x - diametro / 2,
          p.y - diametro / 2,
          diametro,
          diametro
        );
      }
      ctx.globalAlpha = 1;

      frameRef.current = requestAnimationFrame(animar);
    };

    frameRef.current = requestAnimationFrame(animar);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [cantidadBase]);

  return <canvas ref={canvasRef} className={className} />;
});

export default Particles;