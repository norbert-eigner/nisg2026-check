// logic.js – Die Entscheidungslogik des NISG-2026-Checks.
// Keine Abhängigkeit vom Browser: läuft im Browser UND in Node.js (für Tests).
// Rechtsgrundlage: §§ 24, 25 NISG 2026 (BGBl. I Nr. 94/2025), Stand 24.10.2026.

// ---------- 1. Unternehmensgröße nach § 25 NISG 2026 ----------
// groß:   mind. 250 Mitarbeiter ODER (Umsatz > 50 Mio. € UND Bilanzsumme > 43 Mio. €)
// mittel: mind. 50 Mitarbeiter  ODER (Umsatz > 10 Mio. € UND Bilanzsumme > 10 Mio. €)
// sonst:  klein
function sizeClass(employees, turnoverMio, balanceMio) {
  if (employees >= 250 || (turnoverMio > 50 && balanceMio > 43)) return "gross";
  if (employees >= 50 || (turnoverMio > 10 && balanceMio > 10)) return "mittel";
  return "klein";
}

// ---------- 2. Sektoren aus Anlage 1 und Anlage 2 ----------
const ANLAGE_1 = [
  "energie", "verkehr", "bankwesen", "finanzmarkt", "gesundheit",
  "trinkwasser", "abwasser", "digitale_infrastruktur", "ikt_b2b", "weltraum"
];
const ANLAGE_2 = [
  "post", "abfall", "chemie", "lebensmittel", "verarbeitendes",
  "digitale_dienste", "forschung"
];

// ---------- 3. Die eigentliche Einstufung ----------
// answers = {
//   establishedInAustria: true | false,
//   special: ["qtsp", "tsp", "tld", "dns", "telekom", "bund", "land", "kritisch"],
//   sectors: ["energie", ...],
//   employees: Zahl, turnoverMio: Zahl, balanceMio: Zahl
// }
// Rückgabe: { result: "wesentlich" | "wichtig" | "nicht_betroffen" | "ausland",
//             size: "gross" | "mittel" | "klein", reasons: [Text, ...] }
function classify(answers) {
  const special = answers.special || [];
  const sectors = answers.sectors || [];
  const size = sizeClass(answers.employees || 0, answers.turnoverMio || 0, answers.balanceMio || 0);
  const has = (list, id) => list.includes(id);
  const inA1 = sectors.some((s) => ANLAGE_1.includes(s));
  const inA2 = sectors.some((s) => ANLAGE_2.includes(s));
  const atLeastMedium = size === "gross" || size === "mittel";

  // Schritt 0: Örtlicher Anwendungsbereich (§ 28)
  if (!answers.establishedInAustria) {
    return {
      result: "ausland",
      size,
      reasons: ["Das NISG 2026 gilt grundsätzlich für Einrichtungen, die in Österreich niedergelassen sind (§ 28)."]
    };
  }

  // Schritt 1: Wesentliche Einrichtung (§ 24 Abs. 1)
  const essential = [];
  if (has(special, "qtsp")) essential.push("Qualifizierter Vertrauensdiensteanbieter – unabhängig von der Größe (§ 24 Abs. 1 Z 1 lit. a)");
  if (has(special, "tld")) essential.push("TLD-Namenregister – unabhängig von der Größe (§ 24 Abs. 1 Z 1 lit. b)");
  if (has(special, "dns")) essential.push("DNS-Diensteanbieter – unabhängig von der Größe (§ 24 Abs. 1 Z 1 lit. c)");
  if (has(special, "bund")) essential.push("Öffentliche Verwaltung auf Bundesebene (§ 24 Abs. 1 Z 1 lit. d)");
  if (has(special, "kritisch")) essential.push("Als kritische Einrichtung ermittelt (§ 24 Abs. 1 Z 1 lit. f)");
  if (has(special, "telekom") && atLeastMedium) essential.push("Anbieter öffentlicher Kommunikationsnetze/-dienste ab mittlerer Größe (§ 24 Abs. 1 Z 2)");
  if (inA1 && size === "gross") essential.push("Sektor aus Anlage 1 und großes Unternehmen (§ 24 Abs. 1 Z 3)");
  if (essential.length > 0) return { result: "wesentlich", size, reasons: essential };

  // Schritt 2: Wichtige Einrichtung (§ 24 Abs. 2)
  const important = [];
  if ((inA1 || inA2) && atLeastMedium) important.push("Sektor aus Anlage 1 oder 2 und mindestens mittleres Unternehmen (§ 24 Abs. 2 Z 1)");
  if (has(special, "land")) important.push("Öffentliche Verwaltung auf Landesebene (§ 24 Abs. 2 Z 2)");
  if (has(special, "telekom")) important.push("Anbieter öffentlicher Kommunikationsnetze/-dienste – unabhängig von der Größe (§ 24 Abs. 2 Z 3 lit. a)");
  if (has(special, "tsp")) important.push("Vertrauensdiensteanbieter – unabhängig von der Größe (§ 24 Abs. 2 Z 3 lit. b)");
  if (important.length > 0) return { result: "wichtig", size, reasons: important };

  // Schritt 3: Nicht betroffen
  const why = [];
  if (!inA1 && !inA2) why.push("Keine Tätigkeit in einem Sektor der Anlagen 1 oder 2 angegeben.");
  else why.push("Sektor ist erfasst, aber das Unternehmen ist klein (unter den Schwellen des § 25).");
  return { result: "nicht_betroffen", size, reasons: why };
}

// Export für Node.js (Tests). Im Browser wird diese Zeile übersprungen.
if (typeof module !== "undefined") {
  module.exports = { sizeClass, classify, ANLAGE_1, ANLAGE_2 };
}
