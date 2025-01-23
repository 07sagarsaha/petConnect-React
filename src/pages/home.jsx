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
  where,
} from "firebase/firestore";
import { format } from "date-fns";
import Posts from "../components/UI/Posts";
import Button from "../components/UI/PostButton";
import { IoMdAddCircleOutline, IoMdClose, IoMdSearch } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoSearchSharp } from "react-icons/io5";

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
      setPost((prevPosts) => [...prevPosts, ...postData]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error fetching more posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = debounce(() => {
      if (isLoading) return; // Prevent fetching if already loading
      const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
      const threshold = document.documentElement.offsetHeight - 100; // 100px from the bottom
      if (scrollPosition >= threshold) {
        fetchMorePosts();
      }
    }, 200); // Adjust debounce delay as needed

    scrollListenerRef.current = handleScroll;
    window.addEventListener("scroll", scrollListenerRef.current);

    return () => {
      if (scrollListenerRef.current) {
        window.removeEventListener("scroll", scrollListenerRef.current);
      }
    };
  }, [lastDoc, isLoading, fetchMorePosts]);

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
      <div className={`${isSearchModalOpen ? `fixed z-40 w-[60%] max-sm:w-[90%]` : `max-sm:w-full w-[60%]`} self-start flex flex-col items-center gap-2 transition-all duration-500`}>
        <form onSubmit={handleSearch} className={`self-start flex flex-row items-center gap-2 transition-all duration-500 w-[60%] max-sm:w-full`}>
          <input value={searchQuery} onChange={handleAutocomplete} placeholder={`Search by name for handle...`} className={`max-sm:w-full w-full flex outline-none ml-8 max-sm:ml-0 max-sm:text-sm bg-base-100 max-sm:mt-4 p-4 max-sm:text-[24px] shadow-lg rounded-2xl max-sm:m-2 ease`} onClick={isSearchModalOpen? null: openSearchModal}/>
          {isSearchModalOpen && <>
            <button
              type="submit"
              className="text-lg p-3 flex py-4 max-sm:mt-2 justify-center items-center rounded-2xl bg-primary text-base-100 shadow-lg hover:bg-base-100 hover:text-primary ease-in-out duration-700"
            >
              <IoSearchSharp />
            </button>
            <button
              className={`text-lg p-3 py-4 max-sm:mt-2 rounded-2xl bg-error text-base-100 hover:bg-base-300 hover:text-error transition-colors ease duration-200`}
              onClick={clearSearch && closeSearchModal}
            >
              <IoMdClose />
            </button>
          </>}
        </form>
        {isSearchModalOpen && <>
          {(autocompleteResults.length > 0 || searchResults.length > 0) && (
            <div className="max-sm:w-full w-[50%] max-sm:h-fit flex flex-col outline-none self-start ml-8 max-sm:ml-0 max-sm:text-sm bg-base-100 max-sm:mt-2 p-4 max-sm:text-[24px] shadow-lg rounded-2xl max-sm:m-2">
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
              {searchResults.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-xl font-bold mb-2">Search Results:</h2>
                  <div className="overflow-y-auto h-fit max-h-[30rem]">
                    {searchResults.map((user) => (
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
                </div>
              )}
            </div>
          )}

      </>}
      </div>
      {isSearchModalOpen && <div className="h-full w-full justify-center items-center flex bg-black bg-opacity-50 transition-colors duration-200 fixed z-30 top-0 left-0" onClick={closeSearchModal}/>}
      <div className={`flex flex-col lg:flex-row w-full justify-between items-center mb-4 ${isSearchModalOpen && `max-sm:mt-[90px] mt-16`}`}>
        <Button
          buttonName={"New Post"}
          icon={<IoMdAddCircleOutline className="size-7 mr-2" />}
          submitName={"Post"}
        />
      </div>

    
    <>
    <div className="fixed top-0 left-0 bg-black bg-opacity-50 z-40"/>
    <form onSubmit={handleSearch} className=" flex-col fixed top-0 w-1/2 m-4 z-50 hidden">
        <input
          type="text"
          placeholder="Search users by name or handle..."
          value={searchQuery}
          onChange={handleAutocomplete}
          className="p-2 border border-gray-300 rounded-md mb-2"
        />
        <div className="flex justify-between">
          <button
            type="submit"
            className="text-lg p-3 flex justify-center items-center rounded-xl bg-primary text-base-100 shadow-lg hover:bg-base-100 hover:text-primary border-4 ease-in-out duration-700"
          >
            Search
          </button>
          <button
            type="button"
            onClick={clearSearch}
            className="text-lg p-3 flex justify-center items-center rounded-xl bg-error text-base-100 shadow-lg hover:bg-error-focus hover:text-error border-4 ease-in-out duration-700 ml-2"
          >
            Clear
          </button>
        </div>
      </form>
      </>

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
          userId={post.userId} // Pass userId to Posts component
        />
      ))}
      {isLoading && <p className="flex justify-center"><AiOutlineLoading3Quarters className="animate-spin self-center"/></p>}

      {/*isSearchModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Search Users</h2>
              <button
                className="text-lg p-2 rounded-full bg-error text-base-100 hover:bg-error-focus hover:text-error"
                onClick={closeSearchModal}
              >
                <IoMdClose />
              </button>
            </div>
            <form onSubmit={handleSearch} className="flex flex-col">
              <input
                type="text"
                placeholder="Search users by name or handle..."
                value={searchQuery}
                onChange={handleAutocomplete}
                className="p-2 border border-gray-300 rounded-md mb-2"
              />
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="text-lg p-3 flex justify-center items-center rounded-xl bg-primary text-base-100 shadow-lg hover:bg-base-100 hover:text-primary border-4 ease-in-out duration-700"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-lg p-3 flex justify-center items-center rounded-xl bg-error text-base-100 shadow-lg hover:bg-error-focus hover:text-error border-4 ease-in-out duration-700 ml-2"
                >
                  Clear
                </button>
              </div>
            </form>
            {(autocompleteResults.length > 0 || searchResults.length > 0) && (
              <div className="mt-4">
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
                {searchResults.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-xl font-bold mb-2">Search Results:</h2>
                    {searchResults.map((user) => (
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
            )}
          </div>
        </div>
      )*/}
    </div>
  </>
  );
}

export default Home;
