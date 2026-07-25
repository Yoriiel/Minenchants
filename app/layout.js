import "./globals.css";

export const metadata = {
  title: "Minenchants",
  description: "Mejores encantamientos para armas y armaduras",
  keywords: "Encantamientos, Armas, Armaduras, Minecraft, Encantar, Bedrock",
  authors: [{ name: "Yoriiel" }],
  icons: {
    shortcut: "/icon/MesaIcon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html className="container" lang="es" dir="ltr">
      <head>
        <link
          href="https://unpkg.com/boxicons@2.0.7/css/boxicons.min.css"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
        {/* Fallback pixelado para "Mojangles" (ver app/styles/fonts.css):
            si no agregás el archivo real de Mojangles en /public/fonts,
            esta es la que termina usándose en los textos de encantamientos. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
        {/* Mismos colores de texto en blanco que en el index.html original */}
        <style>{`
          img { color: #FFFFFF; }
          h1 { color: #FFFFFF; }
          h2 { color: #FFFFFF; }
          p { color: #FFFFFF; }
          a { color: #FFFFFF; }
          time { color: #FFFFFF; }
          li { color: #FFFFFF; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
