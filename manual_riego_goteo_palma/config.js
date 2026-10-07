// Configuración de la venta. Solo datos públicos: los secretos de Wompi van en Apps Script, nunca aquí.
window.VENTA = {
  producto: 'Manual Visual de Riego por Goteo en Palma de Aceite + 3 bonos',
  precio: 39900,                 // COP, precio de lanzamiento
  precioNormal: 79900,           // COP, se cobra cuando termina el lanzamiento
  finLanzamiento: '2026-11-07T23:59:00-05:00',   // fecha real del fin del precio de lanzamiento
  garantiaDias: 0,               // 0 = no se muestra la garantía
  wompiLlavePublica: 'pub_test_YrO3n7FYeKYaqrU6hJVmwqhouKNA1ocw',         // pub_prod_... (la pegas tú desde el panel de Wompi)
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbzle4V1Ezuqbux6pXXmFYg4tRufVM-09Ygzz-vThqQO2lNn_jFjKye5b9svrXEr0RlN/exec',             // https://script.google.com/macros/s/.../exec (firma y registro del pedido)
  redireccion: 'https://cursos.adanarias.com/manual_riego_goteo_palma/gracias.html',
  correo: 'ingarias9006@gmail.com',
  whatsapp: '573012251358',      // con indicativo 57, solo números
  whatsappTexto: 'Hola, tengo una pregunta sobre el Manual de Riego por Goteo en Palma'
};
