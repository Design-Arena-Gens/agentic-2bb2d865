import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WhatsApp Dental Agent",
  description: "Assistente para agendamento de consultas odontológicas via WhatsApp"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
