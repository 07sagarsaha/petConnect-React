import React, { useState } from 'react'
import { auth, db } from '../firebase/firebase';
import { collection, doc, getDoc, query, updateDoc, where, getDocs } from 'firebase/firestore';
import { BsPencil } from 'react-icons/bs';

const ProfileEdit = ({image, name, handle}) => {
  const [profilePic, setProfilePic] = useState(image);
  const [changeName, setNameChange] = useState(name);
  const [changeHandle, setChangeHandle] = useState(handle);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Pet-connect");

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dagtbrme6/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();

      if (data.secure_url) {
        setProfilePic(data.secure_url);

        // Update user profile in Firestore
        if (auth.currentUser.uid) {
          const userRef = doc(db, "users", auth.currentUser.uid);
          await updateDoc(userRef, {
            profilePic: data.secure_url,
          });
        }
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if(!changeName.trim() || !changeHandle.trim()){
      alert("Change Your Name Or Handle!");
      return;
    }

    const user = auth.currentUser;

    if(user){
      const userDoc = doc(db, 'users', user.uid);
      try{
        await updateDoc(userDoc, {
          name: changeName,
          handle: changeHandle,
        });
        alert("Updated Successfully!");
      }
      catch(error){
        console.error(error);
      }
      const postRef = collection(db, 'posts');
      const q = query(postRef, 
        where('userId', '==', user.uid)
      );
      try{
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (doc) => {
          const post = doc.ref;
          await updateDoc(post,{
            handle: changeHandle
          })
        })
      }
      catch(error){
        console.error(error);
      }
    }
  }

  return (
    <>
        <div className='h-full w-full left-0 justify-center items-center flex fixed top-0 z-40 bg-[#808080ab] transition-colors duration-200'>
            <div className='h-4/5 w-1/2 absolute rounded-xl bg-[#e0e0e0] shadow-xl overflow-hidden'>
              <h1 className='text-2xl mt-4'>Update Your Profile</h1>
              <div className='flex flex-row justify-center gap-6 mt-10 items-center'>
                <img
                  className="w-[150px] h-[150px] rounded-full object-cover"
                  src={profilePic}
                  alt="Profile"
                />
                <label 
                  htmlFor="profile_image" 
                  className='text-lg p-3 m-[10px] absolute ml-40 mt-32 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 text-white hover:shadow-2xl border-4 ease-in-out duration-700'>
                    <BsPencil />
                  </label>
                <input
                  type="file"
                  id="profile_image"
                  accept="images/*"
                  className='hidden'
                  onChange={handleImageChange}
                />
              </div>
              <input
                placeholder={name}
                value={changeName} 
                type="text" 
                className='w-[55%] max-sm:max-w-[95%] max-sm:h-[5vh] max-sm:text-lg outline-none text-xl rounded-lg p-4 text-black mt-9'
                onChange={(e) => setNameChange(e.target.value)}/>
              <input 
                placeholder={handle}
                value={changeHandle} 
                type="text" 
                className='w-[55%] max-sm:max-w-[95%] max-sm:h-[5vh] max-sm:text-lg outline-none text-xl rounded-lg p-4 text-black mt-9'
                onChange={(e) => setChangeHandle(e.target.value)}/>

              <button 
                className='absolute bottom-10 right-10 text-lg p-3 m-[10px] ml-40 mt-32 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 text-white hover:shadow-2xl border-4 ease-in-out duration-700'
                onClick={handleProfileUpdate}>
                  Done
              </button>
            </div>
        </div>
    </>
  )
}

export default ProfileEdit