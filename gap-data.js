// gap-data.js – Fragenkatalog des Sicherheits-Selbstchecks.
// Grundlage: § 32 NISG 2026, § 2–4 NISV 2026 (BGBl. II Nr. 290/2026) und
// Anhang der EU-Durchführungsverordnung 2024/2690 (Abschnitte 1–13).
// critical: true = Lücke hier hat höchste Priorität (Pflicht mit Frist oder hohes Schadensrisiko).

const AREAS = [
  {
    id: "governance", title: "Verantwortung der Geschäftsführung", ref: "§ 31 NISG 2026",
    questions: [
      { id: "g1", critical: true, text: "Hat die Geschäftsführung die Sicherheitsmaßnahmen schriftlich genehmigt und überwacht sie deren Umsetzung?" },
      { id: "g2", critical: true, text: "Hat jedes Mitglied der Geschäftsführung an einer Cybersicherheits-Schulung für Führungskräfte teilgenommen – mit Nachweis?",
        info: "Gemeint ist eine Schulung speziell für Geschäftsführung oder Vorstand. Die allgemeine Mitarbeiter-Schulung reicht laut WKO/BMI-FAQ nicht." },
      { id: "g3", text: "Gibt es eine benannte Person, die für Informationssicherheit verantwortlich ist (intern oder extern)?" }
    ]
  },
  {
    id: "policy", title: "Sicherheitsrichtlinie", ref: "DVO 2024/2690, Anhang Nr. 1",
    questions: [
      { id: "p1", text: "Gibt es eine schriftliche, von der Geschäftsführung freigegebene Richtlinie zur Informationssicherheit?",
        info: "Ein Dokument mit den Sicherheitszielen, Zuständigkeiten und Grundregeln Ihres Unternehmens." },
      { id: "p2", text: "Wird diese Richtlinie mindestens einmal im Jahr überprüft und allen Mitarbeitern bekannt gemacht?" }
    ]
  },
  {
    id: "risk", title: "Risikoanalyse", ref: "§ 32 NISG 2026; § 3 NISV 2026; DVO Nr. 2",
    questions: [
      { id: "r1", critical: true, text: "Gibt es eine schriftliche Risikoanalyse für Ihre IT-Systeme?",
        info: "Eine Liste der Gefahren für Ihre IT (z. B. Hackerangriff, Ausfall, Bedienfehler), wie wahrscheinlich sie sind und wie schwer der Schaden wäre." },
      { id: "r2", text: "Berücksichtigt sie technische Risiken, menschliche Fehler, Risiken durch Lieferanten und IT-Dienstleister sowie Standort-Risiken wie Brand oder Stromausfall?",
        info: "Diese vier Risikoarten muss die Risikoanalyse laut NIS-Verordnung (NISV 2026) mindestens abdecken." },
      { id: "r3", text: "Gibt es einen Maßnahmenplan, wer welches Risiko bis wann reduziert, und wird er nachverfolgt?" }
    ]
  },
  {
    id: "assets", title: "Überblick über IT-Systeme", ref: "DVO Nr. 12",
    questions: [
      { id: "a1", text: "Gibt es ein aktuelles Verzeichnis aller Computer, Server, Netzwerkgeräte, Software und Cloud-Dienste?" },
      { id: "a2", text: "Ist für jedes wichtige System festgelegt, wer dafür verantwortlich ist und wie wichtig es für den Betrieb ist?" }
    ]
  },
  {
    id: "incident", title: "Sicherheitsvorfälle und Meldepflicht", ref: "§ 34 NISG 2026; DVO Nr. 3",
    questions: [
      { id: "i1", critical: true, text: "Gibt es einen schriftlichen Ablauf, wer bei einem Sicherheitsvorfall was in welcher Reihenfolge tut?" },
      { id: "i2", critical: true, text: "Ist festgelegt, wer binnen 24 Stunden die Frühwarnung an das Computer-Notfallteam (CSIRT) abgibt – auch am Wochenende?",
        info: "Die 24-Stunden-Frist läuft ab Kenntnis eines erheblichen Vorfalls, auch an Wochenenden und Feiertagen." },
      { id: "i3", text: "Werden sicherheitsrelevante Ereignisse (z. B. fehlgeschlagene Anmeldungen, Virenwarnungen) aufgezeichnet und regelmäßig ausgewertet?" }
    ]
  },
  {
    id: "continuity", title: "Backup und Notfallplanung", ref: "DVO Nr. 4",
    questions: [
      { id: "b1", critical: true, text: "Werden regelmäßig Backups erstellt, und liegt mindestens eine Kopie getrennt vom Firmennetz (offline oder nicht veränderbar)?",
        info: "Ransomware verschlüsselt alles, was im Netz erreichbar ist – auch verbundene Backup-Laufwerke. Nur eine getrennte Kopie hilft dann." },
      { id: "b2", critical: true, text: "Wurde die Wiederherstellung aus dem Backup in den letzten 12 Monaten tatsächlich getestet?" },
      { id: "b3", text: "Gibt es einen Notfallplan, wie der Betrieb bei Ausfall wichtiger Systeme weiterläuft (z. B. nach einem Ransomware-Angriff)?" }
    ]
  },
  {
    id: "supply", title: "Lieferanten und IT-Dienstleister", ref: "§ 32 NISG 2026; DVO Nr. 5",
    questions: [
      { id: "s1", text: "Wissen Sie, welche Lieferanten und IT-Dienstleister Zugriff auf Ihre Systeme oder Daten haben?" },
      { id: "s2", text: "Enthalten die Verträge mit wichtigen IT-Dienstleistern Sicherheitsanforderungen, z. B. Meldepflicht bei Vorfällen und Prüfrecht?",
        info: "Laut WKO/BMI-FAQ reicht ein allgemeiner Hinweis in den AGB nicht; gefordert sind konkrete, überprüfbare Vertragspflichten." },
      { id: "s3", text: "Wird die Sicherheit wichtiger Lieferanten bewertet, z. B. per Fragebogen oder anhand von Zertifikaten?" }
    ]
  },
  {
    id: "maintenance", title: "Updates, Beschaffung und Netzwerk", ref: "DVO Nr. 6",
    questions: [
      { id: "v1", critical: true, text: "Werden Sicherheitsupdates zeitnah eingespielt – kritische innerhalb weniger Tage?" },
      { id: "v2", text: "Gibt es Sicherheitsanforderungen beim Kauf neuer IT oder Software und bei eigener Software-Entwicklung?" },
      { id: "v3", text: "Ist das Netzwerk in Bereiche getrennt (z. B. Gäste-WLAN, Büro, Produktion) und durch Firewalls geschützt?" }
    ]
  },
  {
    id: "effectiveness", title: "Wirksamkeit überprüfen", ref: "DVO Nr. 7",
    questions: [
      { id: "e1", text: "Wird regelmäßig geprüft, ob die Sicherheitsmaßnahmen wirken, z. B. durch internes Audit, Schwachstellen-Scan oder Penetrationstest?",
        info: "Penetrationstest: ein beauftragter, kontrollierter Hackerangriff, der Schwachstellen aufdeckt, bevor echte Angreifer sie finden." }
    ]
  },
  {
    id: "hygiene", title: "Schulung und Grundregeln", ref: "§ 32 NISG 2026; DVO Nr. 8",
    questions: [
      { id: "t1", text: "Erhalten alle Mitarbeiter mindestens einmal im Jahr eine Sicherheitsschulung, z. B. zum Erkennen von Phishing-Mails?" },
      { id: "t2", text: "Gibt es bekannte Grundregeln wie sichere Passwörter, Bildschirmsperre und keine fremden USB-Sticks?" }
    ]
  },
  {
    id: "crypto", title: "Verschlüsselung", ref: "§ 32 NISG 2026; DVO Nr. 9",
    questions: [
      { id: "c1", text: "Sind Laptops, Smartphones und mobile Datenträger verschlüsselt?" },
      { id: "c2", text: "Werden Daten bei der Übertragung verschlüsselt (z. B. HTTPS, VPN), und ist geregelt, wer Schlüssel und Zertifikate verwaltet?" }
    ]
  },
  {
    id: "hr", title: "Personal", ref: "DVO Nr. 10",
    questions: [
      { id: "h1", text: "Werden beim Austritt von Mitarbeitern alle Zugänge spätestens am letzten Arbeitstag gesperrt?" },
      { id: "h2", text: "Sind Mitarbeiter vertraglich zu Vertraulichkeit und zur Einhaltung der Sicherheitsregeln verpflichtet?" }
    ]
  },
  {
    id: "access", title: "Zugriffsrechte und Anmeldung", ref: "§ 32 NISG 2026; DVO Nr. 11",
    questions: [
      { id: "k1", critical: true, text: "Ist eine Anmeldung mit zweitem Faktor (z. B. Code aus einer App) für E-Mail, Fernzugriff und Administrator-Konten aktiviert?",
        info: "Mehr-Faktor-Authentifizierung (MFA) ist im NISG 2026 ausdrücklich genannt. Sie stoppt die meisten Angriffe mit gestohlenen Passwörtern." },
      { id: "k2", text: "Haben Mitarbeiter nur die Zugriffsrechte, die sie für ihre Arbeit brauchen, und wird das regelmäßig überprüft?" },
      { id: "k3", text: "Sind Administrator-Konten von den normalen Arbeitskonten getrennt?" }
    ]
  },
  {
    id: "physical", title: "Räume und Technik", ref: "DVO Nr. 13",
    questions: [
      { id: "f1", text: "Sind Serverraum und Netzwerktechnik gegen Zutritt Unbefugter, Feuer, Wasser und Stromausfall geschützt (z. B. Schloss, unterbrechungsfreie Stromversorgung)?" }
    ]
  },
  {
    id: "registration", title: "Registrierung und Nachweise", ref: "§§ 29, 33 NISG 2026; § 4 NISV 2026",
    questions: [
      { id: "n1", critical: true, deadline: "31.12.2026", text: "Ist Ihr Unternehmen bereits im Unternehmensserviceportal (USP) registriert?" },
      { id: "n2", deadline: "30.09.2027", text: "Sind Ihre Maßnahmen so dokumentiert, dass Sie die Selbstdeklaration jederzeit ausfüllen könnten?" },
      { id: "n3", text: "Wo Sie eine Anforderung (noch) nicht erfüllen: Sind Ersatzmaßnahmen festgelegt, begründet und dokumentiert?",
        info: "Die NIS-Verordnung verlangt solche „kompensierenden Maßnahmen“, wenn eine Anforderung vorübergehend oder wegen der Unternehmensgröße nicht erfüllbar ist. Sie müssen jährlich überprüft werden." }
    ]
  }
];

const ANSWERS = [
  { value: "ja", label: "Ja", points: 2 },
  { value: "teilweise", label: "Teilweise", points: 1 },
  { value: "nein", label: "Nein", points: 0 },
  { value: "unklar", label: "Weiß nicht", points: 0 }
];

if (typeof module !== "undefined") {
  module.exports = { AREAS, ANSWERS };
}
