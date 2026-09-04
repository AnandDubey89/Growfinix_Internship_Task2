import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef(null);

  // Receive messages and typing status
  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((previousMessages) => [
        ...previousMessages,
        data
      ]);
    });

    socket.on("user_typing", () => {
      setTyping(true);
    });

    socket.on("user_stop_typing", () => {
      setTyping(false);
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);

  // Send message
  const sendMessage = () => {
    if (message.trim() === "") return;

    socket.emit("send_message", {
      text: message,
      sender: "You",
      time: new Date().toLocaleTimeString()
    });

    setMessage("");
    socket.emit("stop_typing");
  };

  // Typing indicator
  const handleTyping = (e) => {
    const value = e.target.value;

    setMessage(value);

    if (value.length > 0) {
      socket.emit("typing");
    } else {
      socket.emit("stop_typing");
    }
  };

  // Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
  <div className="min-h-screen bg-gray-100">

    {/* Floating Chat Button */}
    {!isOpen && (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-blue-600 text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg text-2xl hover:bg-blue-700 transition"
      >
        💬
      </button>
    )}

    {/* Chat Widget */}
    {isOpen && (
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 w-auto sm:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">

          <div>
            <h1 className="text-lg font-bold">
              Chat Support
            </h1>

            <p className="text-sm text-blue-100">
              ● Online
            </p>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="text-xl hover:text-gray-200"
          >
            ✕
          </button>

        </div>

        {/* Messages */}
        <div className="h-[60vh] sm:h-96 overflow-y-auto p-4 space-y-3">

          {messages.map((msg, index) => (

            <div
              key={index}
              className={`flex ${
                msg.sender === "You"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              <div
                className={`max-w-xs px-4 py-2 rounded-2xl ${
                  msg.sender === "You"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >

                <p>{msg.text}</p>

                <p className="text-xs opacity-70 mt-1">
                  {msg.time}
                </p>

              </div>

            </div>

          ))}

          {typing && (
  <div className="flex items-center gap-2 text-gray-500 text-sm">
    <div className="flex gap-1">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
    </div>

    <span>Support is typing...</span>
  </div>
)}

          <div ref={messagesEndRef}></div>

        </div>

        {/* Message Input */}
        <div className="border-t p-3 flex gap-2">

          <input
            type="text"
            value={message}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700"
          >
            ➤
          </button>

        </div>

      </div>
    )}

  </div>
);
    
}

export default App;