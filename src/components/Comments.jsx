import React, { useEffect, useState } from 'react'
import { FaRegThumbsDown, FaRegThumbsUp, FaThumbsDown, FaThumbsUp } from 'react-icons/fa6';
import { arrayRemove, arrayUnion, doc, updateDoc, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, getDoc, runTransaction } from 'firebase/firestore';
import { IoMdClose } from 'react-icons/io';
import { BiCommentDetail } from 'react-icons/bi';
import { auth, db } from '../firebase/firebase';

const CommentDisplay = ({postID, handle, date, title, content, likes = [], dislikes = []}) => {
    const isLiked = likes?.includes(auth.currentUser?.uid);
    const isDisliked = dislikes?.includes(auth.currentUser?.uid);
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState([]);
    const [commentCount, setCommentCount] = useState(0);
    const [isPostClicked, setIsPostClicked] = useState(false);

    const handlePost = () => {
        setIsPostClicked(!isPostClicked);
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !auth.currentUser) return;
    
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : { handle: 'Unknown' };
    
        try {
          const commentsRef = collection(db, 'posts', postID, 'comments');
          await addDoc(commentsRef, {
            content: newComment,
            userId: auth.currentUser.uid,
            userHandle: userData.handle,
            likes: [],
            dislikes: [],
            createdAt: serverTimestamp()
          });
          setNewComment('');
        } catch (error) {
          console.error('Error adding comment:', error);
        }
      };

      useEffect(() => {
          const commentsRef = collection(db, 'posts', postID, 'comments');
          const q = query(commentsRef, orderBy('createdAt', 'desc'));
          
          const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({
              id: doc.postID,
              ...doc.data()
            }));
            setComments(commentsData);
            setCommentCount(snapshot.size);
          });
  
          return () => unsubscribe();
      }, [postID]);

      const handleLike = async () => {
        if (!auth.currentUser) return;
        
        const postRef = doc(db, 'posts', postID);
        try {
          if (isDisliked) {
            await updateDoc(postRef, {
              dislikes: arrayRemove(auth.currentUser.uid),
              likes: arrayUnion(auth.currentUser.uid)
            });
          } else {
            await updateDoc(postRef, {
              likes: isLiked ? arrayRemove(auth.currentUser.uid) : arrayUnion(auth.currentUser.uid)
            });
          }
        } catch (error) {
          console.error("Error updating like:", error);
        }
      };

      const handleDislike = async () => {
        if (!auth.currentUser) return;
        
        const postRef = doc(db, 'posts', postID);
        try {
          if (isLiked) {
            await updateDoc(postRef, {
              likes: arrayRemove(auth.currentUser.uid),
              dislikes: arrayUnion(auth.currentUser.uid)
            });
          } else {
            await updateDoc(postRef, {
              dislikes: isDisliked ? arrayRemove(auth.currentUser.uid) : arrayUnion(auth.currentUser.uid)
            });
          }
        } catch (error) {
          console.error("Error updating dislike:", error);
        }
      };

    return (
        <><div className='h-full w-full left-0 justify-center items-center flex fixed top-0 z-40 bg-[#808080ab] transition-colors duration-200'>
            <div className='h-4/5 w-[90%] absolute rounded-xl bg-[#e0e0e0] flex flex-col shadow-xl overflow-hidden'>

                {/*<h1 className='text-2xl flex mt-3 justify-center'>Post</h1>*/}

                <div className="pt-6 pb-6 ml-[5%] rounded-lg max-w-screen-2xl w-full max-h-[90vh]">
                    <div className="text-sm px-1 text-gray-600">
                      <span>{handle} posted</span>
                      <span className="ml-2">on {date}:</span>
                    </div>
                    <h2 className="text-xl mt-3 font-bold overflow-x-auto max-w-[80%]">{title}</h2>
                    <p className='text-[15px] mt-2 overflow-x-auto max-w-[95%]'>{content}</p>

                    <div className="flex mt-4 items-center gap-4">
                    <button onClick={handleLike}>
                        {isLiked ? <FaThumbsUp className='text-pink-400'/> : <FaRegThumbsUp className='text-pink-400'/>}
                    </button>
                    <span>{likes?.length || 0} likes</span>
                    <button onClick={handleDislike}>
                        {isDisliked ? <FaThumbsDown className='text-[#da80ea]'/> : <FaRegThumbsDown className='text-[#da80ea]'/>}
                    </button>
                    <span>{dislikes?.length || 0} dislikes</span>
                    </div>
                </div>

                <form onSubmit={handleAddComment} className="relative left-[5%] flex max-sm:flex-col items-left gap-6 max-sm:gap-2 w-1/2">
                    <input type='text'
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full p-2 max-sm:w-[30vh] max-sm:h-12 border rounded-lg bg-gradient-to-br from-[#cacaca] to-[#f0f0f0] shadow-[11px_11px_27px_#bebebe,-11px_-11px_27px_#ffffff] z-0"
                    />
                    <button type="submit" className=" px-4 py-2 bg-purple-400 text-white shadow-[4px_4px_11px_#9d9d9d,-4px_-4px_11px_#ffffff] hover:text-purple-400 hover:bg-[#e0e0e0] my-2 ease-in-out duration-300 rounded-md">
                    Comment
                    </button>
                </form>
                <div className="comments-section mt-4 max-h-[40%] mx-[5%] max-sm:max-w-[100vh] max-sm:overflow-x-auto overflow-y-auto">
                <div className="space-y-2 flex flex-col items-start ml-2 gap-5">
                    <h3 className="text-lg font-bold my-2 mx-[5%]">Comments: {commentCount}</h3>
                    {comments.map((comment) => (
                    <div key={comment.id} className="bg-[#e0e0e0] w-full my-4 p-3 rounded-md bg-gradient-to-br from-[#f0f0f0] to-[#cacaca] shadow-[3px_3px_7px_#bebebe,-3px_-3px_7px_#ffffff]">
                        <div className='flex justify-between gap-7'>
                        <p className="text-sm font-semibold">{comment.userHandle}</p>
                        <p className="text-xs text-gray-500">
                        {comment.createdAt?.toDate().toLocaleDateString()}
                        </p>
                        </div>
                        <p className="text-gray-700 my-2">{comment.content}</p>
                        {/*<div className="flex mt-4 items-center gap-4">
                        <button onClick={handleCommentLike}>
                            {isCommentLiked ? <FaThumbsUp /> : <FaRegThumbsUp />}
                        </button>
                        <span>{comment.likes?.length || 0} likes</span>
                        <button onClick={handleCommentDislike}>
                            {isCommentDisliked ? <FaThumbsDown /> : <FaRegThumbsDown />}
                        </button>
                        <span>{comment.dislikes?.length || 0} dislikes</span>
                        </div>*/}
                    </div>
                    ))}
                </div>
                </div>
            </div>
        </div></>
  )
}

export default CommentDisplay