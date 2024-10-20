import React, { useState } from 'react'

const Button = () => {

  const [isClicked, setIsClicked] = useState(false);

  function handleClickEvent(){
    setIsClicked(!isClicked);
  }

  return (
    <>
    <span className={`h-max w-max text-3xl rounded-lg p-4 z-10 mt-10 ml-80 animate-postButtonAnim1 absolute ${!isClicked && `hidden`}`}>Create a post</span>
    <input type='text' placeholder={`What's on your mind?`} className={`h-max w-[50rem] outline-none text-xl rounded-lg p-4 z-10 mt-32 ml-80 animate-postButtonAnim1 absolute shadow-Uni ${!isClicked && `hidden`}`}></input>
    <div id='submit' className={`text-xl p-6 m-8 flex justify-center items-center shadow-Uni h-max min-h-20 w-max min-w-56 rounded-2xl hover:shadow-UniCol transition-all ease-in-out animate-postButtonAnim1 duration-700 ${isClicked && `min-w-[65%] min-h-[40rem] hover:shadow-2xl`}`}
    onClick={handleClickEvent}>
      {!isClicked && 'Create a post'}
    </div>
    <button className={`h-max w-max text-3xl rounded-lg p-4 hover:bg-red-500 hover:text-white -translate-x-24 translate-y-10 transition-all duration-500 ${!isClicked && `hidden`}`} onClick={handleClickEvent}>{isClicked && 'x'}</button>
    </>
  )
}

export default Button;