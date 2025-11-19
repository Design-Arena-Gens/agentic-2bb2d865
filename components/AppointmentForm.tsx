"use client";

import { DateTime } from "luxon";
import { useState, useTransition } from "react";
import useSWR from "swr";
import clsx from "clsx";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface AppointmentFormProps {
  onCreated?: () => void;
}

export function AppointmentForm({ onCreated }: AppointmentFormProps) {
  const { data } = useSWR("/api/appointments", fetcher, { refreshInterval: 10_000 });
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState({
    patientName: "",
    patientPhone: "",
    treatment: "avaliacao",
    preferredDate: "",
    preferredTime: "",
    notes: ""
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const availabilityByDate = data?.availability?.reduce((acc: Record<string, string[]>, slot: any) => {
    if (!slot.available) return acc;
    acc[slot.date] = acc[slot.date] ?? [];
    acc[slot.date].push(slot.time);
    return acc;
  }, {}) ?? {};

  const availableDates = Object.keys(availabilityByDate);
  const availableTimes: string[] = formState.preferredDate
    ? availabilityByDate[formState.preferredDate] ?? []
    : [];

  const handleSubmit = () => {
    setError(null);
    setFeedback(null);
    if (
      !formState.patientName ||
      !formState.patientPhone ||
      !formState.preferredDate ||
      !formState.preferredTime
    ) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    startTransition(async () => {
      try {
        const response = await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formState)
        });
        if (!response.ok) {
          const payload = await response.json();
          setError(payload.error ?? "Falha ao criar agendamento.");
          return;
        }
        setFeedback("Agendamento criado e mensagem enviada pelo WhatsApp!");
        onCreated?.();
        setFormState({
          patientName: "",
          patientPhone: "",
          treatment: "avaliacao",
          preferredDate: "",
          preferredTime: "",
          notes: ""
        });
      } catch (err) {
        console.error(err);
        setError("Não foi possível concluir o agendamento.");
      }
    });
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
      <h2 className="text-lg font-semibold text-slate-900">Agendar manualmente</h2>
      <p className="mt-1 text-sm text-slate-600">
        Cadastre um novo paciente e confirme o horário desejado. O paciente receberá a confirmação via WhatsApp.
      </p>

      <div className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Nome completo
          <input
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={formState.patientName}
            onChange={(event) => setFormState((prev) => ({ ...prev, patientName: event.target.value }))}
            placeholder="Nome do paciente"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          WhatsApp
          <input
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={formState.patientPhone}
            onChange={(event) => setFormState((prev) => ({ ...prev, patientPhone: event.target.value }))}
            placeholder="DDD + número"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Procedimento
          <select
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={formState.treatment}
            onChange={(event) => setFormState((prev) => ({ ...prev, treatment: event.target.value }))}
          >
            <option value="avaliacao">Avaliação inicial</option>
            <option value="limpeza">Limpeza e profilaxia</option>
            <option value="clareamento">Clareamento dental</option>
            <option value="restauracao">Restauração</option>
            <option value="canal">Tratamento de canal</option>
            <option value="ortodontia">Consulta ortodôntica</option>
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Data preferida
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              value={formState.preferredDate}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  preferredDate: event.target.value,
                  preferredTime: ""
                }))
              }
            >
              <option value="">Selecione</option>
              {availableDates.map((date) => {
                const dt = DateTime.fromISO(date);
                return (
                  <option key={date} value={date}>
                    {dt.toFormat("dd 'de' LLLL")}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Horário preferido
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              value={formState.preferredTime}
              onChange={(event) => setFormState((prev) => ({ ...prev, preferredTime: event.target.value }))}
              disabled={!formState.preferredDate}
            >
              <option value="">Selecione</option>
              {availableTimes.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Observações
          <textarea
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={formState.notes}
            onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
            placeholder="Informações adicionais sobre o paciente"
            rows={3}
          />
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {feedback && <p className="mt-4 text-sm text-emerald-600">{feedback}</p>}

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className={clsx(
          "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-primary-dark",
          isPending && "cursor-not-allowed opacity-70"
        )}
      >
        {isPending ? "Salvando..." : "Confirmar agendamento"}
      </button>
    </div>
  );
}
