import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Add useNavigate
import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDoc,
  doc,
} from "firebase/firestore";
import { IoArrowBack } from "react-icons/io5"; // Import back arrow icon
import { useUser } from "@clerk/clerk-react";

const Chat = () => {
  const { user } = useUser();
  const { userId } = useParams();
  const navigate = useNavigate(); // Add navigation
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipientHandle, setRecipientHandle] = useState("");
  const [recipientPfp, setReceipientPfp] = useState("");
  const messagesEndRef = useRef(null); // Add ref for auto-scroll

  // Add scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Effect for auto-scrolling
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch recipient's handle
  useEffect(() => {
    const fetchRecipientHandle = async () => {
      if (!userId) return;
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setRecipientHandle(userDoc.data().handle);
          setReceipientPfp(userDoc.data().profilePic);
        }
      } catch (error) {
        console.error("Error fetching recipient details:", error);
      }
    };
    fetchRecipientHandle();
  }, [userId]);

  // Listen to messages - Updated query ordering
  useEffect(() => {
    if (!user || !userId) return;

    const chatQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.id),
      orderBy("timestamp", "asc") // Changed to "asc" for correct chronological order
    );

    const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      const messageData = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (msg) =>
            msg.participants.includes(userId) &&
            msg.participants.includes(user.id)
        );
      setMessages(messageData);
    });

    return () => unsubscribe();
  }, [userId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user.id || !userId) return;
  
    try {
      // Fetch the current user's document
      const userRef = doc(db, "users", user.id);
      const userDoc = await getDoc(userRef);
  
      // Ensure senderHandle has a fallback value
      const senderHandle =
        userDoc.exists() && userDoc.data().name
          ? userDoc.data().name
          : userDoc.exists() && userDoc.data().email
          ? userDoc.data().email
          : "Unknown User";
  
      // Add the message to the "chats" collection
      await addDoc(collection(db, "chats"), {
        text: newMessage,
        senderId: user.id,
        senderHandle, // Use the fallback value if name or email is missing
        recipientId: userId,
        recipientHandle,
        participants: [user.id, userId],
        timestamp: serverTimestamp(),
      });
  
      setNewMessage(""); // Clear the input field after sending the message
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleBack = () => {
    navigate("/in/messages");
  };

  const handleProfileClick = () => {
    navigate(`/in/profile/${userId}`); // Navigate to the recipient's profile
  }

  return (
    <div className="flex flex-col h-screen bg-base-100 max-lg:h-[100dvh]">
      {/* Header */}
      <div className="bg-primary text-base-100 p-4 flex items-center gap-3 sticky top-0 z-10 shadow-md">
        <button
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-primary-focus transition-colors"
        >
          <IoArrowBack className="w-6 h-6" />
        </button>
        <div onClick={handleProfileClick} className="flex items-center gap-3 cursor-pointer">
          <div className="aspect-square w-[50px] h-[50px] max-sm:w-[40px] max-sm:h-[40px] overflow-hidden rounded-xl"><img src={recipientPfp} alt="Profile" className="w-full h-full rounded-xl object-cover cursor-pointer"/></div>
          <h2 className="text-xl font-semibold truncate">
            Chat with {recipientHandle || "User"}
          </h2>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 pb-32 max-lg:pb-40">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.senderId === user?.id
                ? "flex justify-end"
                : "flex justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] p-3 rounded-lg ${
                message.senderId === user?.id
                  ? "bg-primary text-base-100"
                  : "bg-base-200"
              }`}
            >
              <p>{message.text}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp?.toDate().toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Adjusted for desktop, tablet, and mobile */}
      <form
        onSubmit={sendMessage}
        className="p-4 border-t border-base-200 bg-base-100 fixed bottom-0 max-lg:bottom-20 left-0 right-0 ml-[14%] max-lg:ml-0"
      >
        <div className="flex gap-2 w-full justify-between items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-3 rounded-full bg-base-200 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="px-6 py-3 bg-primary btn text-base-100 rounded-full hover:bg-primary-focus transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!newMessage.trim()}
          >
            {"Send"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
