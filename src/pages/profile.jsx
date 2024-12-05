import React, { useEffect, useState } from "react";
import Button from "../context/authContext/button";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

function Profile() {
  const [pfp, setPfp] = useState("/src/icons/pfp.png");
  const [bg, setBG] = useState("/src/Assets/background.jpg");
  const [userData, setUserData] = useState();

  useEffect(() => {
    const fetchUser = async ()=>{
      try{
        const user = auth.currentUser;
        if(user){
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if(userDoc.exists()){
            setUserData(userDoc.data())
          }
        }
      }
      catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchUser();
  }, []);

  const bgPicChange = (e) => {
    const bgfile = e.target.files[0];
    if (bgfile) {
      setBG(URL.createObjectURL(bgfile)); // Use setBG here to update background
    }
  };

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPfp(URL.createObjectURL(file)); // Use setPfp to update profile pic
    }
  };

  return (
    <>
      <div className="m-5 ml-[19px] bg-[#eeeeee] rounded-lg shadow-lg p-5 w-full">
        <div className="flex flex-col items-center justify-center text-center mb-[19px]">
          <div className="relative object-cover w-full h-[200px] mb-[20px]">
            <img src={bg} className="w-full rounded-lg h-full object-cover" alt="Background" />
            <div className="absolute top-2 right-2">
              <label
                className="text-lg p-3 m-[10px] flex justify-center items-center rounded-2xl bg-gradient-to-r from-purple-400 to-pink-400 text-white hover:shadow-2xl border-4 ease-in-out duration-700"
                htmlFor="bgUpload" // Updated to refer to bgUpload
              >
                <input
                  type="file"
                  id="bgUpload" // Changed ID to bgUpload
                  className="hidden"
                  onChange={bgPicChange}
                />
                +
              </label>
            </div>
          </div>
          <img className="w-[150px] h-[150px] rounded-full" src={pfp} alt="Profile" />
          <h1 className="text-center">{userData?.name || 'loading...'}</h1>
          <h1 className="text-center">{userData?.handle || 'loading...'}</h1>

          <div className="flex justify-center mt-4">
            <label
              className="text-lg p-3 m-[10px] flex justify-center items-center rounded-2xl bg-gradient-to-r from-purple-400 to-pink-400 text-white hover:shadow-2xl border-4 ease-in-out duration-700"
              htmlFor="upload"
            >
              <input
                type="file"
                onChange={handlePicChange}
                id="upload"
                className="hidden"
              />
              Edit profile
            </label>
          </div>

          <p>Bio about their users</p>
        </div>
        <div className="flex justify-between mb-[20px]">
          <div>
            <h2>Basic info</h2>
            <p className="mb-[10px]">
              <strong>Location:</strong> "User location"
            </p>
            <p className="mb-[10px]">
              <strong>Email:</strong> {userData?.email}
            </p>
          </div>
          <div>
            <h2>Pet info</h2>
            <p className="mb-[10px]">
              <strong>Number of pets:</strong> "2"
            </p>
            <p className="mb-[10px]">
              <strong>Pets registered with vets:</strong> "Yes"
            </p>
          </div>
        </div>
        <div className="flex justify-center align-middle">
          <Button title="Edit Pet profile" />
        </div>
        <div className="mb-[20px]">
          <h3>Pet Profiles</h3>
          <div className="flex justify-between bg-gradient-to-r from-purple-400 to-pink-400 p-[10px] rounded-lg">
            <div className="flex flex-col gap-2 text-white">
              <p>
                <strong>Age:</strong> "3 years"
              </p>
              <p>
                <strong>Breed:</strong> "Cat"
              </p>
              <p>
                <strong>Medical Checkup:</strong> "Healthy"
              </p>
            </div>
            <img
              className="w-[100px] h-auto rounded-md"
              src="../src/Assets/catto.jpg"
              alt="Pet"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
