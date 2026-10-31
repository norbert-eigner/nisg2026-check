// gap.js – baut den Selbstcheck aus gap-data.js und zeigt die Auswertung aus gap-score.js an.
// Nur textContent und createElement (kein innerHTML): sicher gegen XSS und kompatibel mit der CSP.

// Kontaktadresse für den Feedback-Button
const CONTACT_EMAIL = "norbert@clickblvd.com";

const form = document.getElementById("gap-form");
const container = document.getElementById("questions");
const resultSection = document.getElementById("gap-result");
const errorBox = document.getElementById("gap-error");
const progress = document.getElementById("gap-progress");

const RATING_TEXT = {
  gut: { title: "Gute Grundlage", text: "Die meisten Maßnahmen sind vorhanden. Prüfen Sie die verbleibenden Lücken und dokumentieren Sie Ihre Nachweise für die Selbstdeklaration." },
  luecken: { title: "Deutliche Lücken", text: "Wichtige Grundlagen sind da, aber mehrere Pflichten sind nur teilweise erfüllt. Ein strukturierter Plan für die nächsten 90 Tage ist sinnvoll." },
  kritisch: { title: "Dringender Handlungsbedarf", text: "Viele Pflichten des NISG 2026 sind noch nicht erfüllt, obwohl sie seit 1.10.2026 gelten. Beginnen Sie mit den Punkten, die mit „Sofort“ markiert sind." }
};
const RATING_LABEL = { gut: "gut", luecken: "Lücken", kritisch: "kritisch" };
const ANSWER_LABEL = { teilweise: "teilweise erfüllt", nein: "nicht erfüllt", unklar: "unklar" };

// Hilfsfunktion: Element mit Attributen und Text erzeugen
function el(tag, attrs = {}, text) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  if (text !== undefined) node.textContent = text;
  return node;
}

// ---------- 1. Fragen aufbauen ----------
let number = 0;
for (const area of AREAS) {
  const section = el("fieldset", { class: "area" });
  section.append(el("legend", {}, area.title));
  section.append(el("p", { class: "ref" }, area.ref));

  for (const q of area.questions) {
    number++;
    const block = el("fieldset", { class: "q", id: `q-${q.id}` });
    const legend = el("legend", {}, `${number}. ${q.text}`);
    block.append(legend);

    if (q.info) {
      const infoId = `info-${q.id}`;
      const btn = el("button", { type: "button", class: "info-btn", "aria-expanded": "false",
                                 "aria-controls": infoId, "aria-label": `Erklärung zu Frage ${number}` }, "?");
      legend.append(" ", btn);
      const info = el("p", { id: infoId, class: "info" }, q.info);
      info.hidden = true;
      block.append(info);
    }

    const choices = el("div", { class: "choices" });
    for (const a of ANSWERS) {
      const label = el("label", { class: "choice" });
      const input = el("input", { type: "radio", name: q.id, value: a.value });
      label.append(input, " ", a.label);
      choices.append(label);
    }
    block.append(choices);
    section.append(block);
  }
  container.append(section);
}

// ?-Buttons (gleiches Muster wie im NISG-Check)
for (const button of document.querySelectorAll(".info-btn")) {
  const box = document.getElementById(button.getAttribute("aria-controls"));
  button.addEventListener("click", (event) => {
    event.preventDefault();
    const open = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!open));
    box.hidden = open;
  });
}

// ---------- 2. Fortschritt anzeigen ----------
const totalQuestions = AREAS.reduce((sum, a) => sum + a.questions.length, 0);
function collectAnswers() {
  const answers = {};
  for (const input of form.querySelectorAll("input[type=radio]:checked")) answers[input.name] = input.value;
  return answers;
}
function updateProgress() {
  progress.textContent = `${Object.keys(collectAnswers()).length} von ${totalQuestions} Fragen beantwortet`;
}
form.addEventListener("change", updateProgress);
updateProgress();

// ---------- 3. Auswerten ----------
form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorBox.hidden = true;
  const result = evaluate(AREAS, collectAnswers());

  if (!result.complete) {
    errorBox.textContent = `Bitte beantworten Sie alle Fragen. Noch offen: ${result.missing.length}. Wir springen zur ersten offenen Frage.`;
    errorBox.hidden = false;
    const first = document.getElementById(`q-${result.missing[0]}`);
    first.scrollIntoView({ behavior: "smooth", block: "center" });
    first.querySelector("input").focus({ preventScroll: true });
    return;
  }
  renderResult(result);
});

function renderResult(result) {
  document.getElementById("gap-date").textContent = new Date().toLocaleDateString("de-AT");
  document.getElementById("gap-summary").className = `result-box rating-${result.rating}`;
  document.getElementById("gap-title").textContent = `${result.percent} % – ${RATING_TEXT[result.rating].title}`;
  document.getElementById("gap-text").textContent = RATING_TEXT[result.rating].text;

  // Balken je Bereich
  const areaList = document.getElementById("gap-areas");
  areaList.replaceChildren();
  for (const area of result.areas) {
    const li = el("li", { class: `area-row rating-${area.rating}` });
    const head = el("div", { class: "area-head" });
    head.append(el("span", {}, area.title), el("span", { class: "area-score" }, `${area.percent} % · ${RATING_LABEL[area.rating]}`));
    const bar = el("div", { class: "bar", role: "img", "aria-label": `${area.title}: ${area.percent} Prozent` });
    const fill = el("span", { class: "bar-fill" });
    fill.style.width = `${area.percent}%`; // CSSOM ist mit style-src 'self' erlaubt
    bar.append(fill);
    li.append(head, bar);
    areaList.append(li);
  }

  // Lückenliste
  const gapList = document.getElementById("gap-list");
  gapList.replaceChildren();
  if (result.gaps.length === 0) {
    gapList.append(el("li", {}, "Keine Lücken nach Ihren Angaben. Prüfen Sie, ob alle Nachweise dokumentiert sind."));
  }
  for (const gap of result.gaps) {
    const li = el("li", { class: `gap prio-${gap.rank}` });
    const meta = el("p", { class: "gap-meta" });
    meta.append(el("span", { class: "badge" }, gap.priority));
    if (gap.deadline) meta.append(el("span", { class: "badge deadline" }, `Frist ${gap.deadline}`));
    meta.append(el("span", {}, `${gap.area} · ${ANSWER_LABEL[gap.answer]}`));
    li.append(meta, el("p", { class: "gap-text" }, gap.text), el("p", { class: "ref" }, gap.ref));
    gapList.append(li);
  }

  const unknown = document.getElementById("gap-unknown");
  unknown.textContent = `Sie haben ${result.unknownCount}-mal „Weiß nicht“ gewählt. Diese Punkte zählen als Lücke, bis sie geklärt sind – am besten gemeinsam mit Ihrer IT oder Ihrem IT-Dienstleister.`;
  unknown.hidden = result.unknownCount === 0;

  document.getElementById("gap-contact").href = buildMailto(result);

  form.hidden = true;
  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: "smooth" });
}

// E-Mail-Entwurf mit dem Ergebnis: der Besucher entscheidet selbst, ob er sendet
function buildMailto(result) {
  const critical = result.gaps.filter((g) => g.rank === 1).length;
  const weak = result.areas.filter((a) => a.rating === "kritisch").map((a) => a.title);
  const body = [
    "Guten Tag,",
    "",
    "hier mein Feedback zum NISG-Selbstcheck:",
    "",
    `Ergebnis Selbstcheck: ${result.percent} % (${RATING_LABEL[result.rating]})`,
    `Offene Punkte mit Priorität „Sofort“: ${critical}`,
    `Bereiche unter 50 %: ${weak.length ? weak.join(", ") : "keine"}`,
    `Antworten „Weiß nicht“: ${result.unknownCount}`,
    "",
    "Unternehmen:",
    "Ansprechpartner:",
    "Telefon:",
    "Ergebnis im NISG-Check (wesentlich / wichtig):"
  ].join("\n");
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Feedback NISG-Selbstcheck")}&body=${encodeURIComponent(body)}`;
}

// ---------- 4. Drucken und Bearbeiten ----------
document.getElementById("gap-print").addEventListener("click", () => window.print());
document.getElementById("gap-edit").addEventListener("click", () => {
  resultSection.hidden = true;
  form.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});
