import type { CoffeeShop } from "@/lib/types";

const VIBE_BG: Record<string, string> = {
  third_wave: "bg-amber-100 text-amber-900",
  minimalist: "bg-zinc-100 text-zinc-900",
  cozy: "bg-rose-100 text-rose-900",
  bustling: "bg-orange-100 text-orange-900",
  rustic: "bg-stone-200 text-stone-900",
  planty: "bg-emerald-100 text-emerald-900",
  scandi: "bg-sky-100 text-sky-900",
  industrial: "bg-slate-200 text-slate-900",
};

const DEFAULT_BG = "bg-amber-100 text-amber-900";

export default function ShopImage({
  shop,
  className,
}: {
  shop: CoffeeShop;
  className?: string;
}) {
  if (shop.primary_photo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={shop.primary_photo_url}
        alt={shop.name}
        className={className}
      />
    );
  }

  const firstVibe = shop.vibe_tags[0];
  const bg = (firstVibe && VIBE_BG[firstVibe]) ?? DEFAULT_BG;
  const initial = shop.name.charAt(0).toUpperCase();

  return (
    <div
      data-testid="shop-image-placeholder"
      className={`flex items-center justify-center ${bg} ${className ?? ""}`}
      aria-hidden="true"
    >
      <span className="text-5xl font-bold select-none">{initial}</span>
    </div>
  );
}
