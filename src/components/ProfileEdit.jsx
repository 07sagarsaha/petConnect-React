import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  doc,
  getDoc,
  query,
  updateDoc,
  where,
  getDocs,
} from "firebase/firestore";
import { IoMdClose } from "react-icons/io";
import { useToast } from "../context/ToastContext";
import { useUser } from "@clerk/clerk-react";
import { BiPencil } from "react-icons/bi";
import { FaPaw } from "react-icons/fa6";
import { City, Country, State } from "country-state-city";
import CustomListBox from "./UI/CustomListbox";

const ProfileEdit = ({
  image,
  name,
  handle,
  bio,
  address,
  pin,
  selectedCountry,
  selectedState,
  selectedCity,
  onProfileUpdate,
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState(image);
  const [changeName, setNameChange] = useState(name);
  const [changeHandle, setChangeHandle] = useState(handle);
  const [changeBio, setChangeBio] = useState(bio);
  const [changeAddress, setAddress] = useState(address);
  const [changePin, setPin] = useState(pin);
  const { user } = useUser();
  const { showToast } = useToast();
  const [changeSelectedCountry, setSelectedCountry] = useState(
    typeof selectedCountry === "string"
      ? { label: selectedCountry, value: selectedCountry }
      : selectedCountry
  );
  const [changeSelectedState, setSelectedState] = useState(
    typeof selectedState === "string"
      ? { label: selectedState, value: selectedState }
      : selectedState
  );
  const [changeSelectedCity, setSelectedCity] = useState(
    typeof selectedCity === "string"
      ? { label: selectedCity, value: selectedCity }
      : selectedCity
  );
  const [hasChanged, setHasChanged] = useState(false);
  const [wantNewAddress, setWantNewAddress] = useState(false);

  const cloudinaryAccounts = [
    //add more cloudinary accounts here just add the name and and change the url too
    //  https://api.cloudinary.com/v1_1/Put_your_cloud_name_here/image/upload
    {
      name: "Post_Image",
      url: import.meta.env.VITE_CLOUDINARY_URL_1,
    },
    {
      name: "Post_Image",
      url: import.meta.env.VITE_CLOUDINARY_URL_2,
    },
    {
      name: "Post_Image",
      url: import.meta.env.VITE_CLOUDINARY_URL_3,
    },
    {
      name: "Post_Image",
      url: import.meta.env.VITE_CLOUDINARY_URL_4,
    },
    {
      name: "post-image",
      url: import.meta.env.VITE_CLOUDINARY_URL_5,
    },
  ];

  const countryOptions = Country.getAllCountries().map((country) => ({
    label: country.name,
    value: country.isoCode,
  }));

  const stateOptions = changeSelectedCountry
    ? State.getStatesOfCountry(changeSelectedCountry.value).map((state) => ({
        label: state.name,
        value: state.isoCode,
      }))
    : [];

  const cityOptions = changeSelectedState
    ? City.getCitiesOfState(
        changeSelectedCountry.value,
        changeSelectedState.value
      ).map((city) => ({
        label: city.name,
        value: city.name,
      }))
    : [];

  const [currentAccountIndex, setCurrentAccountIndex] = useState(0);
  const getNextAccount = () => {
    const nextIndex = (currentAccountIndex + 1) % cloudinaryAccounts.length;
    setCurrentAccountIndex(nextIndex);
    return cloudinaryAccounts[nextIndex];
  };

  const handleImageChange = async (e) => {
    let file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const currentAccount = getNextAccount();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", currentAccount.name);

    //The code is not working for some reason
    try {
      const res = await fetch(currentAccount.url, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.secure_url) {
        setProfilePic(data.secure_url);

        // Update user profile in Firestore
        if (user.id) {
          const userRef = doc(db, "users", user.id);
          await updateDoc(userRef, {
            profilePic: data.secure_url,
          });

          if (typeof onProfileUpdate === "function") {
            onProfileUpdate({ profilePic: data.secure_url });
          }
        }
      }
      showToast("Profile Picture Updated!");
      setLoading(false);
      file = "";
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      showToast("Something went wrong!");
      setLoading(false);
      file = "";
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!(changeName.trim() || changeHandle.trim() || changeBio.trim())) {
      showToast("Please fill in the fields to update your profile.");
      return;
    }

    if (user) {
      const userDoc = doc(db, "users", user.id);
      try {
        await updateDoc(userDoc, {
          name: changeName,
          handle: changeHandle,
          bio: changeBio,
          address: changeAddress,
          pin: changePin,
          selectedCountry: changeSelectedCountry,
          selectedState: changeSelectedState,
          selectedCity: changeSelectedCity,
        });
        showToast("Profile Updated!");
      } catch (error) {
        console.error(error);
      }
      const postRef = collection(db, "posts");
      const q = query(postRef, where("userId", "==", user.id));
      try {
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (doc) => {
          const post = doc.ref;
          await updateDoc(post, {
            handle: changeHandle,
          });
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    const nameChanged = changeName.trim() !== name;
    const bioChanged = changeBio.trim() !== bio;
    const handleChanged = changeHandle.trim() !== handle;
    const addressChanged = changeAddress.trim() !== address;
    const pinChanged = changePin !== pin;

    if (
      nameChanged ||
      bioChanged ||
      handleChanged ||
      addressChanged ||
      pinChanged
    ) {
      setHasChanged(true);
    } else {
      setHasChanged(false);
    }
  }, [
    changeName,
    changeBio,
    changeHandle,
    changeAddress,
    changePin,
    name,
    bio,
    handle,
    address,
    pin,
  ]);

  return (
    <>
      {isClicked && (
        <div
          className="fixed z-30 w-full h-full bg-black/30 opacity-50 top-0 left-0"
          onClick={() => {
            setIsClicked(!isClicked);
          }}
        />
      )}
      <div
        className={`text-xl ${isClicked ? `fixed max-sm:w-full rounded-xl max-sm:rounded-none max-sm:h-full z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-base-100/20 backdrop-blur-lg border-2 border-base-content/20 w-3/5 h-4/5` : `top-0 right-0 rounded-xl cursor-pointer p-2 h-fit w-fit flex justify-end items-center gap-3 btn btn-primary text-base-100 shadow-lg border-2 border-primary`}`}
        onClick={() => {
          if (!isClicked) {
            setIsClicked(!isClicked);
          }
        }}
      >
        {!isClicked && (
          <div className="flex flex-row gap-2 items-center">
            <BiPencil size={25} />
            <p>{" Edit Profile"}</p>
          </div>
        )}
        {isClicked && (
          <div className="flex flex-col justify-between h-full p-8 max-sm:px-8 max-sm:py-4 items-start relative max-sm:overflow-y-auto">
            <button
              className="absolute max-sm:fixed max-sm:z-40 right-6 top-6 bg-primary text-base-100 size-8 rounded-full hover:bg-primary/75 flex justify-center items-center transition-all"
              onClick={() => {
                setIsClicked(false);
              }}
            >
              <IoMdClose />
            </button>
            <div className="flex flex-row max-sm:flex-col max-sm:w-full gap-8 items-center w-1/2">
              <div className="relative w-1/3 max-sm:w-1/2">
                <img
                  alt="Profile"
                  src={profilePic}
                  className="object-cover rounded-full size-32"
                />
                <div
                  className={
                    loading
                      ? `absolute top-0 left-0 bg-black/50 w-full h-full rounded-full opacity-100`
                      : `opacity-0`
                  }
                >
                  <FaPaw
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse text-white/50"
                    size={30}
                  />
                </div>
                <label
                  className={`absolute bottom-0 right-0 btn ${loading ? `btn-disabled` : `btn-primary`} rounded-full btn-sm`}
                >
                  <BiPencil size={20} />
                  <input
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                  />
                </label>
              </div>
              <div className="relative h-18 w-full">
                <p className="text-sm text-primary absolute -top-6 left-0">
                  {"Name"}
                </p>
                <input
                  type="text"
                  value={changeName}
                  placeholder="Enter Your New Name"
                  className="h-14 rounded-xl outline-none px-4 w-full bg-base-100"
                  onChange={(e) => setNameChange(e.target.value)}
                />
              </div>
            </div>
            <div className="relative h-18 mt-8 w-1/2 max-sm:w-full">
              <p className="text-sm text-primary absolute -top-6 left-0">
                {"Handle"}
              </p>
              <input
                type="text"
                value={changeHandle}
                placeholder="Enter Your New Handle"
                className="h-14 rounded-xl outline-none px-4 w-full bg-base-100"
                onChange={(e) => setChangeHandle(e.target.value)}
              />
            </div>
            <div className="relative h-18 mt-8 w-full">
              <p className="text-sm text-primary absolute -top-6 left-0">
                {"Bio"}
              </p>
              <textarea
                type="text"
                value={changeBio}
                placeholder="Enter Your New Bio"
                className="rounded-xl resize-none w-full p-4 h-36 bg-base-100"
                onChange={(e) => setChangeBio(e.target.value)}
              />
            </div>
            <div
              className="flex flex-row items-center gap-2 rounded-xl p-4 bg-base-100 relative h-18 mt-8 justify-between w-full"
              onClick={() => setWantNewAddress(!wantNewAddress)}
            >
              <p className="text-sm text-primary absolute -top-6 left-0">
                {"Change Address"}
              </p>
              <p className="text-start">{"Want to Change Address as well?"}</p>
              <input
                type="checkbox"
                checked={wantNewAddress}
                onChange={(e) => setWantNewAddress(e.target.checked)}
                className="toggle toggle-primary ml-2"
              />
            </div>
            {wantNewAddress && (
              <>
                <div className="flex flex-row justify-between w-full gap-4 max-sm:flex-col max-sm:gap-2">
                  <CustomListBox
                    options={countryOptions}
                    value={changeSelectedCountry}
                    onChange={setSelectedCountry}
                    placeholder="Select Country"
                    labelText="Country"
                  />

                  <CustomListBox
                    options={stateOptions}
                    value={changeSelectedState}
                    onChange={setSelectedState}
                    placeholder="Select State"
                    labelText="State"
                  />

                  <CustomListBox
                    options={cityOptions}
                    value={changeSelectedCity}
                    onChange={setSelectedCity}
                    placeholder="Select City"
                    labelText="City"
                  />
                </div>
                <div className="flex flex-row w-full gap-4 max-sm:mb-20">
                  <div className="relative h-18 mt-8 w-full">
                    <p className="text-sm text-primary absolute -top-6 left-0">
                      {"Address"}
                    </p>
                    <input
                      type="text"
                      value={changeAddress}
                      placeholder="Enter Your New address"
                      className="h-14 rounded-xl outline-none px-4 w-full bg-base-100"
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <div className="relative h-18 mt-8 w-full">
                    <p className="text-sm text-primary absolute -top-6 left-0">
                      {"Pincode"}
                    </p>
                    <input
                      type="text"
                      value={changePin}
                      placeholder="Enter Your New Pin"
                      className="h-14 rounded-xl outline-none px-4 w-full bg-base-100"
                      onChange={(e) => setPin(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
            <button
              className={`self-center btn btn-primary max-sm:shadow-Uni max-sm:shadow-black/50 ${wantNewAddress ? `max-sm:fixed max-sm:z-50 max-sm:bottom-4` : ``}`}
              disabled={!hasChanged}
              onClick={handleProfileUpdate}
            >
              {"Done"}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileEdit;
