"use client";

import { ConfiguracionProvider } from "../context/ConfiguracionContext";
import { IdiomaProvider } from "../context/IdiomaContext";

export default function ProveedorApp({ children }) {
  return (
    <ConfiguracionProvider>
      <IdiomaProvider>{children}</IdiomaProvider>
    </ConfiguracionProvider>
  );
}
