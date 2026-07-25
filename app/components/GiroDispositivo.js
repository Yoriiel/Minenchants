/**
 * Aviso a pantalla completa que tapa el popup cuando el usuario está
 * en un celular en modo vertical: le pide girarlo. Desaparece solo
 * cuando el dispositivo pasa a horizontal (lo controla el hook
 * useOrientacionMovil desde page.js, este componente es solo visual).
 */
export default function GiroDispositivo() {
  return (
    <div className="giro-fondo" role="alert">
      <svg className="giro-icono" viewBox="0 0 100 100" aria-hidden="true">
        <rect
          x="30"
          y="10"
          width="40"
          height="70"
          rx="6"
          fill="none"
          stroke="#ffffff"
          strokeWidth="5"
        />
        <circle cx="50" cy="72" r="2.5" fill="#ffffff" />
      </svg>
      <p className="giro-texto">Girá tu teléfono para ver la mesa de encantamientos</p>
    </div>
  );
}
