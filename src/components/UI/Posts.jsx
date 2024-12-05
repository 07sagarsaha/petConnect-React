import React, { useEffect, useState } from 'react'
import { db } from '../../firebase/firebase'
import { collection, getDocs, orderBy, query, getDoc, doc, limit, onSnapshot } from 'firebase/firestore';
import { format } from 'date-fns';

const Posts = () => {
    const [post, setPost] = useState([]);
    useEffect(() => {
        const q = query(
            collection(db, 'posts'), 
            orderBy('createdAt', 'desc')
        );
        
        // Create real-time listener
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const postData = await Promise.all(snapshot.docs.map(async (postDoc) => {
                const postData = postDoc.data();
                const userDoc = await getDoc(doc(db, 'users', postData.userId));
                const userData = userDoc.exists() ? userDoc.data() : { handle: 'Unknown' };
                return {
                    id: postDoc.id,
                    ...postData,
                    userHandle: userData.handle,
                };
            }));
            setPost(postData);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);
    const severityEmojis = {
        1: '😃 (very good)', // Very happy
        2: '🙂 (good)', // Happy
        3: '😐 (neutral)', // Neutral
        4: '😨 (not good)', // Worried
        5: '😭 (contact vet)', // Sad
    };
  return (
    <>
    {post.map(post => (
    <div key={post.id} className="text-xl bg-[#e0e0e0] relative p-6 m-8 flex-col justify-center items-center shadow-[6px_6px_16px_#9d9d9d,-6px_-6px_16px_#ffffff] h-max min-h-12 w-[60%] min-w-64 rounded-2xl animate-postAnim3 transition-all ease-in-out duration-200">
        <p className='text-xl text-gray-500'>{post.userHandle} posted:</p>
        <h1 className='text-3xl py-4'>{post.title}</h1>
        <h2 className='text-xl'>{post.content}</h2>
        <h2 className='text-xl py-4'>Severity Index: {severityEmojis[post.sevVal]}</h2>
        <input type="range" min={1} max={5} value={post.sevVal} onChange={null} className='rounded-lg'></input>
        <p className='text-sm text-gray-500 absolute top-0 right-0 p-4'>{post.createdAt ? format(new Date(post.createdAt.seconds * 1000), 'PPp') : 'Date unavailable'}</p>
    </div>
    ))}
    </>
  )
}

export default Posts