let carrito = {};

function cargarCarritoDesdeStorage() {
    const guardado = localStorage.getItem("carritoCarbon");
    if (!guardado) return;

    carrito = JSON.parse(guardado);

    for (const [id, item] of Object.entries(carrito)) {
        const span = document.getElementById(`cant${id.replace('card-', '')}`);
        if (span) span.innerText = item.cantidad;

        const card = document.getElementById(id);
        if (card && item.cantidad > 0) card.classList.add('activo');
    }

    recalcularTotal();
}

function guardarCarritoStorage() {
    localStorage.setItem("carritoCarbon", JSON.stringify(carrito));
}

function cambiarCant(idSpan, idCard, delta, precio) {
    const span = document.getElementById(idSpan);
    const card = document.getElementById(idCard);
    if (!span || !card) return;

    let cant = Math.max(0, (parseInt(span.textContent) || 0) + delta);
    span.textContent = cant;

    const nombre = card.querySelector('h3')?.textContent.trim() || idCard;

    if (cant > 0) {
        carrito[idCard] = { nombre, precio, cantidad: cant };
        card.classList.add('activo');
    } else {
        delete carrito[idCard];
        card.classList.remove('activo');
    }

    guardarCarritoStorage();
    recalcularTotal();
    animarBoton(span.closest('.control-cantidad'));
}

function animarBoton(contenedor) {
    if (!contenedor) return;
    contenedor.style.transform = 'scale(1.12)';
    setTimeout(() => contenedor.style.transform = '', 180);
}

function recalcularTotal() {
    let subtotal = 0;
    for (const id in carrito) {
        subtotal += carrito[id].precio * carrito[id].cantidad;
    }

    const esDelivery = document.getElementById('tipoEntrega')?.value === 'delivery';
    const total = subtotal + (esDelivery ? 10 : 0);

    const elSubtotal = document.getElementById('txtSubtotal');
    const elTotal = document.getElementById('txtTotal');

    if (elSubtotal) animarNumero(elSubtotal, `S/ ${subtotal.toFixed(2)}`);
    if (elTotal) animarNumero(elTotal, `S/ ${total.toFixed(2)}`);
}

function animarNumero(el, nuevoValor) {
    if (el.innerText === nuevoValor) return;
    el.style.transition = 'opacity 0.18s';
    el.style.opacity = '0';
    setTimeout(() => {
        el.innerText = nuevoValor;
        el.style.opacity = '1';
    }, 180);
}

function verificarDelivery() {
    const tipo = document.getElementById('tipoEntrega')?.value;
    const cajaDelivery = document.getElementById('cajaDelivery');
    const cajaRecojo = document.getElementById('cajaRecojo');
    const filaDelivery = document.getElementById('filaDelivery');

    if (cajaDelivery) cajaDelivery.style.display = tipo === 'delivery' ? 'block' : 'none';
    if (cajaRecojo) cajaRecojo.style.display = tipo === 'recojo' ? 'block' : 'none';
    if (filaDelivery) filaDelivery.style.display = tipo === 'delivery' ? '' : 'none';

    recalcularTotal();
}

function procesarPedido() {
    const nombre = document.getElementById('nombreCliente')?.value.trim();
    if (!nombre) return mostrarToast('Ingresa tu nombre para continuar', 'error');
    if (Object.keys(carrito).length === 0) return mostrarToast('Tu carrito está vacío', 'error');

    const tipo = document.getElementById('tipoEntrega')?.value;
    let direccion = '', telefono = '', local = '';

    if (tipo === 'delivery') {
        direccion = document.getElementById('direccionCliente')?.value.trim();
        telefono = document.getElementById('telefonoCliente')?.value.trim();
        if (!direccion || !telefono) return mostrarToast('Completa la dirección y tu celular', 'error');
    } else {
        local = document.getElementById('localRecojo')?.value;
    }

    let resumen = `PEDIDO\nCliente: ${nombre}\n`;
    resumen += tipo === 'delivery'
        ? `Dirección: ${direccion}\nTeléfono: ${telefono}\n`
        : `Recojo en: ${local}\n`;
    resumen += '\nProductos:\n';

    for (const id in carrito) {
        const { nombre: prod, precio, cantidad } = carrito[id];
        resumen += `${cantidad}x ${prod} - S/ ${(precio * cantidad).toFixed(2)}\n`;
    }

    resumen += `\nTotal: ${document.getElementById('txtTotal').innerText}`;
    mostrarModalConfirmacion('¡Pedido recibido!', resumen, 'Te escribiremos por WhatsApp pronto.');
}

function confirmarReserva() {
    const campos = ['nombre', 'telefono', 'fecha', 'personas', 'hora-inicio', 'sede'];
    const valores = {};

    for (const campo of campos) {
        const el = document.getElementById(campo);
        if (!el || !el.value.trim()) return mostrarToast('Completa todos los campos obligatorios', 'error');
        valores[campo] = el.value.trim();
    }

    const ocasion = document.getElementById('ocasion')?.value || '';
    const notas = document.getElementById('notas')?.value.trim() || '';

    let resumen = `Reserva\nNombre: ${valores['nombre']}\nFecha: ${valores['fecha']} - ${valores['hora-inicio']}\nPersonas: ${valores['personas']}\nSede: ${valores['sede']}`;
    if (ocasion) resumen += `\nOcasión: ${ocasion}`;
    if (notas) resumen += `\nNotas: ${notas}`;

    mostrarModalConfirmacion('¡Reserva confirmada!', resumen, 'Te contactaremos por WhatsApp.');
}

function seleccionarHorarioSelect(hora) {
    const inputHora = document.getElementById('hora-inicio');
    const inputDisplay = document.getElementById('hora-display');

    if (inputHora) inputHora.value = hora;
    if (inputDisplay) inputDisplay.value = hora || 'Sin horario';
    if (!hora) return;

    const horas = ["12:00 pm","12:30 pm","1:00 pm","1:30 pm","2:00 pm","2:30 pm","3:00 pm","7:00 pm","7:30 pm","8:00 pm","8:30 pm","9:00 pm"];
    const idx = horas.indexOf(hora);
    const selectFin = document.getElementById('hora-fin');
    if (!selectFin) return;

    selectFin.innerHTML = '<option value="">Seleccionar</option>';
    if (idx !== -1) {
        for (let i = idx + 3; i < horas.length; i++) {
            const op = document.createElement('option');
            op.value = horas[i];
            op.textContent = horas[i];
            selectFin.appendChild(op);
        }
    }
}

function filtrarCategoria(cat, btn) {
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('activo'));
    btn.classList.add('activo');

    document.querySelectorAll('.item-pedido, .pedido-seccion-titulo').forEach(el => {
        el.style.display = cat === 'todos' || el.dataset.cat === cat ? '' : 'none';
    });
}

function mostrarCategoria(cat, btn) {
    document.querySelectorAll('.menu-categoria').forEach(c => c.classList.remove('visible'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('activo'));

    if (cat === 'todo') {
        document.querySelectorAll('.menu-categoria').forEach(c => c.classList.add('visible'));
    } else {
        document.getElementById('cat-' + cat)?.classList.add('visible');
    }

    btn?.classList.add('activo');
}

let indiceTestimonio = 0;
const testimonios = [
    { texto: "El mejor pollo a la brasa de Lima. La parrilla es espectacular, y el ambiente muy familiar.", autor: "Maria G." },
    { texto: "Excelente atención y sabor único. Volveré cada semana.", autor: "Carlos R." },
    { texto: "Precios justos y calidad premium. Los anticuchos son increíbles.", autor: "Lucia F." }
];

function actualizarTestimonio() {
    const el = document.getElementById('testimonioTexto');
    if (!el) return;

    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';

    setTimeout(() => {
        const { texto, autor } = testimonios[indiceTestimonio];
        el.innerHTML = `
            <i class="fa-solid fa-quote-left"></i>
            <p>"${texto}"</p>
            <h4>— ${autor}</h4>
        `;
        el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    }, 220);
}

function iniciarTestimonios() {
    const prev = document.getElementById('testimonioPrev');
    const next = document.getElementById('testimonioNext');
    if (!prev || !next) return;

    prev.addEventListener('click', () => {
        indiceTestimonio = (indiceTestimonio - 1 + testimonios.length) % testimonios.length;
        actualizarTestimonio();
    });

    next.addEventListener('click', () => {
        indiceTestimonio = (indiceTestimonio + 1) % testimonios.length;
        actualizarTestimonio();
    });

    actualizarTestimonio();
    setInterval(() => {
        indiceTestimonio = (indiceTestimonio + 1) % testimonios.length;
        actualizarTestimonio();
    }, 6000);
}

function animarContadores() {
    const contadores = document.querySelectorAll('.stat-numero[data-target]');
    if (!contadores.length) return;

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const objetivo = parseInt(el.getAttribute('data-target'));
            let actual = 0;
            const paso = objetivo / 50;

            const timer = setInterval(() => {
                actual += paso;
                if (actual >= objetivo) {
                    el.textContent = objetivo;
                    clearInterval(timer);
                } else {
                    el.textContent = Math.floor(actual);
                }
            }, 20);

            obs.unobserve(el);
        });
    }, { threshold: 0.5 });

    contadores.forEach(c => obs.observe(c));
}

let indiceCarrusel = 0;
let totalSlides = 0;
let timerCarrusel = null;

function initCarruselHero() {
    const track = document.getElementById('heroCarruselTrack');
    if (!track) return;

    const slides = track.querySelectorAll('.hero-carrusel-slide');
    totalSlides = slides.length;

    const dotsWrapper = document.getElementById('heroCarruselDots');
    if (dotsWrapper) {
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'hero-carrusel-dot' + (i === 0 ? ' activo' : '');
            dot.setAttribute('aria-label', `Slide ${i + 1}`);
            dot.addEventListener('click', () => { irASlide(i); reiniciarTimer(); });
            dotsWrapper.appendChild(dot);
        });
    }

    slides[0]?.classList.add('activa');

    function irASlide(i) {
        indiceCarrusel = i;
        track.style.transform = `translateX(-${i * 100}%)`;
        document.querySelectorAll('.hero-carrusel-dot').forEach((d, j) => d.classList.toggle('activo', j === i));
        slides.forEach((s, j) => s.classList.toggle('activa', j === i));
    }

    function iniciarTimer() {
        timerCarrusel = setInterval(() => irASlide((indiceCarrusel + 1) % totalSlides), 5000);
    }

    function reiniciarTimer() {
        clearInterval(timerCarrusel);
        iniciarTimer();
    }

    irASlide(0);
    iniciarTimer();
}

function initScrollAnimations() {
    const elementos = document.querySelectorAll('.stat-item, .promo-card, .beneficio-card, .tarjeta-plato, .item-pedido');
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible-scroll'); });
    }, { threshold: 0.1 });

    elementos.forEach(el => { el.classList.add('pre-scroll'); obs.observe(el); });
}

function initVolverArriba() {
    const btn = document.getElementById('btnTop');
    if (!btn) return;

    window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400));
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function mostrarToast(msg, tipo = 'ok') {
    let toast = document.getElementById('cc-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cc-toast';
        document.body.appendChild(toast);
    }

    toast.textContent = msg;
    toast.className = `cc-toast cc-toast--${tipo} cc-toast--visible`;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('cc-toast--visible'), 3000);
}

function mostrarModalConfirmacion(titulo, cuerpo, nota) {
    document.getElementById('cc-modal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'cc-modal';
    modal.className = 'cc-modal-overlay';
    modal.innerHTML = `
        <div class="cc-modal-box">
            <div class="cc-modal-icono"><i class="fa-solid fa-circle-check"></i></div>
            <h3>${titulo}</h3>
            <pre class="cc-modal-cuerpo">${cuerpo}</pre>
            <p class="cc-modal-nota"><i class="fa-brands fa-whatsapp"></i> ${nota}</p>
            <button class="btn-luxury" onclick="cerrarModal()">Cerrar</button>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('cc-modal-overlay--visible'), 10);
}

function cerrarModal() {
    const modal = document.getElementById('cc-modal');
    if (!modal) return;
    modal.classList.remove('cc-modal-overlay--visible');
    setTimeout(() => modal.remove(), 300);
}

function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 40));
}

function initNavLinks() {
    const links = document.querySelectorAll('.nav-links a');
    const secciones = document.querySelectorAll('section[id]');
    if (!secciones.length) return;

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                links.forEach(a => {
                    a.classList.toggle('activo', a.getAttribute('href') === `#${entry.target.id}`);
                });
            }
        });
    }, { threshold: 0.4 });

    secciones.forEach(s => obs.observe(s));
}

document.addEventListener('DOMContentLoaded', () => {
    cargarCarritoDesdeStorage();
    initCarruselHero();
    animarContadores();
    iniciarTestimonios();
    initScrollAnimations();
    initVolverArriba();
    initNavbarScroll();
    initNavLinks();

    const inputFecha = document.getElementById('fecha');
    if (inputFecha) inputFecha.min = new Date().toISOString().split('T')[0];

    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            const abierto = navLinks.classList.toggle('abierto');
            toggle.setAttribute('aria-expanded', abierto);
            toggle.innerHTML = abierto
                ? '<i class="fa-solid fa-xmark"></i>'
                : '<span class="hamburger-bar"></span><span class="hamburger-bar"></span><span class="hamburger-bar"></span>';
        });

        navLinks.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                navLinks.classList.remove('abierto');
                toggle.setAttribute('aria-expanded', false);
                toggle.innerHTML = '<span class="hamburger-bar"></span><span class="hamburger-bar"></span><span class="hamburger-bar"></span>';
            });
        });
    }
});
