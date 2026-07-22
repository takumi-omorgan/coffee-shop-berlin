import type { Metadata } from "next";
import {
  PLACEHOLDER_OPERATOR_NAME,
  PLACEHOLDER_OPERATOR_ADDRESS,
  PLACEHOLDER_OPERATOR_EMAIL,
  hasLegalPlaceholders,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
};

export default function DatenschutzPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {hasLegalPlaceholders() && (
        <div
          role="alert"
          className="mb-6 rounded-md border border-amber-400 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800"
        >
          Draft — operator details pending
        </div>
      )}

      <h1 className="text-2xl font-semibold">Datenschutzerklärung</h1>

      <section className="mt-6">
        <h2 className="text-lg font-medium">Verantwortlicher</h2>
        <p className="mt-2 whitespace-pre-line text-sm text-neutral-700">
          {PLACEHOLDER_OPERATOR_NAME}
          {"\n"}
          {PLACEHOLDER_OPERATOR_ADDRESS}
          {"\n"}
          E-Mail: {PLACEHOLDER_OPERATOR_EMAIL}
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-medium">Hosting</h2>
        <p className="mt-2 text-sm text-neutral-700">
          Diese Seite ist eine statische Website. Beim Abruf werden durch den
          Hosting-Anbieter automatisch Server-Logfiles erfasst (z.&nbsp;B.
          IP-Adresse, Uhrzeit, angeforderte Datei). Die Verarbeitung erfolgt auf
          Grundlage des berechtigten Interesses des Betreibers an der
          technisch fehlerfreien Darstellung und Sicherheit der Website gemäß
          Art. 6 Abs. 1 lit. f DSGVO.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-medium">Kartenmaterial</h2>
        <p className="mt-2 text-sm text-neutral-700">
          Beim Anzeigen der Karte werden Kartenkacheln (Map Tiles) von
          OpenFreeMap geladen. Dabei wird Ihre IP-Adresse an den
          Kachel-Server übertragen, damit die Kartenansicht in Ihrem Browser
          dargestellt werden kann.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-medium">Analyse</h2>
        <p className="mt-2 text-sm text-neutral-700">
          Diese Website verwendet eine datenschutzfreundliche, cookieless
          Web-Analyse ohne Erstellung persönlicher Profile. Es werden keine
          Cookies gesetzt und keine personenbezogenen Daten gespeichert.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-medium">Ihre Rechte</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
          <li>Auskunft (Art. 15 DSGVO)</li>
          <li>Berichtigung (Art. 16 DSGVO)</li>
          <li>Löschung (Art. 17 DSGVO)</li>
          <li>Beschwerderecht bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
        </ul>
      </section>
    </div>
  );
}
