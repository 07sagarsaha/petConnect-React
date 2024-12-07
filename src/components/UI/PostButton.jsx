import React, { useEffect, useState } from 'react'
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../firebase/firebase';

const Button = ({buttonName, icon, submitName, howMuchCurve}) => {

  const [isClicked, setIsClicked] = useState(false);
  const [title, setTitle] = useState(''); 
  const [content, setContent] = useState('');
  const [sevVal, setSevVal] = useState(3);
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe;
  }, []);

  function handleClickEvent(){
    setIsClicked(!isClicked);
    if(isClicked){
      setTitle("");
      setContent("");
      setSevVal(3);
    }
  }

  const handleSubmit = async (e) => { 
    e.preventDefault();
    if(!title.trim()){
      alert("Set a title before posting!");
      return;
    }
    const user = auth.currentUser;
    try {
      if(user){
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.exists() ? userDoc.data() : { handle: 'Unknown' };
        console.log(userData.handle);
        const postRef = collection(db, 'posts'); 
        await addDoc(postRef, {
          title,
          content,
          sevVal,
          handle: userData.handle,
          likes: [],
          dislikes: [],
          createdAt: serverTimestamp(),
          userId: user.uid,
          author: user.email
        })
        .then(() => { 
          // Clear the form fields after successful submission 
          setTitle(''); 
          setContent(''); 
          setSevVal(3);
          setIsClicked(!isClicked);
        });
      } else {
        console.error('User is not logged in.');
      }
    }

    catch(error){console.error('Error adding post: ', error);}  
  };

  return (
    <>
    <div id='submit' onClick={isClicked ? null : handleClickEvent} disabled={isClicked} className={`text-xl relative z-10 p-4 m-8 flex justify-center items shadow-[6px_6px_16px_#9d9d9d,-6px_-6px_16px_#ffffff] h-max min-h-12 w-max min-w-20 rounded-2xl hover:bg-[#da80ea] bg-[#e0e0e0] text-[#da80ea] hover:text-[#e0e0e0] hover:shadow-[11px_11px_19px_#d0d0d0,-11px_-11px_19px_#f0f0f0] transition-all ease-in-out animate-postButtonAnim1 duration-700 ${isClicked && `min-w-[55rem] min-h-[42rem] text-[210%]`}`}>
      {isClicked ? "" : icon}
      {buttonName}
      <button className={`text-3xl absolute top-0 right-0 p-2 rounded-lg hover:text-red-600 animate-postButtonAnim2 transition-all duration-500 ${!isClicked && `hidden`}`} onClick={handleClickEvent}>{isClicked && 'x'}</button>
      <input type='text' placeholder={`What's on your mind?`} value={title} className={`h-max w-[50rem] outline-none text-xl rounded-lg p-4 text-black top-20 items-center animate-postButtonAnim1 absolute shadow-Uni ${!isClicked && `hidden`}`} onChange={(e) => setTitle(e.target.value)}></input>
      <textarea placeholder={`Describe some more...`} value={content} className={`h-44 w-[50rem] outline-none text-xl rounded-lg p-4 text-gray-600 top-40 items-start animate-postButtonAnim1 absolute shadow-Uni ${!isClicked && `hidden`}`} onChange={(e) => setContent(e.target.value)}></textarea>
      <label htmlFor='sevScale' className={`h-20 w-[35rem] outline-none text-xl rounded-lg p-2 text-gray-600 top-80 mt-12 bg-white self-start animate-postButtonAnim1 absolute shadow-Uni ${!isClicked && `hidden`}`}> Severity Scale:{' '}
            {sevVal === 1
              ? '😃 (very good)'
              : sevVal === 2
              ? '🙂 (good)'
              : sevVal === 3
              ? '😐 (neutral)'
              : sevVal === 4
              ? '😨 (not good)'
              : '😭 (contact vet)'
              }
              </label>
      <input type="range" min={1} max={5} value={sevVal} id='sevScale' className={`h-9 w-[30rem] outline-none text-xl rounded-md  p-2 text-gray-600 top-80 bg-white mt-20 self-start animate-postButtonAnim1 absolute ${!isClicked && `hidden`}`} onChange={(e) => setSevVal(parseInt(e.target.value))}></input>
      <button type='submit' className={`bg-white absolute bottom-0 right-0 text-black p-4 m-8 animate-postButtonAnim1 shadow-Uni hover:shadow-lg rounded-lg transition-all duration-500 ${!isClicked && `hidden`}`} onClick={handleSubmit}>{submitName}</button>
    </div>
    </>
  )
}

export default Button;