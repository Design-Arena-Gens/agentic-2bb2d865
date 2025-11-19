import { NextResponse } from "next/server";
import { handleIncomingMessage } from "@/lib/agent";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(request: Request) {
  const raw = await request.text();
  const params = new URLSearchParams(raw);
  const from = params.get("From") ?? "";
  const body = params.get("Body") ?? "";

  if (!from || !body) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const phone = from.replace(/^whatsapp:/, "");
  const response = handleIncomingMessage({ phone, body });

  for (const reply of response.replies) {
    await sendWhatsAppMessage(phone, reply);
  }

  if (response.appointment) {
    const summary =
      `Olá, ${response.appointment.patientName}! Seu agendamento está marcado para ${formatDateTime(
        response.appointment.scheduledFor
      )}. Protocolo ${response.appointment.id}.`;
    await sendWhatsAppMessage(phone, summary);
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response></Response>`;
  return new NextResponse(twiml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml"
    }
  });
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short"
  }).format(new Date(iso));
}
