import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
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
import pfp from "../icons/pfp.png";
import { useUser } from "@clerk/clerk-react";
import { FaUserDoctor } from "react-icons/fa6";

const ChatList = () => {
  const [contentLoaded, setContentLoaded] = useState(false);
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      console.warn("User is not logged in.");
      return;
    }

    setContentLoaded(false);

    const chatQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.id),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(chatQuery, async (snapshot) => {
      const chatData = await Promise.all(
        snapshot.docs.map(async (docs) => {
          const data = docs.data();
          const otherParticipantId = data.participants.find(
            (id) => id !== user.id
          );

          // Skip if otherParticipantId is undefined
          if (!otherParticipantId) {
            console.warn("Skipping chat due to missing otherParticipantId");
            return null;
          }

          const isCurrentUserSender = data.senderId === user.id;

          // Fetch the other participant's user document
          const userDocRef = doc(db, "users", otherParticipantId);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.exists() ? userDoc.data() : {};
          setContentLoaded(true);

          return {
            id: docs.id,
            lastMessage: data.text,
            timestamp: data.timestamp,
            otherParticipantId,
            otherParticipantHandle: userData.handle || "Unknown", // Add handle
            otherParticipantPfp: userData.profilePic || pfp, // Add PFP link
            receipientVerified: userData.isVetVerified || false, // Add verification status
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
  }, [user]);

  const navigateToChat = (userId) => {
    navigate(`/in/chat/${userId}`);
  };

  return (
    <>
    {!contentLoaded ? (
      <div className="p-6 min-h-screen items-start">
      {/* Header Skeleton */}
      <div className="h-8 w-32 bg-base-300 rounded animate-pulse mb-6" />
      
      {/* Chat List Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="p-4 bg-base-100 rounded-lg flex justify-between animate-pulse"
          >
            {/* Left side with profile pic and message */}
            <div className="flex justify-start gap-3 items-center flex-row w-3/4">
              {/* Profile Picture Skeleton */}
              <div className="w-[75px] h-[75px] max-sm:h-[50px] max-sm:w-[50px] bg-base-300 rounded-xl" />
              
              {/* Chat Info Skeleton */}
              <div className="flex flex-col w-3/4">
                <div className="flex flex-row gap-2 mb-2">
                  <div className="h-5 w-32 bg-base-300 rounded" />
                </div>
                <div className="h-4 w-4/5 bg-base-300 rounded" />
              </div>
            </div>
  
            {/* Timestamp Skeleton */}
            <div className="h-4 w-16 bg-base-300 rounded" />
          </div>
        ))}
      </div>
    </div>
    ) : (
    <div className="p-6 min-h-screen items-start">
      <h2 className="text-2xl font-bold mb-6">Messages</h2>
      <div className="space-y-4">
        {chats.map((chat) => (
          <div
            key={chat.otherParticipantId}
            onClick={() => navigateToChat(chat.otherParticipantId)}
            className="p-4 bg-base-100 rounded-lg cursor-pointer hover:bg-base-300 transition-colors flex-row flex justify-between"
          >
            <div className="flex justify-start gap-3 items-center flex-row w-3/4">
              <div className="aspect-square w-[75px] h-[75px] max-sm:h-[50px] max-sm:w-[50px] overflow-hidden rounded-xl">
                <img
                  src={chat.otherParticipantPfp}
                  alt="Profile"
                  className="w-full h-full rounded-xl object-cover cursor-pointer"
                />
              </div>
              <div className="flex flex-col w-3/4"> 
                <div className="flex flex-row gap-2">
                  <h3 className="font-semibold">
                    {"@" + chat.otherParticipantHandle}
                  </h3>
                  {chat.receipientVerified && <span className="text-primary text-xl size-3 text-center">
                    <FaUserDoctor className="text-base-200 bg-primary p-1 rounded-full"/>
                  </span>}
                </div>
                <p className="text-sm opacity-75 truncate w-4/5">{chat.lastMessage}</p>
              </div>
            </div>
            <span className="text-sm opacity-60">
              {chat.timestamp?.toDate().toLocaleTimeString() || "No timestamp"}
            </span>
          </div>
        ))}
      </div>
    </div>
    )}
    </>
  );
};

export default ChatList;