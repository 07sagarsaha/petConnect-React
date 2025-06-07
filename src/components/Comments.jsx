import React, { useEffect, useRef, useState } from "react";
import {
  FaRegThumbsDown,
  FaRegThumbsUp,
  FaThumbsDown,
  FaThumbsUp,
  FaUserDoctor,
} from "react-icons/fa6";
import {
  arrayRemove,
  arrayUnion,
  doc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { IoMdClose } from "react-icons/io";
import { BiCommentDetail } from "react-icons/bi";
import { db } from "../firebase/firebase";
import { IoSend, IoTrashBin } from "react-icons/io5";
import { useToast } from "../context/ToastContext";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import pfp from "../icons/pfp.png";

const CommentDisplay = ({
  postID,
  handle,
  date,
  title,
  content,
  likes = [],
  dislikes = [],
  imageURL = false,
  isVetVerified,
  profilePic,
  userId,
}) => {
  const { user } = useUser();
  const isLiked = likes?.includes(user?.id);
  const isDisliked = dislikes?.includes(user?.id);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [isPostClicked, setIsPostClicked] = useState(false);
  const [confirmDelete, toggleConfirmDelete] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null); // State to store comment ID
  const commentInputRef = useRef(null);
  const [isImageClicked, setIsImageClicked] = useState(false);
  const [maxImageZoom, setImageMaxZoom] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState("center center");
  const [blurredImageUrl, setBlurredImageUrl] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handlePost = () => {
    setIsPostClicked(!isPostClicked);
    setIsImageClicked(false);
    setImageMaxZoom(false);
    toggleConfirmDelete(false);
    setCommentToDelete(null);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const userDoc = await getDoc(doc(db, "users", user.id));
    const userData = userDoc.exists() ? userDoc.data() : { handle: "Unknown" };

    try {
      const commentsRef = collection(db, "posts", postID, "comments");
      await addDoc(commentsRef, {
        content: newComment,
        userId: user.id,
        userHandle: userData.handle,
        likes: [],
        dislikes: [],
        createdAt: serverTimestamp(),
      });
      setNewComment("");
      showToast("Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  useEffect(() => {
    const commentsRef = collection(db, "posts", postID, "comments");
    const q = query(commentsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentsData);
      setCommentCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [postID]);

  const handleLike = async () => {
    if (!user) {
      showToast("Please log in to like a post.");
      return;
    }

    const postRef = doc(db, "posts", postID);
    try {
      if (isDisliked) {
        await updateDoc(postRef, {
          dislikes: arrayRemove(user.id),
          likes: arrayUnion(user.id),
        });
        showToast("You liked the post and removed your dislike.");
      } else {
        await updateDoc(postRef, {
          likes: isLiked ? arrayRemove(user.id) : arrayUnion(user.id),
        });
        showToast(isLiked ? "You unliked the post." : "You liked the post.");
      }
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const handleDislike = async () => {
    if (!user) {
      showToast("Please log in to dislike a post.");
      return;
    }

    const postRef = doc(db, "posts", postID);
    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(user.id),
          dislikes: arrayUnion(user.id),
        });
        showToast("You disliked the post and removed your like.");
      } else {
        await updateDoc(postRef, {
          dislikes: isDisliked ? arrayRemove(user.id) : arrayUnion(user.id),
        });
        showToast(
          isDisliked ? "You removed your dislike." : "You disliked the post."
        );
      }
    } catch (error) {
      console.error("Error updating dislike:", error);
    }
  };

  const handleCommentTag = (userHandle) => {
    setNewComment("@" + userHandle + " ");
    commentInputRef.current.focus();
  };

  const confirmDeleteBox = (commentId) => {
    setCommentToDelete(commentId); // Store the comment ID
    toggleConfirmDelete(!confirmDelete);
  };

  const handleDeletePComment = async () => {
    const commentRef = doc(db, "posts", postID, "comments", commentToDelete);
    try {
      await deleteDoc(commentRef);
      showToast("Comment deleted successfully!");
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
    confirmDeleteBox();
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

  const isImageURLPresent = !!imageURL;

  useEffect(() => {
    if (imageURL) {
      generateBlurredImage(imageURL);
    }
  }, [imageURL]); // Dependency array ensures this runs when imageUrl changes

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
    <>
      {isImageClicked && imageURL && (
        <>
          <div
            className="fixed top-0 left-0 z-50 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"
            onClick={handleImageClick}
          />
          <div
            className={`fixed z-50 justify-center items-center ${maxImageZoom ? "w-full h-full cursor-zoom-out overflow-auto" : "w-fit h-4/5 max-sm:w-full max-sm:h-fit flex cursor-zoom-in"} top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}
          >
            <img
              src={imageURL}
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
      <div
        className={`max-sm:transition-none duration-[0.625s] ease-in-out rounded-xl ${
          isPostClicked
            ? "h-4/5 w-3/5 top-1/2 fixed z-30 transform -translate-x-1/2 -translate-y-1/2 left-1/2 max-sm:h-full max-sm:rounded-none max-md:w-full md:w-full max-md:h-full md:h-full max-lg:w-[70%] lg:w-[60%] lg:h-[80%] max-lg:h-[80%] max-md:ml-[10%] lg:ml-0 max-lg:ml-[10%] max-sm:ml-0 sm:ml-0 max-sm:w-full flex-col rounded-xl bg-base-100 flex shadow-xl overflow-hidden "
            : "text-xl max-sm:text-lg text-primary rounded-full btn btn-md btn-circle flex flex-row gap-1 mt-4 btn-ghost"
        }`}
        onClick={isPostClicked ? null : handlePost}
      >
        {isPostClicked ? (
          <>
            <div className="flex flex-row justify-between items-center w-full bg-base-200 text-base-100">
              <h1 className="text-2xl font-bold p-4 text-base-content">
                {"Add comment"}
              </h1>
              <IoMdClose
                className="text-3xl hover:text-error text-base-content cursor-pointer transition-colors duration-300 mr-4"
                onClick={handlePost}
              />
            </div>
            <div
              className={`flex ${isImageURLPresent ? `flex-row` : `flex-col`} max-sm:flex-col p-4 pr-10 pt-12 w-full gap-5 overflow-y-auto max-sm:overflow-y-auto md:overflow-hidden max-md:overflow-hidden`}
            >
              <div className="flex flex-col items-start gap-2 w-[50%] max-sm:w-full max-sm:animate-postAnim1">
                <div className="flex flex-row gap-2 items-center py-2">
                  <img
                    src={profilePic || pfp}
                    className="sm:w-10 sm:h-10 w-8 h-8 rounded-full object-cover cursor-pointer"
                    onClick={() => navigate(`/in/profile/${userId}`)}
                  />
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
                </div>
                <h2 className="text-xl font-bold text-left">{title}</h2>
                <p className="text-[16px] mt-2 text-left">{content}</p>
                {isImageURLPresent && (
                  <div
                    className="aspect-video flex justify-center w-full h-[500px] max-sm:h-full overflow-hidden rounded-xl"
                    onClick={handleImageClick}
                    style={{
                      backgroundImage: `url(${blurredImageUrl || imageURL})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    <img
                      src={imageURL}
                      alt="Post"
                      className="h-full rounded-none object-contain cursor-pointer "
                    />
                  </div>
                )}

                <p className="text-base text-base-content/70 mt-3">{date}</p>
                <div className="flex flex-row mt-4 items-center gap-2">
                  <button onClick={handleLike} className="btn btn-lg btn-ghost">
                    {isLiked ? (
                      <FaThumbsUp className="text-primary text-xl" />
                    ) : (
                      <FaRegThumbsUp className="text-primary text-xl" />
                    )}
                    <span>
                      {likes?.length || 0} {"likes"}
                    </span>
                  </button>
                  <button
                    onClick={handleDislike}
                    className="btn btn-lg btn-ghost"
                  >
                    {isDisliked ? (
                      <FaThumbsDown className="text-error text-xl" />
                    ) : (
                      <FaRegThumbsDown className="text-error text-xl" />
                    )}
                    <span>
                      {dislikes?.length || 0} {"dislikes"}
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col w-full max-sm:p-0 max-sm:bottom-0 max-sm:flex-col max-sm:w-full">
                <form
                  onSubmit={handleAddComment}
                  className="relative flex max-sm:flex-row items-left gap-6 max-sm:gap-2 w-[90%] max-sm:fixed max-sm:bottom-10 transition-all"
                >
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full p-2 max-sm:w-full max-sm:h-12 border rounded-lg bg-base-200 shadow-lg z-0"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 w-fit h-12 btn bg-primary text-base-100 shadow-lg hover:text-primary hover:bg-base-100 ease-in-out duration-300 rounded-md"
                    disabled={!newComment.trim()}
                  >
                    <IoSend />
                  </button>
                </form>
                <h3 className="text-lg font-bold mt-3 text-left max-sm:animate-postAnim1">
                  Comments: {commentCount}
                </h3>
                <div className="comments-section my-3 flex flex-col items-start pb-11 max-sm:max-w-[100vh] max-sm:overflow-x-hidden overflow-y-auto">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-base-200 w-fit my-4 p-3 rounded-md shadow-lg"
                    >
                      <div className="flex justify-between gap-7">
                        <p className="text-sm font-semibold">
                          {comment.userHandle}
                        </p>
                        <div className="flex flex-row gap-2">
                          <p className="text-xs text-base-content/70">
                            {comment.createdAt?.toDate().toLocaleDateString()}
                          </p>
                          {comment.userId == user.id && (
                            <button
                              className="text-sm self-start"
                              onClick={() => confirmDeleteBox(comment.id)}
                            >
                              <IoTrashBin />
                            </button>
                          )}
                        </div>
                      </div>
                      {confirmDelete && commentToDelete === comment.id && (
                        <>
                          <div
                            className="fixed z-20 bg-black opacity-30 w-full h-full left-0 top-0"
                            onClick={confirmDeleteBox}
                          />
                          <div className="fixed bg-base-200 flex gap-4 justify-between items-center z-30 flex-col w-3/5 max-sm:w-4/5 h-fit left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-7 rounded-xl bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-10 border-2 border-base-content/30">
                            <button
                              className="text-lg p-2 absolute top-5 rounded-full bg-error text-base-100 hover:bg-base-300 hover:text-error transition-colors duration-200 self-end mb-5"
                              onClick={confirmDeleteBox}
                            >
                              <IoMdClose />
                            </button>
                            <h3 className="text-2xl font-semibold mb-2">
                              {"Delete Comment?"}
                            </h3>
                            <p className="mb-4 text-center">
                              {"This action cannot be undone"}
                            </p>
                            <div className="flex flex-row gap-5">
                              <button
                                className="btn-error btn rounded-xl text-xl"
                                onClick={handleDeletePComment}
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
                      <p className="text-base-content my-2 text-left">
                        {comment.content}
                      </p>
                      <button
                        className="text-sm"
                        onClick={() => {
                          handleCommentTag(comment.userHandle);
                        }}
                      >
                        <BiCommentDetail />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <BiCommentDetail />
            {commentCount}
          </>
        )}
      </div>
      {isPostClicked && (
        <div
          className="h-full w-full justify-center items-center flex bg-black bg-opacity-50 transition-colors duration-200 fixed z-20 top-0 left-0"
          onClick={handlePost}
        ></div>
      )}
    </>
  );
};

export default CommentDisplay;
