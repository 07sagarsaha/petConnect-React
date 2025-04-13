import React, { useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext/authContext";
import landingimg from "../../assets/landingPage.jpg";
import dog3d from "../../assets/voxel_dog.glb";
import Header from "../../components/auth/header";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { IoPawSharp } from "react-icons/io5";
import { FaCat } from "react-icons/fa";
import Register from "../auth/signup";
import Login from "../auth/login";

const degreesToRadians = (degrees) => (degrees * Math.PI) / 180;
const PetModel = ({ isAnimating, showCanvas, register, login }) => {
  const modelRef = useRef();
  const { scene } = useGLTF(dog3d);
  const rotationProgress = useRef(0);
  const time = useRef(0);
  const initialRotationY = useRef(degreesToRadians(-50));
  const moveUpProgress = useRef(0);
  const moveProgress = useRef(0);
  const isMobile = useRef(window.innerWidth <= 768);
  
  React.useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
  
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useFrame((state, delta) => {
    if (!modelRef.current) return;
    
    if (!isAnimating) {
      rotationProgress.current = 0;
      moveUpProgress.current = 0;

      modelRef.current.position.lerp(
        new THREE.Vector3(0, -2, 0),
        0.05
      );
      modelRef.current.rotation.y = THREE.MathUtils.lerp(
        modelRef.current.rotation.y,
        initialRotationY.current,
        0.05
      );
      // Gentle hovering effect
      time.current += delta;
      const hoverOffsetY = Math.sin(time.current) * 0.15;
      const hoverOffsetX = Math.cos(time.current) * 0.05;
      const swayOffset = Math.sin(time.current * 0.5) * 0.02;

      modelRef.current.position.y = -1.25 + hoverOffsetY;
      modelRef.current.position.x = hoverOffsetX;
      modelRef.current.rotation.z = swayOffset;
      modelRef.current.rotation.x = swayOffset * 0.3;
      modelRef.current.rotation.y = initialRotationY.current + swayOffset * 0.5;
    }
    
    if (isAnimating) {
      // 360-degree rotation animation
      if (rotationProgress.current < 1) {
        rotationProgress.current += delta * 0.5;
        const easeProgress = easeInOutCubic(rotationProgress.current);
        modelRef.current.rotation.y = initialRotationY.current + easeProgress * Math.PI * 2;
        
        const targetScale = showCanvas ? 0.25 : 0.125;
        modelRef.current.scale.lerp(
          new THREE.Vector3(targetScale, targetScale, targetScale),
          0.05
        );
      }
      
      // Smooth upward movement after rotation
      if (rotationProgress.current >= 1 && moveUpProgress.current < 1) {
        moveUpProgress.current += delta * 0.25; // Control upward movement speed
        const easeUpProgress = easeInOutCubic(moveUpProgress.current);
        const startY = modelRef.current.position.y;
        const targetY = 0.25;
        
        modelRef.current.position.y = THREE.MathUtils.lerp(
          startY,
          targetY,
          easeUpProgress,
        );
      }

      if(register) {
        moveProgress.current += delta * 0.25;
        const easeProgress = easeInOutCubic(Math.min(moveProgress.current, 1));
        
        // Responsive position calculation
        const targetX = isMobile.current ? 1 : 2;
      
        modelRef.current.position.x = THREE.MathUtils.lerp(
          modelRef.current.position.x,
          targetX,
          easeProgress * 0.05
        );
      
        modelRef.current.rotation.y = THREE.MathUtils.lerp(
          modelRef.current.rotation.y,
          degreesToRadians(-45), // Reduced angle for better visibility
          easeProgress * 0.05
        );
      
        modelRef.current.position.z = THREE.MathUtils.lerp(
          modelRef.current.position.z,
          0.5, // Reduced depth
          easeProgress * 0.05
        );
      }
      
      if(login) {
        moveProgress.current += delta * 0.25;
        const easeProgress = easeInOutCubic(Math.min(moveProgress.current, 1));
        
        // Responsive position calculation
        const targetX = isMobile.current ? -1 : -2; // Less movement on mobile
        
        modelRef.current.position.x = THREE.MathUtils.lerp(
          modelRef.current.position.x,
          targetX,
          easeProgress * 0.05
        );
      
        modelRef.current.rotation.y = THREE.MathUtils.lerp(
          modelRef.current.rotation.y,
          degreesToRadians(45),
          easeProgress * 0.05
        );
      
        modelRef.current.position.z = THREE.MathUtils.lerp(
          modelRef.current.position.z,
          0.5, // Reduced depth
          easeProgress * 0.05
        );
      }
    }
  });

  

  // Easing function for smooth animation
  const easeInOutCubic = (x) => {
    return x < 0.5 
      ? 4 * x * x * x 
      : 1 - Math.pow(-2 * x + 2, 6) / 2;
  };

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={0.25}
      rotation={[degreesToRadians(-10), degreesToRadians(-50), 0]} 
      position={[0, -2, 0]} 
    />
  );
};

const BackgroundPaws = ({ isAnimating, showCanvas }) => {
  const [paws, setPaws] = React.useState([]);
  const [offset, setOffset] = React.useState(0);

  useEffect(() => {
    const numberOfPaws = 50;
    const newPaws = [];

    for (let i = 0; i < numberOfPaws; i++) {
      newPaws.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
        speed: Math.random() * 0.5 + 0.5, // Random speed multiplier for parallax
        isPaw: Math.random() > 0.5, // Randomly choose between paw and cat icon
      });
    }

    setPaws(newPaws);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * 0.5); // Adjust multiplier for parallax intensity
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle button animation
  useEffect(() => {
    if (isAnimating) {
      setOffset(prev => prev + 1000); // Move paws up when button is clicked
    }
  }, [isAnimating]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {paws.map((paw) => (
        <div
          key={paw.id}
          className="absolute text-primary transition-transform duration-1000 ease-in-out"
          style={{
            left: `${paw.x}%`,
            top: `${paw.y}%`,
            transform: `
              rotate(${paw.rotation}deg)
              translateY(${offset * paw.speed}px)
              ${showCanvas ? 'scale(1.5)' : 'scale(1)'}
            `,
            fontSize: `${paw.size}em`,
            opacity: paw.opacity,
            transition: 'all 1s ease-out',
          }}
        >
          {paw.isPaw ? <IoPawSharp /> : <FaCat />}
        </div>
      ))}
    </div>
  );
};

const Landing = () => {
  const { userLoggedIn } = useAuth();
  const controlsRef = useRef();
  const [showCanvas, setShowCanvas] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [secondSection, setSecondSection] = React.useState(false); // State to control the second section
  const [register, showRegister] = React.useState(false);
  const [login, showLogin] = React.useState(false); 
  const navigate = useNavigate();

  const mainRef = useRef(null);
  const scrollThreshold = 100; // Adjust this value to control when animations trigger
  const lastScrollPosition = useRef(0); 

  const handleJoinClick = (e) => {
    e.preventDefault();
    setIsAnimating(true);
    setShowCanvas(true);
    setTimeout(() => {
      setSecondSection(true);
    }, 2000);
  };

  const upScrollThreshold = 50; // Threshold for reverse animation

  useEffect(() => {
    const handleScroll = () => {
      if (!mainRef.current) return;
      
      const scrollPosition = mainRef.current.scrollTop;
      const scrollingUp = scrollPosition < lastScrollPosition.current;
      
      if (scrollPosition > scrollThreshold && !isAnimating && !scrollingUp) {
        // Forward animation
        setIsAnimating(true);
        setShowCanvas(true);
        setTimeout(() => {
          setSecondSection(true);
        }, 2000);
      } else if (scrollPosition <= upScrollThreshold && scrollingUp) {
        // Reverse animation - modified condition
        setSecondSection(false);
        setTimeout(() => {
          setShowCanvas(false);
          setIsAnimating(false);
        }, 1000);
      }

      lastScrollPosition.current = scrollPosition;
    };
  
    const currentRef = mainRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
    }
  
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isAnimating, upScrollThreshold, scrollThreshold]);

  const handleShowRegister = () => {
    showRegister(true);
    showLogin(false);
    setSecondSection(false);
  }

  const handleShowLogin = () => {
    showRegister(false);
    showLogin(true);
    setSecondSection(false);
  }

  const handleDirectShowLogin = () => {
    // Trigger the initial animation sequence
    setIsAnimating(true);
    setShowCanvas(true);
  
    // Sequential timing for animations
    setTimeout(() => {
      setSecondSection(false);
      // After the model moves up, trigger login form
      setTimeout(() => {
        showRegister(false);
        showLogin(true);
        setSecondSection(false);
      }, 100); // Adjust timing as needed
    }, 100); // Matches your original animation timing
  };

  return (
    <>
    <div 
      ref={mainRef}
      className="flex flex-col h-screen animate-fadeIn overflow-y-scroll scroll-smooth"
      style={{ scroll: "smooth" }}>
      {userLoggedIn && <Navigate to={"/in/home"} replace={true} />}
      <div className="fixed z-50 w-fit backdrop-blur-md p-4 shadow-lg rounded-r-full" onClick={() => 
        window.location.reload()}>
        <Header />
      </div>
      <button className="btn btn-primary text-base-100 fixed w-fit top-4 right-8 z-50" onClick={handleDirectShowLogin}>
        {"Login"}
      </button>
      <div className="flex flex-col bg-base-100 relative min-h-[200vh]">
        <BackgroundPaws isAnimating={isAnimating} showCanvas={showCanvas}/>

        {/* Welcome Section 1 */}
        <div className={`flex items-start my-32 justify-center px-8 flex-grow relative z-20 pointer-events-none transition-transform duration-1000 ease-in-out ${showCanvas ? '-translate-y-[2000px]' : ''}`}>
          <div className="w-full max-w-2xl px-4 py-16 rounded-xl animate-postButtonAnim1 backdrop-blur-md bg-base-100/50 shadow-lg pointer-events-auto">
            <h1 className="text-4xl text-center font-bold mb-4 text-primary">
              {"Ever wished, there was a space for your pets?"}
            </h1>
            <p className="text-lg mb-4 text-center">
              {"Where you can share their stories, connect with other pet lovers, and find a community that understands the joy and challenges of pet ownership."}
            </p>
            <p className="text-lg mb-4 text-center italic">
              {"Guess what?"}
            </p>
            <div className="flex justify-center items-center">
              <button 
                onClick={handleJoinClick}
                className="bg-primary shadow-lg justify-center items-center text-base-100 btn btn-md hover:bg-primary rounded-lg transform transition-transform duration-300 hover:scale-105"
              >
                {"It is real!"}
              </button>
            </div>
          </div>
        </div>

        {/* Background Canvas */}
        <div className="flex flex-col">
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-auto">
          <Canvas
            className="w-full h-full"
            camera={{
              position: [0, 2, window.innerWidth <= 768 ? 7 : 5],
              fov: window.innerWidth <= 768 ? 60 : 50,
              near: 0.1,
              far: 1000
            }}
          >
              <ambientLight intensity={0.5} />
              <directionalLight position={[0, 5, 5]} />
              <PetModel isAnimating={isAnimating} showCanvas={showCanvas} register={register} login={login} />
              <OrbitControls
                ref={controlsRef}
                enableZoom={false}
                enablePan={false}
                enableRotate={isAnimating}
                maxPolarAngle={Math.PI / 2} // Prevents viewing from below
                minPolarAngle={0} // Allows viewing from top
              />
            </Canvas>
            </div>
            {/* Second Section */}
            {secondSection && (
              <div className="fixed inset-2 flex items-center justify-center z-20 w-3/5 max-sm:w-full max-sm:translate-x-0 translate-x-1/3 h-2/5 translate-y-[450px]">
                <div className="w-full max-w-2xl px-4 py-16 mx-8 rounded-xl animate-postAnim3 backdrop-blur-md bg-base-100/50 shadow-lg">
                  <h1 className="text-4xl text-center font-bold mb-4 text-primary">
                    {"Welcome to PetConnect!"}
                  </h1>
                  <p className="text-lg mb-4 text-center">
                    {"A place where you can share your pet's stories, share your thoughts, and connect with other pet lovers like you."}
                  </p>
                  <div className="flex justify-center items-center">
                    <button
                      onClick={handleShowRegister}
                      className="bg-primary shadow-lg justify-center items-center text-base-100 btn btn-md hover:bg-primary rounded-lg transform transition-transform duration-300 hover:scale-105"
                    >
                      {"Join The Community"}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Register Section */}
            {register && (
              <div className="fixed inset-y-0 left-15 top-52 w-1/2 h-fit max-sm:w-full z-30 flex items-center justify-center">
                <div className="w-full max-w-md px-6 py-8 animate-postButtonAnim2 duration-500 backdrop-blur-md shadow-lg rounded-2xl border-2 border-base-200 mx-4">
                  <Register />
                  <div className="text-center mt-4">
                    <button className="text-primary underline" onClick={handleShowLogin}>
                      Already A User? Login
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Login Section */}
            {login && (
              <div className="fixed inset-y-0 right-0 top-52 w-1/2 h-fit max-sm:w-full z-30 flex items-center justify-center">
                <div className="w-full max-w-md px-6 py-8 backdrop-blur-md shadow-lg rounded-2xl animate-postAnim4 duration-500 border-2 border-base-200 mx-4">
                  <Login />
                  <div className="text-center mt-4">
                    <button className="text-primary underline" onClick={handleShowRegister}>
                      New User? Register
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
    </>
  );
};

export default Landing;
