import axios from "axios";
import React, { useState } from "react";
import Button from "../context/authContext/button";

const AiChat = () => {
  const API_KEY = import.meta.env.VITE_API_KEY2;
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
    <div className="w-fit sm:w-[85vw] overflow-hidden h-screen flex flex-col bg-[#ebe9e1]">
      <div className="flex-1 p-4 overflow-y-scroll">
        {chatLog.map((message, index) => (
          <div key={index} className={`mb-7 ${message.sender === "AI" ? "text-left" : "text-right"}`}>
            <p
              className={`inline-block p-3 rounded-lg ${
                message.sender === "AI" ? "bg-[#d65368] text-black, shadow-[7px_7px_11px_#bebebe,-7px_-7px_11px_#ffffff]" : "bg-[#ffa2b6] text-black rounded-lg shadow-[7px_7px_11px_#bebebe,-7px_-7px_11px_#ffffff]"
              }`}
            >
              <strong>{message.sender}: </strong>
              {message.text}
            </p>
          </div>
        ))}
      </div>
      <div className="sm:w-full  h-16 bg-[#ebe9e1] flex items-center px-4">
        <input
          type="text"
          placeholder="Type your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 h-14 px-1 sm:px-4 rounded-md shadow-[inset_7px_7px_19px_#c8c6bf,inset_-7px_-7px_19px_#ffffff]"
        />
        <Button
          onClick={getResponse}
          title={"Send"}
        />
      </div>
    </div>
  );
};

export default AiChat;