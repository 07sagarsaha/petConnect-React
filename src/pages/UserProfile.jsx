import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
import { IoMdClose } from "react-icons/io";
import pfp from "../icons/pfp.png";

function UserProfile() {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [pets, setPets] = useState([]);
  const [isPFPClicked, setIsPFPClicked] = useState(false);

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

  return (
    <div className="flex flex-col w-full p-4 bg-base-200 text-primary-focus">
      <div className="flex flex-col justify-center m-3 bg-base-100 rounded-lg shadow-lg sm:p-5 p-2 ">
        <div className="flex flex-col items-center justify-center text-center mb-5">
          {isPFPClicked && userData?.profilePic && (
            <div className="h-full w-full left-0 justify-center items-center flex fixed top-0 z-40 bg-neutral-focus transition-colors duration-200">
              <IoMdClose
                className="text-5xl fixed z-50 p-2 right-5 top-16 rounded-lg hover:text-error transition-all duration-300"
                onClick={handleProfileClick}
              />
              <img
                src={userData.profilePic}
                alt="Image"
                className="h-4/5 max-sm:w-auto w-max m-12 object-contain rounded-2xl animate-postAnim1 max-sm:shadow-transparent"
              />
            </div>
          )}
          <img
            className="w-36 h-36 rounded-full object-cover"
            src={userData?.profilePic || pfp}
            alt="Profile"
            onClick={handleProfileClick}
          />
          <h1 className="text-center text-2xl font-bold mt-4">
            {userData?.name || "loading..."}
          </h1>
          <h2 className="text-center text-xl text-neutral">
            {"@" + userData?.handle || "loading..."}
          </h2>
          <p className="mt-4">{userData?.bio || "Bio is Empty"}</p>
        </div>
        <div className="flex flex-col text-center items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-primary">
              Basic info
            </h2>
            <p className="mb-2">
              <strong>Location:</strong> {userData?.location || "User location"}
            </p>
            <p className="mb-2">
              <strong>Email:</strong> {userData?.email}
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2 text-primary">
              Pet info
            </h2>
            <p className="mb-2">
              <strong>Number of pets:</strong> {pets.length}
            </p>
          </div>
        </div>
        <div className="mb-5">
          <h3 className="text-xl font-semibold mb-2 text-primary">
            Pet Profiles
          </h3>
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="flex justify-between bg-primary text-base-100 shadow-lg m-2 p-4 rounded-lg"
            >
              <div className="flex flex-col gap-2">
                <p>
                  <strong>Name:</strong> {pet.name}
                </p>
                <p>
                  <strong>Age:</strong> {pet.age}
                </p>
                <p>
                  <strong>Breed:</strong> {pet.breed}
                </p>
              </div>
              <img
                className="w-24 h-auto rounded-md"
                src={pet.photoUrl}
                alt="Pet"
              />
            </div>
          ))}
        </div>
      </div>
      <div>
        <h1 className="p-8 text-3xl text-primary">
          Posts by {userData?.name}:
        </h1>
        {posts.length > 0 ? (
          posts.map((post) => (
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
          ))
        ) : (
          <p>No posts found.</p>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
