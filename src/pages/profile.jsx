import React from "react";

function Profile() {
  return(
    <>
    <div class="m-5 ml-[19px] bg-white rounded-lg shadow-lg p-5 w-full">
      <div class="text-center mb-[19px]">
        <div class="object-cover bg-slate-400 w-full h-[200px] mb-[20px]">
          <img src="src\Assets\background.jpg" class="w-full h-full object-cover"/>
          <div class="relative">
            <label class="absolute w-[19px] h-[19px] right-0 rounded-md cursor-pointer bg-slate-400 appearance-none">+</label>
          </div>
        </div>
        <img class="cover w-[150px] h-[150px]" src="src\icons\pfp.png"/>
          <h1 class="block text-center">Loading....</h1>
          <h1 class="block text-center">@email</h1>
          <div>
            <label class="inline-flex items-center appearance-none bg-gradient-to-r from-[#FF512F] via-[#DD2476] to-[#FF512F] mt-1 p-2.5 px-5 text-center uppercase transition duration-500 bg-[200%] text-white font-sans rounded-[19px]">
              <img class="w-[20px] h-[20px]" src="src\icons\edit.png"/>Edit Profile</label>
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
        <label class="inline-flex items-center appearance-none bg-gradient-to-r from-[#FF512F] via-[#DD2476] to-[#FF512F] mt-1 p-2.5 px-5 text-center uppercase transition duration-500 bg-[200%] text-white font-sans rounded-[19px]">
        <img class="w-[20px] h-[20px]" src="src\icons\edit.png"/>Edit Pet details</label>
      </div>
      <div class="mb-[20px]">
        <h3>Pet Profiles</h3>
        <div class="bg-slate-400 p-[10px] rounded-lg">
        <p>
          <strong>Age:</strong>"3 years"
        </p>
        <p>
          <strong>Breed:</strong>"Cat"
        </p>
        <p>
          <strong>Medical Checkup:</strong>"Healthy"
        </p>
        <img class="w-[100px] h-auto" src="src\Assets\catto.jpg"/>
        </div>
      </div> 
    </div>
    </>
  );
}

export default Profile;
