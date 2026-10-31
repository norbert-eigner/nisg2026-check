// app.js – verbindet das Formular mit der Logik aus logic.js.
// Kein Inline-JavaScript im HTML: so bleibt die Content-Security-Policy streng.

const form = document.getElementById("check-form");
const resultSection = document.getElementById("result");
const errorBox = document.getElementById("form-error");

// Texte für die vier möglichen Ergebnisse
const TITLES = {
  wesentlich: "Wesentliche Einrichtung",
  wichtig: "Wichtige Einrichtung",
  nicht_betroffen: "Voraussichtlich nicht betroffen",
  ausland: "NISG 2026 voraussichtlich nicht anwendbar"
};
// Was bedeutet das Ergebnis? In Alltagssprache
const EXPLAIN = {
  wesentlich: "Die strengere der beiden Kategorien: Die Behörde kann jederzeit von sich aus prüfen, und die möglichen Strafen sind höher.",
  wichtig: "Gleiche Pflichten wie bei wesentlichen Einrichtungen, aber weniger Aufsicht: Die Behörde prüft in der Regel nur, wenn es Hinweise auf Verstöße gibt.",
  nicht_betroffen: "Nach Ihren Angaben gelten die Pflichten des NISG 2026 nicht direkt für Ihr Unternehmen.",
  ausland: "Das österreichische Gesetz gilt grundsätzlich nur für Unternehmen mit Sitz in Österreich."
};
const SIZE_LABELS = { gross: "großes", mittel: "mittleres", klein: "kleines" };
const PENALTIES = {
  wesentlich: "Strafrahmen: bis zu 10 Mio. € oder 2 % des weltweiten Vorjahresumsatzes.",
  wichtig: "Strafrahmen: bis zu 7 Mio. € oder 1,4 % des weltweiten Vorjahresumsatzes."
};

// Hilfsfunktion: Werte aller angehakten Checkboxen eines Namens
function checkedValues(name) {
  return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((el) => el.value);
}

// Hilfsfunktion: Zahl aus einem Eingabefeld (leer = 0)
function numberValue(id) {
  const value = parseFloat(document.getElementById(id).value.replace(",", "."));
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

form.addEventListener("submit", (event) => {
  event.preventDefault(); // Seite nicht neu laden
  errorBox.hidden = true;

  // 1. Eingaben prüfen
  const established = form.querySelector('input[name="established"]:checked');
  if (!established) return showError("Bitte beantworten Sie Frage 1.");
  if (established.value === "ja" && document.getElementById("employees").value === "") {
    return showError("Bitte geben Sie die Mitarbeiterzahl an (Frage 4).");
  }

  // 2. Antworten einsammeln
  const answers = {
    establishedInAustria: established.value === "ja",
    special: checkedValues("special"),
    sectors: checkedValues("sector"),
    employees: numberValue("employees"),
    turnoverMio: numberValue("turnover"),
    balanceMio: numberValue("balance")
  };

  // 3. Logik aufrufen (aus logic.js)
  const outcome = classify(answers);

  // 4. Ergebnis anzeigen
  renderResult(outcome, answers);
});

function renderResult(outcome, answers) {
  const box = document.getElementById("result-box");
  box.className = `result-box ${outcome.result}`;
  document.getElementById("result-title").textContent = TITLES[outcome.result];
  document.getElementById("result-explain").textContent = EXPLAIN[outcome.result];
  document.getElementById("result-size").textContent =
    outcome.result === "ausland" ? "" : `Größeneinstufung nach § 25: ${SIZE_LABELS[outcome.size]} Unternehmen`;

  // Begründungen als Liste. textContent statt innerHTML: verhindert XSS.
  const list = document.getElementById("result-reasons");
  list.replaceChildren();
  for (const reason of outcome.reasons) {
    const li = document.createElement("li");
    li.textContent = reason;
    list.appendChild(li);
  }

  // Pflichten nur bei wesentlich/wichtig
  const affected = outcome.result === "wesentlich" || outcome.result === "wichtig";
  document.getElementById("obligations").hidden = !affected;
  document.getElementById("penalty").textContent = affected ? PENALTIES[outcome.result] : "";
  document.getElementById("next-step").hidden = !affected;
  document.getElementById("countdown").textContent = countdownText(new Date());

  // Zusätzliche Hinweise je nach Fall
  const note = document.getElementById("extra-note");
  const notes = [];
  if (outcome.result === "ausland") {
    notes.push("Prüfen Sie die NIS2-Umsetzung Ihres Sitzstaates (in Deutschland z. B. das BSI-Gesetz). Ausnahmen gelten u. a. für Telekom- und bestimmte digitale Anbieter, die Dienste in Österreich erbringen.");
  }
  if (outcome.result === "nicht_betroffen") {
    notes.push("Auch nicht direkt betroffene Unternehmen spüren das NISG: Betroffene Kunden müssen ihre Lieferkette absichern und werden Sicherheitsanforderungen vertraglich weitergeben.");
  }
  if (answers.sectors.includes("bankwesen") || answers.sectors.includes("finanzmarkt")) {
    notes.push("Für Banken und Finanzunternehmen gilt bei Sicherheitsmaßnahmen und Meldepflichten vorrangig die EU-Verordnung DORA (digitale Betriebsstabilität im Finanzsektor). Registrieren müssen Sie sich laut WKO/BMI-FAQ trotzdem nach dem NISG 2026.");
  }
  note.textContent = notes.join(" ");
  note.hidden = notes.length === 0;

  form.hidden = true;
  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: "smooth" });
}

// Countdown bis zur Registrierungsfrist (Ende 31.12.2026, Ortszeit des Besuchers)
function countdownText(now) {
  const deadline = new Date(2026, 11, 31, 23, 59, 59);
  const days = Math.ceil((deadline - now) / 86400000);
  if (days > 1) return `Noch ${days} Tage bis zur Registrierungsfrist am 31.12.2026.`;
  if (days === 1) return "Letzter Tag: Die Registrierungsfrist endet heute, am 31.12.2026.";
  return "Die Registrierungsfrist (31.12.2026) ist abgelaufen. Registrieren Sie sich umgehend; wer erst später betroffen ist, hat drei Monate ab Eintritt der Voraussetzungen Zeit.";
}

document.getElementById("print").addEventListener("click", () => window.print());

// ?-Buttons: Erklärung ein- und ausblenden.
// aria-expanded sagt Screenreadern, ob die Erklärung gerade offen ist.
for (const button of document.querySelectorAll(".info-btn")) {
  const box = document.getElementById(button.getAttribute("aria-controls"));
  button.addEventListener("click", (event) => {
    event.preventDefault(); // ein ?-Button im Label soll kein Kästchen ankreuzen
    const open = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!open));
    box.hidden = open;
  });
}

function closeAllInfos() {
  for (const button of document.querySelectorAll(".info-btn")) {
    button.setAttribute("aria-expanded", "false");
    document.getElementById(button.getAttribute("aria-controls")).hidden = true;
  }
}

document.getElementById("restart").addEventListener("click", () => {
  form.reset();
  closeAllInfos();
  resultSection.hidden = true;
  form.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});
