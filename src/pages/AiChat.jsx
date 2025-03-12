import React, { useState } from "react";
import axios from "axios";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import ReactMarkdown from "react-markdown";
const AiChat = () => {
  const API_KEY = import.meta.env.VITE_API_KEY2;
  const [question, setQuestion] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(false); // New loading state

  // const formatResponse = (text) => {
  //   // Split the response into lines
  //   const lines = text.split("\n");

  //   // Create an array to hold formatted JSX elements
  //   const formattedElements = [];

  //   lines.forEach((line) => {
  //     if (line.startsWith("## ")) {
  //       // Convert to a heading
  //       formattedElements.push(<h2 key={line}>{line.slice(3)}</h2>);
  //     } else if (line.startsWith("**")) {
  //       // Convert to a subheading
  //       formattedElements.push(<h3 key={line}>{line.slice(2, -2)}</h3>);
  //     } else if (line.startsWith("* ")) {
  //       // Convert to a list item
  //       formattedElements.push(<li key={line}>{line.slice(2)}</li>);
  //     } else {
  //       // Convert to a paragraph
  //       formattedElements.push(<p key={line}>{line}</p>);
  //     }
  //   });

  //   return formattedElements;
  // };

  async function getResponse() {
    if (!question.trim()) return;

    setChatLog((prevChat) => [...prevChat, { sender: "You", text: question }]);

    setQuestion("");
    setLoading(true); // Set loading to true when fetching starts

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

      // Format the AI response
      // const formattedResponse = formatResponse(aiResponse);

      setChatLog((prevChat) => [
        ...prevChat,
        { sender: "Pet Connect", text: aiResponse },
      ]);
    } catch (error) {
      setChatLog((prevChat) => [
        ...prevChat,
        {
          sender: "Pet Connect",
          text: "Sorry but something went wrong, please try again later!",
        },
      ]);
    } finally {
      setLoading(false); // Set loading to false when fetching ends
    }
  }

  return (
    <div className="w-full overflow-hidden h-screen flex flex-col bg-base-100">
      {/* Chat Messages Container */}
      <div className="flex-1 mx-4 p-4 overflow-y-auto max-lg:mb-40 max-lg:mt-4 mb-36 rounded-xl bg-base-200">
        {chatLog.map((message, index) => (
          <div
            key={index}
            className={`mb-7 ${
              message.sender === "Pet Connect" ? "text-left" : "text-right"
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                message.sender === "Pet Connect"
                  ? "bg-primary text-base-100 shadow-lg animate-postAnim3"
                  : "bg-secondary text-base-100 shadow-lg animate-postAnim3"
              }`}
            >
              <strong>{message.sender}: </strong>
              {Array.isArray(message.text) ? (
                <div>{message.text}</div>
              ) : (
                <ReactMarkdown>{message.text}</ReactMarkdown>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center">
          <AiOutlineLoading3Quarters className="animate-spin w-6 h-6" />
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          getResponse();
        }}
        className="fixed bottom-0 max-lg:bottom-20 left-0 right-0 ml-[200px] max-lg:ml-0 p-4 bg-base-100 border-t border-base-200"
      >
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask me anything about pets..."
            className="flex-1 p-3 rounded-full bg-base-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="px-6 py-3 bg-primary text-base-100 rounded-full hover:bg-primary-focus transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default AiChat;
