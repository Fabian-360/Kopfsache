# Kopfsache – Version 44: Technik-Durchgang

## Geänderte Dateien
- app/index.html, app/sw.js, app/content.json (nur das Feld „updated“ – Stoff unverändert)
- build/make.py, build/cw_build.py, build/ANLEITUNG_FUER_CLAUDE.md, neu: build/selftest.py, build/AENDERUNGEN_V44.md
- Unverändert: py-worker.js, manifest, Icons, alle Stoff-Dateien (Fragen, Antworten, Erklärungen, Schaubilder, IDs)

## 1. Datensicherheit
- Speicherfehler wurden bisher stillschweigend verschluckt. Jetzt: Schlägt das Speichern fehl (Speicher voll/gesperrt), räumt die App zuerst den ersetzbaren Stoff-Zwischenspeicher (1,4 MB) und speichert erneut. Klappt es trotzdem nicht, erscheint unten eine rote Warnung mit „Backup speichern“. Sie verschwindet, sobald wieder gespeichert werden kann.
- Beim Wegwechseln oder Schließen der App wird sofort gespeichert (vorher konnte Code im Editor bis zu 0,8 s ungespeichert sein).
- Backup enthält jetzt Kennung, App-Version und Datum. Nach dem Laden zeigt die App „Backup vom … geladen · N Antworten“.
- Einstellungen zeigen den Speicherstand (Fortschritt, Stoff-Zwischenspeicher, letztes Backup).
- Geprüft: Backup enthält alle Bereiche (Antworten, Wiederholungsplan, Tests und Prüfungen, Lernstand, eigene Fragenänderungen, Coding-Sterne und Python-Code, Münzen, Spielrekorde und Spielstände, Puzzles, Prüfungstermine). Alte Backups lassen sich weiter laden, dabei wird nichts gelöscht.
- Bewusst nicht gemacht: Cloud-Synchronisation (nur mit deiner Freigabe) und automatische Backups (eine Datei kann eine Web-App nicht ohne dein Zutun erzeugen).

## 2. Build
- Keine festen Pfade mehr: make.py findet den App-Ordner selbst (../app im Projekt-zip, ../kopfsache bei Claude) oder über KOPFSACHE_APP und lässt sich aus jedem Ordner starten.
- Fehler stoppen den Build jetzt wirklich. Vorher wurden Fehler nur ausgegeben und trotzdem geschrieben.
- Geschrieben wird erst ganz am Ende und atomar. Ein fehlgeschlagener Build kann die laufende Version nicht mehr beschädigen.
- Neue Schutzprüfungen: doppelte IDs, Fragen ohne gültige Vorlesung, verschwundene Fragen- oder Coding-IDs (Fortschritt!) und Versionsnummer index.html ≠ sw.js.
- Service Worker: Neue Versionen holen ihre Dateien am Browser-Zwischenspeicher vorbei. Schriften werden nur bei erfolgreicher Antwort gespeichert.
- Anleitung auf den echten Stand (V44) gebracht.

## 3. Bedienung
- Zähler-Fehler behoben: Im Stapel „Falsch“ und „Unbeantwortet“ stand „(10)“, gestartet wurde aber der ganze Stapel. Jetzt steht die tatsächliche Zahl da. Gleiches gilt für „Weiter wiederholen“ (höchstens 20 je Runde). Auf dem Fällig-Balken steht „Je Runde 20 Fragen“, wenn mehr fällig sind.
- Veralteter Hinweis in den Einstellungen korrigiert (✏️ ist bei jeder Frage sichtbar, nicht erst nach dem Beantworten).

## 4. Barrierefreiheit
- Sichtbare Fokusmarkierung (weiß) nur bei Tastaturbedienung. Am iPad mit Finger ändert sich nichts.
- Modulkarten und Prüfungskalender lassen sich mit Enter/Leertaste bedienen.
- Beschriftungen für Bildschirmleser: Schließen-Knöpfe, Spieltempo, Spielfeld. Hinweise werden als Statusmeldung angesagt.
- „Bewegung reduzieren“ (iPad-Einstellung) wird beachtet: Animationen und Konfetti aus.

## 5. Lernstatistik (auf der Modulseite, ohne neue Ansicht)
- „📊 Lernstand je Vorlesung“: pro Vorlesung ein Balken (sitzt / zuletzt falsch / offen), die Trefferquote über alle Versuche und die Zahl der Fehler. Die schwächste Vorlesung ist als „⚠️ Schwerpunkt“ markiert. Antippen öffnet den Lerntext.
- „🎓 Deine Prüfungssimulationen“: Verlauf der letzten Simulationen, damit man die Entwicklung sieht.
- Prüfungen bleiben unverändert Multiple Choice.

## Tests (selbst ausgeführt)
- Syntax: alle Python-Dateien (py_compile) ✅ · JavaScript in index.html, sw.js, py-worker.js ✅ · content.json und manifest gültiges JSON ✅
- Build: läuft ✅ · Stoff identisch zu V43 bis auf das Datum „updated“ ✅ · aus fremdem Ordner im zip-Layout gebaut ✅ · eingebaute doppelte ID → Abbruch, Datei unverändert ✅ · entfernte Frage → Abbruch ✅
- Alle 127 Coding-Level mit echtem Python geprüft (Lösung besteht, Vorlage nicht) ✅
- selftest.py (Desktop-Chrome): 42 von 42 bestanden. Geprüft wurden:
  - Version, Stoff, Module öffnen, Lernen, Vorlesung
  - Modulkarte per Tastatur öffnen
  - Übungsheft offen/falsch mit passenden Zählern
  - Test-Sperre, gemischter Test, Prüfungssimulation, Wiederholung
  - Ergebnisse gespeichert, Lernstand-Karte
  - Eigene Änderungen getrennt vom Original
  - Puzzle
  - Coding-Welt: Multiple Choice, Python-Prüfung, Code speichern, Turtle
  - Spiel: Startfragen, Turm bauen, Spielstand, Welle, Spielfeld bleibt stehen
  - Einstellungen, Backup-Export vollständig, alter Backup-Import, falsche Datei abgelehnt
  - Speicher-voll-Warnung erscheint und verschwindet
  - Fortschritt nach Neuladen identisch, Offline-Start über Service Worker
  - Kein seitliches Überlaufen bei iPad-Hochformat und Handybreite, keine JavaScript-Fehler

## Nicht testbar / verbleibende Punkte
- **Echtes iPad-Safari:** nicht verfügbar. Getestet wurde in Chrome mit iPad- und Handy-Bildschirmgrößen. Der Teilen-Dialog beim Backup läuft nur auf dem iPad, getestet wurde der Download-Weg.
- **Echtes Pyodide:** hier kein Internet. Python lief über einen Ersatz mit identischem Prüf-Code in CPython. Der erste echte Test bist du.
- **Safari-Datenlöschung:** Safari kann Website-Daten nach längerer Nichtnutzung löschen. Die App bittet um dauerhaften Speicher, garantiert ist das aber nicht. Backups bleiben wichtig.
- **Kontrast:** roter Text auf Schwarz ca. 3,9:1, für kleine Schrift unter der WCAG-Empfehlung. Aus Designgründen unverändert, auf Wunsch helle ich den Rot-Ton für Text etwas auf.
- **Fehlender Stoff:** Moodle-Fragen AI Literacy, Menti-Fragen Sozialpädagogik, Selection Sort (Bestätigung offen).
