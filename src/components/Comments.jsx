import React, { useEffect, useRef, useState } from "react";
import {
  FaRegThumbsDown,
  FaRegThumbsUp,
  FaThumbsDown,
  FaThumbsUp,
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
import { auth, db } from "../firebase/firebase";
import { IoSend, IoTrashBin } from "react-icons/io5";
import { useToast } from "../context/ToastContext";

const CommentDisplay = ({
  postID,
  handle,
  date,
  title,
  content,
  likes = [],
  dislikes = [],
  imageURL = false,
}) => {
  const isLiked = likes?.includes(auth.currentUser?.uid);
  const isDisliked = dislikes?.includes(auth.currentUser?.uid);
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
  const { showToast } = useToast();

  const handlePost = () => {
    setIsPostClicked(!isPostClicked);
    setIsImageClicked(false);
    setImageMaxZoom(false);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !auth.currentUser) return;

    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
    const userData = userDoc.exists() ? userDoc.data() : { handle: "Unknown" };

    try {
      const commentsRef = collection(db, "posts", postID, "comments");
      await addDoc(commentsRef, {
        content: newComment,
        userId: auth.currentUser.uid,
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
    if (!auth.currentUser) return;

    const postRef = doc(db, "posts", postID);
    try {
      if (isDisliked) {
        await updateDoc(postRef, {
          dislikes: arrayRemove(auth.currentUser.uid),
          likes: arrayUnion(auth.currentUser.uid),
        });
        showToast("You liked the post and removed your dislike.");
      } else {
        await updateDoc(postRef, {
          likes: isLiked
            ? arrayRemove(auth.currentUser.uid)
            : arrayUnion(auth.currentUser.uid),
        });
        showToast(isLiked ? "You unliked the post." : "You liked the post.");
      }
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const handleDislike = async () => {
    if (!auth.currentUser) return;

    const postRef = doc(db, "posts", postID);
    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(auth.currentUser.uid),
          dislikes: arrayUnion(auth.currentUser.uid),
        });
        showToast("You disliked the post and removed your like.");
      } else {
        await updateDoc(postRef, {
          dislikes: isDisliked
            ? arrayRemove(auth.currentUser.uid)
            : arrayUnion(auth.currentUser.uid),
        });
        showToast(isDisliked ? "You removed your dislike." : "You disliked the post.");
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
  }

  const handleImageZoom = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTransformOrigin(`${x}% ${y}%`);
    setImageMaxZoom(!maxImageZoom);
  }

  const isImageURLPresent = !!imageURL;

  return (
    <>
      <div
        className={`transition-all max-sm:transition-none duration-[0.625s] ease-in-out rounded-xl ${
          isPostClicked
            ? "h-4/5 w-3/5 top-1/2 fixed z-50 transform -translate-x-1/2 -translate-y-1/2 left-1/2 max-sm:h-full max-sm:rounded-none  max-sm:w-full flex-col rounded-xl bg-base-100 flex shadow-xl overflow-hidden "
            : "h-5 w-5 text-xl text-primary flex-row flex gap-2 justify-center"
        }`}
        onClick={isPostClicked ? null : handlePost}
      >
        {isPostClicked ? (
          <>
            <div className="flex flex-row justify-between items-center w-full bg-primary text-base-100">
              <h1 className="text-2xl font-bold p-4">Add comment</h1>
              <IoMdClose
                className="text-3xl hover:text-error transition-colors duration-300 mr-4"
                onClick={handlePost}
              />
            </div>
            {isImageURLPresent ? (
              <div className="flex flex-row max-sm:flex-col p-4 pr-10 pt-12 w-full gap-5 overflow-y-auto max-sm:animate-postAnim1">
                <div className="flex flex-col items-start gap-2 w-[50%] max-sm:w-full">
                  <span className="text-left"> {handle} posted:</span>
                  <h2 className="text-xl font-bold text-left">{title}</h2>
                  <p className="text-[16px] mt-2 text-left">{content}</p>
                  <div className="aspect-square w-full h-full max-sm:w-[90%] relative overflow-hidden rounded-xl" onClick={handleImageClick}>
                    <img
                      src={imageURL}
                      alt="Post"
                      className="absolute w-full h-full rounded-xl object-cover"
                    />
                  </div>
                  {isImageClicked && imageURL && (
                            <>
                              <div className="fixed top-0 left-0 z-50 w-full h-full bg-black bg-opacity-50 flex justify-center items-center" onClick={handleImageClick}/>
                              <div className={`fixed z-50 justify-center items-center ${maxImageZoom ? "w-full h-full cursor-zoom-out overflow-auto" : "w-fit h-4/5 max-sm:w-full max-sm:h-fit flex cursor-zoom-in"} top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}>
                                <img src={imageURL} alt="Post" className="w-full h-full object-cover rounded-xl max-sm:rounded-none" onClick={handleImageZoom} style={{ transformOrigin }}/>
                              </div>
                              <IoMdClose className="fixed z-50 bg-base-100 top-8 right-8 text-5xl max-sm:text-4xl max-sm:top-4 max-sm:right-4 rounded-lg cursor-pointer" onClick={handleImageClick} />
                            </>
                  )}
                  <p className="text-base text-gray-600 mt-3">{date}</p>
                  <div className="flex flex-row mt-4 items-center gap-4">
                    <button onClick={handleLike}>
                      {isLiked ? (
                        <FaThumbsUp className="text-primary" />
                      ) : (
                        <FaRegThumbsUp className="text-primary" />
                      )}
                    </button>
                    <span>{likes?.length || 0} likes</span>
                    <button onClick={handleDislike}>
                      {isDisliked ? (
                        <FaThumbsDown className="text-error" />
                      ) : (
                        <FaRegThumbsDown className="text-error" />
                      )}
                    </button>
                    <span>{dislikes?.length || 0} dislikes</span>
                  </div>
                </div>
                <div className="flex flex-col w-[100%] max-sm:p-0 max-sm:bottom-0 max-sm:flex-col p-10 max-sm:mb-20">
                  <form
                    onSubmit={handleAddComment}
                    className="relative flex max-sm:flex-row items-left gap-6 max-sm:gap-2 w-[90%] max-sm:fixed max-sm:bottom-5 transition-all"
                  >
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full p-2 max-sm:w-full max-sm:h-12 border rounded-lg bg-base-200 shadow-lg z-0 max-sm:mb-20"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 w-fit h-12 bg-primary text-base-100 shadow-lg hover:text-primary hover:bg-base-100 ease-in-out duration-300 rounded-md"
                    >
                      <IoSend />
                    </button>
                  </form>
                  <h3 className="text-lg font-bold mt-3 text-left">
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
                            <p className="text-xs text-gray-500">
                              {comment.createdAt?.toDate().toLocaleDateString()}
                            </p>
                            {(comment.userId == auth.currentUser.uid) && <button className="text-sm self-start" onClick={() => confirmDeleteBox(comment.id)}><IoTrashBin /></button>}
                          </div>
                        </div>
                        {confirmDelete && commentToDelete === comment.id && (
                          <>
                            <div
                              className="fixed z-20 bg-black opacity-30 w-full h-full left-0 top-0"
                              onClick={confirmDeleteBox}
                            />
                            <div className="fixed bg-base-200 flex justify-center items-center z-30 flex-col w-3/5 max-sm:w-4/5 h-fit left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-7 rounded-xl">
                              <button
                                className="text-lg p-2 rounded-full bg-error text-base-100 hover:bg-base-300 hover:text-error transition-colors duration-200 self-end mb-5"
                                onClick={confirmDeleteBox}
                              >
                                <IoMdClose />
                              </button>
                              <h3 className="text-2xl font-semibold mb-2 -translate-y-10">
                                {"Delete Comment?"}
                              </h3>
                              <p className="mb-4">
                                {"This action cannot be undone"}
                              </p>
                              <div className="flex flex-row gap-5">
                                <button
                                  className="bg-error py-2 px-3 rounded-xl text-xl"
                                  onClick={handleDeletePComment}
                                >
                                  Yes
                                </button>
                                <button
                                  className="border-2 border-error py-2 px-3 rounded-xl text-xl"
                                  onClick={confirmDeleteBox}
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                        <p className="text-gray-700 my-2 text-left">
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
            ) : (
              <div className="flex flex-col p-4 pr-8 pt-12 w-[100%] overflow-auto animate-postAnim1">
                <span className="text-left"> {handle} posted:</span>
                <h2 className="text-xl font-bold text-left">{title}</h2>
                <p className="text-[16px] mt-2 text-left">{content}</p>
                <div className="flex flex-row mt-4 items-center gap-4">
                  <button onClick={handleLike}>
                    {isLiked ? (
                      <FaThumbsUp className="text-primary" />
                    ) : (
                      <FaRegThumbsUp className="text-primary" />
                    )}
                  </button>
                  <span>{likes?.length || 0} likes</span>
                  <button onClick={handleDislike}>
                    {isDisliked ? (
                      <FaThumbsDown className="text-error" />
                    ) : (
                      <FaRegThumbsDown className="text-error" />
                    )}
                  </button>
                  <span>{dislikes?.length || 0} dislikes</span>
                </div>
                <div className="flex flex-col pt-5">
                  <form
                    onSubmit={handleAddComment}
                    className="relative flex max-sm:flex-row items-left gap-6 max-sm:gap-2 w-[90%] max-sm:absolute max-sm:bottom-5 max-sm:mb-20"
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
                      className="px-4 py-2 w-fit h-12 bg-primary text-base-100 shadow-lg hover:text-primary hover:bg-base-100 ease-in-out duration-300 rounded-md"
                    >
                      <IoSend />
                    </button>
                  </form>
                  <h3 className="text-lg font-bold mt-3 text-left">
                    Comments: {commentCount}
                  </h3>
                  <div className="comments-section my-3 flex flex-col items-start overflow-y-auto">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-base-200 w-fit max-sm:w-full my-4 p-3 rounded-md shadow-lg"
                      >
                        <div className="flex justify-between gap-7">
                          <p className="text-sm font-semibold">
                            {comment.userHandle}
                          </p>
                          <div className="flex flex-row gap-2">
                            <p className="text-xs text-gray-500">
                              {comment.createdAt?.toDate().toLocaleDateString()}
                            </p>
                            {(comment.userId == auth.currentUser.uid) && <button className="text-sm self-start" onClick={() => confirmDeleteBox(comment.id)}><IoTrashBin /></button>}
                          </div>
                        </div>
                        {confirmDelete && commentToDelete === comment.id && (
                          <>
                            <div
                              className="fixed z-20 bg-black opacity-30 w-full h-full left-0 top-0"
                              onClick={confirmDeleteBox}
                            />
                            <div className="fixed bg-base-200 flex justify-center items-center z-30 flex-col w-3/5 max-sm:w-4/5 h-fit left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-7 rounded-xl">
                              <button
                                className="text-lg p-2 rounded-full bg-error text-base-100 hover:bg-base-300 hover:text-error transition-colors duration-200 self-end mb-5"
                                onClick={confirmDeleteBox}
                              >
                                <IoMdClose />
                              </button>
                              <h3 className="text-2xl font-semibold mb-2 -translate-y-10">
                                {"Delete Comment?"}
                              </h3>
                              <p className="mb-4">
                                {"This action cannot be undone"}
                              </p>
                              <div className="flex flex-row gap-5">
                                <button
                                  className="bg-error py-2 px-3 rounded-xl text-xl"
                                  onClick={handleDeletePComment}
                                >
                                  Yes
                                </button>
                                <button
                                  className="border-2 border-error py-2 px-3 rounded-xl text-xl"
                                  onClick={confirmDeleteBox}
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                        <p className="text-gray-700 my-2 text-left">
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
            )}
          </>
        ) : (
          <div>
            <BiCommentDetail />
            <p className="pt-1">{commentCount}</p>
          </div>
        )}
      </div>
      {isPostClicked && (
        <div
          className="h-full w-full justify-center items-center flex bg-black bg-opacity-50 transition-colors duration-200 fixed z-40 top-0 left-0"
          onClick={handlePost}
        ></div>
      )}
    </>
  );
};

export default CommentDisplay;