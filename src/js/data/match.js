// ===============================
// CONFIGURACIÓN
// ===============================
const csvURL =
  "https://docs.google.com/spreadsheets/d/1LnDbS_SvPKxa2f5kJvoCMRqZdLJATMsuFKt0S6tWPs8/export?format=csv&gid=0";

let datos = [];
let chartPelotas = null;
let chartPatrones = null;
let chartFouls = null;

// ===============================
// CARGA DEL CSV
// ===============================
Papa.parse(csvURL, {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function (results) {
    datos = results.data.map(d => ({
      ...d,
      Match: Number(d.Match)
    }));

    cargarSelectorEquipos();
    cargarSelectorTipos();
    actualizarVista();
  }
});

// ===============================
// SELECTOR DE EQUIPOS
// ===============================
function cargarSelectorEquipos() {
  const selector = document.getElementById("selectorEquipo");
  selector.innerHTML = "";

  const equipos = [...new Set(datos.map(d => d.Equipo))];

  equipos.forEach((e, i) => {
    const option = document.createElement("option");
    option.value = e;
    option.textContent = e;
    if (i === 0) option.selected = true;
    selector.appendChild(option);
  });

  selector.onchange = actualizarVista;
}

// ===============================
// SELECTOR DE TIPOS DE MATCH
// ===============================
function cargarSelectorTipos() {
  const selector = document.getElementById("selectorTipo");
  selector.innerHTML = "";

  const tipos = [...new Set(datos.map(d => d.Tipo))];

  tipos.forEach((t, i) => {
    const option = document.createElement("option");
    option.value = t;
    option.textContent = t;
    if (i === 0) option.selected = true;
    selector.appendChild(option);
  });

  selector.onchange = actualizarVista;
}

// ===============================
// ACTUALIZAR DASHBOARD
// ===============================
function actualizarVista() {
  const equipo = document.getElementById("selectorEquipo")?.value;
  const tipo = document.getElementById("selectorTipo")?.value;

  if (!equipo || !tipo) return;

  const filtrados = datos
    .filter(d => d.Equipo === equipo && d.Tipo === tipo)
    .sort((a, b) => a.Match - b.Match);

  if (filtrados.length === 0) return;

  renderTabla(filtrados);
  renderGraficas(filtrados);
}

// ===============================
// TABLA DEL EQUIPO
// ===============================
function renderTabla(filas) {
  let html = "<table class='table table-sm table-striped table-bordered'>";
  html += "<thead><tr>";

  Object.keys(filas[0]).forEach(col => {
    html += `<th>${col}</th>`;
  });

  html += "</tr></thead><tbody>";

  filas.forEach(fila => {
    html += "<tr>";
    Object.values(fila).forEach(v => {
      html += `<td>${v}</td>`;
    });
    html += "</tr>";
  });

  html += "</tbody></table>";
  document.getElementById("tablaEquipo").innerHTML = html;
}

// ===============================
// GRAFICAS POR MATCH
// ===============================
function renderGraficas(filas) {

  const labels = filas.map(f => `Match ${f.Match}`);

  const pelotas = filas.map(f =>
    num(f["¿Cuántas pelotas metió al goal autonomo?"]) +
    num(f["¿Cuántas pelotas en Overflow autonomo?"]) +
    num(f["¿Cuántas pelotas metió al goal Tele-Op?"]) +
    num(f["¿Cuántas pelotas en Overflow Tele-Op?"])
  );

  const patrones = filas.map(f =>
    num(f["¿Cuántas pelotas en patrones autonomo?"]) +
    num(f["¿Cuántas pelotas en patrones Tele-Op?"])
  );

  const fouls = filas.map(f =>
    num(f["¿Cuántas minor fouls autonomo?"]) +
    num(f["¿Cuántas major fouls autonomo?"]) +
    num(f["¿Cuántas minor fouls Tele-Op?"]) +
    num(f["¿Cuántas major fouls Tele-Op?"])
  );

  chartPelotas?.destroy();
  chartPatrones?.destroy();
  chartFouls?.destroy();

  chartPelotas = new Chart(document.getElementById("graficaPelotas"), {
    type: "bar",
    data: {
      labels,
      datasets: [{ label: "Pelotas por match", data: pelotas }]
    }
  });

  chartPatrones = new Chart(document.getElementById("graficaPatrones"), {
    type: "bar",
    data: {
      labels,
      datasets: [{ label: "Patrones por match", data: patrones }]
    }
  });

  chartFouls = new Chart(document.getElementById("graficaFouls"), {
    type: "bar",
    data: {
      labels,
      datasets: [{ label: "Fouls por match", data: fouls }]
    }
  });
}

// ===============================
// UTILIDAD
// ===============================
function num(v) {
  return Number(v) || 0;
}
