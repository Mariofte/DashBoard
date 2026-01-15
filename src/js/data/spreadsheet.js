// ================= CONFIGURACIÓN =================

const csvURL =
  "https://docs.google.com/spreadsheets/d/1eed5Pgu65Gl1YJDIdwdRqflCAYgBAfQJ8t296Wa_t28/export?format=csv&gid=0";

let datosCSV = [];

// ================= NORMALIZADOR DE TEXTO =================
// Arregla encabezados rotos del CSV
function normalizar(texto) {
  return texto
    .replace(/\n/g, " ")        // elimina saltos de línea
    .replace(/"/g, "")          // elimina comillas
    .replace(/\s+/g, " ")       // espacios dobles
    .trim()
    .toLowerCase();             // todo en minúsculas
}

// ================= COLUMNAS DEFINIDAS =================
// USAMOS VERSIÓN NORMALIZADA (a prueba de Excel)

const columnas = {
  autonomo: [
    "pose",
    "movió en autónomo",
    "¿cuántas pelotas metió al goal autonomo?",
    "¿cuántas pelotas en overflow autonomo?",
    "¿cuántas palotas en patrones autonomo?",
    "¿cuántas minor fouls autonomo?",
    "¿cuántas major fouls autonomo?"
  ],

  teleop: [
    "¿cuántas pelotas dejó en el depot tele-op?",
    "¿cuántas pelotas metió al goal tele-op?",
    "¿cuántas pelotas en overflow tele-op?",
    "¿cuántas pelotas en patrones tele-op?",
    "¿cuántas veces abrió el túnel tele-op?",
    "¿cuántas minor fouls tele-op?",
    "¿cuántas major fouls tele-op?",
    "¿el robot se estacionó end-game?"
  ],

  evaluacion: [
    "¿habilidad de los drivers preguntas?",
    "¿habilidad del human player preguntas?",
    "¿velocidad del robot preguntas?",
    "¿comentarios adicionales preguntas?"
  ]
};

// ================= CARGA DEL CSV =================

Papa.parse(csvURL, {
  download: true,
  skipEmptyLines: true,
  complete: function (results) {

    // Guardamos CSV
    datosCSV = results.data;

    // Limpiar encabezados reales del CSV
    const encabezadosOriginales = datosCSV[0];
    const encabezadosLimpios = encabezadosOriginales.map(normalizar);

    // Reemplazamos encabezados por los limpios
    datosCSV[0] = encabezadosLimpios;

    // Tabla global
    document.getElementById("tablaGlobal").innerHTML =
      crearTabla(datosCSV, encabezadosLimpios);

    // Selector de equipos
    llenarSelectorEquipos();
  }
});

// ================= FUNCIONES =================

// Crear tabla genérica
function crearTabla(filas, columnasMostrar) {
  let html = `
    <div class="table-responsive">
    <table class="table table-sm table-hover">
      <thead class="table-dark"><tr>
  `;

  columnasMostrar.forEach(c => html += `<th>${c}</th>`);
  html += "</tr></thead><tbody>";

  filas.slice(1).forEach(fila => {
    html += "<tr>";
    columnasMostrar.forEach(col => {
      const i = filas[0].indexOf(col);
      html += `<td>${fila[i] ?? ""}</td>`;
    });
    html += "</tr>";
  });

  html += "</tbody></table></div>";
  return html;
}

// Selector de equipos
function llenarSelectorEquipos() {
  const select = document.getElementById("equipoSelect");
  const idxEquipo = datosCSV[0].indexOf("equipo");

  const equipos = [...new Set(
    datosCSV.slice(1).map(f => f[idxEquipo])
  )];

  equipos.forEach(eq => {
    const op = document.createElement("option");
    op.value = eq;
    op.textContent = `Equipo ${eq}`;
    select.appendChild(op);
  });

  select.addEventListener("change", mostrarEquipo);
}

// Mostrar datos por equipo
function mostrarEquipo() {
  const equipo = this.value;
  if (!equipo) return;

  document.getElementById("resultadosEquipo")
    .classList.remove("d-none");

  const idxEquipo = datosCSV[0].indexOf("equipo");

  const filasEquipo = [
    datosCSV[0],
    ...datosCSV.slice(1).filter(f => f[idxEquipo] == equipo)
  ];

  document.getElementById("tablaAutoEquipo").innerHTML =
    crearTabla(filasEquipo, columnas.autonomo.map(normalizar));

  document.getElementById("tablaTeleopEquipo").innerHTML =
    crearTabla(filasEquipo, columnas.teleop.map(normalizar));

  document.getElementById("tablaEvalEquipo").innerHTML =
    crearTabla(filasEquipo, columnas.evaluacion.map(normalizar));
}
