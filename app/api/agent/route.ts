import { NextResponse } from "next/server";
import { handleIncomingMessage } from "@/lib/agent";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(request: Request) {
  const payload = await request.json();
  try {
    const response = handleIncomingMessage(payload);

    if (payload.forwardToWhatsApp) {
      for (const reply of response.replies) {
        await sendWhatsAppMessage(payload.phone, reply);
      }
    }

    if (response.appointment) {
      const summary =
        `Olá, ${response.appointment.patientName}! Seu agendamento foi confirmado para ${formatDateTime(
          response.appointment.scheduledFor
        )}. Protocolo ${response.appointment.id}.`;
      await sendWhatsAppMessage(payload.phone, summary);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Agent route error", error);
    return NextResponse.json({ error: "Falha ao processar a mensagem." }, { status: 400 });
  }
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short"
  }).format(new Date(iso));
}
