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

// "Nivel" de aparición (0 = invisibles, 1 = tamaño/opacidad normal).
// Mientras se está scrolleando (en cualquier dirección) el nivel
// objetivo baja a 0; cuando el scroll se detiene, vuelve a 1. El
// nivel ACTUAL persigue a ese objetivo con un lerp cada frame, así
// el cambio siempre es progresivo y nunca un salto brusco.
//
// NIVEL_LERP: qué tan rápido persigue el nivel actual al objetivo.
// Más chico = transición más lenta y suave. AJUSTAR ACÁ.
const NIVEL_LERP = 0.05;
// Debajo de este nivel ni se dibuja (ahorra trabajo mientras están
// invisibles durante el scroll).
const NIVEL_MINIMO_VISIBLE = 0.01;
// Tamaño con el que "nacen" las partículas al reaparecer (fracción
// del tamaño normal); van creciendo hasta 1 a medida que el nivel
// sube. AJUSTAR ACÁ qué tan chiquitas arrancan.
const ESCALA_MINIMA_REAPARICION = 0.35;
// Cuánto tiempo (ms) sin eventos de scroll para considerar que el
// usuario se detuvo y arrancar la reaparición. AJUSTAR ACÁ.
const SCROLL_QUIETO_MS = 160;

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

  // Nivel de aparición: arranca en 1 (visibles) porque al cargar la
  // página no hubo scroll todavía.
  const nivelActualRef = useRef(1);
  const nivelObjetivoRef = useRef(1);

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

    // Medimos el tamaño REAL del canvas ya puesto en el layout (su
    // caja CSS), no siempre window.innerWidth/innerHeight. En
    // escritorio el canvas es fixed a toda la pantalla, así que da
    // igual (coincide). En el canvas chico del header en móvil, en
    // cambio, el canvas mide lo mismo que el header (position:
    // absolute + width/height:100% dentro de él) — si acá
    // siguiéramos usando el viewport completo, las partículas
    // quedarían mal ubicadas/estiradas dentro de esa caja más chica.
    let ancho = (canvas.width = canvas.clientWidth);
    let alto = (canvas.height = canvas.clientHeight);

    // El pool se crea con el máximo (cantidadBase); "activar menos" solo
    // deja de simular/dibujar las últimas del array, sin recrearlas.
    particulasRef.current = Array.from({ length: cantidadBase }, () =>
      crearParticula(ancho, alto)
    );

    ultimoScrollYRef.current = window.scrollY;

    const onResize = () => {
      ancho = canvas.width = canvas.clientWidth;
      alto = canvas.height = canvas.clientHeight;
    };

    let idTimeoutScrollQuieto = null;

    const onScroll = () => {
      const actual = window.scrollY;
      const deltaY = actual - ultimoScrollYRef.current;
      ultimoScrollYRef.current = actual;

      const impulso = deltaY * FACTOR_VIENTO;
      vientoRef.current = Math.max(
        -VIENTO_MAXIMO,
        Math.min(VIENTO_MAXIMO, vientoRef.current + impulso)
      );

      // Mientras hay eventos de scroll llegando, las apagamos. Cada
      // evento nuevo reinicia el temporizador de "se detuvo"; recién
      // cuando pasan SCROLL_QUIETO_MS sin ningún evento más, se las
      // vuelve a prender (sea que el destino fue el header o la
      // sección 2 — no importa la dirección).
      nivelObjetivoRef.current = 0;
      if (idTimeoutScrollQuieto) clearTimeout(idTimeoutScrollQuieto);
      idTimeoutScrollQuieto = window.setTimeout(() => {
        nivelObjetivoRef.current = 1;
      }, SCROLL_QUIETO_MS);
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

      // Persigue el nivel objetivo (0 mientras se scrollea, 1 cuando
      // está quieto) de a poco: esto es lo que hace que el
      // apagado/reaparición se vea progresivo y no un salto.
      nivelActualRef.current +=
        (nivelObjetivoRef.current - nivelActualRef.current) * NIVEL_LERP;
      const nivel = nivelActualRef.current;

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

        // Por debajo de esto están prácticamente invisibles: nos
        // ahorramos el drawImage (siguen "vivas" y moviéndose, solo
        // que no se pintan) mientras se está scrolleando.
        if (nivel < NIVEL_MINIMO_VISIBLE) continue;

        const parpadeo = (Math.sin(tiempo * 2 + p.fase) + 1) / 2;
        const opacidad = p.opacidadBase * (0.5 + parpadeo * 0.5) * nivel;
        // La escala acompaña al nivel: al reaparecer, la partícula
        // "nace" chica (ESCALA_MINIMA_REAPARICION) y va creciendo
        // hasta su tamaño normal a medida que el nivel llega a 1.
        const escala =
          ESCALA_MINIMA_REAPARICION + (1 - ESCALA_MINIMA_REAPARICION) * nivel;
        const diametro = p.radio * 8 * escala;

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
      if (idTimeoutScrollQuieto) clearTimeout(idTimeoutScrollQuieto);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [cantidadBase]);

  return <canvas ref={canvasRef} className={className} />;
});

export default Particles;