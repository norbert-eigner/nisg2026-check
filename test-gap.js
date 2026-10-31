// test-gap.js – prüft die Bewertung des Selbstchecks. Ausführen mit:  node test-gap.js
const { AREAS } = require("./gap-data.js");
const { evaluate, rating } = require("./gap-score.js");

let failed = 0;
function check(ok, name) {
  if (!ok) failed++;
  console.log(`${ok ? "OK  " : "FAIL"}  ${name}`);
}

const allIds = AREAS.flatMap((a) => a.questions.map((q) => q.id));
const fill = (value) => Object.fromEntries(allIds.map((id) => [id, value]));

// Katalog-Integrität
check(new Set(allIds).size === allIds.length, `Fragen-IDs eindeutig (${allIds.length} Fragen, ${AREAS.length} Bereiche)`);
check(AREAS.every((a) => a.questions.length > 0 && a.ref), "jeder Bereich hat Fragen und Rechtsgrundlage");

// Alles "ja" → 100 %, keine Lücken
let r = evaluate(AREAS, fill("ja"));
check(r.percent === 100 && r.gaps.length === 0 && r.rating === "gut", "alles Ja → 100 %, gut, keine Lücken");

// Alles "nein" → 0 %, kritisch, kritische Fragen zuerst
r = evaluate(AREAS, fill("nein"));
const firstNonCritical = r.gaps.findIndex((g) => g.priority !== "Sofort");
const criticalCount = AREAS.flatMap((a) => a.questions).filter((q) => q.critical).length;
check(r.percent === 0 && r.rating === "kritisch", "alles Nein → 0 %, kritisch");
check(firstNonCritical === criticalCount, `alle ${criticalCount} kritischen Lücken stehen vorne`);

// Alles "teilweise" → 50 %, Lücken
r = evaluate(AREAS, fill("teilweise"));
check(r.percent === 50 && r.rating === "luecken", "alles Teilweise → 50 %, Lücken");

// "Weiß nicht" zählt wie Nein und wird gezählt
r = evaluate(AREAS, fill("unklar"));
check(r.percent === 0 && r.unknownCount === allIds.length, "Weiß nicht → 0 Punkte, wird gezählt");

// Unvollständig erkannt
const partial = fill("ja"); delete partial.k1;
r = evaluate(AREAS, partial);
check(!r.complete && r.missing.includes("k1"), "fehlende Antwort wird erkannt");

// Frist wird mitgegeben
r = evaluate(AREAS, { ...fill("ja"), n1: "nein" });
check(r.gaps[0].id === "n1" && r.gaps[0].deadline === "31.12.2026", "USP-Registrierung offen → Lücke mit Frist 31.12.2026");

// Sortierung innerhalb gleicher Priorität: nein vor teilweise
r = evaluate(AREAS, { ...fill("ja"), a1: "teilweise", a2: "nein" });
check(r.gaps[0].id === "a2" && r.gaps[1].id === "a1", "Nein vor Teilweise bei gleicher Priorität");

// Ampel-Grenzen
check(rating(80) === "gut" && rating(79) === "luecken" && rating(50) === "luecken" && rating(49) === "kritisch", "Ampel-Grenzen 80 / 50");

console.log(failed === 0 ? "\nAlle Tests bestanden." : `\n${failed} Test(s) fehlgeschlagen.`);
process.exit(failed === 0 ? 0 : 1);
