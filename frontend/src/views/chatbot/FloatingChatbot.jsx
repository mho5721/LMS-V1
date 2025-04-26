import { useState } from "react";
import axios from "axios"; // for OpenAI API calls

function FloatingChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState("");

    const toggleChatbox = () => {
        setIsOpen(!isOpen);
    };

    const handleSend = async () => {
        if (!userInput.trim()) return;

        const newMessages = [...messages, { role: "user", content: userInput }];
        setMessages(newMessages);
        setUserInput("");

        try {
            const response = await axios.post("https://api.openai.com/v1/chat/completions", {
                model: "gpt-3.5-turbo",
                messages: newMessages,
            }, {
                headers: {
                    Authorization: `Bearer YOUR_OPENAI_API_KEY`,
                    "Content-Type": "application/json",
                },
            });

            const aiMessage = response.data.choices[0].message;
            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error("Error talking to AI:", error);
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
                    width: "300px",
                    height: "400px",
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    boxShadow: "0 0 15px rgba(0,0,0,0.2)",
                    zIndex: 1001,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}>
                    <div style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                marginBottom: "10px",
                                textAlign: msg.role === "user" ? "right" : "left",
                            }}>
                                <span style={{
                                    backgroundColor: msg.role === "user" ? "#e0e0e0" : "#4f46e5",
                                    color: msg.role === "user" ? "black" : "white",
                                    padding: "8px 12px",
                                    borderRadius: "15px",
                                    display: "inline-block",
                                }}>
                                    {msg.content}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div style={{ padding: "10px", borderTop: "1px solid #ddd" }}>
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Ask me anything..."
                            style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}

export default FloatingChatbot;
