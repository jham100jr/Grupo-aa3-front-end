/* =========================================================
   BARBER HOUSE - JavaScript mejorado
   Funcionalidades: DOM, eventos, reservas, carrito, galería,
   menú responsive, filtros administrativos, persistencia local.
   ========================================================= */

const services = [
    { id: 1, name: "Corte clásico", duration: "45 min", price: 30, icon: "✂️",
      description: "Corte moderno con acabado impecable y atención personalizada." },
    { id: 2, name: "Barba premium", duration: "30 min", price: 25, icon: "🪒",
      description: "Ajuste de barba con precisión y perfilado artesanal." },
    { id: 3, name: "Facial grooming", duration: "20 min", price: 35, icon: "🧴",
      description: "Limpieza y cuidado facial para una apariencia rejuvenecida." },
    { id: 4, name: "Corte + barba", duration: "60 min", price: 50, icon: "💈",
      description: "Paquete completo para un look brillante y bien cuidado." },
    { id: 5, name: "Arreglo de cejas", duration: "15 min", price: 18, icon: "✨",
      description: "Definición y limpieza para resaltar tu mirada." },
    { id: 6, name: "Perfilado de bigote", duration: "20 min", price: 20, icon: "🧔",
      description: "Diseño y definición para un acabado elegante." }
];

const barbers = [
    { id: 1, name: "Luis Álvarez", specialty: "Cortes clásicos", avatar: "LA" },
    { id: 2, name: "Carlos Rojas", specialty: "Barba y perfilado", avatar: "CR" },
    { id: 3, name: "Marco Silva", specialty: "Styling moderno", avatar: "MS" }
];

const demoReservations = [
    { id: 1, code: "BR-9F3K2", cliente: "Ana Gómez", telefono: "987654321",
      servicio: "Corte clásico", barbero: "Luis Álvarez", barberoId: 1, servicioId: 1,
      fecha: "2026-09-15", hora: "10:00", estado: "Pendiente" },
    { id: 2, code: "BR-2X1Q8", cliente: "Sergio Ruiz", telefono: "912345678",
      servicio: "Barba premium", barbero: "Carlos Rojas", barberoId: 2, servicioId: 2,
      fecha: "2026-09-15", hora: "11:30", estado: "Confirmada" },
    { id: 3, code: "BR-7L4M9", cliente: "Diego Pérez", telefono: "998765432",
      servicio: "Corte + barba", barbero: "Marco Silva", barberoId: 3, servicioId: 4,
      fecha: "2026-09-16", hora: "14:00", estado: "Completada" }
];

const STORAGE_KEY = "barberHouseReservationsV2";

let reservations = loadReservations();
let cart = [];
let galleryIndex = 0;
let galleryItems = [];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const reservationForm = $("#reservation-form");
const reservationMessage = $("#reservation-message");
const servicesList = $("#services-list");
const barbersList = $("#barbers-list");
const serviceSelect = $("#servicio");
const barberSelect = $("#barbero");
const dateInput = $("#fecha");
const timeSelect = $("#hora");
const searchForm = $("#search-form");
const searchResult = $("#search-result");
const searchCodeInput = $("#search-code");
const adminSearchInput = $("#admin-search");
const adminStatusFilter = $("#admin-status-filter");
const adminReset = $("#admin-reset");
const reservationsTable = $("#reservations-table");
const shopList = $("#shop-list");
const cartItemsList = $("#cart-items");
const cartTotal = $("#cart-total");
const cartSubtotal = $("#cart-subtotal");
const cartCount = $("#cart-count");
const navCartCount = $("#nav-cart-count");
const cartMessage = $("#cart-message");
const cartClear = $("#cart-clear");
const checkoutButton = $("#checkout-btn");
const contactForm = $("#contact-form");
const contactResponse = $("#contact-response");

function money(value) {
    return `S/ ${Number(value).toFixed(0)}`;
}

function loadReservations() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [...demoReservations];
    } catch {
        return [...demoReservations];
    }
}

function saveReservations() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
}

function generateCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "BR-";
    for (let i = 0; i < 5; i += 1) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

function formatDate(dateString) {
    if (!dateString) return "—";
    return new Intl.DateTimeFormat("es-PE", {
        day: "2-digit", month: "short", year: "numeric"
    }).format(new Date(`${dateString}T00:00:00`));
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[char]));
}

function showToast(message, type = "success") {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast is-visible ${type}`;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

function renderServices() {
    if (!servicesList) return;
    servicesList.innerHTML = services.map((service, index) => `
        <article class="service-card reveal" style="--delay:${index * 70}ms">
            <div class="service-icon">${service.icon}</div>
            <h3>${service.name}</h3>
            <p>${service.description}</p>
            <div class="card-meta">
                <span>${service.duration}</span>
                <strong>${money(service.price)}</strong>
            </div>
        </article>
    `).join("");
}

function renderBarbers() {
    if (!barbersList) return;
    barbersList.innerHTML = barbers.map((barber, index) => `
        <article class="barber-card reveal" style="--delay:${index * 80}ms">
            <div class="avatar">${barber.avatar}</div>
            <h3>${barber.name}</h3>
            <p>${barber.specialty}</p>
            <div class="card-meta">
                <span>Especialista</span>
                <strong>Disponible</strong>
            </div>
        </article>
    `).join("");
}

function renderShopProducts() {
    if (!shopList) return;
    shopList.innerHTML = services.map((service) => `
        <article class="shop-item reveal">
            <div class="shop-item-head">
                <div class="service-icon">${service.icon}</div>
                <strong>${money(service.price)}</strong>
            </div>
            <h3>${service.name}</h3>
            <p>${service.description}</p>
            <div class="card-meta">
                <span>${service.duration}</span>
                <button class="add-to-cart" type="button" data-service-id="${service.id}">
                    Agregar
                </button>
            </div>
        </article>
    `).join("");
}

function addToCart(serviceId) {
    const service = services.find((item) => item.id === Number(serviceId));
    if (!service) return;

    const existing = cart.find((item) => item.id === service.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...service, quantity: 1 });
    }

    renderCart();
    showToast(`${service.name} agregado al carrito.`);
}

function updateCartQuantity(serviceId, change) {
    cart = cart
        .map((item) => item.id === Number(serviceId)
            ? { ...item, quantity: item.quantity + change }
            : item)
        .filter((item) => item.quantity > 0);

    renderCart();
}

function removeFromCart(serviceId) {
    cart = cart.filter((item) => item.id !== Number(serviceId));
    renderCart();
}

function renderCart() {
    if (!cartItemsList) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (!cart.length) {
        cartItemsList.innerHTML = `
            <li class="cart-item cart-empty">
                <div class="cart-item-info">
                    <strong>Tu carrito está vacío</strong>
                    <span>Agrega un servicio para continuar.</span>
                </div>
            </li>`;
    } else {
        cartItemsList.innerHTML = cart.map((item) => `
            <li class="cart-item">
                <div class="cart-item-info">
                    <strong>${escapeHtml(item.name)}</strong>
                    <span>${money(item.price)} c/u</span>
                </div>
                <div class="cart-item-actions">
                    <button class="qty-btn" type="button" data-action="decrease"
                        data-service-id="${item.id}" aria-label="Reducir cantidad">−</button>
                    <span aria-label="Cantidad">${item.quantity}</span>
                    <button class="qty-btn" type="button" data-action="increase"
                        data-service-id="${item.id}" aria-label="Aumentar cantidad">+</button>
                    <button class="remove-item" type="button" data-service-id="${item.id}"
                        aria-label="Eliminar ${escapeHtml(item.name)}">✕</button>
                </div>
            </li>
        `).join("");
    }

    if (cartSubtotal) cartSubtotal.textContent = money(total);
    if (cartTotal) cartTotal.textContent = money(total);
    if (cartCount) cartCount.textContent = `${totalItems} ${totalItems === 1 ? "item" : "items"}`;
    if (navCartCount) {
        navCartCount.textContent = totalItems;
        navCartCount.classList.toggle("is-empty", totalItems === 0);
    }
    if (cartClear) cartClear.hidden = !cart.length;
}

function renderSelectOptions() {
    if (serviceSelect) {
        serviceSelect.innerHTML = services.map((service) =>
            `<option value="${service.id}">${service.name} — ${money(service.price)}</option>`
        ).join("");
    }

    if (barberSelect) {
        barberSelect.innerHTML = barbers.map((barber) =>
            `<option value="${barber.id}">${barber.name} — ${barber.specialty}</option>`
        ).join("");
    }
}

function getDayHours(dateString) {
    if (!dateString) return null;
    const day = new Date(`${dateString}T12:00:00`).getDay();
    return day === 0 ? { open: 10, close: 16 } : { open: 9, close: 20 };
}

function toMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

function toTime(minutes) {
    const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mins = String(minutes % 60).padStart(2, "0");
    return `${hours}:${mins}`;
}

function getAvailableTimes(dateString, barberId) {
    const hours = getDayHours(dateString);
    if (!hours || !barberId) return [];

    const occupied = new Set(
        reservations
            .filter((item) =>
                Number(item.barberoId) === Number(barberId) &&
                item.fecha === dateString &&
                ["Pendiente", "Confirmada"].includes(item.estado)
            )
            .map((item) => item.hora)
    );

    const result = [];
    for (let minutes = hours.open * 60; minutes < hours.close * 60; minutes += 30) {
        const time = toTime(minutes);
        if (!occupied.has(time)) result.push(time);
    }
    return result;
}

function populateTimeSlots() {
    if (!timeSelect) return;

    const times = getAvailableTimes(dateInput?.value, barberSelect?.value);
    timeSelect.innerHTML = "";

    if (!dateInput?.value || !barberSelect?.value) {
        timeSelect.disabled = true;
        timeSelect.innerHTML = `<option value="">Primero elige fecha y barbero</option>`;
        updateBookingSummary();
        return;
    }

    timeSelect.disabled = false;

    if (!times.length) {
        timeSelect.innerHTML = `<option value="">No hay turnos disponibles</option>`;
        timeSelect.disabled = true;
        updateBookingSummary();
        return;
    }

    timeSelect.innerHTML = `<option value="">Selecciona un horario</option>` +
        times.map((time) => `<option value="${time}">${time}</option>`).join("");

    updateBookingSummary();
}

function updateBookingSummary() {
    const service = services.find((item) => item.id === Number(serviceSelect?.value));
    const barber = barbers.find((item) => item.id === Number(barberSelect?.value));
    const values = {
        servicio: service?.name || "Por elegir",
        barbero: barber?.name || "Por elegir",
        fecha: dateInput?.value ? formatDate(dateInput.value) : "Por elegir",
        hora: timeSelect?.value || "Por elegir",
        duracion: service?.duration || "Por elegir",
        precio: service ? money(service.price) : "S/ 0"
    };

    Object.entries(values).forEach(([key, value]) => {
        const element = document.querySelector(`[data-summary="${key}"]`);
        if (element) {
            element.textContent = value;
            element.classList.toggle("is-empty", value === "Por elegir");
        }
    });
}

function setMinDate() {
    if (!dateInput) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const min = tomorrow.toISOString().split("T")[0];
    dateInput.min = min;
    if (!dateInput.value || dateInput.value < min) dateInput.value = min;
}

function validateReservation(data) {
    if (!data.cliente || !data.telefono || !data.servicioId ||
        !data.barberoId || !data.fecha || !data.hora) {
        return "Completa todos los campos obligatorios.";
    }

    const phone = data.telefono.replace(/\D/g, "");
    if (phone.length !== 9 || !phone.startsWith("9")) {
        return "Ingresa un celular peruano válido de 9 dígitos.";
    }

    const selected = new Date(`${data.fecha}T${data.hora}:00`);
    const now = new Date();
    if (selected <= now) {
        return "La fecha y hora deben ser posteriores a la actual.";
    }

    const hours = getDayHours(data.fecha);
    const selectedMinutes = toMinutes(data.hora);
    if (!hours || selectedMinutes < hours.open * 60 || selectedMinutes >= hours.close * 60) {
        return "El horario seleccionado está fuera de atención.";
    }

    const occupied = reservations.some((reservation) =>
        Number(reservation.barberoId) === Number(data.barberoId) &&
        reservation.fecha === data.fecha &&
        reservation.hora === data.hora &&
        ["Pendiente", "Confirmada"].includes(reservation.estado)
    );

    if (occupied) return "Ese horario acaba de ser ocupado. Elige otro turno.";

    return "";
}

function handleReservationSubmit(event) {
    event.preventDefault();

    const service = services.find((item) => item.id === Number(serviceSelect?.value));
    const barber = barbers.find((item) => item.id === Number(barberSelect?.value));

    const data = {
        cliente: $("#cliente")?.value.trim(),
        telefono: $("#telefono")?.value.trim(),
        servicioId: Number(serviceSelect?.value),
        barberoId: Number(barberSelect?.value),
        fecha: dateInput?.value,
        hora: timeSelect?.value
    };

    const error = validateReservation(data);
    if (error) {
        reservationMessage.textContent = error;
        reservationMessage.className = "form-message error";
        showToast(error, "error");
        return;
    }

    const newReservation = {
        id: Date.now(),
        code: generateCode(),
        cliente: data.cliente,
        telefono: data.telefono,
        servicio: service.name,
        barbero: barber.name,
        barberoId: data.barberoId,
        servicioId: data.servicioId,
        fecha: data.fecha,
        hora: data.hora,
        estado: "Pendiente"
    };

    reservations.unshift(newReservation);
    saveReservations();

    reservationForm.reset();
    setMinDate();
    populateTimeSlots();

    reservationMessage.textContent =
        `Reserva creada con éxito. Tu código es ${newReservation.code}.`;
    reservationMessage.className = "form-message success";

    updateSummary();
    renderReservations(getFilteredReservations());
    updateNextSlot();
    updateBookingSummary();
    showToast(`Reserva ${newReservation.code} creada correctamente.`);
}

function handleSearchReservation(event) {
    event.preventDefault();
    const code = searchCodeInput?.value.trim().toUpperCase();

    if (!code) {
        searchResult.textContent = "Ingresa un código de reserva.";
        searchResult.className = "search-result error";
        return;
    }

    const reservation = reservations.find((item) => item.code.toUpperCase() === code);

    if (!reservation) {
        searchResult.textContent = "No se encontró ninguna reserva con ese código.";
        searchResult.className = "search-result error";
        return;
    }

    searchResult.innerHTML = `
        <strong>Reserva encontrada</strong>
        <div class="result-grid">
            <span>Cliente</span><strong>${escapeHtml(reservation.cliente)}</strong>
            <span>Servicio</span><strong>${escapeHtml(reservation.servicio)}</strong>
            <span>Barbero</span><strong>${escapeHtml(reservation.barbero)}</strong>
            <span>Fecha</span><strong>${formatDate(reservation.fecha)} · ${reservation.hora}</strong>
            <span>Estado</span><span class="badge ${getStatusClassName(reservation.estado)}">${reservation.estado}</span>
        </div>`;
    searchResult.className = "search-result success";
}

function getStatusClassName(status) {
    return ({
        Pendiente: "pending",
        Confirmada: "confirmed",
        Completada: "completed",
        Cancelada: "cancelled"
    })[status] || "pending";
}

function getFilteredReservations() {
    const query = adminSearchInput?.value.trim().toLowerCase() || "";
    const status = adminStatusFilter?.value || "all";

    return reservations.filter((reservation) => {
        const matchesText = !query ||
            reservation.code.toLowerCase().includes(query) ||
            reservation.cliente.toLowerCase().includes(query) ||
            reservation.barbero.toLowerCase().includes(query) ||
            reservation.servicio.toLowerCase().includes(query);

        const matchesStatus = status === "all" || reservation.estado === status;
        return matchesText && matchesStatus;
    });
}

function updateSummary() {
    const total = reservations.length;
    const pending = reservations.filter((item) => item.estado === "Pendiente").length;
    const confirmed = reservations.filter((item) => item.estado === "Confirmada").length;
    const completed = reservations.filter((item) => item.estado === "Completada").length;
    const cancelled = reservations.filter((item) => item.estado === "Cancelada").length;

    const revenue = reservations
        .filter((item) => item.estado !== "Cancelada")
        .reduce((sum, item) => {
            const service = services.find((serviceItem) => serviceItem.id === Number(item.servicioId));
            return sum + (service?.price || 0);
        }, 0);

    const values = {
        "summary-total": total,
        "summary-pending": pending,
        "summary-confirmed": confirmed,
        "summary-completed": completed,
        "summary-cancelled": cancelled,
        "summary-revenue": money(revenue)
    };

    Object.entries(values).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });

    const count = $("#admin-count");
    if (count) count.textContent = `${getFilteredReservations().length} reserva(s) mostrada(s)`;
}

function renderReservations(list = reservations) {
    if (!reservationsTable) return;

    if (!list.length) {
        reservationsTable.innerHTML = `
            <tr><td colspan="7" class="empty-table">No se encontraron reservas.</td></tr>`;
        updateSummary();
        return;
    }

    reservationsTable.innerHTML = list.map((reservation) => `
        <tr>
            <td><strong>${escapeHtml(reservation.code)}</strong></td>
            <td>${escapeHtml(reservation.cliente)}</td>
            <td>${escapeHtml(reservation.servicio)}</td>
            <td>${escapeHtml(reservation.barbero)}</td>
            <td>${formatDate(reservation.fecha)}</td>
            <td>${reservation.hora}</td>
            <td>
                <select class="status-select" data-id="${reservation.id}"
                    aria-label="Cambiar estado de ${escapeHtml(reservation.code)}">
                    ${["Pendiente", "Confirmada", "Completada", "Cancelada"].map((status) =>
                        `<option value="${status}" ${reservation.estado === status ? "selected" : ""}>${status}</option>`
                    ).join("")}
                </select>
            </td>
        </tr>
    `).join("");

    updateSummary();
}

function updateReservationStatus(id, status) {
    reservations = reservations.map((reservation) =>
        reservation.id === Number(id) ? { ...reservation, estado: status } : reservation
    );

    saveReservations();
    renderReservations(getFilteredReservations());
    updateSummary();
    populateTimeSlots();
    showToast("Estado de la reserva actualizado.");
}

function resetDemoData() {
    reservations = [...demoReservations];
    saveReservations();
    if (adminSearchInput) adminSearchInput.value = "";
    if (adminStatusFilter) adminStatusFilter.value = "all";
    renderReservations();
    updateSummary();
    populateTimeSlots();
    showToast("Datos de demostración restablecidos.");
}

function updateAdminDate() {
    const element = $("#admin-date");
    if (!element) return;
    element.textContent = new Intl.DateTimeFormat("es-PE", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    }).format(new Date());
}

function updateNextSlot() {
    const target = $("#next-slot");
    if (!target) return;

    const now = new Date();
    for (let dayOffset = 0; dayOffset < 14; dayOffset += 1) {
        const candidate = new Date(now);
        candidate.setDate(now.getDate() + dayOffset);
        const date = candidate.toISOString().split("T")[0];

        for (const barber of barbers) {
            const times = getAvailableTimes(date, barber.id);
            const futureTimes = times.filter((time) =>
                dayOffset > 0 || toMinutes(time) > now.getHours() * 60 + now.getMinutes()
            );

            if (futureTimes.length) {
                target.textContent = `${formatDate(date)} · ${futureTimes[0]}`;
                return;
            }
        }
    }

    target.textContent = "Consultar disponibilidad";
}

function initMobileNav() {
    const toggle = $("#nav-toggle");
    const nav = $("#main-nav");
    const backdrop = $("#nav-backdrop");
    if (!toggle || !nav) return;

    const close = () => {
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Abrir menú");
    };

    toggle.addEventListener("click", () => {
        const open = document.body.classList.toggle("menu-open");
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    });

    backdrop?.addEventListener("click", close);
    $$("#main-nav a").forEach((link) => link.addEventListener("click", close));
    window.addEventListener("resize", () => {
        if (window.innerWidth > 980) close();
    });
}

function initLightbox() {
    const lightbox = $("#lightbox");
    const image = $("#lightbox-img");
    const caption = $("#lightbox-caption");
    const counter = $("#lightbox-counter");
    if (!lightbox || !image) return;

    galleryItems = $$(".gallery-item img");

    const render = () => {
        const item = galleryItems[galleryIndex];
        if (!item) return;
        image.src = item.dataset.full || item.src;
        image.alt = item.alt;
        if (caption) caption.textContent = item.closest(".gallery-item")?.querySelector("figcaption")?.textContent || "";
        if (counter) counter.textContent = `${galleryIndex + 1} / ${galleryItems.length}`;
    };

    const open = (index) => {
        galleryIndex = index;
        render();
        lightbox.hidden = false;
        document.body.classList.add("lightbox-open");
        $("#lightbox-close")?.focus();
    };

    const close = () => {
        lightbox.hidden = true;
        document.body.classList.remove("lightbox-open");
    };

    galleryItems.forEach((item, index) => {
        item.closest(".gallery-item")?.addEventListener("click", () => open(index));
    });

    $("#lightbox-close")?.addEventListener("click", close);
    $("#lightbox-prev")?.addEventListener("click", () => {
        galleryIndex = (galleryIndex - 1 + galleryItems.length) % galleryItems.length;
        render();
    });
    $("#lightbox-next")?.addEventListener("click", () => {
        galleryIndex = (galleryIndex + 1) % galleryItems.length;
        render();
    });

    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) close();
    });

    document.addEventListener("keydown", (event) => {
        if (lightbox.hidden) return;
        if (event.key === "Escape") close();
        if (event.key === "ArrowLeft") $("#lightbox-prev")?.click();
        if (event.key === "ArrowRight") $("#lightbox-next")?.click();
    });
}

function initCodeChips() {
    $$(".code-chip").forEach((button) => {
        button.addEventListener("click", () => {
            if (searchCodeInput) searchCodeInput.value = button.dataset.code || "";
            searchForm?.requestSubmit();
        });
    });
}

function initEvents() {
    reservationForm?.addEventListener("submit", handleReservationSubmit);
    searchForm?.addEventListener("submit", handleSearchReservation);

    serviceSelect?.addEventListener("change", () => {
        updateBookingSummary();
    });

    barberSelect?.addEventListener("change", () => {
        populateTimeSlots();
        updateBookingSummary();
    });

    dateInput?.addEventListener("change", () => {
        populateTimeSlots();
        updateBookingSummary();
    });

    timeSelect?.addEventListener("change", updateBookingSummary);

    adminSearchInput?.addEventListener("input", () => renderReservations(getFilteredReservations()));
    adminStatusFilter?.addEventListener("change", () => renderReservations(getFilteredReservations()));
    adminReset?.addEventListener("click", resetDemoData);

    document.addEventListener("click", (event) => {
        const addButton = event.target.closest(".add-to-cart");
        if (addButton) {
            addToCart(addButton.dataset.serviceId);
            return;
        }

        const qtyButton = event.target.closest(".qty-btn");
        if (qtyButton) {
            const change = qtyButton.dataset.action === "increase" ? 1 : -1;
            updateCartQuantity(qtyButton.dataset.serviceId, change);
            return;
        }

        const removeButton = event.target.closest(".remove-item");
        if (removeButton) {
            removeFromCart(removeButton.dataset.serviceId);
        }
    });

    cartClear?.addEventListener("click", () => {
        cart = [];
        renderCart();
        showToast("Carrito vaciado.");
    });

    checkoutButton?.addEventListener("click", () => {
        if (!cart.length) {
            cartMessage.textContent = "Agrega un servicio antes de comprar.";
            cartMessage.style.color = "var(--danger)";
            return;
        }

        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        cartMessage.textContent = `Pedido confirmado por ${money(total)}. ¡Gracias por tu compra!`;
        cartMessage.style.color = "var(--success)";
        cart = [];
        renderCart();
        showToast("Pedido confirmado.");
    });

    contactForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = $("#contact-name")?.value.trim();
        const email = $("#contact-email")?.value.trim();
        const message = $("#contact-message")?.value.trim();

        if (!name || !email || !message) {
            if (contactResponse) {
                contactResponse.textContent = "Completa todos los campos del formulario.";
                contactResponse.style.color = "var(--danger)";
            }
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            contactResponse.textContent = "Ingresa un correo electrónico válido.";
            contactResponse.style.color = "var(--danger)";
            return;
        }

        contactResponse.textContent = `Gracias ${name}, tu mensaje fue enviado correctamente.`;
        contactResponse.style.color = "var(--success)";
        contactForm.reset();
        showToast("Mensaje enviado correctamente.");
    });

    window.addEventListener("scroll", () => {
        $("#site-header")?.classList.toggle("is-scrolled", window.scrollY > 12);
    }, { passive: true });
}

function setCurrentYear() {
    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();
}

function init() {
    renderServices();
    renderBarbers();
    renderShopProducts();
    renderSelectOptions();
    setMinDate();
    populateTimeSlots();
    updateBookingSummary();
    updateSummary();
    renderReservations(getFilteredReservations());
    renderCart();
    updateAdminDate();
    updateNextSlot();
    setCurrentYear();

    initMobileNav();
    initLightbox();
    initCodeChips();
    initEvents();

    // Convierte los iconos data-icon en símbolos ligeros sin depender de una librería.
    const icons = {
        clock: "◷", calendar: "▣", bag: "▢", arrow: "→", arrowUp: "↑",
        search: "⌕", pin: "⌖", phone: "☎", mail: "✉", whatsapp: "◉",
        shield: "✓", refresh: "↻", layers: "▤", hourglass: "⌛",
        checkCircle: "✓", star: "★", ban: "×", coins: "S/",
        close: "×", chevronLeft: "‹", chevronRight: "›", zoom: "⌕"
    };

    $$("[data-icon]").forEach((element) => {
        const icon = icons[element.dataset.icon];
        if (icon && !element.textContent.trim()) element.textContent = icon;
    });
}

document.addEventListener("DOMContentLoaded", init);
