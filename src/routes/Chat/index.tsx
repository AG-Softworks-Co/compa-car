import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ChatBox } from "@/components/Actividades/ChatBox";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

interface Chat {
  id: number;
  trip_id: number | null;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  useEffect(() => {
    const fetchUserAndChats = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        navigate({ to: "/Login" });
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("chat_participants")
        .select("chat_id")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error al cargar chats:", error);
        return;
      }

      const chatIds = data
        .map((item) => item.chat_id)
        .filter((id): id is number => id !== null);

      const { data: chatData } = await supabase
        .from("chats")
        .select("id, trip_id")
        .in("id", chatIds);

      setChats(chatData ?? []);
    };

    fetchUserAndChats();
  }, [navigate]);

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    setIsMobileChatOpen(true);
  };

  const handleBackToChats = () => {
    setIsMobileChatOpen(false);
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-[#0d0d0d] text-white overflow-hidden">
      {/* Lista de chats */}
      <aside
        className={`flex flex-col md:w-1/3 lg:w-1/4 border-r border-gray-800 bg-[#121212] md:block ${
          isMobileChatOpen ? "hidden" : "block"
        }`}
      >
        <div className="p-4 border-b bg-[#1c1c1c] shadow-sm">
          <h2 className="text-xl font-bold tracking-tight">📨 Mis Chats</h2>
          <p className="text-xs text-gray-400">Conversaciones recientes</p>
        </div>
        <ul className="flex-1 overflow-y-auto divide-y divide-[#222]">
          {chats.map((chat) => (
            <li
              key={chat.id}
              onClick={() => handleSelectChat(chat)}
              className={`px-5 py-4 cursor-pointer hover:bg-[#1f1f1f] transition-colors duration-200 ${
                selectedChat?.id === chat.id
                  ? "bg-[#2b2b2b] border-l-4 border-indigo-500"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  Viaje #{chat.trip_id ?? chat.id}
                </span>
                <span className="text-[11px] text-gray-500">Activo</span>
              </div>
              <p className="text-xs text-gray-400 mt-1 truncate">
                Haz clic para ver los mensajes...
              </p>
            </li>
          ))}
        </ul>
      </aside>

      {/* Panel de chat */}
      <main
        className={`flex-1 flex flex-col h-full max-h-screen bg-[#0d0d0d] ${
          isMobileChatOpen || window.innerWidth >= 768 ? "block" : "hidden"
        }`}
      >
        {selectedChat && userId ? (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-800 bg-[#1c1c1c] sticky top-0 z-10 flex items-center">
              <button
                className="md:hidden text-indigo-400 mr-4 text-sm"
                onClick={handleBackToChats}
              >
                ← Volver
              </button>
              <h3 className="text-lg font-semibold tracking-tight">
                Chat del viaje #{selectedChat.trip_id ?? selectedChat.id}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ChatBox chatId={selectedChat.id} currentUserId={userId} />
            </div>
          </div>
        ) : (
          <div className="m-auto text-center text-gray-500 px-6">
            <h2 className="text-xl font-semibold mb-2">Selecciona un chat</h2>
            <p className="text-sm">Tus mensajes aparecerán aquí</p>
          </div>
        )}
      </main>
    </div>
  );
}

export const Route = createFileRoute("/Chat/")({
  component: ChatPage,
});
