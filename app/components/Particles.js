"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const TAMANIO_SPRITE = 24;

const RADIO_MOUSE = 90;
const RADIO_MOUSE_CUADRADO = RADIO_MOUSE * RADIO_MOUSE;
const FUERZA_MOUSE = 1.6;

const FACTOR_VIENTO = 0.045;
const DECAIMIENTO_VIENTO = 0.94;
const VIENTO_MAXIMO = 9;

// "Nivel" de aparición (0 = invisibles, 1 = tamaño/opacidad normal).
// Mientras se está scrolleando el nivel objetivo baja a 0; cuando el scroll se detiene, vuelve a 1.
// NIVEL_LERP: qué tan rápido persigue el nivel actual al objetivo.
// Más chico = transición más lenta y suave. 
const NIVEL_LERP = 0.05;
// Debajo de este nivel ni se dibuja (ahorra trabajo mientras están
// invisibles durante el scroll).
const NIVEL_MINIMO_VISIBLE = 0.01;
// Tamaño con el que "nacen" las partículas al reaparecer (fracción
// del tamaño normal); van creciendo hasta 1 a medida que el nivel
// sube. AJUSTAR ACÁ qué tan chiquitas arrancan.
const ESCALA_MINIMA_REAPARICION = 0.35;
// Cuánto tiempo (ms) sin eventos de scroll para considerar que el
// usuario se detuvo y arrancar la reaparición. 
const SCROLL_QUIETO_MS = 160;

// ---------- Partículas "que caen" ----------

// Qué fracción del total son "permanentes" (deriva libre de
// siempre). El resto son "que caen". AJUSTAR ACÁ la mezcla.
const PROPORCION_PERMANENTES = 0.50;

// De las que "caen": qué fracción va hacia ABAJO vs. hacia la
// DERECHA, y qué fracción se DESVANECE antes de salir de cámara vs.
// simplemente sigue de largo y desaparece recién al cruzar el borde
// (sin fundido). AJUSTAR ACÁ esas proporciones (0 a 1).
const PROPORCION_CAEN_HACIA_ABAJO = 0.2;
const PROPORCION_SE_DESVANECEN = 0.5;

// Velocidad (px/frame) de las que caen, en su eje dominante (vertical
// si van hacia abajo, horizontal si van hacia la derecha). AJUSTAR
// ACÁ qué tan rápido caen/avanzan.
const VELOCIDAD_CAIDA_MIN = 0.1;
const VELOCIDAD_CAIDA_MAX = 0.5;

// Cuánto pueden desviarse en el eje NO dominante mientras caen/avanzan
// (para que no sea una línea perfectamente recta, sino algo más
// orgánico)
const DERIVA_CAIDA_MIN = -0.35;
const DERIVA_CAIDA_MAX = 0.35;

// Zona (en px, medida desde el borde de salida) donde empieza el
// desvanecimiento de las que "se desvanecen": más grande = empiezan
// a desvanecerse antes / el fundido es más largo y suave.
const ZONA_DESVANECIDO_PX = 160;

// Margen (px) más allá del borde de salida antes de reciclar una
// partícula "de corte" (la que NO se desvanece, solo sigue de
// largo) — asegura que ya está bien fuera de cámara antes de
// reaparecer arriba a la izquierda.
const MARGEN_SALIDA_CORTE_PX = 40;

// Región (fracción del ancho/alto de pantalla) donde pueden "nacer"
// las que caen, cerca de la esquina superior izquierda. Más chico =
// nacen más pegadas a la esquina; más grande = repartidas en un área
// mayor.
const ZONA_NACIMIENTO_FRACCION = 0.4;

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

function crearParticulaPermanente(ancho, alto) {
  const angulo = Math.random() * Math.PI * 2;
  const velocidad = Math.random() * 0.3 + 0.05;
  return {
    modo: "permanente",
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

// Deja `p` lista para "nacer" (o renacer) como partícula que cae,
// cerca de la esquina superior izquierda. Se usa tanto para crearlas
// la primera vez como para reciclarlas cuando salen de cámara o
// terminan de desvanecerse.
function nacerComoCayendo(p, ancho, alto) {
  const direccion = Math.random() < PROPORCION_CAEN_HACIA_ABAJO ? "abajo" : "derecha";
  const estiloSalida = Math.random() < PROPORCION_SE_DESVANECEN ? "desvanece" : "corte";
  const velocidad =
    Math.random() * (VELOCIDAD_CAIDA_MAX - VELOCIDAD_CAIDA_MIN) + VELOCIDAD_CAIDA_MIN;
  const deriva = Math.random() * (DERIVA_CAIDA_MAX - DERIVA_CAIDA_MIN) + DERIVA_CAIDA_MIN;

  p.modo = "cayendo";
  p.direccion = direccion;
  p.estiloSalida = estiloSalida;
  p.x = Math.random() * ancho * ZONA_NACIMIENTO_FRACCION;
  p.y = Math.random() * alto * ZONA_NACIMIENTO_FRACCION;
  p.vx = direccion === "derecha" ? velocidad : deriva;
  p.vy = direccion === "abajo" ? velocidad : deriva;
  p.radio = Math.random() * 1.6 + 0.6;
  p.opacidadBase = Math.random() * 0.5 + 0.25;
  p.fase = Math.random() * Math.PI * 2;
  // 1 = totalmente visible; solo baja mientras se está desvaneciendo.
  p.opacidadActual = 1;
  return p;
}

function crearParticula(ancho, alto) {
  if (Math.random() < PROPORCION_PERMANENTES) {
    return crearParticulaPermanente(ancho, alto);
  }
  return nacerComoCayendo({}, ancho, alto);
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
  // Pausa la FÍSICA (movimiento/desvanecimiento) sin ocultar ni
  // desmontar nada: las partículas quedan dibujadas exactamente donde
  // estaban, y al despausar retoman su recorrido desde ahí — sin
  // ningún efecto de "reaparición".
  const pausadoRef = useRef(false);

  // Nivel de aparición: arranca en 1 (visibles) porque al cargar la
  // página no hubo scroll todavía.
  const nivelActualRef = useRef(1);
  const nivelObjetivoRef = useRef(1);

  // Permite al padre subir/bajar cuántas partículas se simulan y
  // dibujan, y pausar/despausar el movimiento, sin desmontar el canvas.
  useImperativeHandle(ref, () => ({
    setCantidad(n) {
      cantidadActivaRef.current = Math.max(
        0,
        Math.min(particulasRef.current.length, n)
      );
    },
    setPausado(valor) {
      pausadoRef.current = valor;
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    spriteRef.current = crearSpritePartícula();

    let ancho = (canvas.width = canvas.clientWidth);
    let alto = (canvas.height = canvas.clientHeight);

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
      const pausado = pausadoRef.current;

      // Con el popup abierto no avanzamos NADA de la física: ni el
      // tiempo (parpadeo), ni el viento, ni el nivel de aparición.
      // Todo queda congelado tal cual estaba.
      if (!pausado) {
        tiempo += 0.016;
        vientoRef.current *= DECAIMIENTO_VIENTO;
        nivelActualRef.current +=
          (nivelObjetivoRef.current - nivelActualRef.current) * NIVEL_LERP;
      }
      const nivel = nivelActualRef.current;

      ctx.clearRect(0, 0, ancho, alto);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const cantidad = cantidadActivaRef.current;

      for (let i = 0; i < cantidad; i++) {
        const p = particulasRef.current[i];

        if (!pausado) {
          if (p.modo === "permanente") {
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

            // Las permanentes envuelven de un borde al otro, nunca
            // desaparecen.
            if (p.y < -10) p.y = alto + 10;
            if (p.y > alto + 10) p.y = -10;
            if (p.x < -10) p.x = ancho + 10;
            if (p.x > ancho + 10) p.x = -10;
          } else {
            // "cayendo": avanza en línea recta-ish hacia su borde de
            // salida, sin viento ni repulsión del mouse (recorrido
            // predecible y prolijo, como polvo cayendo).
            p.x += p.vx;
            p.y += p.vy;

            let salioDeCamara = false;

            if (p.direccion === "abajo") {
              if (p.estiloSalida === "desvanece") {
                const distanciaAlBorde = alto - p.y;
                p.opacidadActual = Math.max(
                  0,
                  Math.min(1, distanciaAlBorde / ZONA_DESVANECIDO_PX)
                );
                if (p.opacidadActual <= 0) salioDeCamara = true;
              } else if (p.y > alto + MARGEN_SALIDA_CORTE_PX) {
                salioDeCamara = true;
              }
            } else {
              // direccion === "derecha"
              if (p.estiloSalida === "desvanece") {
                const distanciaAlBorde = ancho - p.x;
                p.opacidadActual = Math.max(
                  0,
                  Math.min(1, distanciaAlBorde / ZONA_DESVANECIDO_PX)
                );
                if (p.opacidadActual <= 0) salioDeCamara = true;
              } else if (p.x > ancho + MARGEN_SALIDA_CORTE_PX) {
                salioDeCamara = true;
              }
            }

            // Sale de cámara (desvanecida del todo, o cruzó el borde
            // sin fundido): recicla en el momento, "renace" arriba a
            // la izquierda con nueva dirección/estilo al azar.
            if (salioDeCamara) nacerComoCayendo(p, ancho, alto);
          }
        }

        // Por debajo de esto están prácticamente invisibles
        const opacidadExtra = p.modo === "cayendo" ? p.opacidadActual : 1;
        if (nivel < NIVEL_MINIMO_VISIBLE || opacidadExtra <= 0) continue;

        const parpadeo = (Math.sin(tiempo * 2 + p.fase) + 1) / 2;
        const opacidad = p.opacidadBase * (0.5 + parpadeo * 0.5) * nivel * opacidadExtra;
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