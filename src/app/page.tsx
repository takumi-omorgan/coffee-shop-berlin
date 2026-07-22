import { SITE } from "@/lib/site";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-amber-700 dark:text-amber-500">
        Berlin · Specialty Coffee
      </p>
      <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        {SITE.name}
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        {SITE.description}
      </p>
      <p className="mt-10 rounded-full border border-zinc-200 px-4 py-1.5 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        Launching soon — listings are being brewed.
      </p>
    </main>
  );
}
