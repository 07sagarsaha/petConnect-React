import React, { useState } from "react";
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
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import CommentDisplay from "../Comments";
import pfp from "../../icons/pfp.png";
import { useToast } from "../../context/ToastContext"; // Import useToast

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
  const navigate = useNavigate();
  const { showToast } = useToast(); // Get showToast from context

  const handleLike = async () => {
    if (!auth.currentUser) return;

    const postRef = doc(db, "posts", id);
    try {
      if (isDisliked) {
        await updateDoc(postRef, {
          dislikes: arrayRemove(auth.currentUser.uid),
          likes: arrayUnion(auth.currentUser.uid),
        });
        showToast("You liked the post and removed your dislike."); // Display toast
      } else {
        await updateDoc(postRef, {
          likes: isLiked
            ? arrayRemove(auth.currentUser.uid)
            : arrayUnion(auth.currentUser.uid),
        });
        showToast(isLiked ? "You unliked the post." : "You liked the post."); // Display toast
      }
    } catch (error) {
      console.error("Error updating like:", error);
      showToast("An error occurred while liking the post."); // Display error toast
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
        showToast("You disliked the post and removed your like."); // Display toast
      } else {
        await updateDoc(postRef, {
          dislikes: isDisliked
            ? arrayRemove(auth.currentUser.uid)
            : arrayUnion(auth.currentUser.uid),
        });
        showToast(isDisliked ? "You removed your dislike." : "You disliked the post."); // Display toast
      }
    } catch (error) {
      console.error("Error updating dislike:", error);
      showToast("An error occurred while disliking the post."); // Display error toast
    }
  };

  return (
    <div className="flex justify-center items-center w-full text-base-content bg-base-200">
      {/* Post Content */}
      <div
        key={id}
        className="w-[100%] sm:w-[100%] text-lg sm:text-xl bg-base-100 p-3 mb-6 sm:p-6 flex-col justify-center items-center shadow-lg h-max sm:min-h-12 rounded-2xl transition-all ease-in-out duration-200"
      >
        {/* Header */}
        <div className="flex flex-row gap-2 items-center">
          <img
            src={profilePic || pfp}
            alt="profile pic"
            className="sm:w-10 sm:h-10 w-8 h-8 rounded-full object-cover cursor-pointer"
            onClick={() => navigate(`/in/profile/${userId}`)}
          />
          <div className="flex flex-col items-start justify-center">
            <p
              className="text-[18px] max-sm:text-[15px] cursor-pointer"
              onClick={() => navigate(`/in/profile/${userId}`)}
            >
              {handle} posted:
            </p>
            <p className="max-sm:text-sm text-[15px]">{date}</p>
          </div>
        </div>

        {/* Title and Content */}
        <h1 className="text-[19px] sm:text-[21px] font-bold py-4">{title}</h1>
        <h2 className="text-[16px] sm:text-[19px] font-semibold pb-4">
          {content}
        </h2>

        {/* Image */}
        {imageUrl && (
          <div className="aspect-video w-full h-[500px] max-sm:h-full overflow-hidden rounded-xl">
            <img
              src={imageUrl}
              alt="Post"
              className="w-full h-full rounded-xl object-cover cursor-pointer"
            />
          </div>
        )}

        {/* Severity Index and Actions */}
        <div className="pt-2 flex justify-between">
          {sevVal && (
            <h2 className="text-[14px] sm:text-[17px] text-primary-focus py-4">
              Severity Index: {severityEmojis[sevVal]}
            </h2>
          )}

          <div className="flex justify-end gap-7">
            {/* Comments */}
            <div className="mb-1 pt-1">
              <CommentDisplay
                postID={id}
                handle={handle}
                date={date}
                title={title}
                content={content}
                likes={likes}
                dislikes={dislikes}
                imageURL={imageUrl}
              />
            </div>

            {/* Like Button */}
            <div>
              <button
                className="text-xl text-primary rounded-full flex-row"
                onClick={handleLike}
              >
                {isLiked ? <FaThumbsUp /> : <FaRegThumbsUp />}
              </button>
              <p>{likes?.length || 0}</p>
            </div>

            {/* Dislike Button */}
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