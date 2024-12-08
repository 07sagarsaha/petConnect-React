import React, { useEffect, useState } from 'react'
import { FaRegThumbsDown, FaRegThumbsUp, FaThumbsDown, FaThumbsUp } from 'react-icons/fa6';
import { auth, db } from '../../firebase/firebase';
import { arrayRemove, arrayUnion, doc, updateDoc, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, getDoc } from 'firebase/firestore';
import { IoMdClose } from 'react-icons/io';
import { BiCommentDetail } from 'react-icons/bi';

const Posts = ({id, handle, title, content, sevVal, date, likes = [], dislikes = []}) => {
    const severityEmojis = {
        1: '😃 (very good)', // Very happy
        2: '🙂 (good)', // Happy
        3: '😐 (neutral)', // Neutral
        4: '😨 (not good)', // Worried
        5: '😭 (contact vet)', // Sad
    };

    const isLiked = likes?.includes(auth.currentUser?.uid);
    const isDisliked = dislikes?.includes(auth.currentUser?.uid);
    const [commentLikes, setCommentLikes] = useState({});
    const [commentDislikes, setCommentDislikes] = useState({});    
    const [isPostClicked, setIsPostClicked] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState([]);
    const [commentCount, setCommentCount] = useState(0);

    useEffect(() => {
      const commentsRef = collection(db, 'posts', id, 'comments');
      const q = query(commentsRef);
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setCommentCount(snapshot.size);
      });
    
      return () => unsubscribe();
    }, [id]);

    useEffect(() => {
      if (isPostClicked) {
        const commentsRef = collection(db, 'posts', id, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const commentsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setComments(commentsData);
        });

        return () => unsubscribe();
      }
    }, [isPostClicked, id]);

    const isCommentLiked = commentLikes[comments.id]?.includes(auth.currentUser?.uid);
    const isCommentDisliked = commentDislikes[comments.id]?.includes(auth.currentUser?.uid);

    const handleLike = async () => {
      if (!auth.currentUser) return;
      
      const postRef = doc(db, 'posts', id);
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
      
      const postRef = doc(db, 'posts', id);
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

    const handleCommentLike = async (commentId) => {
      if (!auth.currentUser || !id || !commentId) return; // Add extra validation
      
      const commentRef = doc(db, 'posts', String(id), 'comments', String(commentId));
      try {
        if (isCommentDisliked) {
          await updateDoc(commentRef, {
            dislikes: arrayRemove(auth.currentUser.uid),
            likes: arrayUnion(auth.currentUser.uid)
          });
        } else {
          await updateDoc(commentRef, {
            likes: isCommentLiked ? arrayRemove(auth.currentUser.uid) : arrayUnion(auth.currentUser.uid)
          });
        }
      } catch (error) {
        console.error("Error updating comment like:", error);
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
    };

    const handlePost = () => {
      setIsPostClicked(!isPostClicked);
    };

    const handleAddComment = async (e) => {
      e.preventDefault();
      if (!newComment.trim() || !auth.currentUser) return;

      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : { handle: 'Unknown' };
  
      try {
        const commentsRef = collection(db, 'posts', id, 'comments');
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

  return (
    <>
      <div key={id} className="text-lg sm:text-xl bg-[#e0e0e0] relative p-3 m-4 sm:p-6 sm:m-8 flex-col justify-center items-center shadow-[6px_6px_16px_#9d9d9d,-6px_-6px_16px_#ffffff] h-max sm:min-h-12 w-fit sm:w-[100%] rounded-2xl animate-postAnim3 transition-all ease-in-out duration-200">
        <p className='sm:text-sm sm:text-gray-500 sm:absolute sm:top-0 sm:right-0 sm:p-4'>{date}</p>
        <p className='text-[12px] sm:text-[15px] text-gray-500'>{handle} posted:</p>
        <h1 className='text-[19px] sm:text-[21px] font-bold py-4'>{title}</h1>
        <h2 className='text-[16px] sm:text-[19px] text-gray-700 font-semibold'>{content}</h2>
        <div className='pt-2 flex justify-between'>
          {sevVal && <h2 className='text-[14px] sm:text-[17px] text-gray-700 py-4'>Severity Index: {severityEmojis[sevVal]}</h2>}
          <div className='flex justify-end gap-7'>
            <div>
              <button className='text-xl text-[#da80ea] shadow-[4px_4px_11px_#9d9d9d,-4px_-4px_11px_#ffffff] rounded-full flex-row' onClick={handlePost}><BiCommentDetail /></button>
              <p>{(commentCount) || 0}</p> 
            </div>
            <div>
              <button className='text-xl text-pink-400 shadow-[4px_4px_11px_#9d9d9d,-4px_-4px_11px_#ffffff] rounded-full flex-row' onClick={handleLike}>{isLiked ? <FaThumbsUp/> : <FaRegThumbsUp/>}</button>
              <p>{likes?.length || 0}</p>
            </div>
            <div>
              <button className='text-xl text-[#da80ea] shadow-[4px_4px_11px_#9d9d9d,-4px_-4px_11px_#ffffff] rounded-full flex-row' onClick={handleDislike}>{isDisliked ? <FaThumbsDown/> : <FaRegThumbsDown/>}</button>
              <p>{dislikes?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>
      
      {isPostClicked && (
        <div className='h-screen w-[89.4%] justify-center items-center flex fixed top-0 z-40 bg-[#808080ab]'>
          <div className='h-4/5 w-4/5 rounded-xl bg-[#e0e0e0] flex flex-col shadow-xl overflow-hidden'>
            <button className='flex justify-end p-2 rounded-lg hover:text-red-600 transition-all duration-300' onClick={handlePost}>
              <IoMdClose className='text-2xl'/>
            </button>

            {/*<h1 className='text-2xl flex mt-3 justify-center'>Post</h1>*/}

            <div className="pt-6 pb-6 ml-[5%] rounded-lg max-w-screen-2xl w-full max-h-[90vh]">
                <div className="text-sm text-gray-600">
                  <span>{handle} posted on</span>
                  <span className="ml-2">{date}:</span>
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

            <form onSubmit={handleAddComment} className="relative left-[5%] flex items-center gap-6 w-1/2">
                <input type='text'
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-2 border rounded-lg bg-gradient-to-br from-[#cacaca] to-[#f0f0f0] shadow-[11px_11px_27px_#bebebe,-11px_-11px_27px_#ffffff] z-0"
                />
                <button type="submit" className=" px-4 py-2 bg-purple-400 text-white shadow-[4px_4px_11px_#9d9d9d,-4px_-4px_11px_#ffffff] hover:text-purple-400 hover:bg-[#e0e0e0] my-2 ease-in-out duration-300 rounded-md">
                  Comment
                </button>
            </form>
            <div className="comments-section mt-4 max-h-[40%] mx-[5%] overflow-y-auto">
              <div className="space-y-2 flex flex-col items-start ml-2 gap-5">
                <h3 className="text-lg font-bold my-2 mx-[5%]">Comments: {commentCount}</h3>
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-[#e0e0e0] w-fit my-4 p-3 rounded-md bg-gradient-to-br from-[#f0f0f0] to-[#cacaca] shadow-[3px_3px_7px_#bebebe,-3px_-3px_7px_#ffffff]">
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
                      <span>{comments.likes?.length || 0} likes</span>
                      <button onClick={handleCommentDislike}>
                        {isCommentDisliked ? <FaThumbsDown /> : <FaRegThumbsDown />}
                      </button>
                      <span>{comments.dislikes?.length || 0} dislikes</span>
                    </div>*/}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Posts;
