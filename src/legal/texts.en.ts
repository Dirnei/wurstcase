import type { LegalTexts } from './document'

const NOTE = 'This is a courtesy translation. The German version is legally binding.'

// English courtesy translation of texts.de.ts; keep section ids and placeholders in sync.
export const en: LegalTexts = {
  impressum: {
    title: 'Legal notice',
    note: NOTE,
    sections: [
      {
        id: 'angaben',
        heading: 'Information pursuant to § 5 DDG',
        paragraphs: ['{name}', '{street}', '{postalCode} {city}', '{country}'],
      },
      {
        id: 'kontakt',
        heading: 'Contact',
        paragraphs: ['Email: {email}'],
      },
      {
        id: 'hinweis',
        heading: 'Note',
        paragraphs: [
          'Wurst Case is a private, non-commercial hobby project. The game is free and contains no ads and no in-app purchases.',
        ],
      },
    ],
  },
  datenschutz: {
    title: 'Privacy policy',
    note: NOTE,
    sections: [
      {
        id: 'verantwortlicher',
        heading: 'Controller',
        paragraphs: [
          'The controller responsible for data processing on this website within the meaning of the General Data Protection Regulation (GDPR) is:',
          '{name}',
          '{street}',
          '{postalCode} {city}',
          '{country}',
          'Email: {email}',
        ],
      },
      {
        id: 'cookies',
        heading: 'Cookies and tracking',
        paragraphs: [
          'This website sets no cookies. No analytics, tracking or advertising services are used, and no third-party content such as fonts, videos or scripts is loaded. All files are served directly by this server.',
        ],
      },
      {
        id: 'browser',
        heading: 'Storage in your browser',
        paragraphs: [
          'For the game to work, it stores data only locally in your browser’s storage (local storage): your language choice (key “vegle.language”) and your game progress.',
          'This data does not leave your device and is not transmitted to us. Storing it is strictly necessary for the use of the game you requested (§ 25 (2) no. 2 TDDDG); no consent is therefore required.',
          'You can delete this data at any time by removing the site data for this page in your browser settings. Your game progress will be lost.',
        ],
      },
      {
        id: 'serverlogs',
        heading: 'Server log files',
        paragraphs: [
          'When you visit the website, the web server processes technically necessary access data: date and time, requested file, amount of data transferred, HTTP status code, previously visited page (referrer) and browser identification (user agent).',
          'Your IP address is stored only in shortened form: for IPv4 addresses the last byte, for IPv6 addresses the last 80 bits are replaced with zeros. This largely rules out identifying you.',
          'The log data is used solely to analyse errors and prevent abuse; it is not combined with other data. The legal basis is our legitimate interest in operating the website securely and reliably (Art. 6 (1) (f) GDPR). The log files are automatically overwritten once they reach a set size.',
        ],
      },
      {
        id: 'hosting',
        heading: 'Hosting',
        paragraphs: [
          'This website is operated with the following provider: {hostingProvider}. The provider supplies the technical infrastructure and may process the access data listed above in doing so.',
        ],
      },
      {
        id: 'rechte',
        heading: 'Your rights',
        paragraphs: [
          'You have the right of access (Art. 15 GDPR), rectification (Art. 16 GDPR), erasure (Art. 17 GDPR), restriction of processing (Art. 18 GDPR), data portability (Art. 20 GDPR) and to object to processing (Art. 21 GDPR). To exercise them, contact the email address given above.',
          'You also have the right to lodge a complaint with a data protection supervisory authority (Art. 77 GDPR).',
        ],
      },
      {
        id: 'stand',
        heading: 'Last updated',
        paragraphs: ['September 2026'],
      },
    ],
  },
}
