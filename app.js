// =====================
// STATE
// =====================
let hotelesPorZona = {};
let listaUnidades = [];

// =====================
// INIT GLOBAL
// =====================
window.addEventListener("DOMContentLoaded", () => {

  validarSesion();
  initToggle();
  initForm();
  initFiltros();

});

// =====================
// SESIÓN (LOGIN EXTERNO)
// =====================
function validarSesion() {
  const session = JSON.parse(localStorage.getItem("session"));

  if (!session && location.pathname.includes("app.html")) {
    location.href = "login.html";
    return;
  }

  if (session) {
    const el = document.getElementById("userInfo");
    if (el) el.textContent = `${session.user} (${session.role})`;

    aplicarPermisos(session.role);
  }
}

function logout() {
  localStorage.removeItem("session");
  location.href = "login.html";
}

// =====================
// PERMISOS
// =====================
function aplicarPermisos(role) {

  if (role === "viewer") {
    document.querySelectorAll("button").forEach(b => {
      if (b.id !== "toggleFormulario") b.style.display = "none";
    });

    document.getElementById("formulario")?.remove();
  }

  if (role === "editor") {
    document.getElementById("btnExportar")?.style.display = "none";
  }
}

// =====================
// TOGGLE FORM (FIX REAL)
// =====================
function initToggle() {
  const btn = document.getElementById("toggleFormulario");
  const form = document.getElementById("contenedorFormulario");

  if (!btn || !form) return;

  btn.addEventListener("click", () => {
    form.classList.toggle("hidden");

    btn.textContent = form.classList.contains("hidden")
      ? "➕ Agregar unidad"
      : "➖ Ocultar formulario";
  });
}

// =====================
// CARGA JSON
// =====================
fetch("hoteles1.json")
  .then(r => r.json())
  .then(data => {
    hotelesPorZona = data;
    cargarZonas();
    cargarFiltroZonas();
  });

fetch("unidades.json")
  .then(r => r.json())
  .then(data => {
    listaUnidades = data;
    cargarUnidades();
  });

// =====================
// FORM
// =====================
function initForm() {
  const form = document.getElementById("formulario");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const unidad = val("unidad");
    const hora = val("hora");
    const zona = val("zona");
    const hotel = val("hotel");

    if (!unidad || !hora || !zona || !hotel) return;

    const tbody = document.querySelector("#tablaRegistros tbody");
    if (!tbody) return;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td></td>
      <td>${new Date().toLocaleTimeString()}</td>
      <td>${unidad}</td>
      <td>${hora}</td>
      <td>${zona}</td>
      <td>${hotel}</td>
      <td>${val("cuenta")}</td>
      <td>${val("servicio")}</td>
      <td>--</td>
      <td></td>
      <td></td>
    `;

    tbody.appendChild(tr);
    form.reset();
  });
}

// =====================
// FILTROS
// =====================
function initFiltros() {
  document.getElementById("filtroZona")?.addEventListener("change", aplicarFiltros);
  document.getElementById("filtroCuenta")?.addEventListener("change", aplicarFiltros);
}

function aplicarFiltros() {
  const zona = val("filtroZona");
  const cuenta = val("filtroCuenta");

  document.querySelectorAll("#tablaRegistros tbody tr").forEach(tr => {

    const z = tr.children[4]?.textContent;
    const c = tr.children[6]?.textContent;

    let show = true;

    if (zona && zona !== z) show = false;
    if (cuenta && cuenta !== c) show = false;

    tr.style.display = show ? "" : "none";
  });
}

// =====================
// CARGAS UI
// =====================
function cargarUnidades() {
  const sel = document.getElementById("unidad");
  if (!sel) return;

  sel.innerHTML = '<option value="">Unidad</option>';

  listaUnidades.forEach(u => {
    const opt = document.createElement("option");
    opt.value = u.unidad;
    opt.textContent = u.unidad;
    sel.appendChild(opt);
  });
}

function cargarZonas() {
  const sel = document.getElementById("zona");
  if (!sel) return;

  sel.innerHTML = '<option value="">Zona</option>';

  Object.keys(hotelesPorZona).forEach(z => {
    const opt = document.createElement("option");
    opt.value = z;
    opt.textContent = z;
    sel.appendChild(opt);
  });
}

function cargarFiltroZonas() {
  const sel = document.getElementById("filtroZona");
  if (!sel) return;

  sel.innerHTML = '<option value="">Todas</option>';

  Object.keys(hotelesPorZona).forEach(z => {
    const opt = document.createElement("option");
    opt.value = z;
    opt.textContent = z;
    sel.appendChild(opt);
  });
}

// =====================
// HELPERS
// =====================
function val(id) {
  return document.getElementById(id)?.value || "";
}
