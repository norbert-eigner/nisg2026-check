// gap-score.js – Bewertung des Selbstchecks. Reine Funktionen, ohne Browser: in Node testbar.

// Punkte je Antwort
function pointsFor(value) {
  return { ja: 2, teilweise: 1, nein: 0, unklar: 0 }[value];
}

// Ampel für einen Prozentwert
function rating(percent) {
  if (percent >= 80) return "gut";
  if (percent >= 50) return "luecken";
  return "kritisch";
}

// Priorität einer einzelnen Lücke
function priority(question, answer) {
  if (question.critical) return { rank: 1, label: "Sofort" };
  if (answer === "nein" || answer === "unklar") return { rank: 2, label: "In 3 Monaten" };
  return { rank: 3, label: "In 6 Monaten" };
}

// areas: Fragenkatalog, answers: { frageId: "ja" | "teilweise" | "nein" | "unklar" }
function evaluate(areas, answers) {
  const missing = [];
  const areaResults = [];
  const gaps = [];
  let total = 0;
  let max = 0;

  for (const area of areas) {
    let points = 0;
    for (const q of area.questions) {
      const answer = answers[q.id];
      if (answer === undefined) { missing.push(q.id); continue; }
      points += pointsFor(answer);
      if (answer !== "ja") {
        const p = priority(q, answer);
        gaps.push({ id: q.id, area: area.title, ref: area.ref, text: q.text, answer,
                    rank: p.rank, priority: p.label, deadline: q.deadline || null });
      }
    }
    const areaMax = area.questions.length * 2;
    const percent = Math.round((points / areaMax) * 100);
    total += points;
    max += areaMax;
    areaResults.push({ id: area.id, title: area.title, percent, rating: rating(percent) });
  }

  // Lücken sortieren: Priorität, dann "nein/unklar" vor "teilweise", dann Reihenfolge im Katalog
  const order = { nein: 0, unklar: 0, teilweise: 1 };
  gaps.sort((a, b) => a.rank - b.rank || order[a.answer] - order[b.answer]);

  const percent = max ? Math.round((total / max) * 100) : 0;
  return {
    complete: missing.length === 0,
    missing,
    percent,
    rating: rating(percent),
    areas: areaResults,
    gaps,
    unknownCount: Object.values(answers).filter((a) => a === "unklar").length
  };
}

if (typeof module !== "undefined") {
  module.exports = { evaluate, rating, priority, pointsFor };
}
