import axios from "axios";
import React, { useState } from "react";

const AiChat = () => {
  const API_KEY = "AIzaSyBUt_rOkHDpGtiS2KFxOr05k4CiSsv_AzQ";
  const [question, setQuestion] = useState("");
  const [chatLog, setChatLog] = useState([]);
  async function getResponse() {
    if (!question.trim()) return;
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
        method: "post",
        data: {
          contents: [
            {
              parts: [{ text: question }],
            },
          ],
        },
      });

      const aiResponse =
        response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
      
      setChatLog((prevChat) => [...prevChat, { sender: "You", text: question }, { sender: "AI", text: aiResponse }]);
      setQuestion(""); 
    } catch (error) {
      console.error("Error fetching response:", error);
    }
  }

  return (
    <div className="w-[85vw] h-screen flex flex-col bg-[#e0e0e0]">
      <div className="flex-1 p-4 overflow-y-scroll">
        {chatLog.map((message, index) => (
          <div key={index} className={`mb-7 ${message.sender === "AI" ? "text-left" : "text-right"}`}>
            <p
              className={`inline-block p-3 rounded-lg ${
                message.sender === "AI" ? "bg-[#d89de3] text-black, shadow-[7px_7px_11px_#bebebe,-7px_-7px_11px_#ffffff]" : "bg-[#e6b2ef] text-black rounded-lg shadow-[7px_7px_11px_#bebebe,-7px_-7px_11px_#ffffff]"
              }`}
            >
              <strong>{message.sender}: </strong>
              {message.text}
            </p>
          </div>
        ))}
      </div>
      <div className="w-full h-16 bg-[#e0e0e0] flex items-center px-4">
        <input
          type="text"
          placeholder="Type your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 h-10 px-4 rounded-md shadow-[inset_7px_7px_19px_#bebebe,inset_-7px_-7px_19px_#ffffff]"
        />
        <button
          onClick={getResponse}
          className="ml-4 bg-[#da80ea] text-white px-4 py-2 rounded-lg shadow-[7px_7px_11px_#bebebe,-7px_-7px_11px_#ffffff] hover:bg-purple-400 ease-in-out transition-[600ms]"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AiChat;