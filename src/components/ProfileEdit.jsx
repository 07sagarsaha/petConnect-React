import React, { useState } from "react";
import { auth, db } from "../firebase/firebase";
import {
  collection,
  doc,
  getDoc,
  query,
  updateDoc,
  where,
  getDocs,
} from "firebase/firestore";
import { BsPencil } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import { useToast } from "../context/ToastContext";

const ProfileEdit = ({ image, name, handle, bio, handleProfileClose }) => {
  const [profilePic, setProfilePic] = useState(image);
  const [changeName, setNameChange] = useState(name);
  const [changeHandle, setChangeHandle] = useState(handle);
  const [changeBio, setChangeBio] = useState(bio);
  const {showToast} = useToast();
  const cloudinaryAccounts = [
    //add more cloudinary accounts here just add the name and and change the url too
    //  https://api.cloudinary.com/v1_1/Put_your_cloud_name_here/image/upload
    {
      name: "Post_Image",
      url: import.meta.env.VITE_CLOUDINARY_URL_1,
    },
    {
      name: "Post_Image",
      url: import.meta.env.VITE_CLOUDINARY_URL_2,
    },
    {
      name: "Post_Image",
      url: import.meta.env.VITE_CLOUDINARY_URL_3,
    },
    {
      name: "Post_Image",
      url: import.meta.env.VITE_CLOUDINARY_URL_4,
    },
    {
      name: "post-image",
      url: import.meta.env.VITE_CLOUDINARY_URL_5,
    },
  ];

  const [currentAccountIndex, setCurrentAccountIndex] = useState(0);
  const getNextAccount = () => {
    const nextIndex = (currentAccountIndex + 1) % cloudinaryAccounts.length;
    setCurrentAccountIndex(nextIndex);
    return cloudinaryAccounts[nextIndex];
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const currentAccount = getNextAccount();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", currentAccount.name);

    try {
      const res = await fetch(currentAccount.url, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.secure_url) {
        setProfilePic(data.secure_url);

        // Update user profile in Firestore
        if (auth.currentUser.uid) {
          const userRef = doc(db, "users", auth.currentUser.uid);
          await updateDoc(userRef, {
            profilePic: data.secure_url,
          });
        }
      }
      showToast("Profile Picture Updated!");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!(changeName.trim() || changeHandle.trim() || changeBio.trim())) {
      showToast("Please fill in the fields to update your profile.");
      return;
    }

    const user = auth.currentUser;

    if (user) {
      const userDoc = doc(db, "users", user.uid);
      try {
        await updateDoc(userDoc, {
          name: changeName,
          handle: changeHandle,
          bio: changeBio,
        });
        showToast("Profile Updated!");
      } catch (error) {
        console.error(error);
      }
      const postRef = collection(db, "posts");
      const q = query(postRef, where("userId", "==", user.uid));
      try {
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (doc) => {
          const post = doc.ref;
          await updateDoc(post, {
            handle: changeHandle,
          });
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <>
      <div className="h-full w-full left-0 justify-center items-center flex flex-col fixed top-0 z-40 bg-neutral-focus transition-colors duration-200">
        <div className="h-4/5 max-sm:h-max w-1/2 max-sm:w-[80%] rounded-xl bg-base-100 shadow-xl overflow-hidden">
          <div className="flex flex-row justify-center w-full ml-4 mt-4 items-center">
            <h1 className="flex w-full justify-center text-2xl my-4 text-primary">
              Update Your Profile
            </h1>
            <IoMdClose
              className="text-4xl mr-8 hover:text-error transition-all duration-300"
              onClick={handleProfileClose}
            />
          </div>
          <div className="flex flex-row justify-center mt gap-6 items-center">
            <img
              className="w-[150px] h-[150px] rounded-full object-cover"
              src={profilePic}
              alt="Profile"
            />
            <label
              htmlFor="profile_image"
              className="text-lg p-3 m-[10px] absolute ml-40 mt-32 rounded-full bg-primary text-base-100 hover:bg-base-100 hover:text-primary ease-in-out duration-700"
            >
              <BsPencil />
            </label>
            <input
              type="file"
              id="profile_image"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <div className="flex flex-col items-center">
            <input
              placeholder={name}
              value={changeName}
              type="text"
              className="w-[55%] max-sm:w-[75%] max-sm:h-[5vh] max-sm:text-lg outline-none text-xl rounded-lg p-4 text-black mt-9 bg-base-200"
              onChange={(e) => setNameChange(e.target.value)}
            />
            <input
              placeholder={handle}
              value={changeHandle}
              type="text"
              className="w-[55%] max-sm:w-[75%] max-sm:h-[5vh] max-sm:text-lg outline-none text-xl rounded-lg p-4 text-black mt-5 bg-base-200"
              onChange={(e) => setChangeHandle(e.target.value)}
            />
            <textarea
              placeholder={bio}
              value={changeBio}
              type="text"
              className="w-[55%] max-sm:w-[75%] h-[10vh] max-sm:text-lg outline-none text-xl rounded-lg p-4 text-black mt-5 bg-base-200"
              onChange={(e) => setChangeBio(e.target.value)}
            />
            <button
              className="text-lg p-3 m-[10px] mt-5 rounded-xl bg-primary text-base-100 shadow-lg hover:bg-base-100 hover:text-primary ease-in-out duration-700"
              onClick={handleProfileUpdate}
            >
              Done
            </button>
          </div>
        </div>
      </div>
      <div className="fixed z-20 bg-black opacity-50 w-full h-full left-0 top-0" onClick={handleProfileClose}/>
    </>
  );
};

export default ProfileEdit;
