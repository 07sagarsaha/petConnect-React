import React, { useEffect, useState } from "react";
import Button from "../context/authContext/button";
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
} from "firebase/firestore";
import Posts from "../components/UI/Posts";
import { format } from "date-fns";
import { IoMdClose, IoMdAddCircleOutline, IoMdCreate } from "react-icons/io";
import ProfileEdit from "../components/ProfileEdit";

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

  const closeEditPetModal = () => {
    setIsEditPetModalOpen(false);
    setEditPetId(null);
    setNewPet({ name: "", age: "", breed: "", photoUrl: "" });
  };

  return (
    <div className="flex justify-center flex-col bg-base-100 text-gray-800 min-h-screen p-8 ">
      <div className="w-full bg-base-300 rounded-lg  p-6">
        <div className="flex flex-col items-center w-full text-center mb-5">
          {isPFPClicked && profilePic && (
            <div className="h-full w-full left-0 justify-center items-center flex fixed top-0 z-40 glass transition-colors duration-200">
              <IoMdClose
                className="text-5xl fixed z-50 p-2 right-5 top-16 rounded-lg hover:text-error transition-all duration-300"
                onClick={handleProfileClick}
              />
              <img
                src={profilePic}
                alt="Image"
                className="h-4/5  w-36 m-12 object-contain rounded-2xl animate-postAnim1 max-sm:"
              />
            </div>
          )}
          <img
            className="w-36 h-36 rounded-full object-cover"
            src={profilePic}
            alt="Profile"
            onClick={handleProfileClick}
          />
          <h1 className="text-center text-2xl font-bold mt-4">
            {userData?.name || "loading..."}
          </h1>
          <h2 className="text-center text-xl text-neutral">
            {"@" + userData?.handle || "loading..."}
          </h2>

          <div className="flex justify-center mt-4">
            <button
              id="profilePicUpload"
              className="text-lg p-3 m-2 flex justify-center items-center rounded-2xl bg-accent text-neutral  hover:bg-neutral hover:text-accent ease-in-out duration-700"
              onClick={handleProfileUpdate}
            >
              Edit Your Profile
            </button>
          </div>

          {isProfileEdit && (
            <ProfileEdit
              image={profilePic}
              name={userData?.name}
              handle={userData?.handle}
              bio={userData?.bio || "Write something about you..."}
              handleProfileClose={handleProfileUpdate}
            />
          )}

          <p className="mt-4">{userData?.bio || "Bio is Empty"}</p>

          <div className="flex flex-col text-center items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-semibold mb-2 text-neutral">
                Basic info
              </h2>
              <p className="mb-2">
                <strong>Location:</strong> "User location"
              </p>
              <p className="mb-2">
                <strong>Email:</strong> {userData?.email}
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2 text-neutral">
                Pet info
              </h2>
              <p className="mb-2">
                <strong>Number of pets:</strong> {pets.length}
              </p>
            </div>
          </div>
          <div className="mb-5 w-full">
            <h3 className="text-xl font-semibold mb-2 text-neutral">
              Pet Profiles
            </h3>
            <div className="flex flex-col w-full">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  className="flex justify-between items-center bg-primary text-base-100  m-2 p-4 rounded-lg"
                >
                  <div className="flex flex-row gap-2">
                    <img
                      className="w-24 h-auto rounded-md"
                      src={pet.photoUrl}
                      alt="Pet"
                    />
                    <div className="flex flex-col items-start justify-center text-neutral gap-2">
                      <p>
                        <strong>Name:</strong> {pet.name}
                      </p>
                      <p>
                        <strong>Age:</strong> {pet.age}
                      </p>
                      <p>
                        <strong>Breed:</strong> {pet.breed}
                      </p>
                    </div>
                  </div>
                  <button
                    className="flex justify-center items-center rounded-2xl bg-accent text-neutral hover:bg-neutral h-fit hover:text-accent ease-in-out duration-700"
                    onClick={() => handleEditPet(pet)}
                  >
                    <IoMdCreate className="size-7 m-2" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center align-middle">
            <button
              className="text-lg p-3 m-2 flex justify-center items-center rounded-2xl bg-accent text-neutral  hover:bg-neutral hover:text-accent ease-in-out duration-700"
              onClick={toggleAddPetSection}
            >
              <IoMdAddCircleOutline className="size-7 mr-2" />
              Add Pet
            </button>
          </div>
          {isAddPetVisible && (
            <div className="mb-5 w-full">
              <h3 className="text-xl font-semibold mb-2 text-primary">
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
                className="text-lg p-3 m-2 flex justify-center items-center rounded-2xl bg-primary text-base-100 hover:bg-base-100 hover:text-primary ease-in-out duration-700"
              >
                {editPetId ? "Update Pet" : "Add Pet"}
              </button>
            </div>
          )}
        </div>

        <div>
          <h1 className="p-8 text-3xl text-neutral">Your Posts:</h1>
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

      {isEditPetModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-base-100 p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Pet</h2>
              <button
                className="text-lg p-2 rounded-full bg-error text-base-100 hover:bg-error-focus hover:text-error"
                onClick={closeEditPetModal}
              >
                <IoMdClose />
              </button>
            </div>
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
              className="text-lg p-3 m-2 flex justify-center items-center rounded-2xl bg-primary text-base-100  hover:bg-base-100 hover:text-primary ease-in-out duration-700"
            >
              Update Pet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
