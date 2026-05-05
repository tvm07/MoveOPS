// =====================
// USUARIOS (LOGIN)
// =====================
const users = [
  { user: "admin", pass: "1234", role: "admin" },
  { user: "editor", pass: "1234", role: "editor" },
  { user: "viewer", pass: "1234", role: "viewer" }
];

// =====================
// LOGIN
// =====================
function login() {
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;

  const found = users.find(u => u.user === user && u.pass === pass);

  if (found) {
    localStorage.setItem("session", JSON.stringify(found));
    window.location.href = "app.html";
  } else {
    document.getElementById("error").innerText =
      "Usuario o contraseña incorrectos";
  }
}

// =====================
// SESIÓN
// =====================
function getSession() {
  try {
    return JSON.parse(localStorage.getItem("session"));
  } catch {
    return null;
  }
}

const session = getSession();

if (window.location.pathname.includes("app.html")) {
  if (!session) {
    window.location.href = "login.html";
  } else {
    aplicarPermisos(session.role);
    mostrarUsuario(session);
  }
}

// =====================
// MOSTRAR USUARIO
// =====================
function mostrarUsuario(session) {
  const el = document.getElementById("userInfo");
  if (!el) return;

  el.textContent = `Usuario: ${session.user} (${session.role})`;
}

// =====================
// PERMISOS
// =====================
function aplicarPermisos(role) {

  const isViewer = role === "viewer";
  const isEditor = role === "editor";

  if (isViewer) {
    document.querySelectorAll(".btn-ingresado, .btn-despachado")
      .forEach(b => b.style.display = "none");

    document.getElementById("formulario")?.style.display = "none";
    document.getElementById("btnExportar")?.style.display = "none";
  }

  if (isEditor) {
    document.getElementById("btnExportar")?.style.display = "none";
  }
}

// =====================
// LOGOUT
// =====================
function logout() {
  localStorage.removeItem("session");
  window.location.href = "login.html";
}

// =====================
// VARIABLES
// =====================
let hotelesPorZona = {};
let listaUnidades = [];

// =====================
// UTIL
// =====================
function tiempoAMinutos(tiempoStr) {
  if (!tiempoStr) return 0;
  const [h, m] = tiempoStr.split(":").map(Number);
  return (h * 60) + m;
}

// =====================
// HOTEL
// =====================
function obtenerTiempoHotel(nombreHotel, zona) {
  const hoteles = hotelesPorZona[zona] || [];
  const encontrado = hoteles.find(h => h.nombre === nombreHotel);
  if (!encontrado) return null;
  return tiempoAMinutos(encontrado.tiempo_min);
}

// =====================
// CARGA JSON
// =====================
fetch("hoteles1.json")
  .then(res => res.json())
  .then(data => {
    hotelesPorZona = data;
    cargarZonas();
    cargarFiltroZonas();
  });

fetch("unidades.json")
  .then(res => res.json())
  .then(data => {
    listaUnidades = data;
    cargarUnidades();
  });

// =====================
// 🔥 TOGGLE FORM (FIX DEFINITIVO)
// =====================
function initToggleFormulario() {
  const btn = document.getElementById("toggleFormulario");
  const form = document.getElementById("contenedorFormulario");

  if (!btn || !form) {
    console.warn("Toggle no encontrado");
    return;
  }

  btn.addEventListener("click", () => {
    form.classList.toggle("hidden");

    btn.textContent = form.classList.contains("hidden")
      ? "➕ Agregar unidad"
      : "➖ Ocultar formulario";
  });
}

// ejecución segura (EVITA TODOS LOS BUGS)
window.addEventListener("load", initToggleFormulario);

// =====================
// UNIDADES
// =====================
function cargarUnidades() {
  const select = document.getElementById("unidad");
  select.innerHTML = '<option value="">Selecciona unidad</option>';

  listaUnidades.forEach(item => {
    const option = document.createElement("option");
    option.value = item.unidad;
    option.textContent = `${item.unidad} (${item.proveedor})`;
    select.appendChild(option);
  });
}

// =====================
// ZONAS
// =====================
function cargarZonas() {
  const zonaSelect = document.getElementById("zona");
  zonaSelect.innerHTML = '<option value="">Selecciona zona</option>';

  Object.keys(hotelesPorZona).forEach(zona => {
    const option = document.createElement("option");
    option.value = zona;
    option.textContent = zona;
    zonaSelect.appendChild(option);
  });
}

// =====================
// FILTRO ZONAS
// =====================
function cargarFiltroZonas() {
  const filtro = document.getElementById("filtroZona");
  if (!filtro) return;

  filtro.innerHTML = '<option value="">Todas las zonas</option>';

  Object.keys(hotelesPorZona).forEach(zona => {
    const option = document.createElement("option");
    option.value = zona;
    option.textContent = zona;
    filtro.appendChild(option);
  });
}

// =====================
// HOTELES
// =====================
document.getElementById("zona")?.addEventListener("change", function () {
  const zona = this.value;
  const listaHoteles = document.getElementById("listaHoteles");
  const hotelInput = document.getElementById("hotel");

  listaHoteles.innerHTML = "";
  hotelInput.value = "";

  if (!zona || !hotelesPorZona[zona]) return;

  hotelesPorZona[zona].forEach(item => {
    const option = document.createElement("option");
    option.value = item.nombre;
    listaHoteles.appendChild(option);
  });
});

// =====================
// HORA
// =====================
function obtenerHoraActual() {
  const ahora = new Date();
  return ahora.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

// =====================
// TIEMPO
// =====================
function calcularSegundosRestantes(horaServicio, tiempoMinimo) {
  const ahora = new Date();
  const [h, m] = horaServicio.split(":");

  const servicio = new Date();
  servicio.setHours(h, m, 0, 0);

  const salida = new Date(servicio.getTime() - (tiempoMinimo * 60000));
  return Math.floor((salida - ahora) / 1000);
}

function formatearTiempo(segundos) {
  if (segundos <= 0) return "Vencido";

  const min = Math.floor(segundos / 60);
  const sec = segundos % 60;

  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// =====================
// NUMERACIÓN
// =====================
function actualizarNumeros() {
  document.querySelectorAll("#tablaRegistros tbody tr")
    .forEach((fila, i) => fila.children[0].textContent = i + 1);
}

// =====================
// FILTROS
// =====================
function aplicarFiltros() {
  const zona = document.getElementById("filtroZona")?.value;
  const cuenta = document.getElementById("filtroCuenta")?.value;

  document.querySelectorAll("#tablaRegistros tbody tr").forEach(fila => {

    const zonaFila = fila.children[4].textContent;
    const cuentaFila = fila.children[6].textContent;

    let visible = true;

    if (zona && zona !== zonaFila) visible = false;
    if (cuenta && cuenta !== cuentaFila) visible = false;

    fila.style.display = visible ? "" : "none";
  });
}

// =====================
// ACTUALIZAR TIEMPOS
// =====================
function actualizarTiempos() {
  document.querySelectorAll("#tablaRegistros tbody tr").forEach(fila => {

    const horaServicio = fila.children[3].textContent;
    const celdaTiempo = fila.children[8];
    const tiempoMinimo = parseInt(fila.dataset.tiempoMin || 0);

    const segundos = calcularSegundosRestantes(horaServicio, tiempoMinimo);

    fila.dataset.tiempo = segundos;
    celdaTiempo.textContent = formatearTiempo(segundos);

    fila.classList.remove("estado-ingresado", "estado-vencido", "estado-alerta", "estado-ok");

    if (fila.dataset.estado === "despachado") {
      fila.classList.add("estado-ingresado");
      return;
    }

    if (segundos <= 600) fila.classList.add("estado-vencido");
    else if (segundos <= 1200) fila.classList.add("estado-alerta");
    else fila.classList.add("estado-ok");
  });

  ordenarTabla();
  aplicarFiltros();
}

// =====================
// ORDENAR
// =====================
function ordenarTabla() {
  const tbody = document.querySelector("#tablaRegistros tbody");

  Array.from(tbody.querySelectorAll("tr"))
    .sort((a, b) => {

      if (a.dataset.estado === "despachado" && b.dataset.estado !== "despachado") return 1;
      if (a.dataset.estado !== "despachado" && b.dataset.estado === "despachado") return -1;

      return (a.dataset.tiempo || 0) - (b.dataset.tiempo || 0);
    })
    .forEach(fila => tbody.appendChild(fila));

  actualizarNumeros();
}

// =====================
// SUBMIT
// =====================
document.getElementById("formulario")?.addEventListener("submit", function(e) {
  e.preventDefault();

  const unidad = document.getElementById("unidad").value;
  const hora = document.getElementById("hora").value;
  const zona = document.getElementById("zona").value;
  const hotel = document.getElementById("hotel").value;

  const tiempoMinimo = obtenerTiempoHotel(hotel, zona);
  const cuenta = document.getElementById("cuenta").value;
  const servicio = document.getElementById("servicio").value;

  if (!unidad || !hora || !zona || !hotel) return alert("Completa todos los campos");
  if (tiempoMinimo === null) return alert("Selecciona un hotel válido");

  const tabla = document.querySelector("#tablaRegistros tbody");

  const fila = document.createElement("tr");

  fila.dataset.tiempoMin = tiempoMinimo;
  fila.dataset.estado = "activo";

  fila.innerHTML = `
    <td></td>
    <td>${obtenerHoraActual()}</td>
    <td>${unidad}</td>
    <td>${hora}</td>
    <td>${zona}</td>
    <td>${hotel}</td>
    <td>${cuenta}</td>
    <td>${servicio}</td>
    <td></td>
    <td class="trayecto"></td>
    <td>
      <button class="btn-ingresado">Ingresado</button>
      <button class="btn-despachado">Despachado</button>
    </td>
  `;

  fila.querySelector(".btn-ingresado").onclick = () => {
    const trayecto = prompt("Código de trayecto:");
    if (trayecto) fila.querySelector(".trayecto").textContent = trayecto;
  };

  fila.querySelector(".btn-despachado").onclick = () => {
    fila.dataset.estado = "despachado";
    fila.classList.add("estado-ingresado");
    ordenarTabla();
  };

  tabla.appendChild(fila);

  actualizarTiempos();
  this.reset();
});

// =====================
// EVENTOS FILTROS
// =====================
["filtroZona", "filtroCuenta"].forEach(id => {
  document.getElementById(id)?.addEventListener("change", aplicarFiltros);
});

// =====================
// LOOP
// =====================
setInterval(actualizarTiempos, 1000);

// =====================
// EXCEL
// =====================
document.getElementById("btnExportar")?.addEventListener("click", () => {

  const data = Array.from(document.querySelectorAll("#tablaRegistros tbody tr"))
    .map(fila => ({
      "#": fila.children[0].textContent,
      "Registro": fila.children[1].textContent,
      "Unidad": fila.children[2].textContent,
      "Hora Servicio": fila.children[3].textContent,
      "Zona": fila.children[4].textContent,
      "Hotel": fila.children[5].textContent,
      "Cuenta": fila.children[6].textContent,
      "Tipo": fila.children[7].textContent,
      "Tiempo": fila.children[8].textContent,
      "Trayecto": fila.children[9].textContent,
      "Estado": fila.dataset.estado
    }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "Registros");
  XLSX.writeFile(wb, "operacion.xlsx");
});
