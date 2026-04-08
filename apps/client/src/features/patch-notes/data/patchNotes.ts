// Diese Datei wird aus docs/patch-notes/patch-notes.json erzeugt.
// Änderungen daher bitte in der JSON-Datei pflegen und danach `npm run sync:patch-notes` ausführen.

export interface PatchNoteEntry {
    version: string;
    date: string;
    title: string;
    summary: string;
    items: string[];
    issueUrl?: string;
    issueLabel?: string;
}

export interface PatchNotesData {
    app: string;
    entries: PatchNoteEntry[];
}

export const patchNotesData: PatchNotesData = {
    app: "ChurchINV",
    entries: [
        {
            version: "0.7.11",
            date: "2026-04-08",
            title: "Modellgruppierung und Stammdaten bereinigt",
            summary: "Die Modellansicht in den Buchungen fasst Geraete jetzt robuster nach Hersteller und Modell zusammen. Zusaetzlich wurden mehrere Modell- und Standort-Schreibvarianten in den Stammdaten bereinigt, und die Hauptseite zeigt keinen wirkungslosen Zurueck-Pfeil mehr.",
            issueUrl: undefined,
            issueLabel: undefined,
            items: [
                "Die Auswahl Nach Modell in den Buchungen gruppiert jetzt nach Hersteller plus Modell statt zusaetzlich nach Standort oder Bereich",
                "Standort- und Bereichsinformationen bleiben in der Modellansicht sichtbar, erzeugen aber keine getrennten Gruppen mehr",
                "Mehrere doppelte Modell-Schreibweisen in den Stammdaten wurden auf gemeinsame Zielmodelle zusammengefuehrt",
                "Mehrere offensichtliche Standort-Tippfehler wurden in den Stammdaten auf die jeweils korrekte Variante vereinheitlicht",
                "Die Hauptseite zeigt in der Topbar keinen leeren Zurueck-Pfeil mehr",
            ],
        },
        {
            version: "0.7.10",
            date: "2026-03-29",
            title: "Mobile Kartenansicht der Inventarliste verfeinert",
            summary: "Die mobile Hauptansicht der Inventarliste wurde visuell neu gewichtet: Karten sind kompakter, der Footer ist auf kleinen Breiten besser ausbalanciert, und Fotos haben in der Kartenansicht jetzt klar mehr Prioritaet.",
            issueUrl: undefined,
            issueLabel: undefined,
            items: [
                "Die mobile Kartenansicht der Inventarliste wurde platzsparender abgestimmt, damit auf kleinen Breiten mehr Geraete gleichzeitig sichtbar bleiben",
                "Der mobile Pagination-Footer der Hauptansicht wurde mehrfach nachgeschaerft und als flache, besser ausbalancierte Leiste fuer kleine Breiten umgesetzt",
                "In der mobilen Kartenansicht wurden die Tags unter den Geraeten wieder entfernt, um die Darstellung ruhiger zu halten",
                "Das Thumbnail neben der Modellbezeichnung ist in der mobilen Hauptansicht jetzt deutlich groesser und als wichtiges visuelles Element gewichtet",
                "Desktop- und breitere Webansichten der Inventarliste bleiben von diesen Anpassungen unberuehrt",
            ],
        },
        {
            version: "0.7.9",
            date: "2026-03-28",
            title: "Mobile Buchungsansicht stabilisiert",
            summary: "Auf schmalen Breiten bleibt der Buchungsbereich vorerst bewusst bei der Listenansicht, damit die mobile Darstellung stabil und lesbar bleibt.",
            issueUrl: undefined,
            issueLabel: undefined,
            items: [
                "Die Kalenderansicht fuer bestehende Buchungen ist auf mobilen Breiten vorerst deaktiviert",
                "Mobile Geraete zeigen im rechten Buchungsbereich nur noch die stabilere Listenansicht",
                "Desktop und breitere Webansichten behalten den Umschalter zwischen Liste und Kalender",
                "Im Buchungsformular gibt es jetzt nur noch eine gezielte Aktion zum Leeren der Geraeteauswahl statt eines kompletten Formular-Resets",
                "Die Auswahldialoge auf der AddPage unterscheiden jetzt sauber zwischen Feldern mit echter Neuanlage und reinen Auswahlfeldern",
                "Modell und Kategorie werden in der AddPage erst freigegeben, wenn die jeweils benoetigten Felder vorher gesetzt sind",
                "Mehrtaegige Buchungen im Kalender werden derzeit ueber Tagesstatus wie 'laufend' statt ueber starke Blockgrafiken kenntlich gemacht",
            ],
        },
        {
            version: "0.7.8",
            date: "2026-03-28",
            title: "Buchungsformular und Patch Notes nachgeschaerft",
            summary: "Das Buchungsformular reagiert beim Datum sinnvoller und startet mit alltagstauglichen Tageszeiten, die Patch Notes koennen direkt auf Issues verlinken, und die Topbar zeigt den Beta-Status jetzt sichtbarer an.",
            issueUrl: "https://github.com/cedricbetke/Church_INV/issues/5",
            issueLabel: "#5",
            items: [
                "Beim Aendern des Startdatums wird das Enddatum in typischen Standardfaellen automatisch passend mitgezogen (Issue #5)",
                "Leere Datumsfelder starten beim Oeffnen des Pickers jetzt sinnvoll mit 00:00 fuer den Anfang und 23:59 fuer das Ende",
                "Die Patch-Notes-Ansicht in der App kann jetzt direkt auf verknuepfte GitHub-Issues verlinken",
                "Die Topbar zeigt den aktuellen Beta-Status jetzt direkt am ChurchINV-Titel",
                "Auf mobilen Breiten wurde das Beta-Badge kompakter unter den Titel gezogen, damit die Aktionsbuttons sichtbar bleiben",
            ],
        },
        {
            version: "0.7.7",
            date: "2026-03-28",
            title: "Buchungskalender als zweite Ansicht",
            summary: "Bestehende Buchungen koennen jetzt nicht nur als Liste, sondern auch in einer Kalenderansicht mit Tagesagenda betrachtet werden. Der Buchungsbereich startet dabei standardmaessig im Kalender.",
            issueUrl: "https://github.com/cedricbetke/Church_INV/issues/4",
            issueLabel: "#4",
            items: [
                "Bestehende Buchungen haben jetzt einen Umschalter zwischen Liste und Kalender (Issue #4)",
                "Die neue Kalenderansicht zeigt eine Monatsuebersicht direkt auf der Buchungsseite (Issue #4)",
                "Ein gewaehlter Kalendertag blendet darunter die passende Tagesagenda ein (Issue #4)",
                "Der rechte Buchungsbereich startet jetzt standardmaessig in der Kalenderansicht (Issue #4)",
            ],
        },
        {
            version: "0.7.6",
            date: "2026-03-28",
            title: "Foto- und Dev-Workflow gestrafft",
            summary: "Fotos werden platzsparender behandelt, die Detailansicht nutzt wieder bevorzugt Vorschaubilder, und API sowie Client koennen jetzt bequem aus dem Projekt-Root oder direkt aus VS Code gestartet werden.",
            issueUrl: undefined,
            issueLabel: undefined,
            items: [
                "Neue Geraetefotos werden erst beim Speichern hochgeladen statt schon beim Auswaehlen",
                "Neue Fotos werden direkt als optimierte JPG-Dateien gespeichert und erzeugen weiterhin kleine Thumbnails",
                "Bestehende Geraetefotos koennen per Script auf den optimierten JPG-Pfad gebracht werden",
                "Die Detailansicht nutzt wieder bevorzugt das Thumbnail fuer stabilere Bildanzeige",
                "API und Client lassen sich jetzt gemeinsam ueber Root-Skripte starten",
                "VS Code hat Tasks und Launch-Configs als Startbutton-Ersatz erhalten",
                "Docker- und Linux-Deployment inkl. persistentem Upload-Ordner ist dokumentiert",
            ],
        },
        {
            version: "0.7.5",
            date: "2026-03-27",
            title: "Topbar und Feedback-Flow geschaerft",
            summary: "Die Web-Topbar wurde klarer sortiert, Patch Notes sitzen jetzt direkt am Titel, und Bugs sowie Feature-Wuensche koennen direkt als GitHub-Issues gemeldet werden.",
            issueUrl: undefined,
            issueLabel: undefined,
            items: [
                "Patch Notes wurden in der Standard-Webansicht direkt neben dem ChurchINV-Titel platziert",
                "Bug- und Feature-Buttons oeffnen direkt die passende GitHub-Issue-Maske mit vorbereiteten Labels",
                "Die wichtigsten Topbar-Symbole haben jetzt unaufdringliche Tooltips fuer bessere Orientierung",
                "Buchungen zeigen Konflikte mit bestehenden Reservierungen jetzt direkt als sichtbaren Warnblock mit betroffenen Inventarnummern",
            ],
        },
        {
            version: "0.7.0",
            date: "2026-03-27",
            title: "Import, Buchungen und mobile Oberflaeche ausgebaut",
            summary: "Der Bestand kann jetzt aus Teams/SharePoint uebernommen werden, Buchungen sind als eigener Workflow verfuegbar, und Haupt- sowie Detailansicht wurden fuer kleinere Screens deutlich nachgeschaerft.",
            issueUrl: undefined,
            issueLabel: undefined,
            items: [
                "CSV-, Dokument- und Foto-Import aus Teams/SharePoint sind als wiederverwendbare Scripts vorhanden",
                "Teams-Fotos erzeugen jetzt zusaetzlich Vorschaubilder fuer schnellere Listenansichten",
                "Mehrgeraete-Buchungen mit Zeitraum, Konfliktpruefung und Loeschen sind verfuegbar",
                "QR-Scan kann in der Buchung direkt einzelne Geraete in die Auswahl uebernehmen",
                "Die Hauptansicht hat fuer schmale Screens eine kompakte mobile Kartenansicht erhalten",
                "Detailansicht und Buchungsseite wurden fuer kleinere Displays und bessere Reaktionszeit ueberarbeitet",
            ],
        },
        {
            version: "0.6.0",
            date: "2026-03-26",
            title: "Inventar-Workflow deutlich erweitert",
            summary: "Geräteverwaltung, Dokumente, Verlauf, QR-Scan und Admin-Funktionen wurden wesentlich ausgebaut.",
            issueUrl: undefined,
            issueLabel: undefined,
            items: [
                "Geräte können angelegt, bearbeitet und gelöscht werden",
                "Dokumente pro Gerät sind integriert",
                "QR-Scan öffnet direkt die Detailansicht",
                "Geräteverlauf ist sichtbar",
                "Admin-Panel für erste Stammdatenpflege ist vorhanden",
                "Zustandshinweis ist als eigenes Gerätefeld verfügbar",
                "Swagger-Dokumentation wurde verbessert",
                "Optionaler Dark Mode wurde ergänzt",
                "Patch Notes sind als read-only Ansicht in der App verfügbar",
            ],
        },
        {
            version: "0.5.0",
            date: "2026-03-22",
            title: "Detail und Edit-Flow verbessert",
            summary: "Die Detailansicht wurde ausgebaut und der Edit-Flow auf eine gemeinsame Formularbasis gestellt.",
            issueUrl: undefined,
            issueLabel: undefined,
            items: [
                "Detailansicht deutlich erweitert",
                "Add- und Edit-Formular zusammengeführt",
                "Foto-Upload integriert",
                "Erste Admin-Logik ergänzt",
            ],
        },
        {
            version: "0.4.0",
            date: "2026-03-18",
            title: "Inventarliste und Grundnavigation stehen",
            summary: "Die erste funktionsfähige Inventaransicht und der Basis-Flow zum Anlegen von Geräten wurden aufgebaut.",
            issueUrl: undefined,
            issueLabel: undefined,
            items: [
                "Geräte können angelegt werden",
                "Inventarliste und Grundnavigation stehen",
            ],
        },
    ],
};
