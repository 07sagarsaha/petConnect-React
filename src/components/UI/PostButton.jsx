import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { useUser } from "@clerk/clerk-react";
import { db } from "../../firebase/firebase";
import { CiImageOn } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import LoadingBar from "react-top-loading-bar";

const Button = ({ buttonName, icon, submitName, className }) => {
  const [isClicked, setIsClicked] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sevVal, setSevVal] = useState(3);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isImageClicked, setIsImageClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const loadingBarRef = useRef(null);
  const { user } = useUser();

  const cloudinaryAccounts = [
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

  // Add severity emojis mapping
  const severityEmojis = {
    1: "😃 (very good)",
    2: "🙂 (good)",
    3: "😐 (neutral)",
    4: "😨 (not good)",
    5: "😭 (contact vet)",
  };

  function handleClickEvent() {
    setIsClicked(!isClicked);
    if (isClicked) {
      setTitle("");
      setContent("");
      setImageFile(null);
      setImagePreview(null);
      setIsLoading(false);
      setSevVal(3);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Set a title before posting!");
      return;
    }
    setIsLoading(true);
    loadingBarRef.current.continuousStart();
    const currentAccount = getNextAccount();
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", currentAccount.name);

    let uploadedImageUrl = "";

    try {
      if (imageFile) {
        const response = await fetch(currentAccount.url, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        uploadedImageUrl = data.secure_url;
      }
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.id));
        const userData = userDoc.exists()
          ? userDoc.data()
          : { handle: "Unknown", name: "Unknown" };
        const postRef = doc(db, "posts", user.id);
        await setDoc(postRef, {
          title,
          content,
          sevVal,
          imageUrl: uploadedImageUrl,
          handle: userData.handle,
          likes: [],
          dislikes: [],
          createdAt: serverTimestamp(),
          userId: user.id,
          author: user.emailAddresses[0].emailAddress,
        }).then(() => {
          // Clear the form fields after successful submission
          setTitle("");
          setContent("");
          setSevVal(3);
          setImageFile(null);
          setImagePreview(null);
          setIsClicked(!isClicked);
          setIsLoading(false);
          loadingBarRef.current.complete();

          // Send browser notification
          if (Notification.permission === "granted") {
            new Notification("New Post", {
              body: `${userData.name} (@${userData.handle}) posted: ${title} - Severity: ${sevVal}`,
            });
          }
        });
      } else {
        console.error("User is not logged in.");
      }
    } catch (error) {
      console.error("Error adding post: ", error);
      loadingBarRef.current.complete();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageClick = () => {
    setIsImageClicked(!isImageClicked);
  };

  return (
    <>
      {/* Button */}
      <div
        onClick={handleClickEvent}
        className={`flex text-primary hover:text-base-100 bg-base-100 p-2 justify-center items-center transition-all duration-[0.85s] shadow-lg rounded-lg ease hover:bg-primary h-20 ${className}`}
      >
        <div className="flex justify-center items-center gap-2">
          {icon}
          <span>{buttonName}</span>
        </div>
      </div>

      {/* Modal for desktop / Full screen for mobile */}
      {isClicked && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleClickEvent}
          />

          {/* Modal/Form Container */}
          <div
            className={`fixed z-50 transform transition-all duration-500 ease-in-out
            max-sm:inset-0 max-sm:w-full max-sm:h-full
            sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[600px] sm:max-h-[80vh]
            bg-base-100 rounded-xl overflow-hidden shadow-xl`}
          >
            {/* Header */}
            <div className="flex justify-between items-center bg-primary text-base-100 p-4">
              <h2 className="text-xl font-bold">Create New Post</h2>
              <IoMdClose
                className="text-2xl cursor-pointer hover:text-error transition-colors"
                onClick={handleClickEvent}
              />
            </div>

            {/* Form Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-4rem)]">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="What's on your mind?"
                  value={title}
                  className="w-full rounded-lg px-4 py-2 text-xl text-gray-600 border border-gray-200"
                  onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                  placeholder="Describe some more..."
                  value={content}
                  className="w-full rounded-lg px-4 py-2 text-lg text-gray-600 border border-gray-200 min-h-[100px]"
                  onChange={(e) => setContent(e.target.value)}
                />

                {/* Updated Severity Slider Section */}
                <div className="flex flex-col gap-2">
                  <label className="text-gray-600">Severity:</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={sevVal}
                      className="w-56"
                      onChange={(e) => setSevVal(parseInt(e.target.value))}
                    />
                    <span className="text-xl min-w-[200px]">
                      {severityEmojis[sevVal]}
                    </span>
                  </div>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-error text-white rounded-full"
                    >
                      <IoMdClose />
                    </button>
                  </div>
                )}

                {/* Image Upload */}
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer text-3xl text-primary hover:text-primary-focus"
                  >
                    <CiImageOn />
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="bg-primary text-base-100 py-2 px-4 rounded-lg hover:bg-primary-focus transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <AiOutlineLoading3Quarters className="animate-spin mx-auto" />
                  ) : (
                    "Post"
                  )}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Loading Bar */}
      <LoadingBar color="#f11946" ref={loadingBarRef} />
    </>
  );
};

export default Button;
