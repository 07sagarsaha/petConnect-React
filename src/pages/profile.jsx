import React, { useEffect, useState } from "react";
import Button from "../context/authContext/button";
import { RiDeleteBin6Line } from "react-icons/ri";
import { auth, db } from "../firebase/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import Posts from "../components/UI/Posts";
import { format } from "date-fns";
import { IoMdClose, IoMdAddCircleOutline, IoMdCreate } from "react-icons/io";
import ProfileEdit from "../components/ProfileEdit";
import { BsPencil } from "react-icons/bs";
import { FaDeleteLeft, FaUpRightAndDownLeftFromCenter } from "react-icons/fa6";

function Profile() {
  const [profile, setProfile] = useState();
  const [bg, setBG] = useState("/src/Assets/background.jpg");
  const [userData, setUserData] = useState();
  const [post, setPost] = useState([]);
  const [profilePic, setProfilePic] = useState("/src/icons/pfp.png");
  const [isPFPClicked, setIsPFPClicked] = useState(false);
  const [isProfileEdit, setisProfileEdit] = useState(false);
  const [pets, setPets] = useState([]);
  const [newPet, setNewPet] = useState({
    name: "",
    age: "",
    breed: "",
    photoUrl: "",
  });
  const [isAddPetVisible, setIsAddPetVisible] = useState(false);
  const [editPetId, setEditPetId] = useState(null);
  const [isEditPetModalOpen, setIsEditPetModalOpen] = useState(false);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [confirmDelete, toggleConfirmDelete] = useState(false);

  const handleProfileUpdate = () => {
    setisProfileEdit(!isProfileEdit);
  };

  const user = auth.currentUser;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserData(userData);
            setProfilePic(userData.profilePic || "/src/icons/pfp.png");
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchUser();
  }, [user]);

  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const postData = await Promise.all(
        snapshot.docs.map(async (postDoc) => {
          const postData = postDoc.data();
          return {
            id: postDoc.id,
            ...postData,
          };
        })
      );
      setPost(postData);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const q = query(collection(db, "pets"), where("ownerId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const petsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPets(petsData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddPet = async () => {
    if (!newPet.name || !newPet.age || !newPet.breed || !newPet.photoUrl) {
      alert("Please fill in all pet details.");
      return;
    }

    try {
      if (editPetId) {
        // Update existing pet
        await updateDoc(doc(db, "pets", editPetId), {
          ...newPet,
        });
        setEditPetId(null);
      } else {
        // Add new pet
        await addDoc(collection(db, "pets"), {
          ...newPet,
          ownerId: user.uid,
        });
      }
      setNewPet({ name: "", age: "", breed: "", photoUrl: "" });
      setIsAddPetVisible(false);
      setIsEditPetModalOpen(false);
    } catch (error) {
      console.error("Error adding/updating pet:", error);
    }
  };

  const handlePetImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Pet-connect");

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dagtbrme6/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();

      if (data.secure_url) {
        setNewPet((prevPet) => ({ ...prevPet, photoUrl: data.secure_url }));
      }
    } catch (error) {
      console.error("Error uploading pet picture:", error);
    }
  };

  const bgPicChange = (e) => {
    const bgfile = e.target.files[0];
    if (bgfile) {
      setBG(URL.createObjectURL(bgfile));
    }
  };

  const handleProfileClick = () => {
    setIsPFPClicked(!isPFPClicked);
  };

  const toggleAddPetSection = () => {
    setIsAddPetVisible(!isAddPetVisible);
    setEditPetId(null);
    setNewPet({ name: "", age: "", breed: "", photoUrl: "" });
  };

  const handleEditPet = (pet) => {
    setNewPet({
      name: pet.name,
      age: pet.age,
      breed: pet.breed,
      photoUrl: pet.photoUrl,
    });
    setEditPetId(pet.id);
    setIsEditPetModalOpen(true);
  };

  const handleDeletePet = (pet) => {
    const petRef = doc(db, "pets", pet.id);
    deleteDoc(petRef)
      .then(() => {
        toggleConfirmDelete(!confirmDelete);
      })
      .catch((error) => {
        console.log("Error deleting document." + error);
      })
  }

  const confirmDeleteBox = () => {
    toggleConfirmDelete(!confirmDelete);
  }

  const closeEditPetModal = () => {
    setIsEditPetModalOpen(false);
    setEditPetId(null);
    setNewPet({ name: "", age: "", breed: "", photoUrl: "" });
  };

  const handleBioExpand = () => {
    setIsBioExpanded(!isBioExpanded);
  }

  return (
    <div className="flex justify-center flex-col bg-base-200 text-primary-focus min-h-screen p-8 ">
      <div className="w-4/5 max-sm:w-full self-center bg-base-100 rounded-lg shadow-lg p-6">
        <div className="flex flex-col items-start text-center mb-5">
          {isPFPClicked && profilePic && (
            <div className="h-full w-full left-0 justify-center items-center flex fixed top-0 z-40 transition-colors duration-200">
              <IoMdClose
                className="text-5xl fixed z-50 p-2 right-10 top-16 rounded-lg hover:text-error transition-all duration-300"
                onClick={handleProfileClick}
              />
              <img
                src={profilePic}
                alt="Image"
                className="h-4/5 w-fit m-12 object-contain rounded-2xl animate-postAnim1 fixed z-20"
              />
              <div className="h-full w-full bg-black opacity-50 fixed z-10" onClick={handleProfileClick}/>
            </div>
          )}
          <div className="flex flex-row justify-between w-full gap-5 max-sm:flex-col">
            <div className="flex gap-5 flex-row max-sm:flex-col">
              <img
                className="w-36 h-36 rounded-full object-cover max-sm:self-center"
                src={profilePic}
                alt="Profile"
                onClick={handleProfileClick}
              />
              <div className="flex flex-col justify-center self-center -translate-y-2">
                <h1 className="text-center text-2xl font-bold mt-4">
                  {userData?.name || "loading..."}
                </h1>
                <h2 className="text-center text-xl text-primary-focus">
                  {"@" + userData?.handle || "loading..."}
                </h2>
              </div>
            </div>
            <button
              id="profilePicUpload"
              className="text-2xl p-3 flex justify-end items-center self-center gap-3 rounded-2xl bg-primary text-base-100 shadow-lg hover:bg-base-100 hover:text-primary ease-in-out duration-700"
              onClick={handleProfileUpdate}
            >
              <p className="text-lg">{"Edit"}</p><BsPencil/>
            </button>
          </div>

          {isProfileEdit && (
            <ProfileEdit
              image={profilePic}
              name={userData?.name}
              handle={userData?.handle}
              bio={userData?.bio || "No Bio."}
              handleProfileClose={handleProfileUpdate}
            />
          )}

          <div className={`flex flex-col gap-5 justify-start items-start w-full p-5 rounded-xl bg-base-200 mt-8 ${isBioExpanded ? `hover:bg-base-200` : `hover:bg-base-300`} transition-all mb-5`} onClick={handleBioExpand}>
            <p className="self-start w-full flex items-start">{userData?.bio || "Bio is Empty"}</p>
            {isBioExpanded && 
            <div className="flex flex-col text-start items-start justify-between w-full">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-primary">
                  {"Basic info"}
                </h2>
                <p className="mb-2">
                  <strong>{"Location:"}</strong> {userData?.location || "No Location Added"}
                </p>
                <p className="mb-2 max-sm:text-sm">
                  <strong>{"Email:"}</strong> {userData?.email}
                </p>
              </div>
            </div>}
            <p className="self-start">{"Show "}{isBioExpanded ? "Less" : 'More'}{"..."}</p>
          </div>

          <div className="mb-5 w-full bg-base-200 p-5 rounded-xl">
            <div className="flex flex-row justify-between">
              <h3 className="text-2xl font-bold mb-2 text-primary self-center">
                {"Pets: "}{pets.length}
              </h3>
              <div className="flex justify-center align-middle">
              <button
                className="text-lg p-3 my-2 flex justify-center items-center rounded-2xl bg-primary text-base-100 shadow-lg hover:bg-base-100 hover:text-primary ease-in-out duration-700"
                onClick={toggleAddPetSection}
              >
                <IoMdAddCircleOutline className="size-7 mr-2"/>
                {"Add Pet"}
              </button>
              </div>
            </div>
            <div className="flex flex-col w-full">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  className="flex flex-row max-sm:flex-col gap-2 items-center justify-between bg-primary mt-2 p-4 rounded-lg bg-opacity-30"
                >
                  <div className="flex flex-row gap-2 max-sm:flex-col">
                    <img
                      className="w-24 h-auto rounded-md object-cover max-sm:w-full"
                      src={pet.photoUrl}
                      alt="Pet"
                    />
                    <div className="flex flex-col items-start justify-center text-neutral gap-2">
                      <p>
                        <strong>{"Name:"}</strong> {pet.name}
                      </p>
                      <p>
                        <strong>{"Age:"}</strong> {pet.age}
                      </p>
                      <p>
                        <strong>{"Breed:"}</strong> {pet.breed}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row gap-3">
                    <button
                      className="flex justify-center items-center rounded-2xl bg-primary text-base-100 hover:bg-base-100 hover:text-primary ease-in-out duration-700"
                      onClick={() => handleEditPet(pet)}
                    >
                      <BsPencil className="size-6 m-2" />
                    </button>
                    <button
                      className="flex justify-center items-center rounded-2xl bg-primary text-base-100 hover:bg-base-100 hover:text-primary ease-in-out duration-700"
                      onClick={confirmDeleteBox}
                    >
                      <RiDeleteBin6Line className="size-6 m-2" />
                    </button>
                    {confirmDelete && <>
                    <div className="fixed z-20 bg-black opacity-30 w-full h-full left-0 top-0" onClick={confirmDeleteBox}/>
                    <div className="fixed bg-base-200 flex justify-center items-center z-30 flex-col w-1/5 max-sm:w-4/5 h-fit left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-7 rounded-xl">
                      <button
                        className="text-lg p-2 rounded-full bg-error text-base-100 hover:bg-base-300 hover:text-error transition-colors duration-200 self-end mb-5"
                        onClick={confirmDeleteBox}
                      >
                        <IoMdClose />
                      </button>
                      <h3 className="text-2xl font-semibold mb-2 -translate-y-10">
                        {"Delete Pet?"}
                      </h3>
                      <div className="flex flex-row gap-5">
                        <button className="bg-error py-2 px-3 rounded-xl text-xl" onClick={() => handleDeletePet(pet)}>Yes</button>
                        <button className="border-2 border-error py-2 px-3 rounded-xl text-xl" onClick={confirmDeleteBox}>No</button>
                      </div>
                    </div>
                    </>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {isAddPetVisible && 
          <>
            <div className="fixed z-20 bg-black opacity-50 w-full h-full left-0 top-0" onClick={toggleAddPetSection}/>
            <div className="fixed bg-base-200 flex justify-center items-center z-30 flex-col w-2/5 max-sm:w-4/5 h-fit left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-7 rounded-xl">
              <button
                className="text-lg p-2 rounded-full bg-error text-base-100 hover:bg-base-300 hover:text-error transition-colors duration-200 self-end mb-5"
                onClick={toggleAddPetSection}
              >
                <IoMdClose />
              </button>
              <h3 className="text-2xl font-semibold mb-2 -translate-y-10">
                {editPetId ? "Edit Pet" : "Add New Pet"}
              </h3>
              <input
                type="text"
                placeholder="Pet Name"
                value={newPet.name}
                onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md mb-2"
              />
              <input
                type="text"
                placeholder="Pet Age"
                value={newPet.age}
                onChange={(e) => setNewPet({ ...newPet, age: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md mb-2"
              />
              <input
                type="text"
                placeholder="Pet Breed"
                value={newPet.breed}
                onChange={(e) =>
                  setNewPet({ ...newPet, breed: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md mb-2"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handlePetImageChange}
                className="w-full p-2 border border-gray-300 rounded-md mb-2"
              />
              <button
                onClick={handleAddPet}
                className="text-lg p-3 m-2 flex justify-center items-center rounded-2xl bg-primary text-base-100 shadow-lg hover:bg-base-100 hover:text-primary ease-in-out duration-700"
              >
                {editPetId ? "Update Pet" : "Add Pet"}
              </button>
            </div>
            </>
          }
        </div>
      </div>

      {isEditPetModalOpen && (
        <>
        <div className="fixed z-20 bg-black opacity-50 w-full h-full left-0 top-0" onClick={closeEditPetModal}/>
        <div className="fixed bg-base-200 flex justify-center items-center z-30 flex-col w-2/5 max-sm:w-4/5 h-fit left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-7 rounded-xl">
            <h2 className="text-xl font-bold">Edit Pet</h2>
            <button
              className="text-lg p-2 rounded-full bg-error text-base-100 hover:bg-base-300 hover:text-error transition-colors duration-200 self-end mb-5"
              onClick={closeEditPetModal}
            >
              <IoMdClose />
            </button>
            <input
              type="text"
              placeholder="Pet Name"
              value={newPet.name}
              onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md mb-2"
            />
            <input
              type="text"
              placeholder="Pet Age"
              value={newPet.age}
              onChange={(e) => setNewPet({ ...newPet, age: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md mb-2"
            />
            <input
              type="text"
              placeholder="Pet Breed"
              value={newPet.breed}
              onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md mb-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handlePetImageChange}
              className="w-full p-2 border border-gray-300 rounded-md mb-2"
            />
            <button
              onClick={handleAddPet}
              className="text-lg p-3 m-2 flex justify-center items-center rounded-2xl bg-primary text-base-100 shadow-lg hover:bg-base-100 hover:text-primary ease-in-out duration-700"
            >
              Update Pet
            </button>
        </div>
        </>
      )}
      <div className="w-4/5 max-sm:w-full self-center">
        <div>
          <h1 className="py-8 text-3xl text-primary">Your Posts:</h1>
        </div>
        <div className="flex flex-col items-center w-full">
          {post.map((post) => (
            <Posts
              key={post.id}
              id={post.id}
              handle={post.handle}
              title={post.title}
              content={post.content}
              sevVal={post.sevVal}
              profilePic={userData?.profilePic || null}
              imageUrl={post.imageUrl}
              date={
                post.createdAt
                  ? format(post.createdAt.toDate(), "PPP")
                  : "No date"
              }
              likes={post.likes || []}
              dislikes={post.dislikes || []}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;
