import React, { useEffect, useState } from "react";
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
} from "firebase/firestore";
import { IoMdClose } from "react-icons/io";
import { BiCommentDetail } from "react-icons/bi";
import { auth, db } from "../firebase/firebase";
import { IoSend } from "react-icons/io5";

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

  const handlePost = () => {
    setIsPostClicked(!isPostClicked);
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

    const postRef = doc(db, "posts", postID);
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

  const isImageURLPresent = !!imageURL;

  return (
    <>
      <div
        className={`transition-all duration-[0.625s] ease-in-out rounded-xl ${
          isPostClicked
            ? "h-4/5 w-full top-1/2  max-sm:h-full max-sm:rounded-none  max-sm:w-full flex-col justify-center rounded-xl bg-base-100 flex shadow-xl overflow-hidden "
            : "h-5 w-5 text-xl text-primary flex-row flex items-center justify-center"
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
              <div className="flex flex-row max-sm:flex-col p-4 pr-10 pt-12 w-full gap-5 overflow-y-auto">
                <div className="flex flex-col items-start gap-2 w-[50%] max-sm:w-full">
                  <span className="text-left"> {handle} posted:</span>
                  <h2 className="text-xl font-bold text-left">{title}</h2>
                  <p className="text-[16px] mt-2 text-left">{content}</p>
                  <div className="aspect-video w-full h-full max-sm:w-[90%] relative overflow-hidden rounded-xl">
                    <img
                      src={imageURL}
                      alt="Post"
                      className="absolute w-full h-full rounded-xl object-cover"
                    />
                  </div>
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
                <div className="flex flex-col w-[100%] max-sm:p-0 max-sm:bottom-0 max-sm:flex-col p-10">
                  <form
                    onSubmit={handleAddComment}
                    className="relative flex max-sm:flex-row items-left gap-6 max-sm:gap-2 w-[90%] max-sm:absolute max-sm:bottom-5"
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
                  <div className="comments-section my-3 flex flex-col items-start max-sm:max-w-[100vh] max-sm:overflow-x-hidden overflow-y-auto">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-base-200 w-fit my-4 p-3 rounded-md shadow-lg"
                      >
                        <div className="flex justify-between gap-7">
                          <p className="text-sm font-semibold">
                            {comment.userHandle}
                          </p>
                          <p className="text-xs text-gray-500">
                            {comment.createdAt?.toDate().toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-gray-700 my-2 text-left">
                          {comment.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col p-4 pr-8 pt-12 w-[100%] overflow-auto">
                <span className="text-left"> {handle} posted:</span>
                <h2 className="text-xl font-bold text-left">{title}</h2>
                <p className="text-[16px] mt-2 text-left">{content}</p>
                <div className="flex flex-col pt-5">
                  <form
                    onSubmit={handleAddComment}
                    className="relative flex max-sm:flex-row items-left gap-6 max-sm:gap-2 w-[90%] max-sm:absolute max-sm:bottom-5"
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
                          <p className="text-xs text-gray-500">
                            {comment.createdAt?.toDate().toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-gray-700 my-2 text-left">
                          {comment.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <BiCommentDetail />
        )}
      </div>
      {isPostClicked && (
        <div
          className="h-full w-full left-0 justify-center items-center flex fixed top-0 z-40 bg-neutral-focus transition-colors duration-200"
          onClick={handlePost}
        ></div>
      )}
    </>
  );
};

export default CommentDisplay;
