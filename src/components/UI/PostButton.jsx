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
import { useTour } from "../../context/TourContext";
import { IoMdAddCircleOutline, IoMdImage } from "react-icons/io";

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
  const { startTour, hasTourBeenCompleted } = useTour();

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

  // Add this function to check if it's the user's first post
  const checkFirstTimePosting = async () => {
    if (user) {
      try {
        const userRef = doc(db, "users", user.id);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // If the user has never posted before and hasn't completed the posting tour
          if ((userData.hasPostedBefore === undefined || userData.hasPostedBefore === false) && 
              !hasTourBeenCompleted('posting')) {
            startTour('posting');
            
            // Update the user document to indicate they've posted before
            await setDoc(userRef, { ...userData, hasPostedBefore: true }, { merge: true });
          }
        }
      } catch (error) {
        console.error("Error checking first-time posting:", error);
      }
    }
  };
  
  function handleClickEvent() {
    setIsClicked(!isClicked);
    if (!isClicked) {
      checkFirstTimePosting();
    } else {
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
        const postRef = collection(db, "posts");
        await addDoc(postRef, {
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
    <div className="flex flex-col items-center justify-center">
      <button
        onClick={() => setIsClicked(!isClicked)}
        className="new-post-button btn btn-primary text-base-100 shadow-lg flex items-center justify-center gap-2 mb-4"
      >
        <IoMdAddCircleOutline className="text-xl" />
        New Post
      </button>
      
      {isClicked && (
        <div className="w-full max-w-2xl bg-base-100 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-primary">Create a Post</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="post-title-input w-full p-2 border rounded-lg focus:ring focus:ring-primary/20"
                placeholder="Give your post a title"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="post-content-input w-full p-2 border rounded-lg h-32 focus:ring focus:ring-primary/20"
                placeholder="What's on your mind?"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Image (Optional)</label>
              <div className="post-image-upload flex items-center space-x-2">
                <label className="cursor-pointer bg-base-200 hover:bg-base-300 p-2 rounded-lg flex items-center">
                  <IoMdImage className="mr-2" />
                  Upload Image
                  <input
                    type="file"
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-16 w-16 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-error text-white rounded-full p-1"
                    >
                      <IoMdClose size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">
                Severity (for help requests)
              </label>
              <div className="post-severity-slider flex items-center space-x-4">
                <span>Low</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={sevVal}
                  onChange={(e) => setSevVal(parseInt(e.target.value))}
                  className="range range-primary"
                />
                <span>High</span>
                <span className="ml-2 font-medium">{sevVal}</span>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsClicked(false)}
                className="btn btn-outline mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="post-submit-button btn btn-primary text-base-100"
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      <LoadingBar color="#8B5CF6" ref={loadingBarRef} />
    </div>
  );
};

export default Button;
