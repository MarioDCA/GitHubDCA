// ============================================================
// INČICA: 2026-07-28
// Opis: Apps Script za kviz - sprejema POST podatke, jih shrani v Google Sheet
//       in pošlje HTML email z rezultati.
// Avtor: M.V. (DeepSeek)
// ============================================================

// ============================================================
// FUNKCIJA za GET zahtevke (ko odpreš URL v browserju)
// ============================================================
function doGet() {
  var htmlOutput = HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Kviz API - Test</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #f0f4f8; }
        .container { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { color: #667eea; }
        .info { background: #e8f4fd; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; }
        .status { color: #2ecc71; font-weight: bold; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
        .example { background: #2d2d2d; color: #f8f8f8; padding: 15px; border-radius: 8px; overflow-x: auto; font-size: 13px; }
        .footer { margin-top: 30px; color: #6c757d; font-size: 12px; border-top: 1px solid #dee2e6; padding-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Kviz API - Aktiven</h1>
        <div class="info">
          <p><span class="status">✅</span> Web App je uspešno objavljen!</p>
          <p>📌 Ta URL sprejema <strong>POST</strong> zahtevke za shranjevanje rezultatov kviza.</p>
        </div>
        
        <h3>📤 Kako uporabljati:</h3>
        <p>Pošlji POST zahtevek z JSON podatki na ta URL.</p>
        
        <h4>Primer JSON:</h4>
        <div class="example">
          {
            "ime": "Janez Novak",
            "kviz": "OR_1.json",
            "pravilni": 4,
            "vprasanja": 5,
            "ocena": 4,
            "Q1": 1,
            "Q2": 0,
            "Q3": 1,
            "Q4": 1,
            "Q5": 1
          }
        </div>
        
        <h4>Primer klica v JavaScript:</h4>
        <div class="example">
          fetch('${ScriptApp.getService().getUrl()}', {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ime: 'Janez Novak',
              kviz: 'OR_1.json',
              pravilni: 4,
              vprasanja: 5,
              ocena: 4,
              Q1: 1, Q2: 0, Q3: 1, Q4: 1, Q5: 1
            })
          })
        </div>
        
        <h4>Primer s cURL:</h4>
        <div class="example">
          curl -X POST ${ScriptApp.getService().getUrl()} \\
            -H "Content-Type: application/json" \\
            -d '{"ime":"Janez Novak","kviz":"OR_1.json","pravilni":4,"vprasanja":5,"ocena":4,"Q1":1,"Q2":0,"Q3":1,"Q4":1,"Q5":1}'
        </div>
        
        <div class="footer">
          <p>📅 Inačica: 2026-07-28</p>
          <p>© 2026 - Vse pravice pridržane</p>
        </div>
      </div>
    </body>
    </html>
  `);
  return htmlOutput;
}

// ============================================================
// GLAVNA FUNKCIJA za POST zahtevke
// ============================================================
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Pripravi vrstico za vnos
    var row = [];
    row.push(new Date()); // trenutni datum
    row.push(data.ime || "");
    row.push(data.kviz || "");
    row.push(data.pravilni || 0);
    row.push(data.vprasanja || 0);
    row.push(data.ocena || 0);
    
    // Dodaj podrobnosti po vprašanjih
    for (var i = 1; i <= data.vprasanja; i++) {
      row.push(data["Q" + i] || 0);
    }
    
    // Zapiši v sheet
    sheet.appendRow(row);
    
    // POŠLJI LEP HTML EMAIL
    sendNiceEmail(row, data);
    
    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================
// FUNKCIJA za pošiljanje lepega HTML emaila z rezultati kviza
// ============================================================
function sendNiceEmail(rowData, data) {
  // Podatki iz vrstice
  var ime = rowData[1];
  var kviz = rowData[2];
  var pravilni = rowData[3];
  var skupaj = rowData[4];
  var ocenaStevilka = rowData[5];
  
  // Uporabi podatke iz JSON za lepši naslov kviza
  var kvizNaslov = data.kviz || kviz;
  
  // Če je test.json, uporabi lepši naslov
  if (kviz === "test.json") {
    kvizNaslov = "🧪 Testni kviz (5 vprašanj)";
  }
  // Če je OR_1.json, uporabi lepši naslov
  else if (kviz === "OR_1.json") {
    kvizNaslov = "Osnovni računalniški pojmi";
  }
  else if (kviz === "OR_2.json") {
    kvizNaslov = "Osnove interneta in brskanja";
  }
  else if (kviz === "OR_3.json") {
    kvizNaslov = "Varnost na spletu";
  }
  else if (kviz === "OR_4.json") {
    kvizNaslov = "Strojna oprema in bližnjice";
  }
  else if (kviz === "OR_5.json") {
    kvizNaslov = "Sodobne aplikacije in naprave";
  }
  else if (kviz === "AI_1.json") {
    kvizNaslov = "Pravilna raba pozivov (promptov)";
  }
  else if (kviz === "AI_2.json") {
    kvizNaslov = "Uporaba umetne inteligence";
  }
  
  var rawDate = rowData[0];
  var cas = Utilities.formatDate(new Date(rawDate), "Europe/Ljubljana", "dd. MM. yyyy, HH:mm:ss");
  var percent = Math.round((pravilni / skupaj) * 100);
  
  // Določi oceno
  var ocenaBesedilo = "";
  var ocenaBarva = "";
  var emoji = "";
  if (percent >= 90) { 
    ocenaBesedilo = "ODLIČNO (5)"; 
    ocenaBarva = "#2ecc71"; 
    emoji = "🏆"; 
  }
  else if (percent >= 75) { 
    ocenaBesedilo = "PRAV DOBRO (4)"; 
    ocenaBarva = "#f39c12"; 
    emoji = "🌟"; 
  }
  else if (percent >= 60) { 
    ocenaBesedilo = "DOBRO (3)"; 
    ocenaBarva = "#e67e22"; 
    emoji = "👍"; 
  }
  else if (percent >= 40) { 
    ocenaBesedilo = "ZAHTEVA VEČ VADE (2)"; 
    ocenaBarva = "#e74c3c"; 
    emoji = "📚"; 
  }
  else { 
    ocenaBesedilo = "POSKUSI ZNOVA (1)"; 
    ocenaBarva = "#e74c3c"; 
    emoji = "💪"; 
  }
  
  // Pridobi podrobnosti po vprašanjih
  var podrobnosti = "";
  var stVprasanj = skupaj;
  for (var i = 0; i < stVprasanj; i++) {
    var stolpecIndex = 6 + i;
    var rezultat = rowData[stolpecIndex];
    var ikona = (rezultat == 1) ? "✅" : "❌";
    var barva = (rezultat == 1) ? "#d4edda" : "#f8d7da";
    podrobnosti += `
      <tr style="background-color: ${barva};">
        <td style="padding: 8px 12px; border: 1px solid #ddd; text-align: center;">${i+1}</td>
        <td style="padding: 8px 12px; border: 1px solid #ddd; text-align: center;">${ikona} ${(rezultat == 1) ? 'Pravilno' : 'Napačno'}</td>
      </tr>
    `;
  }
  
  // Ustvari LEP HTML EMAIL
  var htmlBody = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f0f4f8; }
      .header { 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
        color: white; 
        padding: 25px; 
        border-radius: 15px 15px 0 0; 
        text-align: center; 
      }
      .header h2 { margin: 0; font-size: 24px; }
      .header p { margin: 5px 0 0; opacity: 0.9; }
      .content { 
        background: white; 
        padding: 25px; 
        border-radius: 0 0 15px 15px; 
        border: 1px solid #e0e0e0;
        border-top: none;
      }
      .info-row { 
        display: flex; 
        justify-content: space-between; 
        padding: 8px 0; 
        border-bottom: 1px solid #dee2e6; 
      }
      .info-label { font-weight: bold; color: #495057; }
      .info-value { color: #212529; }
      .score-box { 
        background: #f8f9fa; 
        padding: 20px; 
        border-radius: 12px; 
        margin: 20px 0; 
        text-align: center; 
      }
      .score-number { 
        font-size: 42px; 
        font-weight: bold; 
        color: ${ocenaBarva}; 
        margin: 5px 0;
      }
      .progress-bar-bg {
        background: #e9ecef;
        border-radius: 10px;
        height: 12px;
        margin: 10px 0;
        overflow: hidden;
      }
      .progress-bar {
        background: ${ocenaBarva};
        width: ${percent}%;
        height: 12px;
        border-radius: 10px;
      }
      .grade-box { 
        background: ${ocenaBarva}; 
        color: white; 
        padding: 12px 25px; 
        border-radius: 25px; 
        font-size: 20px; 
        font-weight: bold; 
        text-align: center; 
        display: inline-block;
        margin: 10px auto;
      }
      .details-title { 
        font-size: 17px; 
        font-weight: bold; 
        margin: 20px 0 12px 0; 
        color: #495057; 
      }
      .details-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
        border-radius: 8px;
        overflow: hidden;
      }
      .details-table th {
        background-color: #667eea;
        color: white;
        padding: 10px 12px;
        text-align: center;
        font-weight: bold;
      }
      .details-table td {
        padding: 8px 12px;
        border: 1px solid #dee2e6;
        text-align: center;
      }
      .footer { 
        text-align: center; 
        margin-top: 25px; 
        color: #6c757d; 
        font-size: 12px; 
        border-top: 1px solid #dee2e6;
        padding-top: 15px;
      }
      .footer small { display: block; margin-top: 4px; }
    </style>
  </head>
  <body>
    <div class="header">
      <h2>📊 Rezultati kviza</h2>
      <p>Osnove računalništva in umetne inteligence</p>
    </div>
    
    <div class="content">
      <div class="info-row">
        <span class="info-label">👤 Udeleženec:</span>
        <span class="info-value">${ime}</span>
      </div>
      <div class="info-row">
        <span class="info-label">📚 Kviz:</span>
        <span class="info-value">${kvizNaslov}</span>
      </div>
      <div class="info-row">
        <span class="info-label">📅 Datum in čas:</span>
        <span class="info-value">${cas}</span>
      </div>
      
      <div class="score-box">
        <div style="color: #6c757d; font-size: 15px;">Število pravilnih odgovorov</div>
        <div class="score-number">${pravilni} / ${skupaj}</div>
        <div class="progress-bar-bg">
          <div class="progress-bar"></div>
        </div>
        <div style="color: #6c757d; font-size: 14px;">${percent}% uspešnosti</div>
      </div>
      
      <div style="text-align: center;">
        <div class="grade-box">
          ${emoji} Ocena: ${ocenaBesedilo} ${emoji}
        </div>
      </div>
      
      <div class="details-title">📝 Podrobnosti po vprašanjih:</div>
      <table class="details-table">
        <thead>
          <tr>
            <th>Vprašanje</th>
            <th>Rezultat</th>
          </tr>
        </thead>
        <tbody>
          ${podrobnosti}
        </tbody>
      </table>
    </div>
    
    <div class="footer">
      <p>Kviz je bil ustvarjen za namen učenja računalništva in umetne inteligence.</p>
      <small>Program narejen s pomočjo 🐋 DeepSeek (M.V.)</small>
      <small>© 2026 - Vse pravice pridržane</small>
    </div>
  </body>
  </html>
  `;
  
  // Pošlji LEP HTML email
  MailApp.sendEmail({
    to: Session.getActiveUser().getEmail(),
    subject: `📊 Rezultat kviza - ${ime}`,
    htmlBody: htmlBody
  });
}

// ============================================================
// FUNKCIJA ZA ZDRUŽLJIVOST S STARIMI TRIGGERJI (2026-07-28)
// ============================================================
function sendNiceEmailOnNewRow(e) {
  // Preberi zadnjo vrstico
  var sheet = SpreadsheetApp.getActiveSheet();
  var lastRow = sheet.getLastRow();
  var rowData = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Ustvari data objekt iz vrstice
  var data = {
    ime: rowData[1],
    kviz: rowData[2],
    pravilni: rowData[3],
    vprasanja: rowData[4],
    ocena: rowData[5]
  };
  
  // Dodaj podrobnosti po vprašanjih
  for (var i = 0; i < data.vprasanja; i++) {
    data["Q" + (i+1)] = rowData[6 + i] || 0;
  }
  
  // Pošlji email
  sendNiceEmail(rowData, data);
}