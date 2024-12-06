import React, { useEffect, useState } from "react";
import Button from "../components/UI/PostButton";
import { IoMdAddCircleOutline } from "react-icons/io";
import { db } from "../firebase/firebase";
import { collection, orderBy, query, onSnapshot } from 'firebase/firestore';
import { format } from 'date-fns';
import Posts from "../components/UI/Posts";

function Home() {
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
                return {
                    id: postDoc.id,
                    ...postData,
                };
            }));
            setPost(postData);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);
  return (
    <>
    <Button buttonName={"New Post"} icon={<IoMdAddCircleOutline className="size-7 mr-2"/>} submitName={"Post"}/>
    {post.map((post) => (
        <Posts
          keyVal={post.id}
          handle={post.handle}
          title={post.title}
          content={post.content}
          sevVal={post.sevVal}
          date={post.createdAt ? format(post.createdAt.toDate(), 'PPP') : 'No date'}
        />
      ))}
    </>
  );
}

export default Home;
