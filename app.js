// =====================
// USUARIOS (LOGIN SIMPLE)
// =====================
const users = [
  { user: "admin", pass: "1234", role: "admin" },
  { user: "editor", pass: "1234", role: "editor" },
  { user: "viewer", pass: "1234", role: "viewer" }
];

// LOGIN FUNCTION (para login.html)
function login() {
  const user = document.getElementById("user")?.value;
  const pass = document.getElementById("pass")?.value;
  const error = document.getElementById("error");

  const found = users.find(u => u.user === user && u.pass === pass);

  if (found) {
    localStorage.setItem("session", JSON.stringify(found));
    window.location.href = "index.html";
  } else {
    if (error) error.textContent = "Usuario o contraseña incorrectos";
  }
}
// =====================
// STATE
// =====================
let hotelesPorZona = {};
let listaUnidades = [];

// =====================
// INIT
// =====================
window.addEventListener("DOMContentLoaded", () => {

  validarSesion();
  initForm();
  initFiltros();
  cargarDatos();
  initHoteles();
});

// =====================
// 🔐 SESIÓN (LOGIN)
// =====================
function validarSesion() {

  const session = safeJSON(localStorage.getItem("session"));

  // 🔥 bloqueo total si no hay login
  if (!session && location.pathname.includes("app")) {
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

  const btnExport = document.getElementById("btnExportar");
  const form = document.getElementById("formulario");

  if (role === "viewer") {

    document.querySelectorAll(".btn-ingresado, .btn-despachado")
      .forEach(b => b.style.display = "none");

    if (form) form.style.display = "none";
    if (btnExport) btnExport.style.display = "none";
  }

  if (role === "editor") {
    if (btnExport) btnExport.style.display = "none";
  }
}

// =====================
// CARGA DATOS
// =====================
function cargarDatos() {

  fetch("hoteles1.json")
    .then(r => r.json())
    .then(data => {
      hotelesPorZona = data;
      cargarZonas();
      cargarFiltroZonas();
    })
    .catch(err => console.error("hoteles error:", err));

  fetch("unidades.json")
    .then(r => r.json())
    .then(data => {
      listaUnidades = data;
      cargarUnidades();
    })
    .catch(err => console.error("unidades error:", err));
}

// =====================
// 🔥 HOTELS FIX
// =====================
function initHoteles() {

  const zonaSelect = document.getElementById("zona");
  const hotelInput = document.getElementById("hotel");
  const datalist = document.getElementById("listaHoteles");

  if (!zonaSelect || !hotelInput || !datalist) return;

  zonaSelect.addEventListener("change", () => {

    const zona = zonaSelect.value;

    datalist.innerHTML = "";
    hotelInput.value = "";

    if (!zona || !hotelesPorZona[zona]) return;

    hotelesPorZona[zona].forEach(h => {
      const option = document.createElement("option");
      option.value = h.nombre;
      datalist.appendChild(option);
    });

  });
}

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
// LOADERS
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

function safeJSON(v) {
  try { return JSON.parse(v); } catch { return null; }
}