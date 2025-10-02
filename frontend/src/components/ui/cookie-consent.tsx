"use client";

import { useEffect } from "react";
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import * as CookieConsent from 'vanilla-cookieconsent';

export default function CookieConsentBanner() {
  useEffect(() => {
    // Inject custom CSS for primary button color
    const style = document.createElement('style');
    style.innerHTML = `
      .cc__btn_primary, .cc__btn_primary:visited {
        background: #2563eb !important;
        color: #fff !important;
        border-color: #2563eb !important;
      }
      .cc__btn_primary:hover, .cc__btn_primary:focus {
        background: #1e40af !important;
        border-color: #1e40af !important;
      }
    `;
    document.head.appendChild(style);

    // Only run once on mount
    CookieConsent.run({
      guiOptions: {
        consentModal: {
          layout: "cloud",
          position: "bottom center",
          equalWeightButtons: true,
          flipButtons: false,
        },
        preferencesModal: {
          layout: "bar wide",
          position: "right",
          equalWeightButtons: true,
        },
      },
      categories: {
        necessary: {
          enabled: true,
          readOnly: true, // mandatory, cannot be disabled
        },
      },
      disablePageInteraction: true,
      hideFromBots: true,
      language: {
        default: "de",
        translations: {
          de: {
            consentModal: {
              title: "Wir verwenden nur notwendige Cookies",
              description:
                "Wir setzen ausschließlich technisch notwendige Cookies – z.\u00A0B. Sitzungs-Cookies – ein. Diese sind f\u00FCr Login, CSRF-Schutz und das einwandfreie Funktionieren der Website erforderlich. Ohne diese Cookies funktioniert die Seite nicht. Es werden keine Analyse-, Tracking- oder Marketing-Cookies verwendet.",
              acceptAllBtn: "Akzeptieren",
              acceptNecessaryBtn: "Nur notwendige akzeptieren",
              showPreferencesBtn: "Einstellungen",
            },
            preferencesModal: {
              title: "Cookie-Einstellungen",
              closeIconLabel: "Schließen",
              acceptAllBtn: "Akzeptieren",
              acceptNecessaryBtn: "Nur notwendige akzeptieren",
              sections: [
                {
                  title: "Verwendung von Cookies",
                  description:
                    "Diese Website verwendet ausschließlich unbedingt erforderliche Cookies (z.\u00A0B. Sitzungs-Cookies), um Grundfunktionen wie Anmeldung, Sicherheit und Ihre Sitzung aufrechtzuerhalten. Keine Analyse-, Tracking- oder Marketing-Cookies.",
                },
                {
                  title: "Notwendige Cookies",
                  description:
                    "Diese Cookies sind f\u00FCr die grundlegende Funktion der Website erforderlich und k\u00F6nnen nicht deaktiviert werden. Dazu z\u00E4hlen insbesondere Sitzungs-Cookies zur Aufrechterhaltung Ihrer Sitzung, zur Lastverteilung sowie zum Schutz vor Missbrauch (z.\u00A0B. CSRF).",
                  linkedCategory: "necessary",
                },
                {
                  title: "Weitere Informationen",
                  description:
                    'Für weitere Informationen oder bei Fragen zu unseren Cookies und dem Datenschutz kontaktieren Sie uns bitte über <a href="/contact" target="_blank" rel="noopener noreferrer">Kontakt</a>. <br> Lesen Sie auch unsere <a href="/privacy" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</a> und die <a href="/terms" target="_blank" rel="noopener noreferrer">Nutzungsbedingungen</a> für detaillierte rechtliche Hinweise.',
                },
              ],
            },
          },
        },
      },
    });

    return () => {
      // Cleanup style tag on unmount
      if (style && document.head.contains(style)) document.head.removeChild(style);
    };
  }, []);

  // The library renders the banner itself
  return null;
}
