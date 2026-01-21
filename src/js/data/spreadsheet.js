// URL del CSV (Google Sheets)
const csvURL = "https://docs.google.com/spreadsheets/d/1eed5Pgu65Gl1YJDIdwdRqflCAYgBAfQJ8t296Wa_t28/export?format=csv&gid=0";

// Guardamos todo el CSV aquí
let datos = [];

// Gráficas (para poder destruirlas y recrearlas)
let chartPelotas, chartPatrones, chartFouls;

// Leer CSV
Papa.parse(csvURL, {
    download: true,
    header: true, // CSV YA tiene encabezados bien hechos
    skipEmptyLines: true,
    complete: function (results) {
        datos = results.data;
        cargarSelectorEquipos();
    }
});

// Llena el selector con equipos únicos
function cargarSelectorEquipos() {
    const selector = document.getElementById("selectorEquipo");

    const equipos = [...new Set(datos.map(d => d.Equipo))];

    equipos.forEach(equipo => {
        const option = document.createElement("option");
        option.value = equipo;
        option.textContent = equipo;
        selector.appendChild(option);
    });

    // Mostrar primer equipo automáticamente
    mostrarEquipo(equipos[0]);

    selector.addEventListener("change", () => {
        mostrarEquipo(selector.value);
    });
}

// Muestra tabla + gráficas del equipo
function mostrarEquipo(equipo) {
    const datosEquipo = datos.filter(d => d.Equipo === equipo);

    renderTabla(datosEquipo);
    renderGraficas(datosEquipo);
}

// Construye la tabla del equipo
function renderTabla(filas) {
    let html = `<table class="table table-sm table-bordered table-striped">`;

    html += "<thead><tr>";
    Object.keys(filas[0]).forEach(col => {
        html += `<th>${col}</th>`;
    });
    html += "</tr></thead><tbody>";

    filas.forEach(fila => {
        html += "<tr>";
        Object.values(fila).forEach(valor => {
            html += `<td>${valor}</td>`;
        });
        html += "</tr>";
    });

    html += "</tbody></table>";

    document.getElementById("tablaEquipo").innerHTML = html;
}

// Crea las gráficas
function renderGraficas(filas) {

    // SUMAS
    const pelotas = filas.reduce((s, f) =>
        s +
        Number(f["¿Cuántas pelotas metió al goal autonomo?"]) +
        Number(f["¿Cuántas pelotas en Overflow autonomo?"]) +
        Number(f["¿Cuántas pelotas metió al goal Tele-Op?"]) +
        Number(f["¿Cuántas pelotas en Overflow Tele-Op?"])
    , 0);

    const patrones = filas.reduce((s, f) =>
        s +
        Number(f["¿Cuántas palotas en patrones autonomo?"]) +
        Number(f["¿Cuántas pelotas en patrones Tele-Op?"])
    , 0);

    const fouls = filas.reduce((s, f) =>
        s +
        Number(f["¿Cuántas minor fouls autonomo?"]) +
        Number(f["¿Cuántas major fouls autonomo?"]) +
        Number(f["¿Cuántas minor fouls Tele-Op?"]) +
        Number(f["¿Cuántas major fouls Tele-Op?"])
    , 0);

    // Limpiar gráficas anteriores
    chartPelotas?.destroy();
    chartPatrones?.destroy();
    chartFouls?.destroy();

    // PLOT
    chartPelotas = new Chart(document.getElementById("graficaPelotas"), {
        type: "bar",
        data: { labels: ["Pelotas"], datasets: [{ data: [pelotas] }] }
    });

    chartPatrones = new Chart(document.getElementById("graficaPatrones"), {
        type: "bar",
        data: { labels: ["Patrones"], datasets: [{ data: [patrones] }] }
    });

    chartFouls = new Chart(document.getElementById("graficaFouls"), {
        type: "bar",
        data: { labels: ["Fouls"], datasets: [{ data: [fouls] }] }
    });
}
