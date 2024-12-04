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
  return (
    <>
    {post.map(post => (
    <div key={post.id} className="text-xl relative p-6 m-8 flex-col justify-center items-center shadow-skew h-max min-h-12 w-max min-w-[60%] rounded-2xl">
        <p className='text-xl text-gray-500'>{post.userHandle} posted:</p>
        <h1 className='text-3xl py-4'>{post.title}</h1>
        <h2 className='text-xl'>{post.content}</h2>
        <p className='text-sm text-gray-500 absolute top-0 right-0 p-4'>{post.createdAt ? format(new Date(post.createdAt.seconds * 1000), 'PPp') : 'Date unavailable'}</p>
    </div>
    ))}
    </>
  )
}

export default Posts