import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;

    const chatQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", auth.currentUser.uid),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      const chatData = snapshot.docs.map((doc) => {
        const data = doc.data();
        const otherParticipantId = data.participants.find(
          (id) => id !== auth.currentUser.uid
        );
        const isCurrentUserSender = data.senderId === auth.currentUser.uid;

        return {
          id: doc.id,
          lastMessage: data.text,
          timestamp: data.timestamp,
          otherParticipantId,
          otherParticipantHandle: isCurrentUserSender
            ? data.recipientHandle
            : data.senderHandle,
        };
      });

      // Group by participant and get only the latest message
      const uniqueChats = chatData.reduce((acc, curr) => {
        if (
          !acc[curr.otherParticipantId] ||
          acc[curr.otherParticipantId].timestamp < curr.timestamp
        ) {
          acc[curr.otherParticipantId] = curr;
        }
        return acc;
      }, {});

      setChats(Object.values(uniqueChats));
    });

    return () => unsubscribe();
  }, []);

  const navigateToChat = (userId) => {
    navigate(`/in/chat/${userId}`);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Messages</h2>
      <div className="space-y-4">
        {chats.map((chat) => (
          <div
            key={chat.otherParticipantId}
            onClick={() => navigateToChat(chat.otherParticipantId)}
            className="p-4 bg-base-200 rounded-lg cursor-pointer hover:bg-base-300 transition-colors"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{chat.otherParticipantHandle}</h3>
              <span className="text-sm opacity-60">
                {chat.timestamp?.toDate().toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm opacity-75 truncate">{chat.lastMessage}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
