import React, { useEffect, useState } from 'react'
import { FaRegThumbsDown, FaRegThumbsUp, FaThumbsDown, FaThumbsUp } from 'react-icons/fa6';
import { auth, db } from '../../firebase/firebase';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';

const Posts = ({id, handle, title, content, sevVal, date, likes = [], dislikes = []}) => {
    const severityEmojis = {
        1: '😃 (very good)', // Very happy
        2: '🙂 (good)', // Happy
        3: '😐 (neutral)', // Neutral
        4: '😨 (not good)', // Worried
        5: '😭 (contact vet)', // Sad
    };

    const isLiked = likes.includes(auth.currentUser?.uid);
    const isDisliked = dislikes.includes(auth.currentUser?.uid);

    const handleLike = async () => {
      if (!auth.currentUser) return;
      
      const postRef = doc(db, 'posts', id);
      try {
        if (isDisliked) {
          // If post is disliked, remove dislike first
          await updateDoc(postRef, {
            dislikes: arrayRemove(auth.currentUser.uid),
            likes: arrayUnion(auth.currentUser.uid)
          });
        } else {
          // Toggle like state
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
          // If post is liked, remove like first
          await updateDoc(postRef, {
            likes: arrayRemove(auth.currentUser.uid),
            dislikes: arrayUnion(auth.currentUser.uid)
          });
        } else {
          // Toggle dislike state
          await updateDoc(postRef, {
            dislikes: isDisliked ? arrayRemove(auth.currentUser.uid) : arrayUnion(auth.currentUser.uid)
          });
        }
      } catch (error) {
        console.error("Error updating dislike:", error);
      }
    };

  return (
    <>
    <div key={id} className={`text-xl bg-[#e0e0e0] relative p-6 m-8 flex-col justify-center items-center shadow-[6px_6px_16px_#9d9d9d,-6px_-6px_16px_#ffffff] h-max min-h-12 w-[100%] rounded-2xl animate-postAnim3 transition-all ease-in-out duration-200`}>
    <p className='text-sm text-gray-500 absolute top-0 right-0 p-4'>{date}</p>
        <p className='text-[15px] text-gray-500'>{handle} posted:</p>
        <h1 className='text-[21px] font-bold py-4'>{title}</h1>
        <h2 className='text-[19px] text-gray-700 font-semibold'>{content}</h2>
        <div className='pt-2 flex justify-between'>
        {(sevVal) && <h2 className='text-[17px] text-gray-700 py-4'>Severity Index: {severityEmojis[sevVal]}</h2>}
          <div className='flex justify-end gap-7'>
          <div>
          {{likes} && <button className='text-xl text-pink-400 shadow-[4px_4px_11px_#9d9d9d,-4px_-4px_11px_#ffffff] rounded-full flex-row' onClick={handleLike}>{isLiked? <FaThumbsUp/> : <FaRegThumbsUp/>}</button>}
          <p>{{likes} && likes?.length || 0}</p>
          </div>
          <div>
          {{dislikes} && <button className='text-xl text-[#da80ea] shadow-[4px_4px_11px_#9d9d9d,-4px_-4px_11px_#ffffff] rounded-full flex-row' onClick={handleDislike}>{isDisliked? <FaThumbsDown/> : <FaRegThumbsDown/>}</button>}
          <p>{{dislikes} && dislikes?.length || 0}</p>
          </div>
          </div>
        </div>
    </div>
    </>
  )
}

export default Posts