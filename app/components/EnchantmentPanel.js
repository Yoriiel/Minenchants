import { agruparEncantamientos } from "../utils/agruparEncantamientos";

/**
 * Los 3 recuadros anchos a la derecha del libro, con los encantamientos
 * del ítem que está en la casilla principal repartidos de a 2 por
 * recuadro (ver utils/agruparEncantamientos.js). Si no hay ítem en la
 * casilla principal, no se renderiza nada.
 */
export default function EnchantmentPanel({ item }) {
  if (!item) return null;

  const grupos = agruparEncantamientos(item.encantamientos);

  return (
    <div className="popup-encantamientos">
      {grupos.map((grupo, indice) => (
        <div className="popup-encantamiento-recuadro" key={indice}>
          {grupo.map((encantamiento) => (
            <span className="popup-encantamiento-linea" key={encantamiento}>
              {encantamiento}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
