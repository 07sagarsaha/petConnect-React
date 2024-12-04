import React, { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../firebase/firebase';

const Button = ({buttonName, icon, submitName}) => {

  const [isClicked, setIsClicked] = useState(false);
  const [title, setTitle] = useState(''); 
  const [content, setContent] = useState('');

  function handleClickEvent(){
    setIsClicked(!isClicked);
  }

  const handleSubmit = (e) => { 
    e.preventDefault(); 
    addDoc(collection(db, 'posts'), {
      title,
      content,
      createdAt: serverTimestamp(),
    })
    .then(() => {
      setTitle('');
      setContent('');
    })
    .catch((error) => {
      console.error('Error adding post: ', error);
    });
    setIsClicked(!isClicked);
    };

  return (
    <>
    <div id='submit' onClick={isClicked ? null : handleClickEvent} disabled={isClicked} className={`text-xl relative p-6 m-8 flex justify-center items shadow-xl h-max min-h-12 w-max min-w-20 rounded-2xl hover:bg-[#c183f8c4] bg-gradient-to-b from-[#c183f8c4] to-[#f173bac0] text-white hover:shadow-2xl border-4 transition-all ease-in-out animate-postButtonAnim1 duration-700 ${isClicked && `min-w-[55rem] min-h-[42rem] text-[210%]`}`}>
      {isClicked ? "" : icon}
      {buttonName}
      <button className={`text-3xl absolute top-0 right-0 p-4 rounded-lg hover:text-red-600 animate-postButtonAnim2 transition-all duration-500 ${!isClicked && `hidden`}`} onClick={handleClickEvent}>{isClicked && 'x'}</button>
      <input type='text' placeholder={`What's on your mind?`} className={`h-max w-[50rem] outline-none text-xl rounded-lg p-4 text-black top-20 items-center animate-postButtonAnim1 absolute shadow-Uni ${!isClicked && `hidden`}`} onChange={(e) => setTitle(e.target.value)}></input>
      <textarea placeholder={`Describe some more...`} className={`h-44 w-[50rem] outline-none text-xl rounded-lg p-4 text-gray-600 top-40 items-start animate-postButtonAnim1 absolute shadow-Uni ${!isClicked && `hidden`}`} onChange={(e) => setContent(e.target.value)}></textarea>
      <button type='submit' className={`bg-white absolute bottom-0 right-0 text-black p-4 m-8 animate-postButtonAnim1 shadow-Uni hover:shadow-lg rounded-lg transition-all duration-500 ${!isClicked && `hidden`}`} onClick={handleSubmit}>{submitName}</button>
    </div>
    </>
  )
}

export default Button;