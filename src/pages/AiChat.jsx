import axios from "axios";
import React, { useState } from "react";

const AiChat = () => {
  const API_KEY = import.meta.env.VITE_API_KEY2;
  const [question, setQuestion] = useState("");
  const [chatLog, setChatLog] = useState([]);

  async function getResponse() {
    if (!question.trim()) return;

    // Add user's message to the chat log immediately
    setChatLog((prevChat) => [
      ...prevChat,
      { sender: "You", text: question },
    ]);

    // Clear the input field
    setQuestion("");

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

      // Add AI's response to the chat log
      setChatLog((prevChat) => [
        ...prevChat,
        { sender: "Pet Connect", text: aiResponse },
      ]);
    } catch (error) {
      setChatLog((prevChat) => [
        ...prevChat,
        { sender: "Pet Connect", text: "Sorry, something went wrong! Please again later." },
      ]);
    }
  }

  return (
    <div className="w-full overflow-hidden h-screen flex flex-col bg-base-100">
      <div className="flex-1 max-sm:mb-16 p-4 overflow-y-scroll">
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
                  ? "bg-primary text-base-100 shadow-lg animate-postAnim3"
                  : "bg-secondary text-base-100 shadow-lg animate-postAnim3"
              }`}
            >
              <strong>{message.sender}: </strong>
              {message.text}
            </p>
          </div>
        ))}
      </div>
      <div className="max-sm:w-full h-16 bg-base-100 max-sm:bg-transparent mb-10 max-sm:mb-2 flex justify-center items-center px-4 max-sm:px-0 fixed z-10 max-sm:bottom-20 max-sm:left-1 w-[80%] left-[200px] bottom-2">
        <input
          type="text"
          placeholder="Type your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 h-14 px-1 max-sm:px-4 rounded-md shadow-inner bg-base-200"
        />
        <button
          onClick={getResponse}
          className="text-lg p-3 m-2 h-14 flex justify-center items-center rounded-md bg-primary text-base-100 shadow-lg hover:bg-base-100 hover:text-primary ease-in-out duration-700 "
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AiChat;
