// Configuración de la venta. Solo datos públicos: los secretos de Wompi van en Apps Script, nunca aquí.
window.VENTA = {
  producto: 'Balance Hídrico y Riego en Excel',
  precio: 19900,                 // COP, precio de lanzamiento
  precioNormal: 39900,           // COP, se cobra cuando termina el lanzamiento
  finLanzamiento: '2026-11-07T23:59:00-05:00',
  garantiaDias: 0,
  codigo: 'BH',                  // prefijo de la referencia en Wompi: así Apps Script sabe qué cobrar y qué entregar
  wompiLlavePublica: 'pub_prod_xbNAm4zEHLvll5b1dsYhcOzXerJ3Q4Xj',     // la misma cuenta de Wompi del manual
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbzle4V1Ezuqbux6pXXmFYg4tRufVM-09Ygzz-vThqQO2lNn_jFjKye5b9svrXEr0RlN/exec',   // el mismo Apps Script y la misma hoja de pedidos del manual
  redireccion: 'https://cursos.adanarias.com/balance_hidrico/gracias.html',
  correo: 'ingarias9006@gmail.com',
  whatsapp: '573012251358',
  whatsappTexto: 'Hola, tengo una pregunta sobre el Excel de Balance Hídrico y Riego'
};
