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
  $('contacto').innerHTML = '¿Preguntas sobre el manual? Escríbenos al correo <a href="mailto:' + V.correo + '?subject=' + encodeURIComponent('Pregunta sobre el Manual de Riego en Palma') + '">' + V.correo + '</a> o por WhatsApp al <a href="' + wa + '" target="_blank" rel="noopener">' + tel + '</a>.';

  // Aparición suave de cada bloque al llegar a él con el scroll
  const bloques = document.querySelectorAll('main > section, main > .boton-borde, main > .cta-portada, .dolores li, .logros li, .para div, .confianza div');
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
  // Si el widget de Wompi no cargó (conexión lenta o un bloqueador del navegador), se usa la página de pago de Wompi
  function irAlCheckout(r) {
    const w = new URLSearchParams({
      'public-key': V.wompiLlavePublica, currency: 'COP', 'amount-in-cents': String(r.montoCentavos),
      reference: r.referencia, 'signature:integrity': r.firma, 'redirect-url': V.redireccion
    });
    location.href = 'https://checkout.wompi.co/p/?' + w;
  }
  const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));
  async function widgetListo() {
    for (let i = 0; i < 10 && typeof WidgetCheckout === 'undefined'; i++) await esperar(300);   // hasta 3 s
    return typeof WidgetCheckout !== 'undefined';
  }

  $('comprar').addEventListener('click', async () => {
    error('');
    if (!V.wompiLlavePublica || !V.appsScriptUrl) return error('Los pagos se están configurando. Vuelve en unas horas o escríbenos.');
    const b = $('comprar'); b.disabled = true; b.textContent = 'Abriendo el pago…';
    const listo = () => { b.disabled = false; b.innerHTML = '<span class="ico-w">🔒</span> Pagar con Wompi'; };
    try {
      const r = await fetch(V.appsScriptUrl + '?accion=firmar').then((x) => x.json());
      if (!r.ok) throw new Error(r.error || 'sin firma');
      if (!(await widgetListo())) return irAlCheckout(r);
      new WidgetCheckout({
        currency: 'COP', amountInCents: r.montoCentavos, reference: r.referencia,
        publicKey: V.wompiLlavePublica, signature: { integrity: r.firma }, redirectUrl: V.redireccion
      }).open((res) => {
        const t = res && res.transaction;
        if (t && t.id) location.href = V.redireccion + '?id=' + encodeURIComponent(t.id);
      });
      listo();
    } catch (e) {
      error('No pudimos abrir el pago. Revisa tu conexión e intenta de nuevo, o escríbenos.');
      listo();
    }
  });
})();
