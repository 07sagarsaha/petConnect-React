import React, { useState, useEffect } from "react";
import axios from "axios";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsClockHistory } from "react-icons/bs";
import ReactMarkdown from "react-markdown";
import { useUser } from "@clerk/clerk-react";
import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDocs,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { MdDelete } from "react-icons/md";
import { IoClose } from "react-icons/io5";

const AiChat = () => {
  const { user } = useUser();
  const [question, setQuestion] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

  // Load conversations list
  const fetchConversations = async () => {
    if (!user) return;

    const chatRef = collection(db, "aiChatHistory", user.id, "conversations");
    const q = query(chatRef, orderBy("timestamp", "desc"));

    // Set up a real-time listener for conversations
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const conversationIds = [
        ...new Set(snapshot.docs.map((doc) => doc.data().conversationId)),
      ];

      const conversationsList = await Promise.all(
        conversationIds.map(async (id) => {
          const msgs = snapshot.docs
            .filter((doc) => doc.data().conversationId === id)
            .sort((a, b) => b.data().timestamp - a.data().timestamp);

          // Get the first user message as the title/preview
          const userMessage = msgs.find((doc) => doc.data().sender === "You");
          const preview = userMessage
            ? userMessage.data().text.substring(0, 50)
            : "New Conversation";

          return {
            id,
            timestamp: msgs[0].data().timestamp,
            preview: preview + (preview.length >= 50 ? "..." : ""),
          };
        })
      );

      setConversations(conversationsList);
    });

    return unsubscribe;
  };

  useEffect(() => {
    if (!user) return;

    const unsubscribe = fetchConversations();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe.then((unsub) => unsub());
      }
    };
  }, [user]);

  // Load or start new chat
  const loadChat = async (existingConversationId = null) => {
    if (!user) return;

    const newConversationId = existingConversationId || Date.now().toString();
    setConversationId(newConversationId);

    const chatRef = collection(db, "aiChatHistory", user.id, "conversations");
    const q = query(
      chatRef,
      where("conversationId", "==", newConversationId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => doc.data());
      setChatLog(messages);
    });

    setShowHistory(false);
    setShowOverlay(false); // Add this line to remove the overlay
    return () => unsubscribe();
  };

  useEffect(() => {
    if (!user) return;
    loadChat();
  }, [user]);

  const saveMessageToFirebase = async (message) => {
    if (!user) return;

    await addDoc(collection(db, "aiChatHistory", user.id, "conversations"), {
      ...message,
      timestamp: serverTimestamp(), // Use serverTimestamp for consistency
      conversationId,
    });
  };

  async function getResponse() {
    if (!question.trim() || !user) return;

    const userMessage = { sender: "You", text: question };
    await saveMessageToFirebase(userMessage);

    setQuestion("");
    setIsGenerating(true); // Set generating state to true
    setLoading(true);

    try {
      const response = await axios({
        url: "https://openrouter.ai/api/v1/chat/completions",
        method: "post",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        data: {
          model: "deepseek/deepseek-r1-distill-llama-70b:free", // Faster model
          messages: [
            {
              role: "system",
              content:
                "You are a knowledgeable pet care assistant for Pet Connect, a social media platform for pet owners. Provide helpful, accurate advice about pet care, behavior, and health. Always encourage users to consult veterinarians for medical concerns. Use a friendly, professional tone.",
            },
            ...chatLog.map((msg) => ({
              role: msg.sender === "You" ? "user" : "assistant",
              content: msg.text,
            })),
            { role: "user", content: question },
          ],
        },
      });

      const aiResponse = {
        sender: "Pet Connect",
        text: response.data.choices[0].message.content,
      };

      await saveMessageToFirebase(aiResponse);
    } catch (error) {
      const errorMessage = {
        sender: "Pet Connect",
        text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
      };
      await saveMessageToFirebase(errorMessage);
    } finally {
      setLoading(false);
      setIsGenerating(false); // Set generating state to false
    }
  }

  // First, add a new function to handle conversation deletion
  const deleteConversation = async (conversationId, e) => {
    e.stopPropagation(); // Prevent triggering loadChat when clicking delete button
    if (!user) return;

    try {
      // Get all messages for this conversation
      const chatRef = collection(db, "aiChatHistory", user.id, "conversations");
      const q = query(chatRef, where("conversationId", "==", conversationId));
      const snapshot = await getDocs(q);

      // Delete each message document
      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Update local state
      setConversations((prev) =>
        prev.filter((conv) => conv.id !== conversationId)
      );

      // If the deleted conversation was the current one, reset the chat
      if (conversationId === conversationId) {
        setChatLog([]);
        setConversationId(null);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  // Add a function to start a new conversation
  const startNewConversation = () => {
    loadChat();
    setShowHistory(false);
    setShowOverlay(false); // Add this line to remove the overlay
  };

  return (
    <div className="w-full h-screen flex flex-col bg-base-100 relative overflow-hidden">
      {/* Floating History/Close Button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => {
            setShowHistory(!showHistory);
            setShowOverlay(!showOverlay);
          }}
          className="p-2 rounded-full bg-primary text-base-100 shadow-lg hover:scale-105 transition-all duration-300 ease-in-out"
        >
          {showHistory ? <IoClose size={24} /> : <BsClockHistory size={24} />}
        </button>
      </div>

      {/* Dark Overlay */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300" />
      )}

      {/* Conversation History Sidebar */}
      <div
        className={`fixed right-0 top-0 w-72 bg-base-200 h-screen p-4 overflow-y-auto shadow-lg z-40 transition-transform duration-300 ease-in-out ${
          showHistory ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mt-16">
          {" "}
          {/* Add padding for the floating button */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Conversation History</h3>
            <button
              onClick={startNewConversation}
              className="btn btn-sm btn-primary"
            >
              New Chat
            </button>
          </div>
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="p-3 mb-2 bg-base-100 rounded-lg cursor-pointer hover:bg-primary hover:text-base-100 relative group"
              >
                <div onClick={() => loadChat(conv.id)}>
                  <p className="text-sm font-medium">{conv.preview}</p>
                  <p className="text-xs mt-1">
                    {new Date(conv.timestamp?.toDate()).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => deleteConversation(conv.id, e)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-error text-base-100 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MdDelete size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          showHistory ? "filter blur-sm" : ""
        }`}
      >
        {/* Chat Messages Container */}
        <div className="flex-1 relative">
          <div className="absolute inset-x-0 top-16 bottom-24 max-lg:top-12 max-lg:bottom-32 mx-4 rounded-xl bg-base-200 overflow-y-auto">
            <div className="p-4">
              {chatLog.map((message, index) => (
                <div
                  key={index}
                  className={`mb-7 ${
                    message.sender === "Pet Connect"
                      ? "text-left"
                      : "text-right"
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
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex items-center space-x-2 mb-7">
                  <div className="bg-primary text-base-100 p-4 rounded-lg shadow-lg animate-pulse flex items-center">
                    <div className="flex items-center gap-2">
                      <AiOutlineLoading3Quarters className="animate-spin" />
                      <span>Pet Connect is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="absolute left-1/2 bottom-32 -translate-x-1/2">
            <AiOutlineLoading3Quarters className="animate-spin w-6 h-6" />
          </div>
        )}

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            getResponse();
          }}
          className="absolute bottom-0 max-lg:bottom-20 left-0 right-0 ml-[14%] max-lg:ml-0 p-4 bg-base-100 border-t border-base-200"
        >
          <div className="flex gap-2 w-full justify-between items-center">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask me anything about pets..."
              className="flex-1 p-3 rounded-full bg-base-200 focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isGenerating}
            />
            <button
              type="submit"
              disabled={!question.trim() || isGenerating}
              className="px-6 py-3 btn bg-primary text-base-100 rounded-full hover:bg-primary-focus transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <AiOutlineLoading3Quarters className="animate-spin" />
                  <span>Generating...</span>
                </div>
              ) : (
                "Send"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AiChat;
