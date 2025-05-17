import React, { useEffect, useState } from "react";
import {
  FaRegThumbsDown,
  FaRegThumbsUp,
  FaThumbsDown,
  FaThumbsUp,
  FaUserDoctor,
} from "react-icons/fa6";
import { db } from "../../firebase/firebase";
import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import CommentDisplay from "../Comments";
import pfp from "../../icons/pfp.png";
import { useToast } from "../../context/ToastContext"; // Import useToast
import { IoMdClose } from "react-icons/io";
import { useUser } from "@clerk/clerk-react";
import { IoTrashBin } from "react-icons/io5";

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
  isVetVerified,
}) => {
  const severityEmojis = {
    1: "😃 (very good)",
    2: "🙂 (good)",
    3: "😐 (neutral)",
    4: "😨 (not good)",
    5: "😭 (contact vet)",
  };

  const { user } = useUser();
  const isLiked = likes?.includes(user?.id);
  const isDisliked = dislikes?.includes(user?.id);
  const [isImageClicked, setIsImageClicked] = useState(false);
  const [maxImageZoom, setImageMaxZoom] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState("center center");
  const [postToDelete, setPostToDelete] = useState(null);
  const [confirmDelete, toggleConfirmDelete] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast(); // Get showToast from context
  const [blurredImageUrl, setBlurredImageUrl] = useState(null);

  const handleLike = async () => {
    if (!user) return;

    const postRef = doc(db, "posts", id);
    try {
      if (isDisliked) {
        await updateDoc(postRef, {
          dislikes: arrayRemove(user.id),
          likes: arrayUnion(user.id),
        });
        showToast("You liked the post and removed your dislike."); // Display toast
      } else {
        await updateDoc(postRef, {
          likes: isLiked ? arrayRemove(user.id) : arrayUnion(user.id),
        });
        showToast(isLiked ? "You unliked the post." : "You liked the post."); // Display toast
      }
    } catch (error) {
      console.error("Error updating like:", error);
      showToast("An error occurred while liking the post."); // Display error toast
    }
  };

  const handleDislike = async () => {
    if (!user.id) return;

    const postRef = doc(db, "posts", id);
    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(user.id),
          dislikes: arrayUnion(user.id),
        });
        showToast("You disliked the post and removed your like."); // Display toast
      } else {
        await updateDoc(postRef, {
          dislikes: isDisliked ? arrayRemove(user.id) : arrayUnion(user.id),
        });
        showToast(
          isDisliked ? "You removed your dislike." : "You disliked the post."
        ); // Display toast
      }
    } catch (error) {
      console.error("Error updating dislike:", error);
      showToast("An error occurred while disliking the post."); // Display error toast
    }
  };

  const handleImageClick = () => {
    setIsImageClicked(!isImageClicked);
    setImageMaxZoom(false);
  };

  const handleImageZoom = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTransformOrigin(`${x}% ${y}%`);
    setImageMaxZoom(!maxImageZoom);
  };

  const confirmDeleteBox = (postId) => {
    setPostToDelete(postId); // Store the comment ID
    toggleConfirmDelete(!confirmDelete);
  };

  const handleDeletePost = async () => {
    const postRef = doc(db, "posts", postToDelete);
    try {
      await deleteDoc(postRef);
      showToast("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
    }
    confirmDeleteBox();
  };

  //blur image

  useEffect(() => {
    if (imageUrl) {
      generateBlurredImage(imageUrl);
    }
  }, [imageUrl]); // Dependency array ensures this runs when imageUrl changes

  const generateBlurredImage = async (imageUrl) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.crossOrigin = "Anonymous"; // Handle CORS issues
      img.onload = () => {
        // Set canvas size to a smaller dimension for blur effect
        canvas.width = img.width / 4;
        canvas.height = img.height / 4;

        // Draw and blur the image
        ctx.filter = "blur(10px)";
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to base64 and resolve
        const blurredUrl = canvas.toDataURL("image/jpeg", 0.5);
        setBlurredImageUrl(blurredUrl);
        resolve(blurredUrl);
      };

      img.onerror = (error) => {
        console.error("Error loading image:", error);
        resolve(null); // Resolve with null or a default value
      };

      img.src = imageUrl;
    });
  };

  return (
    <div className="flex justify-center items-center w-full text-base-content bg-base-200">
      {/* Post Content */}
      <div
        key={id}
        className="w-[100%] sm:w-[100%] text-lg sm:text-xl bg-base-100 p-3 mb-6 sm:p-6 flex-col justify-center items-center shadow-lg h-max sm:min-h-12 rounded-xl transition-all ease-in-out duration-200 border-2 border-base-300"
      >
        <div className="flex justify-between">
          {/* Header */}
          <div className="flex flex-row gap-2 items-center">
            <img
              src={profilePic || pfp}
              alt="profile pic"
              className="sm:w-10 sm:h-10 w-8 h-8 rounded-full object-cover cursor-pointer"
              onClick={() => navigate(`/in/profile/${userId}`)}
            />
            <div className="flex flex-col items-start justify-center">
              <div
                className={`flex flex-row items-center ${isVetVerified ? "gap-3" : "gap-1"}`}
              >
                <p
                  className="text-[18px] max-sm:text-[15px] cursor-pointer flex flex-row gap-1"
                  onClick={() => navigate(`/in/profile/${userId}`)}
                >
                  {handle}
                  {isVetVerified && (
                    <span className="text-primary text-xl size-3 text-center translate-y-1">
                      <FaUserDoctor className="text-base-200 bg-primary p-1 rounded-full" />
                    </span>
                  )}
                </p>
                <p className="max-sm:text-sm text-[15px]">{"posted:"}</p>
              </div>
              <p className="max-sm:text-sm text-[15px]">{date}</p>
            </div>
          </div>
          {userId == user.id && (
            <button
              className="text-lg self-start"
              onClick={() => confirmDeleteBox(id)}
            >
              <IoTrashBin />
            </button>
          )}
        </div>

        {confirmDelete && postToDelete === id && (
          <>
            <div
              className="fixed z-20 bg-black opacity-30 w-full h-full left-0 top-0"
              onClick={confirmDeleteBox}
            />
            <div className="fixed bg-base-200 flex justify-center items-center z-30 flex-col w-1/5 max-sm:w-4/5 h-fit left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-7 rounded-xl bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-10 border-2 border-base-content/30">
              <button
                className="text-lg p-2 rounded-full bg-error text-base-100 hover:bg-base-300 hover:text-error transition-colors duration-200 self-end mb-5"
                onClick={confirmDeleteBox}
              >
                <IoMdClose />
              </button>
              <h3 className="text-2xl font-semibold mb-2 -translate-y-10">
                {"Delete Post?"}
              </h3>
              <p className="mb-4">{"This action cannot be undone"}</p>
              <div className="flex flex-row gap-5">
                <button
                  className="btn-error btn rounded-xl text-xl"
                  onClick={handleDeletePost}
                >
                  Yes
                </button>
                <button
                  className="border-2 border-error btn btn-base-100 rounded-xl text-xl"
                  onClick={confirmDeleteBox}
                >
                  No
                </button>
              </div>
            </div>
          </>
        )}

        {/* Title and Content */}
        <h1 className="text-[19px] sm:text-[21px] font-bold py-4">{title}</h1>
        <h2 className="text-[16px] sm:text-[19px] font-semibold pb-4">
          {content}
        </h2>

        {/* Image */}
        {imageUrl && (
          <>
            <div
              className="aspect-video flex justify-center w-full h-[500px] max-sm:h-full overflow-hidden rounded-xl"
              onClick={handleImageClick}
              style={{
                backgroundImage: `url(${blurredImageUrl || imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <img
                src={imageUrl}
                alt="Post"
                className="h-full rounded-none object-contain cursor-pointer "
              />
            </div>
          </>
        )}

        {isImageClicked && imageUrl && (
          <>
            <div
              className="fixed top-0 left-0 z-50 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"
              onClick={handleImageClick}
            />
            <div
              className={`fixed z-50 justify-center items-center ${maxImageZoom ? "w-full h-full cursor-zoom-out overflow-auto" : "w-fit h-4/5 max-sm:w-full max-sm:h-fit flex cursor-zoom-in"} top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}
            >
              <img
                src={imageUrl}
                alt="Post"
                className="w-full h-full object-cover rounded-xl max-sm:rounded-none"
                onClick={handleImageZoom}
                style={{ transformOrigin }}
              />
            </div>
            <IoMdClose
              className="fixed z-50 bg-base-100 top-8 right-8 text-5xl max-sm:text-4xl max-sm:top-4 max-sm:right-4 rounded-lg cursor-pointer"
              onClick={handleImageClick}
            />
          </>
        )}

        {/* Severity Index and Actions */}
        <div className="pt-2 flex justify-between">
          {sevVal && (
            <h2 className="text-[14px] sm:text-[17px] text-primary-focus py-4">
              Severity Index: {severityEmojis[sevVal]}
            </h2>
          )}

          <div className="flex flex-row justify-end gap-7 max-sm:gap-3">
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
                profilePic={profilePic}
                isVetVerified={isVetVerified}
                userId={userId}
              />
            </div>

            {/* Like Button */}
            <div>
              <button
                className={`text-xl max-sm:text-lg text-primary rounded-full btn btn-md btn-circle flex flex-row gap-1 mt-4 btn-ghost`}
                onClick={handleLike}
              >
                {isLiked ? <FaThumbsUp /> : <FaRegThumbsUp />}
                {likes?.length || 0}
              </button>
            </div>

            {/* Dislike Button */}
            <div>
              <button
                className="text-xl max-sm:text-lg text-primary rounded-full btn btn-md btn-circle flex flex-row gap-1 mt-4 btn-ghost"
                onClick={handleDislike}
              >
                {isDisliked ? <FaThumbsDown /> : <FaRegThumbsDown />}
                {dislikes?.length || 0}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Posts;
