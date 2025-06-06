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
  setDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import pfp from "../icons/pfp.png";
import { useUser } from "@clerk/clerk-react";
import { FaUserDoctor } from "react-icons/fa6";
import { useTour } from "../context/TourContext";
import { LuMessageCircleQuestion } from "react-icons/lu";
import AOS from "aos";

const ChatList = () => {
  const [contentLoaded, setContentLoaded] = useState(false);
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();
  const { user } = useUser();
  const { startTour, hasTourBeenCompleted } = useTour();

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      startEvent: "DOMContentLoaded",
      offset: 120,
    });

    // Cleanup function
    return () => {
      // Clean up any AOS-related resources
      AOS.refresh();
    };
  }, []);

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
      if (snapshot.empty) {
        console.log("No chat data exists for this user");
        setContentLoaded(true);
        setChats([]);
        return;
      }

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

  // Check if it's the user's first time viewing messages
  useEffect(() => {
    const checkFirstTimeMessaging = async () => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.id);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();

            // If the user has never used messaging and hasn't completed the messaging tour
            if (
              (userData.hasUsedMessaging === undefined ||
                userData.hasUsedMessaging === false) &&
              !hasTourBeenCompleted("messaging")
            ) {
              startTour("messaging");

              // Update the user document to indicate they've used messaging
              await setDoc(
                userRef,
                { ...userData, hasUsedMessaging: true },
                { merge: true }
              );
            }
          }
        } catch (error) {
          console.error("Error checking first-time messaging:", error);
        }
      }
    };

    checkFirstTimeMessaging();
  }, [user, hasTourBeenCompleted, startTour]);

  const navigateToChat = (userId) => {
    navigate(`/in/chat/${userId}`);
  };

  return (
    <div className="messages-container messages">
      {!contentLoaded ? (
        <div className="p-6 min-h-screen items-start">
          {/* Header Skeleton */}
          <h2 className="text-2xl font-bold mb-6">Messages</h2>

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
        <>
          {contentLoaded && chats.length === 0 && (
            <div className="p-6 min-h-screen items-start">
              <h2 className="text-2xl font-bold mb-6">Messages</h2>
              <div className="flex flex-col items-start p-4 justify-start min-h-screen gap-8">
                <LuMessageCircleQuestion
                  className="text-base-content/70"
                  size={100}
                  data-aos="fade-up"
                />
                <p
                  className="text-center text-primary text-2xl"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  {"Looks a bit empty here"}
                </p>
                <p data-aos="fade-up" data-aos-delay="300">
                  {
                    "You can start conversation with anyone you want! Just go to their profile and start a conversation!"
                  }
                </p>
                <button
                  className="btn btn-primary button"
                  onClick={() => navigate("/in/home")}
                  data-aos="fade-up"
                  data-aos-delay="600"
                >
                  {"Go to Home and Start a Conversation"}
                </button>
              </div>
            </div>
          )}
          {chats.length > 0 && (
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
                          {chat.receipientVerified && (
                            <span className="text-primary text-xl size-3 text-center">
                              <FaUserDoctor className="text-base-200 bg-primary p-1 rounded-full" />
                            </span>
                          )}
                        </div>
                        <p className="text-sm opacity-75 truncate w-4/5">
                          {chat.lastMessage}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm opacity-60">
                      {chat.timestamp?.toDate().toLocaleTimeString() ||
                        "No timestamp"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatList;
