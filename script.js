let carrito = {};

function cargarCarritoDesdeStorage() {
    const guardado = localStorage.getItem("carritoCarbon");
    
    if (guardado) {
        carrito = JSON.parse(guardado);
        
        for (const [id, item] of Object.entries(carrito)) {
            const spanCant = document.getElementById(`cant${id.replace('card-', '')}`);
            if (spanCant) {
                spanCant.innerText = item.cantidad;
            }
            
            const card = document.getElementById(id);
            if (card && item.cantidad > 0) {
                card.classList.add('activo');
            }
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
    let direccion = '';
    let telefono = '';
    let local = '';
    
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
    const horaInicio = document.getElementById('hora-inicio')?.value;
    const sede = document.getElementById('sede')?.value;
    
    if (!nombre || !telefono || !fecha || !personas || !horaInicio || !sede) {
        return mostrarToast('Completa todos los campos obligatorios', 'error');
    }
    
    const ocasion = document.getElementById('ocasion')?.value || '';
    const notas = document.getElementById('notas')?.value.trim() || '';
    
    let resumen = `Reserva\nNombre: ${nombre}\nFecha: ${fecha} - ${horaInicio}\nPersonas: ${personas}\nSede: ${sede}`;
    
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

    const horasDisponibles = ["12:00 pm","12:30 pm","1:00 pm","1:30 pm","2:00 pm","2:30 pm","3:00 pm","7:00 pm","7:30 pm","8:00 pm","8:30 pm","9:00 pm"];
    const indiceHora = horasDisponibles.indexOf(hora);
    const selectFin = document.getElementById('hora-fin');
    
    if (!selectFin) return;
    
    selectFin.innerHTML = '<option value="">Seleccionar</option>';
    
    if (indiceHora !== -1) {
        for (let i = indiceHora + 3; i < horasDisponibles.length; i++) {
            const opcion = document.createElement('option');
            opcion.value = horasDisponibles[i];
            opcion.textContent = horasDisponibles[i];
            selectFin.appendChild(opcion);
        }
    }
}

function filtrarCategoria(categoriaFiltro, botonClic) {
    const botones = document.querySelectorAll('.filtro-btn');
    botones.forEach(boton => boton.classList.remove('activo'));
    
    botonClic.classList.add('activo');
    
    const elementos = document.querySelectorAll('.item-pedido, .pedido-seccion-titulo');
    elementos.forEach(elemento => {
        const esVisible = categoriaFiltro === 'todos' || elemento.dataset.cat === categoriaFiltro;
        elemento.style.display = esVisible ? '' : 'none';
    });
}

function mostrarCategoria(categoriaFiltro, botonClic) {
    const categorias = document.querySelectorAll('.menu-categoria');
    const botones = document.querySelectorAll('.tab-btn');
    
    categorias.forEach(categoria => categoria.classList.remove('visible'));
    botones.forEach(boton => boton.classList.remove('activo'));
    
    if (categoriaFiltro === 'todo') {
        categorias.forEach(categoria => categoria.classList.add('visible'));
    } else {
        const categoriaDestino = document.getElementById('cat-' + categoriaFiltro);
        if (categoriaDestino) {
            categoriaDestino.classList.add('visible');
        }
    }
    
    if (botonClic) {
        botonClic.classList.add('activo');
    }
}

let indiceTestimonio = 0;
const testimonios = [
    { texto: "El mejor pollo a la brasa de Lima. La parrilla es espectacular, y el ambiente muy familiar.", autor: "Maria G." },
    { texto: "Excelente atencion y sabor unico. Volvere cada semana.", autor: "Carlos R." },
    { texto: "Precios justos y calidad premium. Los anticuchos son increibles.", autor: "Lucia F." }
];

function actualizarTestimonio() {
    const testimonioActual = testimonios[indiceTestimonio];
    const contenedorTestimonio = document.getElementById('testimonioTexto');
    
    if (contenedorTestimonio) {
        contenedorTestimonio.innerHTML = `
            <i class="fa-solid fa-quote-left"></i>
            <p>"${testimonioActual.texto}"</p>
            <h4>— ${testimonioActual.autor}</h4>
        `;
    }
}

function iniciarTestimonios() {
    const botonPrevio = document.getElementById('testimonioPrev');
    const botonSiguiente = document.getElementById('testimonioNext');
    
    if (botonPrevio && botonSiguiente) {
        botonPrevio.addEventListener('click', () => {
            indiceTestimonio = (indiceTestimonio - 1 + testimonios.length) % testimonios.length;
            actualizarTestimonio();
        });
        
        botonSiguiente.addEventListener('click', () => {
            indiceTestimonio = (indiceTestimonio + 1) % testimonios.length;
            actualizarTestimonio();
        });
        
        actualizarTestimonio();
        
        setInterval(() => {
            indiceTestimonio = (indiceTestimonio + 1) % testimonios.length;
            actualizarTestimonio();
        }, 6000);
    }
}

function animarContadores() {
    const elementosContador = document.querySelectorAll('.stat-numero[data-target]');
    if (!elementosContador.length) return;
    
    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                const elemento = entrada.target;
                const objetivo = parseInt(elemento.getAttribute('data-target'));
                let valorActual = 0;
                const incremento = objetivo / 50;
                
                const temporizador = setInterval(() => {
                    valorActual += incremento;
                    if (valorActual >= objetivo) {
                        elemento.textContent = objetivo;
                        clearInterval(temporizador);
                    } else {
                        elemento.textContent = Math.floor(valorActual);
                    }
                }, 20);
                
                observador.unobserve(elemento);
            }
        });
    }, { threshold: 0.5 });
    
    elementosContador.forEach(contador => observador.observe(contador));
}

let indiceCarrusel = 0;
let totalSlides = 0;
let temporizadorCarrusel = null;

function initCarruselHero() {
    const contenedorPistas = document.getElementById('heroCarruselTrack');
    if (!contenedorPistas) return;
    
    const diapositivas = contenedorPistas.querySelectorAll('.hero-carrusel-slide');
    totalSlides = diapositivas.length;
    
    const contenedorPuntos = document.getElementById('heroCarruselDots');
    
    if (contenedorPuntos) {
        diapositivas.forEach((_, i) => {
            const punto = document.createElement('button');
            punto.className = 'hero-carrusel-dot' + (i === 0 ? ' activo' : '');
            punto.addEventListener('click', () => {
                cambiarSlide(i);
                reiniciarAutoplay();
            });
            contenedorPuntos.appendChild(punto);
        });
    }
    
    if (diapositivas[0]) {
        diapositivas[0].classList.add('activa');
    }

    function cambiarSlide(indiceNuevo) {
        indiceCarrusel = indiceNuevo;
        contenedorPistas.style.transform = `translateX(-${indiceNuevo * 100}%)`;
        
        document.querySelectorAll('.hero-carrusel-dot').forEach((punto, i) => {
            punto.classList.toggle('activo', i === indiceNuevo);
        });
        
        diapositivas.forEach((diapositiva, i) => {
            diapositiva.classList.toggle('activa', i === indiceNuevo);
        });
    }

    function iniciarAutoplay() {
        if (temporizadorCarrusel) clearInterval(temporizadorCarrusel);
        temporizadorCarrusel = setInterval(() => cambiarSlide((indiceCarrusel + 1) % totalSlides), 5000);
    }

    function reiniciarAutoplay() {
        clearInterval(temporizadorCarrusel);
        iniciarAutoplay();
    }

    cambiarSlide(0);
    iniciarAutoplay();
}

function initScrollAnimations() {
    const elementosAnimables = document.querySelectorAll('.stat-item, .promo-card, .beneficio-card, .tarjeta-plato, .item-pedido');
    
    const observadorScroll = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add('visible-scroll');
            }
        });
    }, { threshold: 0.1 });
    
    elementosAnimables.forEach(elemento => {
        elemento.classList.add('pre-scroll');
        observadorScroll.observe(elemento);
    });
}

function initVolverArriba() {
    const botonSubir = document.getElementById('btnTop');
    if (!botonSubir) return;
    
    window.addEventListener('scroll', () => {
        botonSubir.classList.toggle('visible', window.scrollY > 400);
    });
    
    botonSubir.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function mostrarToast(mensaje, tipo = 'ok') {
    let notificacionToast = document.getElementById('cc-toast');
    
    if (!notificacionToast) {
        notificacionToast = document.createElement('div');
        notificacionToast.id = 'cc-toast';
        document.body.appendChild(notificacionToast);
    }
    
    notificacionToast.textContent = mensaje;
    notificacionToast.className = `cc-toast cc-toast--${tipo} cc-toast--visible`;
    
    clearTimeout(notificacionToast._timer);
    notificacionToast._timer = setTimeout(() => {
        notificacionToast.classList.remove('cc-toast--visible');
    }, 3000);
}

function mostrarModalConfirmacion(titulo, cuerpo, nota) {
    const modalExistente = document.getElementById('cc-modal');
    if (modalExistente) modalExistente.remove();
    
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
    
    const inputFecha = document.getElementById('fecha');
    if (inputFecha) {
        const fechaDeHoy = new Date().toISOString().split('T')[0];
        inputFecha.min = fechaDeHoy;
    }
    
    const botonMenuMovil = document.querySelector('.nav-toggle');
    const enlacesNavegacion = document.querySelector('.nav-links');
    
    if (botonMenuMovil && enlacesNavegacion) {
        botonMenuMovil.addEventListener('click', () => {
            const estaAbierto = enlacesNavegacion.classList.toggle('abierto');
            botonMenuMovil.setAttribute('aria-expanded', estaAbierto);
            
            if (estaAbierto) {
                botonMenuMovil.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            } else {
                botonMenuMovil.innerHTML = '<span class="hamburger-bar"></span><span class="hamburger-bar"></span><span class="hamburger-bar"></span>';
            }
        });
    }
});
