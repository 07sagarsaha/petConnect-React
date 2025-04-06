import React, { useEffect, useRef, useState } from "react";
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
import Posts from "../components/UI/Posts";
import Button from "../components/UI/PostButton";
import { IoMdAddCircleOutline, IoMdClose, IoMdSearch } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import { IoSearchSharp } from "react-icons/io5";
import { FaCat, FaDog, FaFish, FaDove, FaHorse } from "react-icons/fa";
import { GiRabbit } from "react-icons/gi";
import PetFacts from "../components/UI/PetFacts";
import { format } from "date-fns";

function Home() {
  const [post, setPost] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const postsPerPage = 5;
  const navigate = useNavigate();
  const scrollListenerRef = useRef(null);

  const ANIMALS_API_KEY = import.meta.env.VITE_NINJAS_API_KEY; // Add this to your .env file

  const petTypes = {
    cat: { icon: FaCat, name: "Cat" },
    dog: { icon: FaDog, name: "Dog" },
    bird: { icon: FaDove, name: "Bird" },
    fish: { icon: FaFish, name: "Fish" },
    rabbit: { icon: GiRabbit, name: "Rabbit" },

    horse: { icon: FaHorse, name: "Horse" },
  };

  const fetchPosts = async (isInitial = false) => {
    if (!isInitial && (!lastDoc || isLoading)) return;

    setIsLoading(true);

    try {
      const q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        ...(isInitial ? [limit(postsPerPage)] : [startAfter(lastDoc), limit(postsPerPage)])
      );

      const snapshot = await getDocs(q);
      const postData = await Promise.all(
        snapshot.docs.map(async (postDoc) => {
          const postRef = doc(db, "posts", postDoc.id);
          const unsubscribe = onSnapshot(postRef, async (postSnapshot) => {
            if (postSnapshot.exists()) {
              const updatedPostData = postSnapshot.data();
              const userRef = doc(db, "users", updatedPostData.userId);
              const userSnap = await getDoc(userRef);
              const userProfile = userSnap.exists() ? userSnap.data() : {};

              setPost((prevPosts) => {
                const updatedPosts = [...prevPosts];
                const index = updatedPosts.findIndex((p) => p.id === postDoc.id);
                if (index !== -1) {
                  updatedPosts[index] = {
                    id: postDoc.id,
                    ...updatedPostData,
                    profilePic: userProfile.profilePic,
                    userProfile,
                  };
                }
                return updatedPosts;
              });
            }
          });

          scrollListenerRef.current = scrollListenerRef.current || [];
          scrollListenerRef.current.push(unsubscribe);

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
            profilePic: userProfile.profilePic,
            isVetVerified: userProfile.isVetVerified,
            userProfile,
          };
        })
      );

      setPost((prevPosts) => {
        const postMap = new Map(prevPosts.map((post) => [post.id, post]));
        postData.forEach((newPost) => {
          postMap.set(newPost.id, newPost);
        });
        return Array.from(postMap.values());
      });

      if (!isInitial) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(postsPerPage));
  
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
            profilePic: userProfile.profilePic,
            isVetVerified: userProfile.isVetVerified,
            userProfile,
          };
        })
      );
  
      setPost(postData);
  
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    });
  
    return () => unsubscribe();
  }, []);
  
  // Load more posts on scroll
  useEffect(() => {
    const handleScroll = debounce(() => {
      if (isLoading) return;
      const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
      const threshold = document.documentElement.offsetHeight - 100; 
      if (scrollPosition >= threshold) {
        fetchPosts(false); 
      }
    }, 200);
  
    window.addEventListener("scroll", handleScroll);
  
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastDoc, isLoading]);

  useEffect(() => {
    return () => {
      if (scrollListenerRef.current) {
        scrollListenerRef.current.forEach((unsubscribe) => unsubscribe());
      }
    };
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const lowerCaseQuery = searchQuery.toLowerCase();
    const q = query(collection(db, "users"));

    try {
      const snapshot = await getDocs(q);
      const results = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(
          (user) =>
            user.name.toLowerCase().includes(lowerCaseQuery) ||
            user.handle.toLowerCase().includes(lowerCaseQuery)
        );
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/in/profile/${userId}`);
  };

  const handleAutocomplete = async (e) => {
    const queryText = e.target.value;
    setSearchQuery(queryText);

    if (queryText.length > 2) {
      const lowerCaseQuery = queryText.toLowerCase();
      const q = query(collection(db, "users"));

      try {
        const snapshot = await getDocs(q);
        const results = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(
            (user) =>
              user.name.toLowerCase().includes(lowerCaseQuery) ||
              user.handle.toLowerCase().includes(lowerCaseQuery)
          );
        setAutocompleteResults(results);
      } catch (error) {
        console.error("Error fetching autocomplete results:", error);
      }
    } else {
      setAutocompleteResults([]);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setAutocompleteResults([]);
  };

  const openSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
    clearSearch();
  };

  return (
    <>
      <div className="flex flex-col items-center bg-base-200 text-gray-800 min-h-screen p-4 rounded-lg">
        {/* Container for search and new post */}
        <div className="lg:w-4/6 max-sm:w-full max-sm:flex-col self-start flex lg:flex-row gap-4 mb-4 md:flex-row md:w-full max-md:w-full max-md:flex-row">
          {/* Search Container */}
          <div
            className={`${isSearchModalOpen ? "w-full" : "lg:flex-1 md:w-full max-md:w-full"} relative`}
          >
            <form
              onSubmit={handleSearch}
              className="flex flex-row items-center gap-2"
            >
              <input
                value={searchQuery}
                onChange={handleAutocomplete}
                placeholder="Search by name or handle..."
                className="w-full outline-none bg-base-100 p-4 text-[16px] shadow-lg rounded-lg"
                onClick={isSearchModalOpen ? null : openSearchModal}
              />
              {isSearchModalOpen && (
                <>
                  <button
                    type="submit"
                    className="text-lg p-3 flex py-4 justify-center items-center rounded-2xl bg-primary text-base-100 shadow-lg hover:bg-base-100 hover:text-primary ease-in-out duration-700"
                  >
                    <IoSearchSharp />
                  </button>
                  <button
                    className="text-lg p-3 py-4 rounded-2xl bg-error text-base-100 hover:bg-base-300 hover:text-error transition-colors ease duration-200"
                    onClick={clearSearch && closeSearchModal}
                  >
                    <IoMdClose />
                  </button>
                </>
              )}
            </form>

            {/* Search Results - Now positioned absolutely */}
            {isSearchModalOpen &&
              (autocompleteResults.length > 0 || searchResults.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-base-100 p-4 shadow-lg rounded-2xl z-50">
                  {autocompleteResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex justify-between items-center bg-base-200 p-4 rounded-lg shadow-lg mb-2 cursor-pointer"
                      onClick={() => handleUserClick(user.id)}
                    >
                      <div>
                        <p className="font-bold">{user.name}</p>
                        <p className="text-sm text-neutral">@{user.handle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>

          {/* New Post Button Container */}
          <div className="lg:w-[300px] w-full md:w-[300px] max-md:w-[300px] max-sm:w-full">
            <Button
              buttonName="New Post"
              icon={<IoMdAddCircleOutline className="size-7 mr-2" />}
              submitName="Post"
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Modal Backdrop */}
        {isSearchModalOpen && (
          <div className="fixed inset-0 z-40" onClick={closeSearchModal} />
        )}

        {/* Main content container */}
        <div className="w-full flex flex-col gap-4">
          {/* Posts section */}
          <div className="lg:w-2/3 w-full z-0">
            <PetFacts/>
          </div>
          <div className="lg:w-2/3 w-full z-0 flex flex-col gap-4">
            {post.map((post) => (
                <Posts key={post.id} {...post} profilePic={post.profilePic} date={
                  post.createdAt
                    ? format(post.createdAt.toDate(), "PPP")
                    : "No date" 
                }
                isVetVerified ={post.isVetVerified} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
