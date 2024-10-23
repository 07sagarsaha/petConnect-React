import React from "react";
import Button from "../context/authContext/button";

function Profile() {
  return(
    <>
    <div class="m-5 ml-[19px] bg-white rounded-lg shadow-lg p-5 w-full">
      <div class="flex flex-col items-center justify-center align-middle text-center mb-[19px]">
        <div class="object-cover  w-full h-[200px] mb-[20px]">
          <img src="../src/Assets/background.jpg" class="w-full h-full object-cover"/>
          <div class="absolute flex justify-end">
            <Button title="+"/>
          </div>
        </div>
        <img class="cover w-[150px] h-[150px]" src="../src/icons/pfp.png"/>
          <h1 class="block text-center">Loading....</h1>
          <h1 class="block text-center">@email</h1>
          <div className="flex justify-center">
            <Button title="Edit profile"/>
          </div>
          <p>Bio about their users</p>
      </div>
      <div class="flex justify-between mb-[20px]">
        <div>
          <h2>Basic info</h2>
          <p class="mb-[10px]">
            <strong>Location:</strong>
            "User location"
          </p>
          <p  class="mb-[10px]">
            <strong>Email:</strong>
            "User email"
          </p>
        </div>
        <div>
          <h2>Pet info</h2>
          <p class="mb-[10px]">
            <strong>
              Number of pets:
            </strong>
            "2"
          </p>
          <p class="mb-[10px]">
            <strong>
              Pets registered with vets:
            </strong>
            "Yes"
          </p>
        </div>
      </div>
      <div class="flex justify-center align-middle">
        <Button title="Edit Pet profile"/>
      </div>
      <div class="mb-[20px]">
        <h3>Pet Profiles</h3>
        <div class="flex justify-between bg-gradient-to-r from-purple-400 to-pink-400 p-[10px] rounded-lg">
        <div class="flex flex-col gap-2 text-white">
        <p>
          <strong>Age:</strong>"3 years"
        </p>
        <p>
          <strong>Breed:</strong>"Cat"
        </p>
        <p>
          <strong>Medical Checkup:</strong>"Healthy"
        </p>
        </div>
        <img class="w-[100px] h-auto rounded-md" src="../src/Assets/catto.jpg"/>
        </div>
      </div> 
    </div>
    </>
  );
}

export default Profile;
