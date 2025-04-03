import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase";
import {
  doc,
  getDoc,
  query,
  collection,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import Posts from "../components/UI/Posts";
import { format } from "date-fns";
import { IoMdClose, IoMdCloseCircleOutline } from "react-icons/io";
import { IoChatbubbleOutline } from "react-icons/io5";
import pfp from "../icons/pfp.png";
import { useUser } from "@clerk/clerk-react";

function UserProfile() {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [pets, setPets] = useState([]);
  const [isPFPClicked, setIsPFPClicked] = useState(false);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const navigate = useNavigate();

  const { user } = useUser();

  const startChat = () => {
    navigate(`/in/chat/${userId}`);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
          console.log("User data fetched:", userDoc.data()); // Debugging log
        } else {
          console.log("No such user!");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
      console.log("Posts fetched:", postsData); // Debugging log
    });

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    const q = query(collection(db, "pets"), where("ownerId", "==", userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const petsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPets(petsData);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleProfileClick = () => {
    setIsPFPClicked(!isPFPClicked);
  };

  const handleBioExpand = () => {
    setIsBioExpanded(!isBioExpanded);
  }

  return (
    <div className="flex flex-col justify-center p-4 bg-base-200 text-primary-focus min-h-screen">
      <div className="w-4/5 max-sm:w-full self-center bg-base-100 rounded-lg shadow-lg p-6 ">
        <div className="flex flex-col items-start text-center mb-5">
          {isPFPClicked && userData?.profilePic && (
            <div className="h-full w-full left-0 justify-center items-center flex fixed top-0 z-40 transition-colors duration-200">
              <IoMdClose
                className="text-5xl fixed z-50 p-2 right-10 top-16 rounded-lg hover:text-error transition-all duration-300"
                onClick={handleProfileClick}
              />
              <img
                src={userData.profilePic}
                alt="Image"
                className="h-4/5 w-fit m-12 object-contain rounded-2xl animate-postAnim1 fixed z-20"
              />
              <div className="h-full w-full bg-black opacity-50 fixed z-10" onClick={handleProfileClick}/>
            </div>
          )}
          <div className="flex flex-row justify-between w-full gap-5 max-sm:flex-col">
            <div className="flex gap-5 flex-row max-sm:flex-col">
              <img
                className="w-36 h-36 rounded-full object-cover max-sm:self-center"
                src={userData?.profilePic || pfp}
                alt="Profile"
                onClick={handleProfileClick}
              />
              <div className="flex flex-col justify-center self-center -translate-y-2">
                <h1 className="text-start max-sm:text-center text-2xl font-bold mt-4">
                  {userData?.name || "loading..."}
                </h1>
                <h2 className="text-start max-sm:text-center text-xl text-primary-focus">
                  {"@" + userData?.handle || "loading..."}
                </h2>
              </div>
            </div>
            {(user.id === userId) && navigate(`/in/profile`)}
            <div className="flex self-center gap-3">
              <button
                onClick={startChat}
                className="text-lg p-3 m-2 rounded-2xl bg-primary text-base-100 shadow-lg hover:bg-base-100 hover:text-primary ease-in-out duration-700 flex items-center justify-center gap-2"
              >
                <IoChatbubbleOutline className="text-2xl" />
                {"Start Chat"}
              </button>
            </div>
          </div>
          
          <div className={`flex flex-col gap-5 justify-start items-start w-full p-5 rounded-xl bg-base-200 mt-8 ${isBioExpanded ? `hover:bg-base-200` : `hover:bg-base-300`} transition-all mb-5`} onClick={handleBioExpand}>
            <p className="self-start w-full flex items-start">{userData?.bio || "Bio is Empty"}</p>
            {isBioExpanded && 
            <div className="flex flex-col text-start items-start justify-between w-full">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-primary">
                  {"Basic info"}
                </h2>
                <p className="mb-2">
                  <strong>{"Location:"}</strong> {userData?.location || "No Location Added"}
                </p>
                <p className="mb-2 max-sm:text-sm">
                  <strong>{"Email:"}</strong> {userData?.email}
                </p>
              </div>
            </div>}
            <p className="self-start">{"Show "}{isBioExpanded ? "Less" : 'More'}{"..."}</p>
          </div>
        <div className="mb-5 w-full bg-base-200 p-5 rounded-xl">
            <div className="flex flex-row justify-between">
              <h3 className="text-2xl font-bold mb-2 text-primary self-center">
                {"Pets: "}{pets.length}
              </h3>
            </div>
          <div className="flex flex-col w-full">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="flex flex-row max-sm:flex-col gap-2 items-center justify-between bg-primary mt-2 p-4 rounded-lg bg-opacity-30"
              >
              <div className="flex flex-row gap-2 max-sm:flex-col">
                <img
                  className="w-24 h-auto rounded-md object-cover max-sm:w-full"
                  src={pet.photoUrl}
                  alt="Pet"
                />
                <div className="flex flex-col items-start justify-center text-neutral gap-2">
                  <p>
                    <strong>{"Name:"}</strong> {pet.name}
                  </p>
                  <p>
                    <strong>{"Age:"}</strong> {pet.age}
                  </p>
                  <p>
                    <strong>{"Breed:"}</strong> {pet.breed}
                  </p>
                </div>
              </div>
            </div>
            ))}
          </div>
          </div>
          </div>
        </div>
        <div className="w-4/5 max-sm:w-full self-center">
        <div>
          {(posts.length === 0) ? <h1 className="py-8 text-3xl text-primary">{`No post from ${userData?.name} yet!`}</h1> : <h1 className="py-8 text-3xl text-primary">{"Posts by "+userData?.name}</h1>}
        </div>
        <div className="flex flex-col items-center w-full">
          {posts.map((post) => (
            <Posts
              key={post.id}
              id={post.id}
              handle={post.handle}
              title={post.title}
              content={post.content}
              sevVal={post.sevVal}
              profilePic={userData?.profilePic || null}
              imageUrl={post.imageUrl}
              date={
                post.createdAt
                  ? format(post.createdAt.toDate(), "PPP")
                  : "No date"
              }
              likes={post.likes || []}
              dislikes={post.dislikes || []}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
