import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useChatMessages } from "@/components/Actividades/useChatMessages";

type Props = {
  chatId: number;
  currentUserId: string;
};

export function ChatBox({ chatId, currentUserId }: Props) {
  const messages = useChatMessages(chatId);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    await supabase.from("chat_messages").insert({
      chat_id: chatId,
      message: input,
      user_id: currentUserId,
    });

    setInput("");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] text-white">
      {/* Contenedor de mensajes con espacio reservado abajo para el input */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 space-y-5 bg-[#0d0d0d]">
        {messages.length === 0 ? (
          <div className="text-center text-gray-600 mt-12 text-sm">
            No hay mensajes aún. ¡Escribe el primero!
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.user_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative max-w-[75%] px-5 py-3 rounded-3xl text-sm whitespace-pre-line break-words shadow-lg ${
                    isOwn
                      ? "bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-br-sm"
                      : "bg-[#1f1f1f] border border-gray-700 text-gray-100 rounded-bl-sm"
                  }`}
                >
                  <p className="mb-5 leading-snug tracking-wide">{msg.message}</p>
                  <div className="absolute bottom-1 right-4 text-[10px] text-gray-400">
                    {new Date(msg.send_date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input fijo y visible fuera del scroll */}
      <div className="w-full px-4 py-3 bg-[#1a1a1a] border-t border-gray-800 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-4 py-2 text-sm text-white bg-[#111] border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-sm"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}


