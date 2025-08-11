import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// For admin: userId is the selected user to chat with
export const useChat = ({ userId, isAdmin }) => {
  const [userMessages, setuserMessages] = useState([]);
  const [userList, setUserList] = useState([]); // List of users who have chatted
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000");
    socketRef.current.emit("join", { userId, isAdmin });

    // For admin: receive all user messages
    socketRef.current.on("receiveMessage", (msg) => {
      if (isAdmin) {
        // msg: { userId, message, from }
        setuserMessages((prev) => {
          // Only show messages for the selected user
          if (msg.userId === userId) {
            return [...prev, msg];
          }
          return prev;
        });
        setUserList((prev) => {
          if (msg.userId && !prev.includes(msg.userId)) {
            return [...prev, msg.userId];
          }
          return prev;
        });
      } else {
        // For user: just append messages
        setuserMessages((prev) => [...prev, msg]);
      }
    });

    // Optionally, receive a list of active users from the server
    socketRef.current.on("userList", (users) => {
      setUserList(users);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [userId, isAdmin]);

  // When admin switches user, clear messages and request chat history
  useEffect(() => {
    if (isAdmin && userId) {
      setuserMessages([]); // Clear messages when switching user
      socketRef.current.emit("getChatHistory", { userId });
      socketRef.current.on("chatHistory", (history) => {
        setuserMessages(history || []);
      });
    }
    // eslint-disable-next-line
  }, [userId, isAdmin]);

  const sendMessage = (msg) => {
    if (isAdmin) {
      // Admin sends to a specific user
      socketRef.current.emit("adminReply", { userId, message: msg.message });
      setuserMessages((prev) => [...prev, { ...msg, from: "admin" }]);
    } else {
      socketRef.current.emit("userMessage", { userId, message: msg.message });
      setuserMessages((prev) => [...prev, { ...msg, from: "user" }]);
    }
  };

  return { userMessages, sendMessage, setuserMessages, userList };
};