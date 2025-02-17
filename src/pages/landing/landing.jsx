import React, { useRef } from "react";
import { Navigate, NavLink } from "react-router-dom";
import { useAuth } from "../../context/authContext/authContext";
import landingimg from "../../assets/landingPage.jpg";
import dog3d from "../../assets/voxel_dog.glb";
import Header from "../../components/auth/header";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

const degreesToRadians = (degrees) => (degrees * Math.PI) / 180;
const PetModel = () => {
  const { scene } = useGLTF(dog3d);
  return (
    <primitive
      object={scene}
      scale={0.5}
      rotation={[
        degreesToRadians(20),
        degreesToRadians(-50),
        degreesToRadians(0),
      ]} // Set default rotation
    />
  );
};

const Landing = () => {
  const { userLoggedIn } = useAuth();
  const controlsRef = useRef();

  return (
    <div className="flex flex-col h-screen ">
      {userLoggedIn && <Navigate to={"/in/home"} replace={true} />}
      <div className="flex flex-col bg-base-100">
        {/* header */}
        <Header />
        {/* landingPage */}
        <div className="flex flex-col  md:flex-row items-center justify-center px-8 flex-grow">
          <div className="w-1/2 p-4 max-sm:w-full">
            <h1 className="text-4xl text-center font-bold mb-4 text-primary">
              Welcome to Pet Connect
            </h1>
            <p className="text-lg mb-4 text-neutral text-center">
              As a platform to help you figure out any problem, any question,
              from a wide range of pet lovers, pet owners, and pet parents just
              like you. We aim to build a community of like-minded pet lovers,
              which you can be a part of today, whether new or veteran!
            </p>
            <div className="flex justify-center items-center">
              <NavLink to="/signup">
                <button className="bg-primary shadow-lg justify-center items-center text-base-100 py-2 px-6 rounded-lg transform hover:scale-105 transition-transform duration-300">
                  Join the community
                </button>
              </NavLink>
            </div>
          </div>
          <div className="md:w-1/2 h-screen p-4 flex justify-center items-center">
            <Canvas className="w-full h-full">
              <ambientLight intensity={0.5} />
              <directionalLight position={[0, 5, 5]} />
              <PetModel />
              <OrbitControls ref={controlsRef} />
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
