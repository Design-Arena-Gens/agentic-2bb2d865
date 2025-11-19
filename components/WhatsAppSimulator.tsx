"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { DateTime } from "luxon";

interface Message {
  id: string;
  from: "paciente" | "agente";
  content: string;
  timestamp: string;
}

function generatePhone() {
  return "55" + Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

export function WhatsAppSimulator() {
  const [phone] = useState(generatePhone);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const response = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, body: "Oi" })
        });
        const payload = await response.json();
        if (payload.session?.messages) {
          setMessages(payload.session.messages);
        }
      } catch (error) {
        console.error(error);
      }
    };
    bootstrap();
  }, [phone]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const outgoingContent = input;
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, body: outgoingContent })
      });
      const payload = await response.json();
      if (payload.session?.messages) {
        setMessages(payload.session.messages);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-2xl bg-[#111b21] shadow-lg">
      <header className="flex items-center gap-2 border-b border-white/10 p-4 text-white">
        <div className="h-10 w-10 rounded-full bg-primary/60" />
        <div>
          <p className="text-sm font-semibold">Paciente</p>
          <p className="text-xs text-white/60">+{phone}</p>
        </div>
      </header>
      <div className="flex-1 space-y-4 overflow-y-auto bg-[url('https://i.imgur.com/8wPDK9v.png')] bg-cover p-4">
        {messages.map((message) => (
          <div key={message.id} className={clsx("flex", message.from === "agente" ? "justify-start" : "justify-end")}>
            <div
              className={clsx(
                "max-w-[70%] rounded-lg px-3 py-2 text-sm",
                message.from === "agente" ? "rounded-bl-none bg-white/80 text-slate-900" : "rounded-br-none bg-emerald-500 text-white"
              )}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <span className="mt-1 block text-[0.65rem] text-white/60">
                {DateTime.fromISO(message.timestamp).toFormat("HH:mm")}
              </span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex items-center gap-2 border-t border-white/10 bg-[#202c33] p-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Escreva a mensagem..."
          className="flex-1 rounded-full bg-[#2a3942] px-4 py-2 text-sm text-white placeholder:text-white/40"
        />
        <button
          disabled={isSending}
          onClick={sendMessage}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
