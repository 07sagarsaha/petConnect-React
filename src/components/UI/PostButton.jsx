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
    <div onClick={isClicked ? null : handleClickEvent} className={`relative flex text-[#da80ea] hover:text-[#e0e0e0] z-10 p-4 m-8 max-sm:mt-4 max-sm:ml-0 max-sm:text-[24px] justify-center items-center transition-all shadow-[6px_6px_16px_#9d9d9d,-6px_-6px_16px_#ffffff] rounded-2xl w-52 max-sm:w-[95%] h-16 ease-in-out animate-postButtonAnim1 duration-700 ${isClicked 
              ? `bg-purple-300 text-[210%] text-white hover:text-white flex-col gap-4 w-[100%] h-[62vh] max-sm:w-[90%] max-sm:h-[8%]` 
              : `text-xl  max-sm:w-[90%] hover:bg-[#da80ea] bg-[#e0e0e0]  hover:shadow-[11px_11px_19px_#d0d0d0,-11px_-11px_19px_#f0f0f0]`}`}>
      
      <p className={`${isClicked ? `absolute top-4 self-center` : `relative ml-[-50px]`}`}>{buttonName}</p>
      <div className={`ml-3 absolute top-0 right-0 px-4 py-[1.1rem] rounded-lg transition-all duration-500 ${isClicked && `rotate-45 text-white hover:text-red-600`}`} onClick={handleClickEvent}>{icon}</div>
      {isClicked 
            &&(<>
            <input type='text' placeholder={`What's on your mind?`} value={title} className={`w-[95%] mt-[-25px] max-sm:max-w-[95%] max-sm:h-[7%] max-sm:text-lg outline-none text-xl rounded-lg p-4 text-black animate-postButtonAnim1 shadow-Uni`} onChange={(e) => setTitle(e.target.value)}></input>
            <textarea placeholder={`Describe some more...`} value={content} className={`h-44 w-[95%] max-sm:max-w-[95%] max-sm:h-[27%] max-sm:text-lg outline-none text-xl rounded-lg pl-4 pt-2 text-gray-600 animate-postButtonAnim1 shadow-Uni`} onChange={(e) => setContent(e.target.value)}></textarea>
            <div className={`w-[95%] max-sm:h-[15%]  mb-5 relative pl-4 flex-col justify-center items-start rounded-lg py-2 max-sm:max-w-[95%] text-gray-600 bg-white animate-postButtonAnim1 shadow-Uni transition-all duration-100`}>
              <p htmlFor='sevScale' className='text-xl max-sm:text-base relative'> Severity Scale:{' '}
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
                    </p>
              <input type="range" min={1} max={5} value={sevVal} id='sevScale' className={`relative text-gray-600 animate-postButtonAnim1 w-56 max-sm:w-[10rem]`} onChange={(e) => setSevVal(parseInt(e.target.value))}/>
            </div>
            <button type='submit' className={`text-[24px] bg-white absolute bottom-0 right-0 text-black p-4 m-8 animate-postButtonAnim1 shadow-Uni hover:shadow-lg rounded-lg transition-all duration-500`} onClick={handleSubmit}>{submitName}</button></>)}
    </div>
    </>
  )
}

export default Button;