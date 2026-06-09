let carrito = {};

function cargarCarritoDesdeStorage() {
    const guardado = localStorage.getItem("carritoCarbon");
    if (guardado) {
        carrito = JSON.parse(guardado);
        for (const [id, item] of Object.entries(carrito)) {
            const spanCant = document.getElementById(`cant${id.replace('card-', '')}`);
            if (spanCant) spanCant.innerText = item.cantidad;
            const card = document.getElementById(id);
            if (card && item.cantidad > 0) card.classList.add('activo');
        }
        recalcularTotal();
    }
}

function guardarCarritoStorage() {
    localStorage.setItem("carritoCarbon", JSON.stringify(carrito));
}

function cambiarCant(idSpan, idCard, delta, precio) {
    const span = document.getElementById(idSpan);
    const card = document.getElementById(idCard);
    if (!span || !card) return;

    let cant = parseInt(span.textContent) || 0;
    cant = Math.max(0, cant + delta);
    span.textContent = cant;

    const nombre = card.querySelector('h3')?.textContent || idCard;
    if (cant > 0) {
        carrito[idCard] = { nombre, precio, cantidad: cant };
        card.classList.add('activo');
    } else {
        delete carrito[idCard];
        card.classList.remove('activo');
    }
    guardarCarritoStorage();
    recalcularTotal();
}

function recalcularTotal() {
    let subtotal = 0;
    for (let id in carrito) {
        subtotal += carrito[id].precio * carrito[id].cantidad;
    }
    const esDelivery = document.getElementById('tipoEntrega')?.value === 'delivery';
    const total = subtotal + (esDelivery ? 10 : 0);
    const txtSubtotal = document.getElementById('txtSubtotal');
    const txtTotal = document.getElementById('txtTotal');
    if (txtSubtotal) txtSubtotal.innerText = `S/ ${subtotal.toFixed(2)}`;
    if (txtTotal) txtTotal.innerText = `S/ ${total.toFixed(2)}`;
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
    if (!nombre) return mostrarToast('Ingresa tu nombre', 'error');
    if (Object.keys(carrito).length === 0) return mostrarToast('Agrega productos al carrito', 'error');

    const tipo = document.getElementById('tipoEntrega')?.value;
    let direccion = '', telefono = '', local = '';
    if (tipo === 'delivery') {
        direccion = document.getElementById('direccionCliente')?.value.trim();
        telefono = document.getElementById('telefonoCliente')?.value.trim();
        if (!direccion || !telefono) return mostrarToast('Completa dirección y celular', 'error');
    } else {
        local = document.getElementById('localRecojo')?.value;
    }

    let resumen = `PEDIDO\nCliente: ${nombre}\n`;
    resumen += tipo === 'delivery' ? `Direccion: ${direccion}\nTelefono: ${telefono}\n` : `Recojo en: ${local}\n`;
    resumen += '\nProductos:\n';
    for (let id in carrito) {
        const item = carrito[id];
        resumen += `${item.cantidad}x ${item.nombre} - S/ ${(item.precio * item.cantidad).toFixed(2)}\n`;
    }
    resumen += `\nTotal: ${document.getElementById('txtTotal').innerText}`;
    mostrarModalConfirmacion('Pedido Recibido', resumen, 'Te contactaremos por WhatsApp.');
}

function confirmarReserva() {
    const nombre = document.getElementById('nombre')?.value.trim();
    const telefono = document.getElementById('telefono')?.value.trim();
    const fecha = document.getElementById('fecha')?.value;
    const personas = document.getElementById('personas')?.value;
    const horaI = document.getElementById('hora-inicio')?.value;
    const sede = document.getElementById('sede')?.value;
    if (!nombre || !telefono || !fecha || !personas || !horaI || !sede) {
        return mostrarToast('Completa todos los campos obligatorios', 'error');
    }
    const ocasion = document.getElementById('ocasion')?.value || '';
    const notas = document.getElementById('notas')?.value.trim() || '';
    let resumen = `Reserva\nNombre: ${nombre}\nFecha: ${fecha} - ${horaI}\nPersonas: ${personas}\nSede: ${sede}`;
    if (ocasion) resumen += `\nOcasion: ${ocasion}`;
    if (notas) resumen += `\nNotas: ${notas}`;
    mostrarModalConfirmacion('Reserva Confirmada', resumen, 'Te contactaremos por WhatsApp.');
}

function seleccionarHorarioSelect(hora) {
    const inputHora = document.getElementById('hora-inicio');
    const inputDisplay = document.getElementById('hora-display');
    if (inputHora) inputHora.value = hora;
    if (inputDisplay) inputDisplay.value = hora || 'Sin horario';
    if (!hora) return;

    const horas = ["12:00 pm","12:30 pm","1:00 pm","1:30 pm","2:00 pm","2:30 pm","3:00 pm","7:00 pm","7:30 pm","8:00 pm","8:30 pm","9:00 pm"];
    const idx = horas.indexOf(hora);
    const finSelect = document.getElementById('hora-fin');
    if (!finSelect) return;
    finSelect.innerHTML = '<option value="">Seleccionar</option>';
    if (idx !== -1) {
        for (let i = idx + 3; i < horas.length; i++) {
            const opt = document.createElement('option');
            opt.value = horas[i];
            opt.textContent = horas[i];
            finSelect.appendChild(opt);
        }
    }
}

function filtrarCategoria(cat, btn) {
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('activo'));
    btn.classList.add('activo');
    document.querySelectorAll('.item-pedido, .pedido-seccion-titulo').forEach(el => {
        const visible = cat === 'todos' || el.dataset.cat === cat;
        el.style.display = visible ? '' : 'none';
    });
}

function mostrarCategoria(cat, btn) {
    document.querySelectorAll('.menu-categoria').forEach(el => el.classList.remove('visible'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('activo'));
    const target = document.getElementById('cat-' + cat);
    if (target) target.classList.add('visible');
    if (btn) btn.classList.add('activo');
}

let testimonioIndex = 0;
const testimonios = [
    { texto: "El mejor pollo a la brasa de Lima. La parrilla es espectacular, y el ambiente muy familiar.", autor: "Maria G." },
    { texto: "Excelente atencion y sabor unico. Volvere cada semana.", autor: "Carlos R." },
    { texto: "Precios justos y calidad premium. Los anticuchos son increibles.", autor: "Lucia F." }
];

function actualizarTestimonio() {
    const t = testimonios[testimonioIndex];
    const contenedor = document.getElementById('testimonioTexto');
    if (contenedor) {
        contenedor.innerHTML = `<i class="fa-solid fa-quote-left"></i><p>"${t.texto}"</p><h4>— ${t.autor}</h4>`;
    }
}

function iniciarTestimonios() {
    const prev = document.getElementById('testimonioPrev');
    const next = document.getElementById('testimonioNext');
    if (prev && next) {
        prev.addEventListener('click', () => {
            testimonioIndex = (testimonioIndex - 1 + testimonios.length) % testimonios.length;
            actualizarTestimonio();
        });
        next.addEventListener('click', () => {
            testimonioIndex = (testimonioIndex + 1) % testimonios.length;
            actualizarTestimonio();
        });
        actualizarTestimonio();
        setInterval(() => {
            testimonioIndex = (testimonioIndex + 1) % testimonios.length;
            actualizarTestimonio();
        }, 6000);
    }
}

function animarContadores() {
    const contadores = document.querySelectorAll('.stat-numero[data-target]');
    if (!contadores.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-target'));
                let current = 0;
                const increment = target / 50;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        el.textContent = target;
                        clearInterval(timer);
                    } else {
                        el.textContent = Math.floor(current);
                    }
                }, 20);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    contadores.forEach(c => observer.observe(c));
}

let carruselActual = 0, carruselTotal = 0, carruselTimer = null;

function initCarruselHero() {
    const track = document.getElementById('heroCarruselTrack');
    if (!track) return;
    const slides = track.querySelectorAll('.hero-carrusel-slide');
    carruselTotal = slides.length;
    const dotsContainer = document.getElementById('heroCarruselDots');
    if (dotsContainer) {
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'hero-carrusel-dot' + (i === 0 ? ' activo' : '');
            dot.addEventListener('click', () => { irASlide(i); reiniciarAutoplay(); });
            dotsContainer.appendChild(dot);
        });
    }
    slides[0]?.classList.add('activa');

    function irASlide(idx) {
        carruselActual = idx;
        track.style.transform = `translateX(-${idx * 100}%)`;
        document.querySelectorAll('.hero-carrusel-dot').forEach((d, i) => d.classList.toggle('activo', i === idx));
        slides.forEach((s, i) => s.classList.toggle('activa', i === idx));
    }

    function iniciarAutoplay() {
        if (carruselTimer) clearInterval(carruselTimer);
        carruselTimer = setInterval(() => irASlide((carruselActual + 1) % carruselTotal), 5000);
    }

    function reiniciarAutoplay() {
        clearInterval(carruselTimer);
        iniciarAutoplay();
    }

    irASlide(0);
    iniciarAutoplay();
}

function initScrollAnimations() {
    const elementos = document.querySelectorAll('.stat-item, .promo-card, .beneficio-card, .tarjeta-plato, .item-pedido');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible-scroll');
        });
    }, { threshold: 0.1 });
    elementos.forEach(el => {
        el.classList.add('pre-scroll');
        observer.observe(el);
    });
}

function initVolverArriba() {
    const btn = document.getElementById('btnTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function mostrarToast(mensaje, tipo = 'ok') {
    let toast = document.getElementById('cc-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cc-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = mensaje;
    toast.className = `cc-toast cc-toast--${tipo} cc-toast--visible`;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('cc-toast--visible'), 3000);
}

function mostrarModalConfirmacion(titulo, cuerpo, nota) {
    const existing = document.getElementById('cc-modal');
    if (existing) existing.remove();
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
    if (modal) {
        modal.classList.remove('cc-modal-overlay--visible');
        setTimeout(() => modal.remove(), 300);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarCarritoDesdeStorage();
    initCarruselHero();
    animarContadores();
    iniciarTestimonios();
    initScrollAnimations();
    initVolverArriba();

    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        const hoy = new Date().toISOString().split('T')[0];
        fechaInput.min = hoy;
    }

    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            const abierto = navLinks.classList.toggle('abierto');
            toggle.setAttribute('aria-expanded', abierto);
            toggle.innerHTML = abierto ? '<i class="fa-solid fa-xmark"></i>' : '<span class="hamburger-bar"></span><span class="hamburger-bar"></span><span class="hamburger-bar"></span>';
        });
    }
});