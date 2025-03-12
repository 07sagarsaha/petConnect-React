import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
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

const Chat = () => {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipientHandle, setRecipientHandle] = useState("");

  // Fetch recipient's handle
  useEffect(() => {
    const fetchRecipientHandle = async () => {
      if (!userId) return;
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setRecipientHandle(userDoc.data().handle);
        }
      } catch (error) {
        console.error("Error fetching recipient details:", error);
      }
    };
    fetchRecipientHandle();
  }, [userId]);

  // Listen to messages
  useEffect(() => {
    if (!auth.currentUser || !userId) return;

    const chatQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", auth.currentUser.uid),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      const messageData = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (msg) =>
            msg.participants.includes(userId) &&
            msg.participants.includes(auth.currentUser.uid)
        );
      setMessages(messageData);
    });

    return () => unsubscribe();
  }, [userId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser || !userId) return;

    try {
      await addDoc(collection(db, "chats"), {
        text: newMessage,
        senderId: auth.currentUser.uid,
        senderHandle: auth.currentUser.displayName || auth.currentUser.email,
        recipientId: userId,
        recipientHandle,
        participants: [auth.currentUser.uid, userId],
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-base-100">
      {/* Header */}
      <div className="bg-primary text-base-100 p-4">
        <h2 className="text-xl font-semibold">
          Chat with {recipientHandle || "User"}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.senderId === auth.currentUser?.uid
                ? "text-right"
                : "text-left"
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg max-w-[70%] ${
                message.senderId === auth.currentUser?.uid
                  ? "bg-primary text-base-100"
                  : "bg-base-200"
              }`}
            >
              <p className="text-sm opacity-75 mb-1">
                {message.senderId === auth.currentUser?.uid
                  ? "You"
                  : message.senderHandle}
              </p>
              <p className="break-words">{message.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-base-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-2 rounded-md bg-base-200"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-base-100 rounded-md hover:bg-primary-focus transition-colors"
            disabled={!newMessage.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
