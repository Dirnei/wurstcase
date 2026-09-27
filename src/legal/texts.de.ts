import type { LegalTexts } from './document'

// Authoritative German legal texts. {placeholders} are filled from the operator details (legal.json).
export const de: LegalTexts = {
  impressum: {
    title: 'Impressum',
    sections: [
      {
        id: 'angaben',
        heading: 'Angaben gemäß § 5 DDG',
        paragraphs: ['{name}', '{street}', '{postalCode} {city}', '{country}'],
      },
      {
        id: 'kontakt',
        heading: 'Kontakt',
        paragraphs: ['E-Mail: {email}'],
      },
      {
        id: 'hinweis',
        heading: 'Hinweis',
        paragraphs: [
          'Wurst Case ist ein privates, nicht kommerzielles Hobbyprojekt. Das Spiel ist kostenlos und enthält weder Werbung noch In-App-Käufe.',
        ],
      },
    ],
  },
  datenschutz: {
    title: 'Datenschutzerklärung',
    sections: [
      {
        id: 'verantwortlicher',
        heading: 'Verantwortlicher',
        paragraphs: [
          'Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:',
          '{name}',
          '{street}',
          '{postalCode} {city}',
          '{country}',
          'E-Mail: {email}',
        ],
      },
      {
        id: 'cookies',
        heading: 'Cookies und Tracking',
        paragraphs: [
          'Diese Website setzt keine Cookies. Es werden keine Analyse-, Tracking- oder Werbedienste eingesetzt, und es werden keine Inhalte von Drittanbietern wie Schriftarten, Videos oder Skripte geladen. Alle Dateien werden direkt von diesem Server ausgeliefert.',
          'Im Fußbereich befindet sich ein Link zu meiner Seite bei Ko-fi (ko-fi.com). Beim Anzeigen des Spiels werden keine Daten an Ko-fi übertragen. Erst wenn Sie dem Link folgen, verlassen Sie diese Website, und es gilt die Datenschutzerklärung von Ko-fi.',
        ],
      },
      {
        id: 'browser',
        heading: 'Speicherung im Browser',
        paragraphs: [
          'Damit das Spiel funktioniert, speichert es Daten ausschließlich lokal im Speicher Ihres Browsers (Local Storage): Ihre Sprachauswahl (Schlüssel „vegle.language“) und Ihren Spielstand.',
          'Diese Daten verlassen Ihr Gerät nicht und werden nicht an uns übertragen. Die Speicherung ist für die von Ihnen gewünschte Nutzung des Spiels unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG); eine Einwilligung ist dafür nicht nötig.',
          'Sie können diese Daten jederzeit löschen, indem Sie die Websitedaten für diese Seite in den Einstellungen Ihres Browsers entfernen. Dabei geht Ihr Spielstand verloren.',
        ],
      },
      {
        id: 'serverlogs',
        heading: 'Server-Logdateien',
        paragraphs: [
          'Beim Aufruf der Website verarbeitet der Webserver technisch notwendige Zugriffsdaten: Datum und Uhrzeit, aufgerufene Datei, übertragene Datenmenge, HTTP-Statuscode, zuvor besuchte Seite (Referrer) und die Browserkennung (User-Agent).',
          'Ihre IP-Adresse wird dabei nur gekürzt gespeichert: Bei IPv4-Adressen wird das letzte Byte, bei IPv6-Adressen werden die letzten 80 Bit durch Nullen ersetzt. Dadurch ist ein Personenbezug weitgehend ausgeschlossen.',
          'Die Logdaten dienen ausschließlich der Fehleranalyse und der Abwehr von Missbrauch; sie werden nicht mit anderen Daten zusammengeführt. Rechtsgrundlage ist unser berechtigtes Interesse an einem sicheren und stabilen Betrieb der Website (Art. 6 Abs. 1 lit. f DSGVO). Die Logdateien werden automatisch überschrieben, sobald sie eine festgelegte Größe erreichen.',
        ],
      },
      {
        id: 'hosting',
        heading: 'Hosting',
        paragraphs: [
          'Diese Website wird bei folgendem Anbieter betrieben: {hostingProvider}. Der Anbieter stellt die technische Infrastruktur bereit und kann dabei die oben genannten Zugriffsdaten verarbeiten.',
        ],
      },
      {
        id: 'rechte',
        heading: 'Ihre Rechte',
        paragraphs: [
          'Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO), Löschung (Art. 17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO), Datenübertragbarkeit (Art. 20 DSGVO) und Widerspruch gegen die Verarbeitung (Art. 21 DSGVO). Wenden Sie sich dazu an die oben genannte E-Mail-Adresse.',
          'Außerdem haben Sie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren (Art. 77 DSGVO).',
        ],
      },
      {
        id: 'stand',
        heading: 'Stand',
        paragraphs: ['September 2026'],
      },
    ],
  },
}
