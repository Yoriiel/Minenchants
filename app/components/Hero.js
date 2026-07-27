import Particles from "./Particles";

/**
 * En escritorio, page.js monta un canvas de partículas grande y
 * fijo a la página (cubre header + sección 2). En móvil ese NO se
 * monta; en su lugar, Hero monta acá su propio canvas de partículas
 * más chico y absoluto — queda acotado al recuadro del header
 * (gracias a `.seccion { position: relative; overflow: hidden }`),
 * así que nunca se ve sobre la sección 2.
 */
export default function Hero({ particulasMovil = false, cantidadParticulasMovil = 15 }) {
  return (
    <header className="seccion seccion-hero">
      {particulasMovil && (
        <Particles
          className="canvas-particulas-movil"
          cantidadBase={cantidadParticulasMovil}
        />
      )}

      <div className="hero-contenido">
        <div className="contenedor-logo">
          <img
            src="/img/Minenchants-bedrock.png"
            alt="Minenchants Bedrock Edition"
            className="hero-logo"
          />
          <span className="texto-splash">Estos son los Mejores!</span>
        </div>

        <div className="menu-minecraft">
          <a href="#seccion-marcadores" className="btn-mc btn-largo">Encantar!</a>
          <button className="btn-mc btn-largo">Multiplayer</button>
          <button className="btn-mc btn-largo">Minecraft Realms</button>

          <div className="fila-botones-inferior">
            <button className="btn-mc btn-cuadrado" aria-label="Language">
              🌍
            </button>
            <button className="btn-mc btn-mitad">Opciones...</button>
            <button className="btn-mc btn-mitad">Contacto...</button>
            <button className="btn-mc btn-cuadrado" aria-label="Accessibility">
              ♿
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}