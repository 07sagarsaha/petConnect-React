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
  const [showButton, setShowButton] = useState(true);
  const lastScrollY = useRef(window.scrollY);
  const [fullScreenForm, setFullScreenForm] = useState(false);

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
          if (
            (userData.hasPostedBefore === undefined ||
              userData.hasPostedBefore === false) &&
            !hasTourBeenCompleted("posting")
          ) {
            startTour("posting");

            // Update the user document to indicate they've posted before
            await setDoc(
              userRef,
              { ...userData, hasPostedBefore: true },
              { merge: true }
            );
          }
        }
      } catch (error) {
        console.error("Error checking first-time posting:", error);
      }
    }
  };

  function handleClickEvent() {
    if (!isClicked) {
      // Check if at the top of the page (allow a small threshold)
      if (window.scrollY > 10) {
        setFullScreenForm(true);
        setIsClicked(true);
      } else {
        setFullScreenForm(false);
        setIsClicked(true);
      }
      checkFirstTimePosting();
    } else {
      setIsClicked(false);
      setFullScreenForm(false);
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
          handleClickEvent();
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
      handleClickEvent();
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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY.current) {
        setShowButton(false); // scrolling down
      } else {
        setShowButton(true); // scrolling up
      }
      lastScrollY.current = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        {fullScreenForm && (
          <div
            className="fixed z-40 top-0 left-0 w-full h-full bg-black opacity-50"
            onClick={handleClickEvent}
          />
        )}
        <div
          className={` ${isClicked ? `max-sm:transition-all max-sm:duration-500 ${fullScreenForm ? `transition-none fixed z-50 w-3/5 max-sm:w-5/6 h-fit top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-base-100` : `w-full bg-base-100 h-[35rem] shadow-lg p-4 opacity-100`}` : `rounded-xl h-0 bg-base-200 p-0 opacity-0`} rounded-xl flex-col text-base-100 flex items-start justify-center gap-2 max-sm:w-full max-sm:transition-all duration-500`}
        >
          {isClicked && (
            <>
              <h2 className="text-2xl font-bold mb-4 text-primary w-full">
                {"Create a Post"}
              </h2>
              <form onSubmit={handleSubmit} className="w-full">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-base-content text-start">
                    {"Title"}
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="post-title-input w-full p-2 border rounded-lg focus:ring focus:ring-primary/20 text-base-content outline-none"
                    placeholder="Give your post a title"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-base-content text-start">
                    {"Content"}
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="post-content-input w-full p-2 border rounded-lg h-32 focus:ring focus:ring-primary/20 resize-none outline-none text-base-content"
                    placeholder="What's on your mind?"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-base-content text-start">
                    {"Image (Optional)"}
                  </label>
                  <div className="post-image-upload flex items-center space-x-2">
                    <label className="cursor-pointer bg-base-200 hover:bg-base-300 p-2 rounded-lg flex items-center text-base-content text-start">
                      <IoMdImage className="mr-2" />
                      {"Upload Image"}
                      <input
                        type="file"
                        onChange={handleImageChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </label>
                    {imagePreview && (
                      <div className="relative aspect-auto">
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
                  <label className="block text-sm font-medium mb-1 text-base-content text-start">
                    {"Severity (for help requests)"}
                  </label>
                  <div className="post-severity-slider flex items-center space-x-4 text-base-content text-start">
                    <span>{"Low"}</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={sevVal}
                      onChange={(e) => setSevVal(parseInt(e.target.value))}
                      className="range range-primary"
                    />
                    <span className="text-base-content text-start">
                      {"High"}
                    </span>
                    <span className="ml-2 font-medium">{sevVal}</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleClickEvent}
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
            </>
          )}
        </div>

        {!isClicked && (
          <button
            className={`shadow-Uni flex flex-row items-center gap-4 lg:w-fit md:w-fit btn-accent text-accent-content shadow-base-content/30 btn max-sm:btn-square btn-lg fixed z-20 right-4 backdrop:blur-md transition-all duration-300 new-post-button
            ${showButton ? "opacity-100 pointer-events-auto lg:bottom-[7%] md:bottom-28 max-md:bottom-28 max-sm:bottom-28 lg:left-[4%] max-sm:right-5" : "lg:opacity-100 max-sm:opacity-0 max-md:opacity-0 md:opacity-0 lg:bottom-[7%] max-md:bottom-8 md:bottom-8 max-sm:bottom-8 lg:left-[4%] max-sm:right-5"}`}
            onClick={isClicked ? null : handleClickEvent}
          >
            <IoMdAddCircleOutline className="text-xl" size={25} />
            <span className="max-sm:hidden">{"New Post"}</span>
          </button>
        )}
        <LoadingBar color="#8B5CF6" ref={loadingBarRef} />
      </div>
    </>
  );
};

export default Button;
