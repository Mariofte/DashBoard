const csvURL = "https://docs.google.com/spreadsheets/d/1eed5Pgu65Gl1YJDIdwdRqflCAYgBAfQJ8t296Wa_t28/export?format=csv&gid=0";

Papa.parse(csvURL, {
  download: true,
  header: false,
  skipEmptyLines: true,
  complete: function (results) {
    const filas = results.data;

    let html = `
      <table class="table table-sm table-striped table-bordered table-hover align-middle">
        <thead class="table-dark">
          <tr>
    `;

    // encabezados
    filas[0].forEach(col => {
      html += `<th>${col}</th>`;
    });

    html += `
          </tr>
        </thead>
        <tbody>
    `;

    // datos
    filas.slice(1).forEach(fila => {
      html += "<tr>";
      fila.forEach(col => {
        html += `<td>${col}</td>`;
      });
      html += "</tr>";
    });

    html += `
        </tbody>
      </table>
    `;

    document.getElementById("tabla").innerHTML = html;
  }
});
