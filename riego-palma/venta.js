(function () {
  const V = window.VENTA;
  const $ = (id) => document.getElementById(id);
  const cop = (n) => '$' + n.toLocaleString('es-CO') + ' COP';
  const fin = new Date(V.finLanzamiento).getTime();
  const enLanzamiento = () => Date.now() < fin;
  const precioActual = () => (enLanzamiento() ? V.precio : V.precioNormal);

  function pintarPrecio() {
    const p = precioActual();
    const dto = Math.round((1 - V.precio / V.precioNormal) * 100);
    $('precio').innerHTML = enLanzamiento() ? `<s>${cop(V.precioNormal)}</s>${cop(p)} <span class="desc">↓ ${dto}%</span>` : cop(p);
    $('precio2').textContent = cop(p);
  }

  // Cuenta regresiva hasta la fecha real de fin del lanzamiento (no se reinicia)
  function reloj() {
    const r = fin - Date.now();
    if (r <= 0) { $('barra').style.display = 'none'; pintarPrecio(); return; }
    const d = Math.floor(r / 864e5), h = Math.floor(r / 36e5) % 24, m = Math.floor(r / 6e4) % 60, s = Math.floor(r / 1e3) % 60;
    const z = (x) => String(x).padStart(2, '0');
    $('reloj').textContent = (d ? d + 'd ' : '') + `${z(h)}:${z(m)}:${z(s)}`;
  }

  // El contenido empieza debajo del contador, mida lo que mida la barra en cada pantalla
  function espacio() { document.querySelector('main').style.paddingTop = ($('barra').offsetHeight + 18) + 'px'; }
  addEventListener('resize', espacio);

  pintarPrecio(); reloj(); espacio(); setInterval(reloj, 1000);
  $('anio').textContent = new Date().getFullYear();
  if (V.contacto) $('contacto').textContent = '¿Preguntas sobre el manual? Escríbenos: ' + V.contacto;

  function error(t) { const e = $('error'); e.textContent = t; e.style.display = t ? 'block' : 'none'; }

  $('form').addEventListener('submit', async (ev) => {
    ev.preventDefault(); error('');
    const d = {
      correo: $('correo').value.trim().toLowerCase(), correo2: $('correo2').value.trim().toLowerCase(),
      nombre: $('nombre').value.trim(), cedula: $('cedula').value.replace(/\D/g, ''), celular: $('celular').value.replace(/[^\d+]/g, '')
    };
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.correo)) return error('Revisa tu correo.');
    if (d.correo !== d.correo2) return error('Los dos correos no coinciden.');
    if (d.nombre.split(/\s+/).length < 2) return error('Escribe tu nombre y apellido.');
    if (d.cedula.length < 5 || d.cedula.length > 12) return error('Revisa tu cédula: solo números.');
    if (d.celular.replace('+', '').length < 10) return error('Revisa tu celular.');
    if (!V.wompiLlavePublica || !V.appsScriptUrl) return error('Los pagos se están configurando. Vuelve en unas horas.');

    const b = $('comprar'); b.disabled = true; b.textContent = 'Preparando el pago…';
    try {
      // Apps Script registra el pedido y firma el monto con el secreto de integridad (que nunca llega al navegador)
      const q = new URLSearchParams({ accion: 'firmar', correo: d.correo, nombre: d.nombre, cedula: d.cedula, celular: d.celular });
      const r = await fetch(V.appsScriptUrl + '?' + q).then((x) => x.json());
      if (!r.ok) throw new Error(r.error || 'sin firma');
      const w = new URLSearchParams({
        'public-key': V.wompiLlavePublica, currency: 'COP', 'amount-in-cents': String(r.montoCentavos),
        reference: r.referencia, 'signature:integrity': r.firma, 'redirect-url': V.redireccion,
        'customer-data:email': d.correo, 'customer-data:full-name': d.nombre,
        'customer-data:phone-number': d.celular.replace('+57', ''), 'customer-data:phone-number-prefix': '+57',
        'customer-data:legal-id': d.cedula, 'customer-data:legal-id-type': 'CC'
      });
      location.href = 'https://checkout.wompi.co/p/?' + w;
    } catch (e) {
      error('No pudimos preparar el pago. Intenta de nuevo en un momento.');
      b.disabled = false; b.textContent = 'Comprar ahora';
    }
  });
})();
