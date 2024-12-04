import React from "react";
import Button from "../components/UI/PostButton";
import { IoMdAddCircleOutline } from "react-icons/io";

function Home() {
  return (
    <>
    <Button buttonName={"New Post"} icon={<IoMdAddCircleOutline className="size-7 mr-2"/>} submitName={"Post"}/>
    </>
  );
}

export default Home;
