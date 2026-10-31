// test.js – prüft die Logik gegen bekannte Fälle. Ausführen mit:  node test.js
const { classify, sizeClass } = require("./logic.js");

const cases = [
  // [Beschreibung, Antworten, erwartetes Ergebnis]
  ["Energieversorger, 300 MA", { establishedInAustria: true, sectors: ["energie"], employees: 300 }, "wesentlich"],
  ["Energieversorger, 80 MA", { establishedInAustria: true, sectors: ["energie"], employees: 80 }, "wichtig"],
  ["Maschinenbau, 120 MA (Anlage 2)", { establishedInAustria: true, sectors: ["verarbeitendes"], employees: 120 }, "wichtig"],
  ["Lebensmittel, 400 MA (Anlage 2 bleibt wichtig)", { establishedInAustria: true, sectors: ["lebensmittel"], employees: 400 }, "wichtig"],
  ["DNS-Anbieter, 20 MA", { establishedInAustria: true, special: ["dns"], employees: 20 }, "wesentlich"],
  ["Telekom, 10 MA", { establishedInAustria: true, special: ["telekom"], employees: 10 }, "wichtig"],
  ["Telekom, 60 MA", { establishedInAustria: true, special: ["telekom"], employees: 60 }, "wesentlich"],
  ["MSP, 30 MA, 12 Mio Umsatz, 11 Mio Bilanz", { establishedInAustria: true, sectors: ["ikt_b2b"], employees: 30, turnoverMio: 12, balanceMio: 11 }, "wichtig"],
  ["MSP, 30 MA, 12 Mio Umsatz, 5 Mio Bilanz", { establishedInAustria: true, sectors: ["ikt_b2b"], employees: 30, turnoverMio: 12, balanceMio: 5 }, "nicht_betroffen"],
  ["Einzelhandel, 500 MA, kein Sektor", { establishedInAustria: true, sectors: [], employees: 500 }, "nicht_betroffen"],
  ["Sitz in Deutschland", { establishedInAustria: false, sectors: ["energie"], employees: 300 }, "ausland"],
  ["Krankenhaus, 260 MA, 5 Mio Umsatz", { establishedInAustria: true, sectors: ["gesundheit"], employees: 260, turnoverMio: 5, balanceMio: 4 }, "wesentlich"],
  ["Vertrauensdiensteanbieter (nicht qualifiziert), 5 MA", { establishedInAustria: true, special: ["tsp"], employees: 5 }, "wichtig"],
  ["Cloud-Anbieter, 55 Mio Umsatz, 44 Mio Bilanz, 100 MA", { establishedInAustria: true, sectors: ["digitale_infrastruktur"], employees: 100, turnoverMio: 55, balanceMio: 44 }, "wesentlich"]
];

let failed = 0;
for (const [name, answers, expected] of cases) {
  const actual = classify(answers).result;
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? "OK  " : "FAIL"}  ${name}  → ${actual}${ok ? "" : ` (erwartet: ${expected})`}`);
}

// Grenzwerte von § 25 prüfen
const edges = [
  [249, 0, 0, "mittel"], [250, 0, 0, "gross"], [49, 0, 0, "klein"], [50, 0, 0, "mittel"],
  [0, 10, 11, "klein"], [0, 10.01, 10.01, "mittel"], [0, 50.01, 43, "mittel"], [0, 50.01, 43.01, "gross"]
];
for (const [e, t, b, expected] of edges) {
  const actual = sizeClass(e, t, b);
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? "OK  " : "FAIL"}  Größe(${e} MA, ${t} Mio, ${b} Mio) → ${actual}${ok ? "" : ` (erwartet: ${expected})`}`);
}

console.log(failed === 0 ? "\nAlle Tests bestanden." : `\n${failed} Test(s) fehlgeschlagen.`);
process.exit(failed === 0 ? 0 : 1);
