import React, { useEffect, useState } from 'react'

const Posts = ({keyVal, handle, title, content, sevVal, date, width}) => {
    const severityEmojis = {
        1: '😃 (very good)', // Very happy
        2: '🙂 (good)', // Happy
        3: '😐 (neutral)', // Neutral
        4: '😨 (not good)', // Worried
        5: '😭 (contact vet)', // Sad
    };
  return (
    <>
    <div key={keyVal} className={`text-xl bg-[#e0e0e0] relative p-6 m-8 flex-col justify-center items-center shadow-[6px_6px_16px_#9d9d9d,-6px_-6px_16px_#ffffff] h-max min-h-12 w-[${width}] rounded-2xl animate-postAnim3 transition-all ease-in-out duration-200`}>
        <p className='text-lg text-gray-500'>{handle} posted:</p>
        <h1 className='text-xl font-bold py-4'>{title}</h1>
        <h2 className='text-lg font-semibold'>{content}</h2>
        {(sevVal) && <h2 className='text-lg py-4'>Severity Index: {severityEmojis[sevVal]}</h2>}
        {(sevVal) && <input type="range" min={1} max={5} value={sevVal} onChange={null} className='rounded-lg'></input>}
        <p className='text-sm text-gray-500 absolute top-0 right-0 p-4'>{date}</p>
    </div>
    </>
  )
}

export default Posts