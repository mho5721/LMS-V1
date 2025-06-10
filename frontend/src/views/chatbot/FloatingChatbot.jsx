import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useState, useRef, useEffect } from "react";
import useAxios from "../../utils/useAxios";

// Inject loader CSS
if (typeof document !== "undefined") {
  const style = document.createElement('style');
  style.innerHTML = `
    .loader {
      width: 60px;
      aspect-ratio: 2;
      --_g: no-repeat radial-gradient(circle closest-side,#4f46e5 90%,#0000);
      background: 
        var(--_g) 0%   50%,
        var(--_g) 50%  50%,
        var(--_g) 100% 50%;
      background-size: calc(100%/3) 50%;
      animation: l3 1s infinite linear;
    }
    @keyframes l3 {
      20% { background-position: 0% 0%, 50% 50%, 100% 50% }
      40% { background-position: 0% 100%, 50% 0%, 100% 50% }
      60% { background-position: 0% 50%, 50% 100%, 100% 0% }
      80% { background-position: 0% 50%, 50% 50%, 100% 100% }
    }
  `;
  document.head.appendChild(style);
}

function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const textareaRef = useRef(null);
  const bottomRef = useRef(null);

  const [courseContent, setCourseContent] = useState("");

  useEffect(() => {
    useAxios.get("student/aggregated-course-content/").then((res) => {
      setCourseContent(res.data.content);
    });
  }, []);


  useEffect(() => {
    if (!isLoading && isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading, isOpen]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const toggleChatbox = () => {
    if (!isOpen && messages.length === 0) {
      setMessages([{ role: "assistant", content: "Hello! I'm your AI learning assistant. How can I help you today?" }]);
    }
    setIsOpen(!isOpen);

    setTimeout(() => {
      if (!isOpen && textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

const handleSend = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...messages, { role: "user", content: userInput }];
    setMessages(newMessages);
    setUserInput("");
    setIsLoading(true);

    try {
      // ✅ NEW: Build a special prompt template
      const systemPrompt = `
  You are an AI learning assistant in an LMS platform.
  - You help students understand lessons and assignments.
  - Be clear, concise, friendly, and guide the student step-by-step.
  - Only answer based on LMS course materials.
  - If unsure or the topic is outside LMS content, politely say: "I'm sorry, I can only assist with LMS topics."

  Student's question:
  ${userInput}
      `.trim();

      const formattedMessages = [
        {
          role: "user",
          parts: [{ text: systemPrompt }]
        }
      ];

      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        { contents: formattedMessages },
        {
          headers: { "Content-Type": "application/json" },
          params: { key: "AIzaSyBsSSYNoj65IocTTRQg14alNwFOjjYcDHk" }
        }
      );

      const aiMessage = {
        role: "assistant",
        content: response.data.candidates[0].content.parts[0].text,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error talking to Gemini AI:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
};


  return (
    <>
      {/* Floating Button */}
      <div style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 1000,
      }}>
        <button onClick={toggleChatbox} style={{
          backgroundColor: "#4f46e5",
          color: "white",
          padding: "15px",
          borderRadius: "50%",
          fontSize: "20px",
          border: "none",
          cursor: "pointer"
        }}>
          💬
        </button>
      </div>

      {/* Chatbox Popup */}
      {isOpen && (
        <div style={{
          position: "fixed",
          bottom: "80px",
          right: "20px",
          width: "320px",
          height: "450px",
          backgroundColor: "white",
          border: "1px solid #ddd",
          borderRadius: "10px",
          boxShadow: "0 0 15px rgba(0,0,0,0.2)",
          zIndex: 1001,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Title */}
          <div style={{
            backgroundColor: "#4f46e5",
            color: "white",
            padding: "10px",
            fontSize: "16px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <span>AI Learning Assistant</span>
            <button onClick={toggleChatbox} style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "18px",
              cursor: "pointer",
            }}>×</button>
          </div>

          {/* Chat Messages */}
          <div style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
            {/* Greeting first if available */}
            {messages.length > 0 && messages[0].role === "assistant" && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "20px" }}>
                <div style={{
                  backgroundColor: "#f1f5f9",
                  color: "#111827",
                  padding: "10px 14px",
                  borderRadius: "20px",
                  maxWidth: "70%",
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                }}>
                  <ReactMarkdown>
                    {messages[0].content}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Normal messages */}
            {messages.slice(1).map((msg, idx) => (
              <div key={idx} style={{ marginBottom: "20px" }}>
                {msg.role === "user" ? (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{
                    backgroundColor: "#4f46e5",
                    color: "white",
                    padding: "8px 12px",
                    borderRadius: "20px",
                    maxWidth: "80%",
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    minHeight: "32px",
                    }}>
                    <div style={{
                        width: "100%",
                        textAlign: "left",
                    }}>
                        <ReactMarkdown components={{
                        p: ({ node, ...props }) => <span {...props} />
                        }}>
                        {msg.content}
                        </ReactMarkdown>
                    </div>
                    </div>
                </div>
                ) : (
                    <div style={{
                    backgroundColor: "#f1f5f9",
                    color: "#111827",
                    padding: "10px 14px",
                    borderRadius: "20px",
                    maxWidth: "85%",             // (wider, more natural for reading)
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                    display: "flex",             // <-- NEW: make bubble flex
                    alignItems: "center",        // <-- NEW: vertical center
                    minHeight: "40px",           // <-- NEW: minimum height to match user bubble
                    }}
                    >
                    <div style={{
                        width: "100%",
                    }}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    </div>
                )}
              </div>
            ))}

            {/* Loading AI thinking */}
            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "20px" }}>
                <div style={{
                  backgroundColor: "#f1f5f9",
                  padding: "10px 14px",
                  borderRadius: "20px",
                  width: "100px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <div className="loader"></div>
                </div>
              </div>
            )}

            {/* Empty div for auto-scrolling */}
            <div ref={bottomRef} />
          </div>

          {/* Chat Input */}
          <div style={{ padding: "10px", borderTop: "1px solid #ddd" }}>
            <textarea
              ref={textareaRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isLoading ? "Waiting for AI response..." : "Type your message..."}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                resize: "vertical",
                minHeight: "40px",
                maxHeight: "120px",
                fontFamily: "inherit",
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? "not-allowed" : "text",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default FloatingChatbot;
