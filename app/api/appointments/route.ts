import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createAppointment,
  getAvailability,
  listAppointments
} from "@/lib/store";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { TREATMENT_OPTIONS } from "@/lib/types";

const appointmentSchema = z.object({
  patientName: z.string().min(3),
  patientPhone: z.string().min(8),
  treatment: z.enum(TREATMENT_OPTIONS),
  preferredDate: z.string(),
  preferredTime: z.string(),
  notes: z.string().optional()
});

export function GET() {
  const appointments = listAppointments();
  const availability = getAvailability();
  return NextResponse.json({ appointments, availability });
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = appointmentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const appointment = createAppointment(parsed.data, "web");
    const summary =
      `Olá, ${appointment.patientName}! Seu agendamento no consultório OdontoSorriso está confirmado para ` +
      `${formatDateTime(appointment.scheduledFor)}.\n` +
      `Procedimento: ${appointment.treatment}.\n` +
      `Protocolo: ${appointment.id}.`;
    await sendWhatsAppMessage(appointment.patientPhone, summary);
    return NextResponse.json({ appointment });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível criar o agendamento." },
      { status: 500 }
    );
  }
}

function formatDateTime(iso: string) {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short"
  });
  return formatter.format(new Date(iso));
}
