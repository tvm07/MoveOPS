
/* =====================
   SESIÓN / LOGIN
===================== */

const users = [
  { user: "admin", pass: "1234", role: "admin" },
  { user: "editor", pass: "1234", role: "editor" },
  { user: "viewer", pass: "1234", role: "viewer" }
];

function login() {
  const user = document.getElementById("user")?.value;
  const pass = document.getElementById("pass")?.value;

  const found = users.find(u => u.user === user && u.pass === pass);

  if (found) {
    localStorage.setItem("session", JSON.stringify(found));
    window.location.href = "app.html";
  } else {
    document.getElementById("error").innerText =
      "Usuario o contraseña incorrectos";
  }
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem("session"));
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem("session");
  window.location.href = "login.html";
}

/* =====================
   SEGURIDAD APP
===================== */

const session = getSession();

if (window.location.pathname.includes("app.html")) {
  if (!session) {
    window.location.href = "login.html";
  } else {
    aplicarPermisos(session.role);
    mostrarUsuario(session);
  }
}

function mostrarUsuario(session) {
  const el = document.getElementById("userInfo");
  if (el) el.textContent = `Usuario: ${session.user} (${session.role})`;
}

/* =====================
   PERMISOS
===================== */

function aplicarPermisos(role) {

  if (role === "viewer") {
    document.querySelectorAll(".btn-ingresado, .btn-despachado")
      .forEach(b => b.style.display = "none");

    document.getElementById("formulario")?.style.display = "none";
    document.getElementById("btnExportar")?.style.display = "none";
  }

  if (role === "editor") {
    document.getElementById("btnExportar")?.style.display = "none";
  }
}

/* =====================
   VARIABLES
===================== */

let hotelesPorZona = {};
let listaUnidades = {};

/* =====================
   UTIL
===================== */

function tiempoAMinutos(tiempoStr) {
  if (!tiempoStr) return 0;
  const [h, m] = tiempoStr.split(":").map(Number);
  return (h * 60) + m;
}

function obtenerHoraActual() {
  const ahora = new Date();
  return ahora.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

/* =====================
   FETCH DATA
===================== */

fetch("hoteles1.json")
  .then(r => r.json())
  .then(data => {
    hotelesPorZona = data;
    cargarZonas();
    cargarFiltroZonas();
  })
  .catch(() => console.error("Error cargando hoteles"));

fetch("unidades.json")
  .then(r => r.json())
  .then(data => {
    listaUnidades = data;
    cargarUnidades();
  })
  .catch(() => console.error("Error cargando unidades"));

/* =====================
   INIT DOM (CLAVE)
===================== */

window.addEventListener("DOMContentLoaded", () => {
  initToggle();
  initFormulario();
  initFiltros();
});

/* =====================
   TOGGLE FORM
===================== */

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

/* =====================
   UNIDADES
===================== */

function cargarUnidades() {
  const select = document.getElementById("unidad");
  if (!select) return;

  select.innerHTML = '<option value="">Selecciona unidad</option>';

  listaUnidades.forEach(item => {
    const option = document.createElement("option");
    option.value = item.unidad;
    option.textContent = `${item.unidad} (${item.proveedor})`;
    select.appendChild(option);
  });
}

/* =====================
   ZONAS
===================== */

function cargarZonas() {
  const zonaSelect = document.getElementById("zona");
  if (!zonaSelect) return;

  zonaSelect.innerHTML = '<option value="">Selecciona zona</option>';

  Object.keys(hotelesPorZona).forEach(z => {
    const opt = document.createElement("option");
    opt.value = z;
    opt.textContent = z;
    zonaSelect.appendChild(opt);
  });
}

function cargarFiltroZonas() {
  const filtro = document.getElementById("filtroZona");
  if (!filtro) return;

  filtro.innerHTML = '<option value="">Todas las zonas</option>';

  Object.keys(hotelesPorZona).forEach(z => {
    const opt = document.createElement("option");
    opt.value = z;
    opt.textContent = z;
    filtro.appendChild(opt);
  });
}

/* =====================
   FORMULARIO
===================== */

function initFormulario() {
  const form = document.getElementById("formulario");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const unidad = document.getElementById("unidad").value;
    const hora = document.getElementById("hora").value;
    const zona = document.getElementById("zona").value;
    const hotel = document.getElementById("hotel").value;
    const cuenta = document.getElementById("cuenta").value;
    const servicio = document.getElementById("servicio").value;

    if (!unidad || !hora || !zona || !hotel) {
      alert("Completa todos los campos");
      return;
    }

    const tabla = document.querySelector("#tablaRegistros tbody");
    if (!tabla) return;

    const fila = document.createElement("tr");

    fila.dataset.estado = "activo";
    fila.dataset.tiempoMin = 0;

    fila.innerHTML = `
      <td></td>
      <td>${obtenerHoraActual()}</td>
      <td>${unidad}</td>
      <td>${hora}</td>
      <td>${zona}</td>
      <td>${hotel}</td>
      <td>${cuenta}</td>
      <td>${servicio}</td>
      <td>--</td>
      <td class="trayecto"></td>
      <td>
        <button class="btn-ingresado">Ingresado</button>
        <button class="btn-despachado">Despachado</button>
      </td>
    `;

    fila.querySelector(".btn-ingresado").onclick = () => {
      const t = prompt("Código de trayecto:");
      if (t) fila.querySelector(".trayecto").textContent = t;
    };

    fila.querySelector(".btn-despachado").onclick = () => {
      fila.dataset.estado = "despachado";
      fila.classList.add("estado-ingresado");
    };

    tabla.appendChild(fila);

    form.reset();
  });
}

/* =====================
   FILTROS (BÁSICO)
===================== */

function initFiltros() {
  document.getElementById("filtroZona")?.addEventListener("change", aplicarFiltros);
  document.getElementById("filtroCuenta")?.addEventListener("change", aplicarFiltros);
}

function aplicarFiltros() {
  const zona = document.getElementById("filtroZona")?.value;
  const cuenta = document.getElementById("filtroCuenta")?.value;

  document.querySelectorAll("#tablaRegistros tbody tr").forEach(fila => {
    const z = fila.children[4]?.textContent;
    const c = fila.children[6]?.textContent;

    let show = true;

    if (zona && zona !== z) show = false;
    if (cuenta && cuenta !== c) show = false;

    fila.style.display = show ? "" : "none";
  });
}
