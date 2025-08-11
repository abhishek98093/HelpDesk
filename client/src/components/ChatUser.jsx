import { useState, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import { jwtDecode } from "jwt-decode";
const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const chat = () => {
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const { userMessages, setuserMessages, sendMessage } = useChat({ 
    userId: decoded?.id, 
    isAdmin: false 
  });
  const [chatInput, setChatInput] = useState("");

  // Fetch last 20 messages on mount
  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch(`${apiUrl}/api/chat?user_id=${decoded.id}&limit=20`);
      const data = await res.json();
      setuserMessages(data);
    };
    fetchMessages();
  }, [decoded.id, setuserMessages]);

  const handleSend = async () => {
    if (chatInput.trim()) {
      await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: decoded.id,
          message: chatInput,
          from_role: "user"
        })
      });
      sendMessage({ userId: decoded.id, message: chatInput, from: "user" });
      setChatInput("");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-90 bg-gray-900 rounded-xl shadow-lg border border-gray-700 p-4">
      <h3 className="text-lg font-bold text-white mb-2">Chat with Admin</h3>
      <div className="h-68 overflow-y-auto bg-gray-800 rounded-lg p-2 mb-2">
        {userMessages.map((msg, idx) => (
          <div key={idx} className={`mb-1 text-sm ${msg.from_role === "user" ? "text-right" : "text-left"}`}>
            <span className={`inline-block px-2 py-1 rounded ${msg.from_role === "user" ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-200"}`}>
              {msg.message}
            </span>
          </div>
        ))}
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <input
          className="flex-1 px-3 py-2 rounded bg-gray-700 text-white"
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Send</button>
      </form>
    </div>
  )
};

export default chat;