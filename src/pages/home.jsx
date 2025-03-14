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
import { AiOutlineLoading3Quarters, AiOutlineInfoCircle } from "react-icons/ai";
import { IoSearchSharp } from "react-icons/io5";
import { FaCat, FaDog, FaFish, FaDove, FaHorse } from "react-icons/fa";
import { GiRabbit } from "react-icons/gi";
import axios from "axios";

function Home() {
  const [post, setPost] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [petFacts, setPetFacts] = useState([]);
  const [isLoadingFacts, setIsLoadingFacts] = useState(true);
  const [error, setError] = useState(null);
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
              profilePic: userProfile.profilePic,
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
            profilePic: userProfile.profilePic,
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
      const scrollPosition =
        window.innerHeight + document.documentElement.scrollTop;
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

  useEffect(() => {
    const fetchPetFacts = async () => {
      setIsLoadingFacts(true);
      try {
        // Get facts for multiple animals
        const animals = ["cat", "dog", "bird", "fish", "rabbit", "horse"];
        const factsPromises = animals.map((animal) =>
          axios.get(`https://api.api-ninjas.com/v1/animals?name=${animal}`, {
            headers: { "X-Api-Key": ANIMALS_API_KEY },
          })
        );

        const responses = await Promise.all(factsPromises);
        const facts = responses.flatMap((response, index) => {
          const animal = animals[index];
          return response.data
            .map((animalData) => ({
              id: Math.random(),
              type: animal,
              content: generateFact(animalData),
            }))
            .slice(0, 2); // Get 2 facts per animal
        });

        // Shuffle the facts
        const shuffledFacts = facts.sort(() => Math.random() - 0.5);
        setPetFacts(shuffledFacts.slice(0, 8)); // Show only 8 facts total
      } catch (err) {
        console.error("Error fetching pet facts:", err);
        setError("Failed to load pet facts");
        // Fallback facts
        setPetFacts([
          {
            id: 1,
            type: "cat",
            content: "Cats can jump up to six times their length.",
          },
          {
            id: 2,
            type: "dog",
            content:
              "Dogs have a sense of time and can differentiate between 5 minutes and 2 hours.",
          },
          {
            id: 3,
            type: "bird",
            content:
              "Parrots can mimic human speech and understand over 100 words.",
          },
          {
            id: 4,
            type: "fish",
            content:
              "Goldfish can remember things for months, despite popular belief about their short memory.",
          },
          {
            id: 5,
            type: "rabbit",
            content:
              "Rabbits can see behind themselves without turning their heads.",
          },
          {
            id: 6,
            type: "hamster",
            content:
              "Hamsters can run up to 8 miles at night using their exercise wheel.",
          },
        ]);
      } finally {
        setIsLoadingFacts(false);
      }
    };

    const generateFact = (animalData) => {
      // Create interesting facts from the API data
      const facts = [
        animalData.characteristics?.diet &&
          `Diet: ${animalData.characteristics.diet}`,
        animalData.characteristics?.habitat &&
          `Habitat: ${animalData.characteristics.habitat}`,
        animalData.characteristics?.lifespan &&
          `Lifespan: ${animalData.characteristics.lifespan}`,
        animalData.characteristics?.behavior &&
          `Behavior: ${animalData.characteristics.behavior}`,
      ].filter(Boolean);

      return (
        facts[Math.floor(Math.random() * facts.length)] ||
        "This pet makes a wonderful companion!"
      );
    };

    fetchPetFacts();

    // Refresh facts every 10 minutes
    const interval = setInterval(fetchPetFacts, 600000);
    return () => clearInterval(interval);
  }, []);

  const getFactIcon = (type) => {
    const petType = petTypes[type] || petTypes.dog;
    const Icon = petType.icon;
    return <Icon className="text-lg text-primary" />;
  };

  return (
    <>
      <div className="flex flex-col items-center bg-base-200 text-gray-800 min-h-screen p-4 rounded-lg">
        {/* Container for search and new post */}
        <div className="w-full flex lg:flex-row flex-col gap-4 mb-4">
          {/* Search Container */}
          <div
            className={`${isSearchModalOpen ? "w-full" : "lg:flex-1"} relative`}
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
          <div className="lg:w-[300px] w-full">
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
        <div className="w-full flex lg:flex-row flex-col gap-4">
          {/* Posts section */}
          <div className="lg:w-2/3 w-full z-0">
            {post.map((post) => (
              <Posts key={post.id} {...post} profilePic={post.profilePic} />
            ))}
          </div>

          {/* Pet Facts section - only visible on large screens */}
          <div className="hidden lg:block lg:w-1/3">
            <div className="bg-base-100 rounded-lg shadow-lg p-6 sticky top-4">
              <div className="flex items-center gap-2 mb-4">
                <AiOutlineInfoCircle className="text-2xl text-primary" />
                <h2 className="text-xl font-semibold text-primary">
                  Pet Facts
                </h2>
              </div>

              {isLoadingFacts ? (
                <div className="flex justify-center p-4">
                  <AiOutlineLoading3Quarters className="animate-spin text-2xl text-primary" />
                </div>
              ) : error ? (
                <div className="text-error p-4 text-center">{error}</div>
              ) : (
                <div className="space-y-4">
                  {petFacts.map((fact) => (
                    <div
                      key={fact.id}
                      className="bg-base-200 p-4 rounded-lg transition-all duration-300 hover:shadow-md"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {getFactIcon(fact.type)}
                        <h3 className="font-semibold text-primary capitalize">
                          {petTypes[fact.type]?.name || "Pet"} Fact
                        </h3>
                      </div>
                      <p className="text-sm text-neutral">{fact.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
