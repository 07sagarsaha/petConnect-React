import React, { useEffect, useRef, useState, Suspense } from "react";
import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS styles
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import dog3d from "../assets/voxel_dog.glb";
import { degreesToRadians } from "../pages/landing/landing";
import * as THREE from "three";
import { db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { FaGithub, FaUserDoctor } from "react-icons/fa6";
import pfp from "../icons/pfp.png";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

// Developer info component
const DeveloperInfo = () => {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeveloperInfo = async () => {
      try {
        // Query users collection for documents where isDev is true
        const usersCollection = collection(db, "users");
        const adminQuery = query(usersCollection, where("isDev", "==", true));

        // Use onSnapshot for real-time updates instead of getDocs
        const unsubscribe = onSnapshot(
          adminQuery,
          (querySnapshot) => {
            const adminUsers = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            console.log("Fetched developers:", adminUsers.length);
            setDevelopers(adminUsers);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching developer info:", error);
            setLoading(false);
          }
        );

        // Return the unsubscribe function for cleanup
        return unsubscribe;
      } catch (error) {
        console.error("Error setting up developer info listener:", error);
        setLoading(false);
        return () => {}; // Return empty function as fallback for cleanup
      }
    };

    // Store the unsubscribe function directly
    let unsubscribe;
    fetchDeveloperInfo().then((unsub) => {
      unsubscribe = unsub;
    });

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleUserClick = (userId) => {
    navigate(`/in/profile/${userId}`);
  };

  if (loading) {
    return (
      <div className="p-4 bg-base-100 rounded-xl flex justify-center items-center">
        <AiOutlineLoading3Quarters className="animate-spin" size={30} />
        <span className="ml-2">Loading developer information...</span>
      </div>
    );
  }

  if (developers.length === 0) {
    return (
      <div className="p-4 bg-base-100 rounded-xl">
        Developer information not available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {developers.map((dev, index) => (
        <div
          key={dev.id}
          data-aos="fade-up"
          data-aos-delay={index * 100} // Staggered delay based on index
          className="p-4 bg-base-100 rounded-xl flex flex-col items-center cursor-pointer hover:bg-base-200 transition-all"
          onClick={() => handleUserClick(dev.id)}
        >
          <div className="relative">
            <img
              src={dev.profilePic || pfp}
              alt={dev.name}
              className="w-24 h-24 rounded-full object-cover mb-2"
            />
            {dev.isVetVerified && (
              <div className="absolute bottom-2 right-0">
                <FaUserDoctor className="text-primary" size={20} />
              </div>
            )}
          </div>
          <h3 className="text-xl font-bold">{dev.name}</h3>
          <p className="text-sm text-base-content/50 mb-2">
            @{dev.handle || "unknown"}
          </p>
          {dev.name === "Subham Chakraborty" && (
            <p className="mt-4 p-4 bg-base-300 rounded-xl">
              {"Worked at both Frontend and Backend"}
            </p>
          )}
          {dev.name === "Sagar Saha" && (
            <p className="mt-4 p-4 bg-base-300 rounded-xl">
              {"Lead Project Dev"}
            </p>
          )}
          {dev.name === "Rajdeep Majumder" && (
            <p className="mt-4 p-4 bg-base-300 rounded-xl">{"Frontend Dev"}</p>
          )}
        </div>
      ))}
    </div>
  );
};

// Separate the 3D model into its own component for better control
const ModelContainer = () => {
  const [userInteracted, setUserInteracted] = useState(false);
  const controlsRef = useRef();

  // Handle user interaction with the 3D model
  const handleUserInteraction = () => {
    setUserInteracted(true);
  };

  return (
    <div
      className="w-1/2 h-fit rounded-xl"
      onMouseDown={handleUserInteraction}
      onTouchStart={handleUserInteraction}
    >
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            Loading 3D model...
          </div>
        }
      >
        <Canvas
          className="mt-4"
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
          }}
          dpr={[1, 2]} // Responsive pixel ratio
          camera={{
            position: [0, 2, 5],
            fov: 40,
            near: 0.1,
            far: 1000,
          }}
          onCreated={({ gl }) => {
            // Configure WebGL context on creation
            gl.setClearColor(0x000000, 0);
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 5, 5]} intensity={1} />
          <PetModel isAnimating={true} userInteracted={userInteracted} />
          <OrbitControls
            ref={controlsRef}
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            maxDistance={10}
            minDistance={7}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={0}
          />
        </Canvas>
      </Suspense>
    </div>
  );
};

// Separate the PetModel component
const PetModel = ({ isAnimating, userInteracted }) => {
  const primitiveRef = useRef();
  const { scene } = useGLTF(dog3d, true); // Add true for priority loading
  const rotationProgress = useRef(0);
  const time = useRef(0);
  const initialRotationY = useRef(degreesToRadians(-50));

  // Set initial rotation when the component mounts
  useEffect(() => {
    if (primitiveRef.current) {
      primitiveRef.current.rotation.y = initialRotationY.current;
    }

    // Cleanup function
    return () => {
      // Dispose of any resources if needed
      rotationProgress.current = 0;
      time.current = 0;
    };
  }, []);

  // Animation frame
  useFrame((state, delta) => {
    if (!primitiveRef.current) return;

    // Only animate if user hasn't interacted
    if (!userInteracted) {
      time.current += delta;
      const swayOffset = Math.sin(time.current * 0.5) * 0.1;

      if (isAnimating) {
        // 360-degree rotation animation
        rotationProgress.current += delta * 0.5;
        if (rotationProgress.current > 1) rotationProgress.current = 0;

        const easeProgress = easeInOutCubic(rotationProgress.current);
        primitiveRef.current.rotation.y =
          initialRotationY.current + easeProgress * Math.PI * 2;
      } else {
        // Gentle hovering effect when not animating
        primitiveRef.current.rotation.y = initialRotationY.current + swayOffset;
      }
    }
  });

  const easeInOutCubic = (x) => {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 6) / 2;
  };

  return (
    <primitive
      ref={primitiveRef}
      object={scene}
      scale={0.5}
      position={[0, 0, 0]}
    />
  );
};

function About() {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const [initialAnimationComplete, setInitialAnimationComplete] =
    useState(false);
  const [scrolledBeyondInitial, setScrolledBeyondInitial] = useState(false);
  const [modelMounted, setModelMounted] = useState(false);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      startEvent: "DOMContentLoaded",
      offset: 120,
    });

    // Cleanup function
    return () => {
      // Clean up any AOS-related resources
      AOS.refresh();
    };
  }, []);

  // Set up initial animations
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.classList.add("animate-textSize");
    }

    const timer1 = setTimeout(() => {
      const timer2 = setTimeout(() => {
        setInitialAnimationComplete(true);
        AOS.refresh();
      }, 2000);

      return () => clearTimeout(timer2);
    }, 2000);

    // Delay mounting the 3D model to ensure WebGL context is ready
    const modelTimer = setTimeout(() => {
      setModelMounted(true);
    }, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(modelTimer);
    };
  }, []);

  // Set up scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 0.2) {
        setScrolledBeyondInitial(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Refresh AOS when scrolledBeyondInitial changes
  useEffect(() => {
    if (scrolledBeyondInitial) {
      AOS.refresh();
    }
  }, [scrolledBeyondInitial]);

  return (
    <>
      <div className="flex flex-col gap-4 p-4 py-16 max-sm:py-8 min-h-screen">
        <div className="flex flex-row max-sm:flex-col gap-4">
          <p ref={titleRef} className="text-5xl font-bold text-primary">
            {"Pet Connect"}
          </p>
          {initialAnimationComplete && (
            <p
              ref={subtitleRef}
              data-aos="fade-up"
              className="text-3xl font-bold text-primary rounded-xl p-4 bg-base-300 w-fit -mt-3"
            >
              {"/ About Us"}
            </p>
          )}
        </div>

        {initialAnimationComplete && (
          <>
            <div className="mt-8" data-aos="fade-up">
              <h2 className="text-2xl font-bold mb-4">{"Our Mission"}</h2>
              <div className="flex flex-row max-sm:flex-col max-sm:items-center gap-2 w-full h-min">
                <p className="mb-6 rounded-xl p-4 bg-base-100 w-full h-fit text-lg">
                  {
                    "Pet Connect is dedicated to creating a vibrant community where "
                  }
                  {
                    "pet owners can share experiences, find support, and celebrate "
                  }
                  {"the joy that pets bring to our lives. "}
                  {
                    "We believe that pets are an integral part of our lives, and "
                  }
                  {
                    "it's important to have a space where we can openly discuss "
                  }
                  {"our joys, challenges, and everything in between. "}
                  {
                    "And that's why we created Pet Connect. Also because we felt like there was a real lack of space for pet owners to interact. "
                  }
                  {
                    "Also there are certain stuff needed to accomodate for the needs of pet owners."
                  }
                </p>
                {modelMounted && <ModelContainer />}
              </div>
            </div>

            {/* Content sections with AOS animations - only animate when scrolled into view */}
            <div
              data-aos="fade-up"
              data-aos-delay="200"
              data-aos-anchor-placement="top-bottom"
              className="mt-8"
            >
              <h2 className="text-2xl font-bold mb-4">
                {"Thus, "}
                <p className="text-primary">{"Pet Connect"}</p>
              </h2>
              <p className="mb-6 rounded-xl p-4 bg-base-100 text-lg">
                {
                  "Our platform provides a safe space for pet owners to connect, "
                }
                {"share stories, find advice, and build lasting friendships "}
                {"centered around their beloved companions. "}
                {
                  "It's a real space where you can pet owner and voice your and you pets own needs. "
                }
                {
                  "You can have a real discussion and we believe that is really, really important to have. "
                }
              </p>
            </div>

            {/* Additional sections with AOS animations */}
            <div
              data-aos="fade-up"
              data-aos-delay="300"
              data-aos-anchor-placement="top-bottom"
              className="mt-8"
            >
              <h2 className="text-2xl font-bold mb-4">{"Who are we?"}</h2>
              <p className="mb-6 rounded-xl p-4 bg-base-100 text-lg">
                {"Now let's talk about the hands behind Pet Connect. "}
                {"We are a team of pet lovers, developers, and designers who "}
                {
                  "came together with a shared vision to create a platform that "
                }
                {"would truly benefit the pet community. "}
                {"We are all pet owners ourselves, and we understand the joys "}
                {"and challenges that come with having a furry friend. "}
                {
                  "This project was started as a College Project by us but it quickly developed into something bigger. "
                }
                {"Thus 100 and 100 of pure hard work that made what it is. "}
              </p>
              <h2 className="text-2xl font-bold mb-4">
                {"Now let us talk about ourselves"}
              </h2>
              <p className="mb-6 rounded-xl p-4 bg-base-100 text-lg">
                {
                  "We are a team of 3 people. Some managed the backend and some managed the frontend. "
                }
                {"Altogether, we made a platform that we are proud of. "}
              </p>
              <p className="p-2 text-xl text-primary">
                {"Let us introduce ourselves, one by one:"}
              </p>
              <div className="mt-4">
                <DeveloperInfo />
              </div>
            </div>

            <div
              data-aos="fade-up"
              data-aos-delay="400"
              data-aos-anchor-placement="top-bottom"
              className="mt-8"
            >
              <h2 className="text-2xl font-bold mb-4">{"Special thanks:"}</h2>
              <p className="mb-6 rounded-xl p-4 bg-base-100 text-lg">
                {
                  "A huge, hearty thanks to our mentor and professor, Debasish Sir. "
                }
                {
                  "Without his guidance and support, this project would not have "
                }
                {"been possible. And a big thanks Dipak Sir for his support. "}
                {"And a big thanks to all the people who have supported us. "}
              </p>
            </div>
            <a
              data-aos="fade-up"
              data-aos-delay="500"
              data-aos-anchor-placement="top-bottom"
              href="https://github.com/07sagarsaha/petConnect-React.git"
              className="hover:underline w-fit btn self-center"
              target="_blank"
            >
              <FaGithub />
              <p>{"Our GitHub"}</p>
            </a>
            <p
              data-aos="fade-up"
              data-aos-delay="500"
              data-aos-anchor-placement="top-bottom"
              className="text-2xl text-primary self-center"
            >
              {"Once again, thanks for visiting us. "}
            </p>
          </>
        )}
      </div>
    </>
  );
}

// Preload the 3D model
useGLTF.preload(dog3d);

export default About;
