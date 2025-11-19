"use client";

import { DateTime } from "luxon";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function AvailabilityBoard() {
  const { data } = useSWR("/api/appointments", fetcher, { refreshInterval: 15_000 });
  const availability = (data?.availability ?? []) as Array<{ date: string; time: string; available: boolean }>;

  const grouped = availability.reduce<Record<string, { label: string; slots: string[] }>>((acc, slot) => {
    if (!slot.available) return acc;
    const label = DateTime.fromISO(slot.date).toFormat("dd 'de' LLLL");
    if (!acc[slot.date]) {
      acc[slot.date] = { label, slots: [] };
    }
    acc[slot.date].slots.push(slot.time);
    return acc;
  }, {});

  const days = Object.entries(grouped).slice(0, 5);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
      <h2 className="text-lg font-semibold text-slate-900">Disponibilidade</h2>
      <p className="mt-1 text-sm text-slate-600">Horários livres próximos.</p>

      <div className="mt-4 grid gap-4">
        {days.length === 0 && <p className="text-sm text-slate-500">Sem horários livres nos próximos dias.</p>}
        {days.map(([date, info]) => (
          <div key={date} className="rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-medium text-slate-800">{info.label}</h3>
            <p className="mt-2 flex flex-wrap gap-2">
              {info.slots.slice(0, 8).map((time) => (
                <span
                  key={time}
                  className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {time}
                </span>
              ))}
              {info.slots.length > 8 && (
                <span className="text-xs text-slate-500">+{info.slots.length - 8} horários</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
