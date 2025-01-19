import React, { useEffect, useState } from "react";
import {
  FaRegThumbsDown,
  FaRegThumbsUp,
  FaThumbsDown,
  FaThumbsUp,
} from "react-icons/fa6";
import { auth, db } from "../../firebase/firebase";
import {
  arrayRemove,
  arrayUnion,
  doc,
  updateDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { IoMdClose } from "react-icons/io";
import CommentDisplay from "../Comments";
import pfp from "../../icons/pfp.png";
import { useNavigate } from "react-router-dom";

const Posts = ({
  id,
  handle,
  title,
  content,
  sevVal,
  date,
  likes = [],
  dislikes = [],
  profilePic,
  imageUrl = null,
  userId,
}) => {
  const severityEmojis = {
    1: "😃 (very good)",
    2: "🙂 (good)",
    3: "😐 (neutral)",
    4: "😨 (not good)",
    5: "😭 (contact vet)",
  };

  const isLiked = likes?.includes(auth.currentUser?.uid);
  const isDisliked = dislikes?.includes(auth.currentUser?.uid);
  const [isPostClicked, setIsPostClicked] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [isImageClicked, setIsImageClicked] = useState(false);
  const navigate = useNavigate();

  const handleLike = async () => {
    if (!auth.currentUser) return;

    const postRef = doc(db, "posts", id);
    try {
      if (isDisliked) {
        await updateDoc(postRef, {
          dislikes: arrayRemove(auth.currentUser.uid),
          likes: arrayUnion(auth.currentUser.uid),
        });
      } else {
        await updateDoc(postRef, {
          likes: isLiked
            ? arrayRemove(auth.currentUser.uid)
            : arrayUnion(auth.currentUser.uid),
        });
      }
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const handleDislike = async () => {
    if (!auth.currentUser) return;

    const postRef = doc(db, "posts", id);
    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(auth.currentUser.uid),
          dislikes: arrayUnion(auth.currentUser.uid),
        });
      } else {
        await updateDoc(postRef, {
          dislikes: isDisliked
            ? arrayRemove(auth.currentUser.uid)
            : arrayUnion(auth.currentUser.uid),
        });
      }
    } catch (error) {
      console.error("Error updating dislike:", error);
    }
  };

  useEffect(() => {
    const commentsRef = collection(db, "posts", id, "comments");
    const q = query(commentsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCommentCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [id]);

  const handleImageClick = () => {
    setIsImageClicked(!isImageClicked);
  };

  const handlePost = () => {
    setIsPostClicked(!isPostClicked);
  };

  const handleProfileClick = () => {
    console.log(userId);
    navigate(`/in/profile/${userId}`);
  };

  return (
    <div className="flex justify-center items-center w-full text-base-content bg-base-200">
      {isImageClicked && imageUrl && (
        <>
          <div
            className="h-full w-full justify-center items-center flex bg-black bg-opacity-50 transition-colors duration-200 fixed z-30 top-0 left-0"
            onClick={handleImageClick}
          />
          <IoMdClose
            className="text-5xl p-2 rounded-lg hover:text-error transition-all duration-300 fixed top-5 right-5 z-50 bg-base-200 text-primary"
            onClick={handleImageClick}
          />
          <img
            src={imageUrl}
            alt="Image"
            className="h-fit w-[75%] max-sm:w-full transform -translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-40 rounded-xl"
          />
        </>
      )}
      <div
        key={id}
        className={`w-[95%] sm:w-[95%] text-lg sm:text-xl bg-base-100 max-sm:ml-1 p-3 mb-6 sm:p-6 sm:m-8 flex-col justify-center items-center shadow-lg h-max sm:min-h-12 rounded-2xl transition-all ease-in-out duration-200`}
      >
        <div className="flex flex-row gap-2 items-center">
          <img
            src={profilePic || pfp}
            alt="profile pic"
            className="sm:w-10 sm:h-10 w-8 h-8 rounded-full object-cover cursor-pointer"
            onClick={handleProfileClick}
          />
          <div className="flex flex-col items-start justify-center">
            <p
              className="text-[18px] max-sm:text-[15px]   cursor-pointer"
              onClick={handleProfileClick}
            >
              {handle} posted:
            </p>
            <p className="max-sm:text-sm text-[15px] ">{date}</p>
          </div>
        </div>

        <h1 className="text-[19px] sm:text-[21px] font-bold py-4">{title}</h1>
        <h2 className="text-[16px] sm:text-[19px]  font-semibold pb-4">
          {content}
        </h2>
        {imageUrl && (
          <div className=" aspect-video w-full h-[500px] max-sm:h-full overflow-hidden rounded-xl">
            <img
              src={imageUrl}
              alt="Post"
              className="w-full h-full rounded-xl object-cover cursor-pointer"
              onClick={handleImageClick}
            />
          </div>
        )}
        <div className="pt-2 flex justify-between">
          {sevVal && (
            <h2 className="text-[14px] sm:text-[17px] text-primary-focus py-4">
              Severity Index: {severityEmojis[sevVal]}
            </h2>
          )}

          <div className="flex justify-end gap-7">
            <div>
              <div className="mb-1 pt-1">
                <CommentDisplay
                  postID={id}
                  handle={handle}
                  date={date}
                  title={title}
                  content={content}
                  likes={likes}
                  dislikes={dislikes}
                  imageURL={imageUrl ? imageUrl : false}
                />
              </div>
            </div>

            <div>
              <button
                className="text-xl text-primary rounded-full flex-row"
                onClick={handleLike}
              >
                {isLiked ? <FaThumbsUp /> : <FaRegThumbsUp />}
              </button>
              <p>{likes?.length || 0}</p>
            </div>
            <div>
              <button
                className="text-xl text-error rounded-full flex-row"
                onClick={handleDislike}
              >
                {isDisliked ? <FaThumbsDown /> : <FaRegThumbsDown />}
              </button>
              <p>{dislikes?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Posts;
