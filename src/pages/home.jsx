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
} from "firebase/firestore";
import { format } from "date-fns";
import Posts from "../components/UI/Posts";

function Home() {
  const [post, setPost] = useState([]);
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    // Create real-time listener
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const postData = await Promise.all(
        snapshot.docs.map(async (postDoc) => {
          const postData = postDoc.data();
          // Fetch user profile info
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
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
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
          date={
            post.createdAt ? format(post.createdAt.toDate(), "PPP") : "No date"
          }
          likes={post.likes || []}
          dislikes={post.dislikes || []}
        />
      ))}
    </>
  );
}

export default Home;
