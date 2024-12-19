import React, { useState } from 'react'
import { auth, db } from '../firebase/firebase';
import { collection, doc, getDoc, query, updateDoc, where, getDocs } from 'firebase/firestore';
import { BsPencil } from 'react-icons/bs';

const ProfileEdit = ({image, name, handle, bio}) => {
  const [profilePic, setProfilePic] = useState(image);
  const [changeName, setNameChange] = useState(name);
  const [changeHandle, setChangeHandle] = useState(handle);
  const [changeBio, setChangeBio] = useState(bio);

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
    if(!(changeName.trim() || changeHandle.trim() || changeBio.trim())){
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
          bio: changeBio,
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
        <div className='h-full w-full left-0 justify-center items-center flex flex-row fixed top-0 z-40 bg-[#808080ab] transition-colors duration-200'>
            <div className='h-4/5 max-sm:h-max w-1/2 max-sm:w-[80%] absolute rounded-xl bg-[#e0e0e0] shadow-xl overflow-hidden'>
              <h1 className='text-2xl mt-4'>Update Your Profile</h1>
              <div className='flex flex-row justify-center gap-6 items-center'>
                <img
                  className="w-[150px] h-[150px] rounded-full object-cover"
                  src={profilePic}
                  alt="Profile"
                />
                <label 
                  htmlFor="profile_image" 
                  className='text-lg p-3 m-[10px] absolute ml-40 mt-32 rounded-full bg-[#e43d12] text-white hover:bg-[#e0e0e0] hover:text-[#e43d12] ease-in-out duration-700'>
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
                className='w-[55%] max-sm:w-[75%] max-sm:h-[5vh] max-sm:text-lg outline-none text-xl rounded-lg p-4 text-black mt-9'
                onChange={(e) => setNameChange(e.target.value)}/>
              <input 
                placeholder={handle}
                value={changeHandle} 
                type="text" 
                className='w-[55%] max-sm:w-[75%] max-sm:h-[5vh] max-sm:text-lg outline-none text-xl rounded-lg p-4 text-black mt-5'
                onChange={(e) => setChangeHandle(e.target.value)}/>

              <textarea 
                placeholder={bio}
                value={changeBio} 
                type="text" 
                className='w-[55%] max-sm:w-[75%] h-[10vh] max-sm:text-lg outline-none text-xl rounded-lg p-4 text-black mt-5'
                onChange={(e) => setChangeBio(e.target.value)}/>

              <button 
                className=' text-lg p-3 m-[10px] ml-40 rounded-xl bg-[#e43d12] text-white shadow-[6px_6px_11px_#c8c6bf,-6px_-6px_11px_#ffffff] hover:bg-[#e0e0e0] hover:text-[#e43d12] ease-in-out duration-700'
                onClick={handleProfileUpdate}>
                  Done
              </button>
            </div>
        </div>
    </>
  )
}

export default ProfileEdit