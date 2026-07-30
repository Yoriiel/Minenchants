"use client";

import { useIdioma } from "../context/IdiomaContext";
import { tituloSegunIdioma } from "../utils/buscarItems";

/**
 * Pieza visual "de adentro" del buscador: el input + botón de flecha
 * + lista de sugerencias + mensaje de error. No sabe nada de cómo se
 * abre/cierra por afuera (eso lo maneja cada wrapper: el del header
 * en la Parte 3, el del popup en la Parte 4) — solo necesita que le
 * pasen el estado del hook `useBuscadorAutocompletado` y listo.
 *
 * `className` permite que cada wrapper le agregue sus propias clases
 * (para diferenciarlos visualmente sin duplicar el componente).
 */
export default function CampoBusqueda({
  consulta,
  sugerencias,
  error,
  onCambiarConsulta,
  onEnviar,
  onSeleccionarSugerencia,
  inputRef,
  className = "",
}) {
  const { t, idioma } = useIdioma();

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onEnviar();
    }
  };

  return (
    <div className={`campo-busqueda${className ? ` ${className}` : ""}`}>
      <div className="campo-busqueda-fila">
        <input
          ref={inputRef}
          type="text"
          value={consulta}
          onChange={(e) => onCambiarConsulta(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t("buscarPlaceholder")}
          className="campo-busqueda-input"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          className="campo-busqueda-boton-enviar"
          onClick={onEnviar}
          aria-label={t("buscarEnviarAria")}
        >
          {/* Flecha apuntando a la derecha — SVG propio, sin
              librerías externas de íconos. */}
          <svg viewBox="0 0 24 24" className="campo-busqueda-flecha" aria-hidden="true">
            <path
              d="M4 12h14m0 0-6-6m6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {sugerencias.length > 0 && (
        <ul className="campo-busqueda-sugerencias">
          {sugerencias.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="campo-busqueda-sugerencia"
                onClick={() => onSeleccionarSugerencia(item)}
              >
                {tituloSegunIdioma(item, idioma)}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="campo-busqueda-error">{t("itemNoEncontrado")}</p>}
    </div>
  );
}
