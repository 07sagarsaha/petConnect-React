import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import pfp from "../icons/pfp.png"

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

    const unsubscribe = onSnapshot(chatQuery, async (snapshot) => {
      const chatData = await Promise.all(
        snapshot.docs.map(async (docs) => {
          const data = docs.data();
          const otherParticipantId = data.participants.find(
            (id) => id !== auth.currentUser.uid
          );

          // Debugging: Log otherParticipantId
          console.log("Other Participant ID:", otherParticipantId);

          // Skip if otherParticipantId is undefined
          if (!otherParticipantId) {
            console.warn("Skipping chat due to missing otherParticipantId");
            return null;
          }

          const isCurrentUserSender = data.senderId === auth.currentUser.uid;
  
          // Fetch the other participant's user document
          const userDocRef = doc(db, "users", otherParticipantId);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.exists() ? userDoc.data() : {};
  
          return {
            id: docs.id,
            lastMessage: data.text,
            timestamp: data.timestamp,
            otherParticipantId,
            otherParticipantHandle: userData.handle || "Unknown", // Add handle
            otherParticipantPfp: userData.profilePic || pfp, // Add PFP link
          };
        })
      );

      // Filter out null values
      const filteredChatData = chatData.filter((chat) => chat !== null);

      // Group by participant and get only the latest message
      const uniqueChats = filteredChatData.reduce((acc, curr) => {
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
            className="p-4 bg-base-200 rounded-lg cursor-pointer hover:bg-base-300 transition-colors flex-row flex animate-postAnim1"
          >
            <div className="flex justify-start gap-3 items-center flex-row">
              <div className="aspect-square w-1/6 h-1/6 max-sm:h-full overflow-hidden rounded-xl"><img src={chat.otherParticipantPfp} alt="Profile" className="w-full h-full rounded-xl object-cover cursor-pointer"/></div>
              <div className="flex flex-col">
                <h3 className="font-semibold">{"@"+chat.otherParticipantHandle}</h3>
                <p className="text-sm opacity-75 truncate">{chat.lastMessage}</p>
              </div>
            </div>
            <span className="text-sm opacity-60 self-end text-right">
                  {chat.timestamp?.toDate().toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
