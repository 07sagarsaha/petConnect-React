import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebase/firebase";
import { CiImageOn } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import LoadingBar from "react-top-loading-bar";

const Button = ({ buttonName, icon, submitName, howMuchCurve }) => {
  const [isClicked, setIsClicked] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sevVal, setSevVal] = useState(3);
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isImageClicked, setIsImageClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const loadingBarRef = useRef(null);
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe;
  }, []);

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

    const user = auth.currentUser;
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
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists()
          ? userDoc.data()
          : { handle: "Unknown" };
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
          userId: user.uid,
          author: user.email,
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
      <div
        onClick={isClicked ? null : handleClickEvent}
        className={`flex text-neutral bg-base-200 hover:text-accent hover:bg-neutral border-accent border-2 p-0 m-8 max-sm:mt-4 max-sm:ml-0 max-sm:text-[24px] justify-center items-center transition-all rounded-2xl w-52 max-sm:w-[95%] h-16 ease-in-out  ${
          isClicked
            ? `w-full sm:w-[95%] ${imagePreview ? `h-[31%]` : `h-[30%]`} `
            : `text-xl text-neutral max-sm:w-[90%] hover:bg-primary`
        }`}
      >
        <div
          className={`flex justify-center items-center ${
            isClicked ? `hidden` : ` `
          }`}
        >
          {icon}
        </div>
        <p className={`${isClicked ? `hidden` : ` `}`}>{buttonName}</p>

        {isClicked && (
          <div className="flex flex-col justify-center items-center gap-4 bg-primary w-full h-full p-4 rounded-xl text-base-100">
            <div className="flex flex-row w-full ml-4 mt-4 items-center">
              <div className="flex w-[100%] justify-center ml-4 ">
                {icon}
                <p className="text-2xl ">New Post</p>
              </div>
              <div className="">
                <IoMdClose
                  className="w-8 h-8 justify-end  mr-8"
                  onClick={handleClickEvent}
                ></IoMdClose>
              </div>
            </div>
            <input
              type="text"
              placeholder={`What's on your mind?`}
              value={title}
              className={`w-[95%] rounded-lg pl-4 py-2 text-xl text-gray-600 `}
              onChange={(e) => setTitle(e.target.value)}
            ></input>
            <textarea
              placeholder={`Describe some more...`}
              value={content}
              className={`h-44 w-[95%] text-xl rounded-lg pl-4 pt-2 text-gray-600 `}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
            <div
              className={`w-[95%] pl-4 flex-col justify-center items-start rounded-lg py-2 max-sm:max-w-[95%] text-gray-600 bg-base-100 `}
            >
              <p
                htmlFor="sevScale"
                className="text-xl max-sm:text-base relative"
              >
                {" "}
                Severity Scale:{" "}
                {sevVal === 1
                  ? "😃 (very good)"
                  : sevVal === 2
                    ? "🙂 (good)"
                    : sevVal === 3
                      ? "😐 (neutral)"
                      : sevVal === 4
                        ? "😨 (not good)"
                        : "😭 (contact vet)"}
              </p>
              <input
                type="range"
                min={1}
                max={5}
                value={sevVal}
                id="sevScale"
                className={`text-gray-600 animate-postButtonAnim1 w-56 max-sm:w-[10rem]`}
                onChange={(e) => setSevVal(parseInt(e.target.value))}
              />
            </div>

            {imagePreview && (
              <>
                <button
                  className="rounded-full bg-[#474747a1]"
                  onClick={removeImage}
                >
                  <IoMdClose />
                </button>

                <img
                  src={imagePreview}
                  className="object-cover rounded-xl w-fit h-[30%] max-sm:h-[25%]"
                  onClick={handleImageClick}
                />

                {isImageClicked && imagePreview && (
                  <div className="h-full w-full left-0 justify-center items-center flex fixed top-0 z-40 bg-[#4f4f4fcd] transition-colors duration-200">
                    <IoMdClose
                      className="text-5xl fixed z-50 p-2 right-[5%] top-16 rounded-lg transition-all duration-300"
                      onClick={handleImageClick}
                    />
                    <img
                      src={imagePreview}
                      alt="Image"
                      className="h-4/5 max-sm:w-auto w-max m-12 object-contain rounded-2xl animate-postAnim1"
                    />
                  </div>
                )}
              </>
            )}

            <label
              htmlFor="image upload"
              className={`text-3xl bg-base-100 text-black p-3 py-3 animate-postButtonAnim1   rounded-lg transition-all duration-500 ${
                imagePreview ? `hidden` : ` `
              }`}
            >
              <CiImageOn />
            </label>

            <input
              type="file"
              id="image upload"
              accept="image/*"
              onChange={handleImageChange}
              className={"hidden"}
            />

            <button
              type="submit"
              className={`text-[20px] bg-base-100 bottom-0 right-0 p-3 py-3 flex flex-row gap-2 animate-postButtonAnim1 rounded-lg transition-all duration-500 ${isLoading? `text-gray-600` : `text-black`}`}
              onClick={isLoading? null : handleSubmit}
              disabled={isLoading}
            >
              {submitName}
              {isLoading && <AiOutlineLoading3Quarters className="animate-spin self-center"/>}
              <LoadingBar color="#f11946" ref={loadingBarRef} className=""/>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Button;
