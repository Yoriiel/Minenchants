export default function Hero() {
  return (
    <header className="seccion seccion-hero">
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
