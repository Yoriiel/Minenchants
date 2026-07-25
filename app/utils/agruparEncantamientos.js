// Reparte una lista de encantamientos en los 3 recuadros de la derecha,
// de a 2 por recuadro y de arriba hacia abajo.
//
// Ejemplos:
//   6 encantamientos -> [ [e1,e2], [e3,e4], [e5,e6] ]
//   5 encantamientos -> [ [e1,e2], [e3,e4], [e5]     ]
//   4 encantamientos -> [ [e1,e2], [e3,e4], []        ]
//
// Si en algún momento un ítem tuviera más de 6 encantamientos, los que
// sobren simplemente no se muestran (no hay más recuadros disponibles).

const ENCANTAMIENTOS_POR_RECUADRO = 2;
const CANTIDAD_RECUADROS = 3;

export function agruparEncantamientos(encantamientos = []) {
  const grupos = Array.from({ length: CANTIDAD_RECUADROS }, () => []);

  encantamientos.forEach((encantamiento, indice) => {
    const indiceRecuadro = Math.floor(indice / ENCANTAMIENTOS_POR_RECUADRO);
    if (indiceRecuadro < CANTIDAD_RECUADROS) {
      grupos[indiceRecuadro].push(encantamiento);
    }
  });

  return grupos;
}
