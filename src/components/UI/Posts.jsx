import React, { useEffect, useState } from 'react'
import { FaRegThumbsDown, FaRegThumbsUp, FaThumbsDown, FaThumbsUp } from 'react-icons/fa6';
import { auth, db } from '../../firebase/firebase';
import { arrayRemove, arrayUnion, doc, updateDoc, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
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
  
      try {
        const commentsRef = collection(db, 'posts', id, 'comments');
        await addDoc(commentsRef, {
          content: newComment,
          userId: auth.currentUser.uid,
          userHandle: auth.currentUser.displayName,
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
      <div key={id} className="text-xl bg-[#e0e0e0] relative p-6 m-8 flex-col justify-center items-center shadow-[6px_6px_16px_#9d9d9d,-6px_-6px_16px_#ffffff] h-max min-h-12 w-[100%] rounded-2xl animate-postAnim3 transition-all ease-in-out duration-200">
        <p className='text-sm text-gray-500 absolute top-0 right-0 p-4'>{date}</p>
        <p className='text-[15px] text-gray-500'>{handle} posted:</p>
        <h1 className='text-[21px] font-bold py-4'>{title}</h1>
        <h2 className='text-[19px] text-gray-700 font-semibold'>{content}</h2>
        <div className='pt-2 flex justify-between'>
          {sevVal && <h2 className='text-[17px] text-gray-700 py-4'>Severity Index: {severityEmojis[sevVal]}</h2>}
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
        <div className='h-screen w-[89.4%] justify-center items-center flex fixed top-0 z-40 bg-[#6262622b]'>
          <div className='h-3/4 w-3/4 rounded-lg bg-[#e0e0e0] shadow-Uni'>
            <button className='absolute top-0 right-0 p-2 m-16 rounded-lg hover:text-red-600 transition-all duration-300' onClick={handlePost}>
              <IoMdClose className='text-3xl'/>
            </button>

            <h1 className='text-3xl flex mt-3 justify-center'>Post</h1>

            <div className="pt-6 pb-6 ml-[5%] rounded-lg max-w-screen-2xl w-full max-h-[90vh]">
                <div className="text-lg text-gray-600">
                  <span>{handle} posted on</span>
                  <span className="ml-2">{date}:</span>
                </div>
                <h2 className="text-2xl mt-3 font-bold overflow-x-auto max-w-[80%]">{title}</h2>
                <p className='text-lg mt-2 overflow-x-auto max-w-[80%]'>{content}</p>

                <div className="flex mt-4 items-center gap-4">
                  <button onClick={handleLike}>
                    {isLiked ? <FaThumbsUp /> : <FaRegThumbsUp />}
                  </button>
                  <span>{likes?.length || 0} likes</span>
                  <button onClick={handleDislike}>
                    {isDisliked ? <FaThumbsDown /> : <FaRegThumbsDown />}
                  </button>
                  <span>{dislikes?.length || 0} dislikes</span>
                </div>
            </div>

            <form onSubmit={handleAddComment} className="relative left-[5%] flex gap-6 w-1/2">
                <input type='text'
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-2 border rounded"
                />
                <button type="submit" className="mt-2 px-4 py-2 bg-purple-400 text-white rounded">
                  Comment
                </button>
            </form>
            <h3 className="text-lg font-bold my-2 mx-[5%]">Comments: {commentCount}</h3>
            <div className="comments-section mt-4 max-h-[300px] mx-[5%] overflow-y-auto">
              <div className="space-y-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-semibold">{comment.userHandle}</p>
                    <p className="text-gray-700">{comment.content}</p>
                    <p className="text-xs text-gray-500">
                      {comment.createdAt?.toDate().toLocaleDateString()}
                    </p>
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
