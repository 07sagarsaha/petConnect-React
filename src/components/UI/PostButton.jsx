import React, { useState } from 'react'

const Button = ({buttonName}) => {

  const [isClicked, setIsClicked] = useState(false);

  function handleClickEvent(){
    setIsClicked(!isClicked);
  }

  return (
    <>
    <button className={`text-3xl absolute left-[1050px] top-10 rounded-lg p-4 hover:bg-red-500 animate-postButtonAnim1 hover:text-white transition-all duration-500 ${!isClicked && `hidden`}`} onClick={handleClickEvent}>{isClicked && 'x'}</button>
    <div id='submit' onClick={isClicked ? null : handleClickEvent} disabled={isClicked} className={`text-xl p-6 m-8 flex justify-center items shadow-xl h-max min-h-12 w-max min-w-20 rounded-2xl bg-gradient-to-b from-[#c183f8c4] to-[#f173bac0] text-white hover:shadow-2xl border-4 transition-all ease-in-out animate-postButtonAnim1 duration-700 ${isClicked && `min-w-[55rem] min-h-[42rem] text-[30px]`}`}>
      {!isClicked ? "New Post" : "Create a post"}
      <input type='text' placeholder={`What's on your mind?`} className={`h-max w-[50rem] outline-none text-xl rounded-lg p-4 text-black z-10 mt-20 animate-postButtonAnim1 absolute shadow-Uni ${!isClicked && `hidden`}`}></input>
    </div>
    </>
  )
}

export default Button;