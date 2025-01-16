import axios from "axios";
import React, { useState } from "react";

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
        response?.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response";

      setChatLog((prevChat) => [
        ...prevChat,
        { sender: "You", text: question },
        { sender: "Pet Connect", text: aiResponse },
      ]);
      setQuestion("");
    } catch (error) {
      console.error("Error fetching response:", error);
    }
  }

  return (
    <div className="w-full overflow-hidden h-screen flex flex-col bg-base-100">
      <div className="flex-1 mr-4 p-4 overflow-y-scroll">
        {chatLog.map((message, index) => (
          <div
            key={index}
            className={`mb-7 ${
              message.sender === "Pet Connect" ? "text-left" : "text-right"
            }`}
          >
            <p
              className={`inline-block p-3 rounded-lg ${
                message.sender === "Pet Connect"
                  ? "bg-primary text-base-100 shadow-lg"
                  : "bg-secondary text-base-100 shadow-lg"
              }`}
            >
              <strong>{message.sender}: </strong>
              {message.text}
            </p>
          </div>
        ))}
      </div>
      <div className="sm:w-full h-16 bg-base-100 flex items-center px-4">
        <input
          type="text"
          placeholder="Type your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 h-14 px-1 sm:px-4 mb-16 rounded-md shadow-inner bg-base-200"
        />
        <button
          onClick={getResponse}
          className="text-lg p-4 m-[7px] flex mb-16 justify-center items-center rounded-xl bg-primary-focus text-primary  hover:bg-primary hover:text-base-100 border-4 ease-in-out duration-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AiChat;
