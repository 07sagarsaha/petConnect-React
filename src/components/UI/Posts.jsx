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
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  runTransaction,
} from "firebase/firestore";
import { IoMdClose } from "react-icons/io";
import { BiCommentDetail } from "react-icons/bi";
import CommentDisplay from "../Comments";
import pfp from "../../icons/pfp.png";

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
}) => {
  const severityEmojis = {
    1: "😃 (very good)", // Very happy
    2: "🙂 (good)", // Happy
    3: "😐 (neutral)", // Neutral
    4: "😨 (not good)", // Worried
    5: "😭 (contact vet)", // Sad
  };

  const isLiked = likes?.includes(auth.currentUser?.uid);
  const isDisliked = dislikes?.includes(auth.currentUser?.uid);
  const [isPostClicked, setIsPostClicked] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [isImageClicked, setIsImageClicked] = useState(false);

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
            const commentsRef = collection(db, 'posts', id, 'comments');
            const q = query(commentsRef, orderBy('createdAt', 'desc'));
            
            const unsubscribe = onSnapshot(q, (snapshot) => {
              const commentsData = snapshot.docs.map(doc => ({
                id: doc.id,
              }));
              setCommentCount(snapshot.size);
            });
    
            return () => unsubscribe();
  }, [id]);

  /*const handleCommentLike = async () => {
      if (!auth.currentUser || !id || !comments.id) {
          console.log('Missing required data');
          return;
      }
  
      const commentRef = doc(db, 'posts', String(id), 'comments', String(comments.id));
      
      try {
          // Use a transaction to prevent race conditions
          await runTransaction(db, async (transaction) => {
              const commentDoc = await transaction.get(commentRef);
              
              if (!commentDoc.exists()) {
                  throw new Error('Comment does not exist!');
              }
  
              const commentData = commentDoc.data();
              const userId = auth.currentUser.uid;
              const likes = commentData.likes || [];
              const dislikes = commentData.dislikes || [];
  
              const newData = {};
  
              if (dislikes.includes(userId)) {
                  // If disliked, remove dislike and add like
                  newData.dislikes = dislikes.filter(id => id !== userId);
                  newData.likes = [...likes, userId];
              } else if (likes.includes(userId)) {
                  // If already liked, remove like
                  newData.likes = likes.filter(id => id !== userId);
              } else {
                  // If neither liked nor disliked, add like
                  newData.likes = [...likes, userId];
              }
  
              transaction.update(commentRef, newData);
          });
  
          // Update local state here if needed
          
      } catch (error) {
          console.error("Error updating comment like:", error);
          // Add user feedback here
          throw error; // Rethrow to handle in component
      }
    };
  
    const handleCommentDislike = async (commentId) => {
      if (!auth.currentUser || !id || !commentId) return; // Add extra validation
      
      const commentRef = doc(db, 'posts', id, 'comments', commentId);
      try {
        if (isCommentLiked) {
          await updateDoc(commentRef, {
            likes: arrayRemove(auth.currentUser.uid),
            dislikes: arrayUnion(auth.currentUser.uid)
          });
        } else {
          await updateDoc(commentRef, {
            dislikes: isCommentLiked ? arrayRemove(auth.currentUser.uid) : arrayUnion(auth.currentUser.uid)
          });
        }
      } catch (error) {
        console.error("Error updating comment dislike:", error);
      }
    };*/

    const handleImageClick = () => {
      setIsImageClicked(!isImageClicked);
    }

  const handlePost = () => {
    setIsPostClicked(!isPostClicked);
  };
  

  return (
    <>
      {(isImageClicked && imageUrl) && <>
            <div className="h-full w-full left-0 justify-center items-center flex fixed top-0 z-40 bg-[#4f4f4fcd] transition-colors duration-200">
              <IoMdClose
                  className="text-5xl fixed z-50 p-2 right-[5%] top-16 rounded-lg hover:text-red-600 transition-all duration-300"
                  onClick={handleImageClick}
              />
              <img src={imageUrl} alt="Image" className="h-4/5 max-sm:w-[auto w-max m-12 object-contain rounded-2xl shadow-Uni"/>
            </div>
        </>}
      <div
        key={id}
        className="text-lg sm:text-xl bg-[#e0e0e0] max-sm:ml-1 relative p-3 m-4 sm:p-6 sm:m-8 flex-col justify-center items-center shadow-[6px_6px_16px_#9d9d9d,-6px_-6px_16px_#ffffff] h-max sm:min-h-12 w-[100%] max-sm:w-[95%] rounded-2xl animate-postAnim3 transition-all ease-in-out duration-200"
      >
        <div className="flex flex-row gap-2 items-center">
          <img
            src={profilePic || pfp}
            alt="profile pic"
            className="sm:w-10 sm:h-10 w-8 h-8 rounded-full "
          />
          <p className="text-[18px] sm:top-0 max-sm:text-[15px] text-gray-500">
            {handle} posted:
          </p>
        </div>
        <p className="max-sm:text-sm text-[15px] text-gray-500 max-sm:relative absolute sm:right-0 top-0 sm:p-4">
          {date}
        </p>
        <h1 className="text-[19px] sm:text-[21px] font-bold py-4">{title}</h1>
        <h2 className="text-[16px] sm:text-[19px] text-gray-700 font-semibold">
          {content}
        </h2>
        {imageUrl && (
          <img src={imageUrl} alt="Post" className="w-[60%] max-sm:w-[80%] h-auto rounded-xl hover:shadow-Uni transition-all ease duration-300" onClick={handleImageClick}/>
        )}
        <div className="pt-2 flex justify-between">
          {sevVal && (
            <h2 className="text-[14px] sm:text-[17px] text-gray-700 py-4">
              Severity Index: {severityEmojis[sevVal]}
            </h2>
          )}

          <div className="flex justify-end gap-7">
            <div>
              <button
                className="text-xl text-[#da80ea] shadow-[4px_4px_11px_#9d9d9d,-4px_-4px_11px_#ffffff] rounded-full flex-row"
                onClick={handlePost}
              >
                <BiCommentDetail />
              </button>
              <p>{commentCount || 0}</p>
            </div>
            <div>
              <button
                className="text-xl text-pink-400 shadow-[4px_4px_11px_#9d9d9d,-4px_-4px_11px_#ffffff] rounded-full flex-row"
                onClick={handleLike}
              >
                {isLiked ? <FaThumbsUp /> : <FaRegThumbsUp />}
              </button>
              <p>{likes?.length || 0}</p>
            </div>
            <div>
              <button
                className="text-xl text-[#da80ea] shadow-[4px_4px_11px_#9d9d9d,-4px_-4px_11px_#ffffff] rounded-full flex-row"
                onClick={handleDislike}
              >
                {isDisliked ? <FaThumbsDown /> : <FaRegThumbsDown />}
              </button>
              <p>{dislikes?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {isPostClicked && (
        <>
          <div className="">
            {
              <IoMdClose
                className="text-5xl fixed z-50 p-2 right-[10%] top-32 rounded-lg hover:text-red-600 transition-all duration-300"
                onClick={handlePost}
              />
            }
            <CommentDisplay
              postID={id}
              handle={handle}
              date={date}
              title={title}
              content={content}
              likes={likes}
              dislikes={dislikes}
            />
          </div>
        </>
      )}
    </>
  );
};

export default Posts;
