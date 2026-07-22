import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-200 px-4 py-4 text-sm text-neutral-600">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-1">
        <span>
          ©{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            className="underline"
            rel="license"
          >
            OpenStreetMap contributors
          </a>
        </span>
        <span aria-hidden>·</span>
        <Link href="/impressum" className="underline">
          Impressum
        </Link>
        <span aria-hidden>·</span>
        <Link href="/datenschutz" className="underline">
          Datenschutz
        </Link>
        <span aria-hidden>·</span>
        <span>{SITE.name}</span>
      </div>
    </footer>
  );
}
