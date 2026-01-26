// ===============================
// CONFIGURACIÓN
// ===============================
const csvURL =
"https://docs.google.com/spreadsheets/d/1eed5Pgu65Gl1YJDIdwdRqflCAYgBAfQJ8t296Wa_t28/export?format=csv&gid=0";

let datos = [];
let chartPelotas, chartPatrones, chartFouls;

// ===============================
// CARGA DEL CSV
// ===============================
Papa.parse(csvURL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
        datos = results.data;
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

    equipos.forEach(e => {
        const option = document.createElement("option");
        option.value = e;
        option.textContent = e;
        selector.appendChild(option);
    });

    selector.addEventListener("change", actualizarVista);
}

// ===============================
// SELECTOR DE TIPOS DE MATCH
// ===============================
function cargarSelectorTipos() {
    const selector = document.getElementById("selectorTipo");
    selector.innerHTML = "";

    const tipos = [...new Set(datos.map(d => d.Tipo))];

    tipos.forEach(t => {
        const option = document.createElement("option");
        option.value = t;
        option.textContent = t;
        selector.appendChild(option);
    });

    selector.addEventListener("change", actualizarVista);
}

// ===============================
// ACTUALIZAR DASHBOARD
// ===============================
function actualizarVista() {
    const equipo = document.getElementById("selectorEquipo").value;
    const tipo = document.getElementById("selectorTipo").value;

    const filtrados = datos.filter(d =>
        d.Equipo === equipo &&
        d.Tipo === tipo
    );

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
        Number(f["¿Cuántas pelotas metió al goal autonomo?"]) +
        Number(f["¿Cuántas pelotas en Overflow autonomo?"]) +
        Number(f["¿Cuántas pelotas metió al goal Tele-Op?"]) +
        Number(f["¿Cuántas pelotas en Overflow Tele-Op?"])
    );

    const patrones = filas.map(f =>
        Number(f["¿Cuántas palotas en patrones autonomo?"]) +
        Number(f["¿Cuántas pelotas en patrones Tele-Op?"])
    );

    const fouls = filas.map(f =>
        Number(f["¿Cuántas minor fouls autonomo?"]) +
        Number(f["¿Cuántas major fouls autonomo?"]) +
        Number(f["¿Cuántas minor fouls Tele-Op?"]) +
        Number(f["¿Cuántas major fouls Tele-Op?"])
    );

    chartPelotas?.destroy();
    chartPatrones?.destroy();
    chartFouls?.destroy();

    chartPelotas = new Chart(graficaPelotas, {
        type: "bar",
        data: { labels, datasets: [{ label: "Pelotas", data: pelotas }] }
    });

    chartPatrones = new Chart(graficaPatrones, {
        type: "bar",
        data: { labels, datasets: [{ label: "Patrones", data: patrones }] }
    });

    chartFouls = new Chart(graficaFouls, {
        type: "bar",
        data: { labels, datasets: [{ label: "Fouls", data: fouls }] }
    });
}
