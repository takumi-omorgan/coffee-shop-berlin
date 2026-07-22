import type { CoffeeShop } from "@/lib/types";
import { formatHours } from "@/lib/hours";

const DAY_LABELS: Record<string, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export default function HoursTable({ hours }: { hours: CoffeeShop["hours"] }) {
  const rows = formatHours(hours);
  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map((row) => (
          <tr key={row.day} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
            <th
              scope="row"
              className="py-1.5 pr-4 text-left font-medium text-zinc-600 dark:text-zinc-400"
            >
              {DAY_LABELS[row.day]}
            </th>
            <td className="py-1.5 text-zinc-900 dark:text-zinc-100">
              {row.label}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
