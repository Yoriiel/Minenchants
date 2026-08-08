// genera automáticamente /robots.txt permitiendo el rastreo completo del sitio
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
  };
}
