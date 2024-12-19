import React, { useEffect, useState } from "react";
import Button from "../context/authContext/button";
import { auth, db } from "../firebase/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import Posts from "../components/UI/Posts";
import { format } from "date-fns";
import { IoMdClose } from "react-icons/io";
import ProfileEdit from "../components/ProfileEdit";

function Profile() {
  const [profile, setProfile] = useState();
  const [bg, setBG] = useState("/src/Assets/background.jpg");
  const [userData, setUserData] = useState();
  const [post, setPost] = useState([]);
  const [profilePic, setProfilePic] = useState("/src/icons/pfp.png");
  const [isPFPClicked, setIsPFPClicked] = useState(false);
  const [isProfileEdit, setisProfileEdit] = useState(false);

  const handleProfileUpdate = () => {
    setisProfileEdit(!isProfileEdit);
    /*const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Pet-connect");

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dagtbrme6/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();

      if (data.secure_url) {
        setProfilePic(data.secure_url);

        // Update user profile in Firestore
        if (user) {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            profilePic: data.secure_url,
          });
        }
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }*/
  };

  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    // Create real-time listener
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const postData = await Promise.all(
        snapshot.docs.map(async (postDoc) => {
          const postData = postDoc.data();
          return {
            id: postDoc.id,
            ...postData,
          };
        })
      );
      setPost(postData);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const user = auth.currentUser;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserData(userData);
            setProfilePic(userData.profilePic || "/src/icons/pfp.png");
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchUser();
  }, []);

  const bgPicChange = (e) => {
    const bgfile = e.target.files[0];
    if (bgfile) {
      setBG(URL.createObjectURL(bgfile)); // Use setBG here to update background
    }
  };

  const handleProfileChange = () => {
    setProfile(!profile);
  };

  const handleProfileClick = () => {
    setIsPFPClicked(!isPFPClicked);
  }

  return (
    <>
      <div className="sm:m-3 m-1 bg-[#ebe9e1] rounded-lg shadow-[6px_6px_16px_#c8c6bf,-6px_-6px_16px_#ebe9e1] sm:p-5 p-2 z-10">
        <div className="flex flex-col items-center justify-center text-center mb-[19px]">
          <div className="relative object-cover w-full h-[200px] mb-[20px]">
            <img
              src={bg}
              className="w-full rounded-lg h-full object-cover"
              alt="Background"
            />
            <div className="absolute top-2 right-2">
              <label
                className="text-lg p-3 m-[10px] flex justify-center items-center rounded-2xl bg-[#e43d12] text-white  border-4 ease-in-out duration-700"
                htmlFor="bgUpload" // Updated to refer to bgUpload
              >
                <input
                  type="file"
                  id="bgUpload" // Changed ID to bgUpload
                  className="hidden"
                  onChange={bgPicChange}
                />
                +
              </label>
            </div>
          </div>
          {(isPFPClicked && profilePic) && <>
                      <div className="h-full w-full left-0 justify-center items-center flex fixed top-0 z-40 bg-[#4f4f4fcd] transition-colors duration-200">
                        <IoMdClose
                            className="text-5xl fixed z-50 p-2 right-[5%] top-16 rounded-lg hover:text-red-600 transition-all duration-300"
                            onClick={handleProfileClick}
                        />
                        <img src={profilePic} alt="Image" className="h-4/5 max-sm:w-auto w-max m-12 object-contain rounded-2xl animate-postAnim1 max-sm:shadow-transparent"/>
                      </div>
          </>}
          <img
            className="w-[150px] h-[150px] rounded-full object-cover"
            src={profilePic}
            alt="Profile"
            onClick={handleProfileClick}
          />
          <h1 className="text-center">{userData?.name || "loading..."}</h1>
          <h1 className="text-center">
            {"@" + userData?.handle || "loading..."}
          </h1>

          <div className="flex justify-center mt-4">
              <button
                id="profilePicUpload"
                className="text-lg p-3 m-[10px] flex justify-center border-4 items-center rounded-2xl bg-[#e43d12] text-white shadow-[6px_6px_11px_#c8c6bf,-6px_-6px_11px_#ffffff] hover:bg-[#e0e0e0] hover:text-[#e43d12] ease-in-out duration-700"
                onClick={handleProfileUpdate}
              >
              Edit Your Profile
              </button>
          </div>

          {isProfileEdit && 
            <>
              <IoMdClose
                className="text-5xl fixed z-50 p-2 right-[25%] top-24 max-sm:right-16 max-sm:top-[25%] rounded-lg hover:text-red-600 transition-all duration-300"
                onClick={handleProfileUpdate}
              />
              <ProfileEdit image = {profilePic} name={userData?.name} handle={userData?.handle} bio={userData?.bio || "Write something about you..."}/>
            </>}

          <p>{userData?.bio || "Bio is Empty"}</p>
        </div>
        <div className="flex flex-col sm:flex-row text-center items-center justify-between mb-[20px]">
          <div>
            <h2>Basic info</h2>
            <p className="mb-[10px]">
              <strong>Location:</strong> "User location"
            </p>
            <p className="mb-[10px]">
              <strong>Email:</strong> {userData?.email}
            </p>
          </div>
          <div>
            <h2>Pet info</h2>
            <p className="mb-[10px]">
              <strong>Number of pets:</strong> "2"
            </p>
            <p className="mb-[10px]">
              <strong>Pets registered with vets:</strong> "Yes"
            </p>
          </div>
        </div>
        <div className="flex justify-center align-middle">
          <Button title="Edit Pet profile" />
        </div>
        <div className="mb-[20px]">
          <h3>Pet Profiles</h3>
          <div className="flex justify-between bg-[#e43d12] text-white shadow-[6px_6px_11px_#c8c6bf,-6px_-6px_11px_#ffffff] m-2 p-[10px] rounded-lg">
            <div className="flex flex-col gap-2 text-white">
              <p>
                <strong>Age:</strong> "3 years"
              </p>
              <p>
                <strong>Breed:</strong> "Cat"
              </p>
              <p>
                <strong>Medical Checkup:</strong> "Healthy"
              </p>
            </div>
            <img
              className="w-[100px] h-auto rounded-md"
              src="../src/Assets/catto.jpg"
              alt="Pet"
            />
          </div>
        </div>
      </div>
      <div>
        <h1 className="p-8 text-3xl">Your Posts:</h1>
        {post.map((post) => (
          <Posts
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
    </>
  );
}

export default Profile;
