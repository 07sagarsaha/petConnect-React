import React, { useEffect, useState } from 'react'
import { FaRegThumbsUp, FaThumbsUp } from 'react-icons/fa6';
import { auth, db } from '../../firebase/firebase';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';

const Posts = ({id, handle, title, content, sevVal, date, width, likes = []}) => {
    const severityEmojis = {
        1: '😃 (very good)', // Very happy
        2: '🙂 (good)', // Happy
        3: '😐 (neutral)', // Neutral
        4: '😨 (not good)', // Worried
        5: '😭 (contact vet)', // Sad
    };

    const isLiked = likes.includes(auth.currentUser?.uid);

    const handleLike = async() => {
      if(!auth.currentUser) return;

      const postRef = doc(db, 'posts', id);
      try{
        await updateDoc(postRef, {
          likes: isLiked
          ? arrayRemove(auth.currentUser.uid)
          : arrayUnion(auth.currentUser.uid)
        });
      }
      catch(error){
        console.error("Error updating likes: ", error);
      }
    }; 

  return (
    <>
<<<<<<< HEAD
    <div key={keyVal} className={`text-xl relative p-6 m-8 flex-col justify-center items-center shadow-[6px_6px_16px_#9d9d9d,-6px_-6px_16px_#ffffff] h-max min-h-12 w-[${width}] rounded-2xl animate-postAnim3 transition-all ease-in-out duration-200`}>
=======
    <div key={id} className={`text-xl bg-[#e0e0e0] relative p-6 m-8 flex-col justify-center items-center shadow-[6px_6px_16px_#9d9d9d,-6px_-6px_16px_#ffffff] h-max min-h-12 w-[${width}] rounded-2xl animate-postAnim3 transition-all ease-in-out duration-200`}>
>>>>>>> b35eb9a6e859b7e92429b27ad26f8e736f018404
        <p className='text-lg text-gray-500'>{handle} posted:</p>
        <h1 className='text-xl font-bold py-4'>{title}</h1>
        <h2 className='text-lg font-semibold'>{content}</h2>
        {(sevVal) && <h2 className='text-lg py-4'>Severity Index: {severityEmojis[sevVal]}</h2>}
        {(sevVal) && <input type="range" min={1} max={5} value={sevVal} onChange={null} className='rounded-lg'></input>}
        <p className='text-sm text-gray-500 absolute top-0 right-0 p-4'>{date}</p>
        <div className='pt-2 flex-row justify-start'>
          <button className='text-xl text-gray-500 rounded-full flex-row' onClick={handleLike}>{isLiked? <FaThumbsUp/> : <FaRegThumbsUp/>}</button>
          <p>{likes?.length || 0}</p>
        </div>
    </div>
    </>
  )
}

export default Posts