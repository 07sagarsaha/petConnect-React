import React from "react";
import Button from "../components/UI/PostButton";
import { IoMdAddCircleOutline } from "react-icons/io";
import Posts from "../components/UI/Posts";

function Home() {
  return (
    <>
    <Button buttonName={"New Post"} icon={<IoMdAddCircleOutline className="size-7 mr-2"/>} submitName={"Post"}/>
    <Posts/>
    </>
  );
}

export default Home;
