import { Suspense } from "react";
import { AppointmentForm } from "@/components/AppointmentForm";
import { AvailabilityBoard } from "@/components/AvailabilityBoard";
import { WhatsAppSimulator } from "@/components/WhatsAppSimulator";

export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 py-12">
      <section className="grid gap-6">
        <div className="inline-flex items-center gap-3 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">
          Agente inteligente de agendamento odontológico via WhatsApp
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Automatize seus agendamentos e confirmações pelo WhatsApp
        </h1>
        <p className="max-w-2xl text-lg text-slate-600">
          Centralize o fluxo de marcação de consultas com um assistente virtual que entende o paciente, sugere horários
          disponíveis e confirma o agendamento automaticamente no consultório OdontoSorriso.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-6">
          <Suspense fallback={<div className="rounded-2xl bg-white p-6 shadow-sm">Carregando...</div>}>
            <AppointmentForm />
          </Suspense>
          <Suspense fallback={<div className="rounded-2xl bg-white p-6 shadow-sm">Carregando...</div>}>
            <AvailabilityBoard />
          </Suspense>
        </div>
        <div className="min-h-[600px]">
          <Suspense fallback={<div className="rounded-2xl bg-white p-6 shadow-sm">Carregando simulador...</div>}>
            <WhatsAppSimulator />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
