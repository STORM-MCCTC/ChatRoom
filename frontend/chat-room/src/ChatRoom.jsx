import { useEffect, useState, useRef } from "react";

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const ws = useRef(null);
  const chatEndRef = useRef(null); // Reference to the bottom of the chat box

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8000/ws");

    ws.current.onopen = () => console.log("Connected to WebSocket");

    ws.current.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    ws.current.onerror = (error) => console.error("WebSocket error:", error);
    ws.current.onclose = () => console.log("WebSocket disconnected");

    return () => ws.current.close();
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() && username.trim() && ws.current.readyState === WebSocket.OPEN) {
      const messageData = { username, message: input };
      ws.current.send(JSON.stringify(messageData)); // Send as JSON
      setInput("");
    }
  };

  return (
    <div className="p-4">
      {/* Chat Box */}
      <div className="border p-2 h-96 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className="p-1 border-b">{msg}</div>
        ))}
        {/* Invisible div to scroll to */}
        <div ref={chatEndRef} />
      </div>

      {/* Message Input */}
      <input 
        type="text" 
        className="border p-2 w-full mt-2"
        placeholder="Type a message..."
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
            {/* Username Input */}
            <input 
        type="text"
        className="border p-2 w-full mb-2"
        placeholder="Enter your username..."
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
    </div>
  );
};

export default ChatRoom;
