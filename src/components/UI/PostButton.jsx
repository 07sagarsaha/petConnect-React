import React, { useEffect, useState } from "react";
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
  const cloudinaryAccounts = [
    //add more cloudinary accounts here just add the name and and chege the url too
    //  https://api.cloudinary.com/v1_1/Put_your_cloud_name_here/image/upload
    {
      name: "Post_Image",
      url: "https://api.cloudinary.com/v1_1/dvczcmdgh/image/upload",
    },
    {
      name: "Post_Image",
      url: "https://api.cloudinary.com/v1_1/dspxe3n3r/image/upload",
    },
    {
      name: "Post_Image",
      url: "https://api.cloudinary.com/v1_1/dzyzdbf5s/image/upload",
    },
    {
      name: "Post_Image",
      url: "https://api.cloudinary.com/v1_1/dfhlildqv/image/upload",
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
      setSevVal(3);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Set a title before posting!");
      return;
    }
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "Post_Image");

    const user = auth.currentUser;
    let uploadedImageUrl = "";

    try {
      if (imageFile) {
        const currentAccount = getNextAccount();
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
        console.log(userData.handle);
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
        });
      } else {
        console.error("User is not logged in.");
      }
    } catch (error) {
      console.error("Error adding post: ", error);
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
  }

  const handleImageClick = () => {
    setIsImageClicked(!isImageClicked);
  }

  return (
    <>
      <div
        onClick={isClicked ? null : handleClickEvent}
        className={`relative flex text-[#da80ea] hover:text-[#e0e0e0] z-10 p-4 m-8 max-sm:mt-4 max-sm:ml-0 max-sm:text-[24px] justify-center items-center transition-all shadow-[6px_6px_16px_#9d9d9d,-6px_-6px_16px_#ffffff] rounded-2xl w-52 max-sm:w-[95%] h-16 ease-in-out animate-postButtonAnim1 duration-700 ${
          isClicked
            ? `bg-purple-300 text-[210%] text-white hover:text-white flex-col gap-4 w-[80%] ${imagePreview ? `h-[94vh] max-sm:h-[750px]` : `h-[64vh] max-sm:h-[500px]`} max-sm:w-[90%] `
            : `text-xl  max-sm:w-[90%] hover:bg-[#da80ea] bg-[#e0e0e0]  hover:shadow-[11px_11px_19px_#d0d0d0,-11px_-11px_19px_#f0f0f0]`
        }`}
      >
        <p
          className={`${
            isClicked ? `absolute top-4 self-center` : `relative ml-[-50px]`
          }`}
        >
          {buttonName}
        </p>
        <div
          className={`ml-3 absolute top-0 right-0 px-4 py-[1.1rem] rounded-lg transition-all duration-500 ${
            isClicked && `rotate-45 text-white hover:text-red-600`
          }`}
          onClick={handleClickEvent}
        >
          {icon}
        </div>
        {isClicked && (
          <>
            <input
              type="text"
              placeholder={`What's on your mind?`}
              value={title}
              className={`w-[95%] mt-[-25px] max-sm:max-w-[95%] max-sm:h-[5vh] max-sm:text-lg outline-none text-xl rounded-lg p-4 text-black animate-postButtonAnim1 shadow-Uni`}
              onChange={(e) => setTitle(e.target.value)}
            ></input>
            <textarea
              placeholder={`Describe some more...`}
              value={content}
              className={`h-44 w-[95%] max-sm:max-w-[95%] max-sm:h-[15vh] max-sm:text-lg outline-none text-xl rounded-lg pl-4 pt-2 text-gray-600 animate-postButtonAnim1 shadow-Uni`}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
            <div
              className={`w-[95%] max-sm:h-[8vh]  mb-5 relative pl-4 flex-col justify-center items-start rounded-lg py-2 max-sm:max-w-[95%] text-gray-600 bg-white animate-postButtonAnim1 shadow-Uni transition-all duration-100`}
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
                className={`relative text-gray-600 animate-postButtonAnim1 w-56 max-sm:w-[10rem]`}
                onChange={(e) => setSevVal(parseInt(e.target.value))}
              />
            </div>

            {imagePreview && 
            <>
              <button 
                className="absolute bottom-10 p-2 rounded-full bg-[#474747a1]" 
                onClick={removeImage}>
                  <IoMdClose/>
              </button>

              <img 
                src={imagePreview} 
                className="object-cover rounded-xl w-fit h-[30%] max-sm:h-[25%]"
                onClick={handleImageClick}/>

              {(isImageClicked && imagePreview) && <>
                          <div className="h-full w-full left-0 justify-center items-center flex fixed top-0 z-40 bg-[#4f4f4fcd] transition-colors duration-200">
                            <IoMdClose
                                className="text-5xl fixed z-50 p-2 right-[5%] top-16 rounded-lg hover:text-red-600 transition-all duration-300"
                                onClick={handleImageClick}
                            />
                            <img src={imagePreview} alt="Image" className="h-4/5 max-sm:w-auto w-max m-12 object-contain rounded-2xl shadow-Uni max-sm:shadow-transparent"/>
                          </div>
              </>}
            </>}

            <label htmlFor="image upload" className="text-3xl bg-white absolute bottom-0 left-0 text-black p-3 py-3 m-6 animate-postButtonAnim1 shadow-Uni hover:shadow-lg rounded-lg transition-all duration-500"><CiImageOn /></label>

            <input
              type="file"
              id="image upload"
              accept="image/*"
              onChange={handleImageChange}
              className={
                "hidden"
              }
            />

            <button
              type="submit"
              className={`text-[20px] bg-white absolute bottom-0 right-0 text-black p-3 py-3 m-6 animate-postButtonAnim1 shadow-Uni hover:shadow-lg rounded-lg transition-all duration-500`}
              onClick={handleSubmit}
            >
              {submitName}
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default Button;
