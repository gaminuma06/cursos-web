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

  pintarPrecio(); reloj(); espacio(); setInterval(reloj, 1000);
  $('anio').textContent = new Date().getFullYear();
  // Contacto: el correo abre el programa de correo y el número abre WhatsApp con un mensaje listo
  const wa = 'https://wa.me/' + V.whatsapp + '?text=' + encodeURIComponent(V.whatsappTexto);
  const tel = V.whatsapp.replace(/^57/, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  $('contacto').innerHTML = '¿Preguntas sobre el manual? Escríbenos al correo <a href="mailto:' + V.correo + '?subject=' + encodeURIComponent('Pregunta sobre el Manual de Riego en Palma') + '">' + V.correo + '</a> o por WhatsApp al <a href="' + wa + '" target="_blank" rel="noopener">' + tel + '</a>.';

  // Aparición suave de cada bloque al llegar a él con el scroll
  const bloques = document.querySelectorAll('main > section, main > .boton-borde, .dolores li, .logros li, .para div, .confianza div');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } }), { threshold: 0.12 });
    bloques.forEach((b, i) => { b.classList.add('aparece'); b.style.transitionDelay = (b.tagName === 'LI' || b.tagName === 'DIV' ? (i % 6) * 70 : 0) + 'ms'; io.observe(b); });
  }

  function error(t) { const e = $('error'); e.textContent = t; e.style.display = t ? 'block' : 'none'; }

  // Botón de pago: Apps Script firma el monto (el secreto de integridad nunca llega al navegador) y se abre el widget de Wompi
  $('comprar').addEventListener('click', async () => {
    error('');
    if (!V.wompiLlavePublica || !V.appsScriptUrl || typeof WidgetCheckout === 'undefined')
      return error('Los pagos se están configurando. Vuelve en unas horas o escríbenos.');
    const b = $('comprar'); b.disabled = true; b.textContent = 'Abriendo el pago…';
    try {
      const r = await fetch(V.appsScriptUrl + '?accion=firmar').then((x) => x.json());
      if (!r.ok) throw new Error(r.error || 'sin firma');
      new WidgetCheckout({
        currency: 'COP', amountInCents: r.montoCentavos, reference: r.referencia,
        publicKey: V.wompiLlavePublica, signature: { integrity: r.firma }, redirectUrl: V.redireccion
      }).open((res) => {
        const t = res && res.transaction;
        if (t && t.id) location.href = V.redireccion + '?id=' + encodeURIComponent(t.id);
      });
    } catch (e) {
      error('No pudimos abrir el pago. Intenta de nuevo en un momento.');
    }
    b.disabled = false; b.innerHTML = '<span class="ico-w">🔒</span> Pagar con Wompi';
  });
})();
