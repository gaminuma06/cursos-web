(function () {
  window.ventaLista = true;
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
    $('precio-cta').innerHTML = enLanzamiento() ? `<s>${cop(V.precioNormal)}</s><b>${cop(p)}</b>` : `<b>${cop(p)}</b>`;
  }

  // Cuenta regresiva hasta la fecha de config.js
  function reloj() {
    const r = fin - Date.now();
    if (r <= 0) { $('barra').style.display = 'none'; pintarPrecio(); espacio(); return; }
    const d = Math.floor(r / 864e5), h = Math.floor(r / 36e5) % 24, m = Math.floor(r / 6e4) % 60, s = Math.floor(r / 1e3) % 60;
    const z = (x) => String(x).padStart(2, '0');
    $('reloj').textContent = (d ? d + 'd ' : '') + `${z(h)}:${z(m)}:${z(s)}`;
  }

  // El contenido empieza debajo del contador, mida lo que mida la barra en cada pantalla
  function espacio() { document.querySelector('main').style.paddingTop = ($('barra').offsetHeight + 18) + 'px'; }
  addEventListener('resize', espacio);
  if ('ResizeObserver' in window) new ResizeObserver(espacio).observe($('barra'));   // si la barra cambia de alto (fuentes, giro del celular)
  if (document.fonts) document.fonts.ready.then(espacio);

  pintarPrecio(); reloj(); espacio(); setInterval(reloj, 1000);
  $('anio').textContent = new Date().getFullYear();
  // Contacto: el correo abre el programa de correo y el número abre WhatsApp con un mensaje listo
  const wa = 'https://wa.me/' + V.whatsapp + '?text=' + encodeURIComponent(V.whatsappTexto);
  const tel = V.whatsapp.replace(/^57/, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  $('contacto').innerHTML = '¿Preguntas sobre el Excel? Escríbenos al correo <a href="mailto:' + V.correo + '?subject=' + encodeURIComponent('Pregunta sobre el Excel de Balance Hídrico') + '">' + V.correo + '</a> o por WhatsApp al <a href="' + wa + '" target="_blank" rel="noopener">' + tel + '</a>.';

  // Aparición suave de cada bloque al llegar a él con el scroll
  const bloques = document.querySelectorAll('main > section, main > .boton-borde, main > .cta-portada, .dolores li, .logros li, .para div, .confianza div, .galeria figure');
  const ver = (b) => b.classList.add('visible');
  if (!document.documentElement.classList.contains('anim') || !('IntersectionObserver' in window)) bloques.forEach(ver);
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const b = e.target, i = [...b.parentNode.children].indexOf(b);
      if (b.tagName !== 'SECTION') b.style.transitionDelay = (i % 6) * 70 + 'ms';
      ver(b); io.unobserve(b);
      setTimeout(() => { b.style.transitionDelay = ''; }, 1200);   // el retraso solo aplica a la entrada, no al pasar el mouse
    }), { threshold: 0.12 });
    bloques.forEach((b) => io.observe(b));
  }

  function error(t) { const e = $('error'); e.textContent = t; e.style.display = t ? 'block' : 'none'; }

  // Botón de pago: Apps Script firma el monto (el secreto de integridad nunca llega al navegador) y se abre el widget de Wompi
  // Pago: página de Wompi a pantalla completa (rápida y con scroll normal en celular y PC).
  // La firma se pide al servidor propio (pagos.adanarias.com) apenas abre la landing, para que el clic sea instantáneo.
  let firma = null;
  const pedirFirma = () => firma || (firma = fetch(V.pagosUrl + '/firmar?producto=' + (V.codigo || 'RP'))
    .then((x) => x.json()).then((r) => {
      if (!r.ok) throw new Error(r.error);
      // seguridad: solo se cobra si el servidor devolvió una referencia de ESTE producto (con su precio)
      if (String(r.referencia).indexOf(V.codigo + '-') !== 0) throw new Error('producto');
      return r;
    })
    .catch((e) => { firma = null; throw e; }));
  if (V.pagosUrl) setTimeout(() => pedirFirma().catch(() => {}), 800);

  // Marcas de Meta del navegador: _fbc (clic en un anuncio) y _fbp (este navegador). Viajan con el pedido
  // para que la compra reportada desde el servidor quede ligada al anuncio, aunque el cliente no vuelva a "gracias".
  function marcas() {
    const galleta = (n) => decodeURIComponent((document.cookie.match('(?:^|; )' + n + '=([^;]*)') || [])[1] || '');
    let fbc = galleta('_fbc');
    const fbclid = new URLSearchParams(location.search).get('fbclid');
    if (!fbc && fbclid) fbc = 'fb.1.' + Date.now() + '.' + fbclid;
    return { fbc: fbc, fbp: galleta('_fbp'), navegador: navigator.userAgent };
  }
  function guardarMarcas(ref) {
    try {
      const m = marcas();
      if (!m.fbc && !m.fbp) return;
      const q = new URLSearchParams({ ref: ref, fbc: m.fbc, fbp: m.fbp, navegador: m.navegador });
      fetch(V.pagosUrl + '/marcar?' + q, { keepalive: true, mode: 'no-cors' }).catch(() => {});
    } catch (e) { /* nunca debe impedir el pago */ }
  }

  function irAlCheckout(r) {
    guardarMarcas(r.referencia);
    const w = new URLSearchParams({
      'public-key': V.wompiLlavePublica, currency: 'COP', 'amount-in-cents': String(r.montoCentavos),
      reference: r.referencia, 'signature:integrity': r.firma, 'redirect-url': V.redireccion
    });
    location.href = 'https://checkout.wompi.co/p/?' + w;
  }

  $('comprar').addEventListener('click', async () => {
    error('');
    if (!V.wompiLlavePublica || !V.pagosUrl) return error('Los pagos se están configurando. Vuelve en unas horas o escríbenos.');
    if (window.fbq) fbq('track', 'InitiateCheckout', { value: precioActual(), currency: 'COP', content_name: 'Balance Hídrico y Riego en Excel' });
    const b = $('comprar'); b.disabled = true; b.textContent = 'Abriendo el pago seguro…';
    try {
      irAlCheckout(await pedirFirma());
    } catch (e) {
      error('No pudimos abrir el pago. Revisa tu conexión e intenta de nuevo, o escríbenos.');
      b.disabled = false; b.innerHTML = '<span class="ico-w">🔒</span> Pagar con Wompi';
    }
  });
  // Si el cliente vuelve con el botón "atrás", el botón queda listo otra vez
  addEventListener('pageshow', () => { const b = $('comprar'); b.disabled = false; b.innerHTML = '<span class="ico-w">🔒</span> Pagar con Wompi'; });
})();
