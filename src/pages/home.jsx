import React, { useEffect, useState } from "react";
import Button from "../components/UI/PostButton";
import { IoMdAddCircleOutline } from "react-icons/io";

import { db } from "../firebase/firebase";
import {
  collection,
  orderBy,
  query,
  onSnapshot,
  getDoc,
  doc,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";
import { format } from "date-fns";
import Posts from "../components/UI/Posts";

function Home() {
  const [post, setPost] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const postsPerPage = 5;

    // Create real-time listener
    useEffect(() => {
      const fetchInitialPosts = async () => {
          const q = query(
              collection(db, "posts"), 
              orderBy("createdAt", "desc"),
              limit(postsPerPage)
          );
  
          const unsubscribe = onSnapshot(q, async (snapshot) => {
              const postData = await Promise.all(
                  snapshot.docs.map(async (postDoc) => {
                      const postData = postDoc.data();
                      let userProfile = {};
                      if (postData.userId) {
                          const userRef = doc(db, "users", postData.userId);
                          const userSnap = await getDoc(userRef);
                          if (userSnap.exists()) {
                              userProfile = userSnap.data();
                          }
                      }
                      return {
                          id: postDoc.id,
                          ...postData,
                          userProfile,
                      };
                  })
              );
              setPost(postData);
              setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
          });
  
          return () => unsubscribe();
      };
  
      fetchInitialPosts();
  }, []);

  const fetchMorePosts = async () => {
    if (!lastDoc || isLoading) return;

    setIsLoading(true);
    const q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(postsPerPage)
    );

    try {
        const snapshot = await getDocs(q);
        const newPosts = await Promise.all(
            snapshot.docs.map(async (postDoc) => {
                const postData = postDoc.data();
                let userProfile = {};
                if (postData.userId) {
                    const userRef = doc(db, "users", postData.userId);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        userProfile = userSnap.data();
                    }
                }
                return {
                    id: postDoc.id,
                    ...postData,
                    userProfile,
                };
            })
        );

        setPost(prevPosts => [...prevPosts, ...newPosts]);
        if (snapshot.docs.length > 0) {
            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        }
    } catch (error) {
        console.error("Error fetching more posts:", error);
    } finally {
        setIsLoading(false);
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
        if (
          window.innerHeight + document.documentElement.scrollTop
          >= document.documentElement.offsetHeight - 10
      ) {
          fetchMorePosts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastDoc, isLoading]);

  return (
    <>
      <Button
        buttonName={"New Post"}
        icon={<IoMdAddCircleOutline className="size-7 mr-2" />}
        submitName={"Post"}
      />
      {post.map((post) => (
        <Posts
          key={post.id}
          id={post.id}
          handle={post.handle}
          profilePic={post.userProfile.profilePic || null} // Fallback if no profile pic
          title={post.title}
          content={post.content}
          sevVal={post.sevVal}
          imageUrl={post.imageUrl}
          date={
            post.createdAt ? format(post.createdAt.toDate(), "PPP") : "No date"
          }
          likes={post.likes || []}
          dislikes={post.dislikes || []}
        />
      ))}
      {isLoading && <p className=" flex justify-center">Loading...</p>}
    </>
  );
}

export default Home;
