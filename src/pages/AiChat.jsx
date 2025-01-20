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
    <div className="w-full overflow-hidden h-screen  flex flex-col bg-base-100">
      <div className="flex-1 mx-4 p-4 overflow-y-scroll max-sm:mb-40 max-sm:mt-10 mb-36 rounded-xl bg-base-200">
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
                <ReactMarkdown allowElement={() => true}>
                  {message.text}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
      </div>
      {loading && (
        <AiOutlineLoading3Quarters className="animate-spin self-center" />
      )}
      <div className="max-sm:w-full h-16 bg-base-100 max-sm:bg-transparent mb-16 max-sm:mb-2 flex justify-center items-center px-4 max-sm:px-0 fixed z-10 max-sm:bottom-20 max-sm:left-1 w-[80%] left-[200px] bottom-2">
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
