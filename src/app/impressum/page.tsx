import type { Metadata } from "next";
import {
  PLACEHOLDER_OPERATOR_NAME,
  PLACEHOLDER_OPERATOR_ADDRESS,
  PLACEHOLDER_OPERATOR_EMAIL,
  hasLegalPlaceholders,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "Impressum",
};

export default function ImpressumPage() {
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

      <h1 className="text-2xl font-semibold">Impressum</h1>

      <section className="mt-6">
        <h2 className="text-lg font-medium">Angaben gemäß § 5 DDG</h2>
        <p className="mt-2 whitespace-pre-line text-sm text-neutral-700">
          {PLACEHOLDER_OPERATOR_NAME}
          {"\n"}
          {PLACEHOLDER_OPERATOR_ADDRESS}
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-medium">Kontakt</h2>
        <p className="mt-2 text-sm text-neutral-700">
          E-Mail:{" "}
          <a
            href={`mailto:${PLACEHOLDER_OPERATOR_EMAIL}`}
            className="underline"
          >
            {PLACEHOLDER_OPERATOR_EMAIL}
          </a>
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-medium">Verantwortlich für den Inhalt</h2>
        <p className="mt-2 text-sm text-neutral-700">
          {PLACEHOLDER_OPERATOR_NAME}
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-medium">Haftung für Links</h2>
        <p className="mt-2 text-sm text-neutral-700">
          Für die Inhalte externer Links sind ausschließlich deren Betreiber
          verantwortlich. Zum Zeitpunkt der Verlinkung wurden die verlinkten
          Seiten auf Rechtsverstöße überprüft; rechtswidrige Inhalte waren nicht
          erkennbar. Eine dauerhafte inhaltliche Kontrolle der verlinkten Seiten
          ist ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht
          zumutbar.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-medium">Urheberrecht</h2>
        <p className="mt-2 text-sm text-neutral-700">
          Die durch die Betreiber erstellten Inhalte unterliegen dem deutschen
          Urheberrecht. Vervielfältigung, Bearbeitung und Verbreitung außerhalb
          der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung
          des jeweiligen Autors bzw. Erstellers.
        </p>
      </section>
    </div>
  );
}
