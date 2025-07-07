import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowDropleft } from "react-icons/io";
import AdminVetVerification from "../components/UI/AdminVetVerification";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import SetAdmin from "../components/UI/SetAdmin";
import AdminFeedback from "../components/UI/AdminFeedback";
import AdminBugs from "../components/UI/AdminBugs";
import AdminOthers from "../components/UI/AdminOthers";
import AdminAnnouncements from "../components/UI/AdminAnnouncements";
import AdminAllAnnouncements from "../components/UI/AdminAllAnnouncements";
import AdminReports from "../components/UI/AdminReports";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useUser();
  const Navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const userSnapshot = await getDocs(usersCollection);
        const allUsers = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const currentUserDoc = allUsers.find((u) => u.id === user?.id);
        const isUserAdmin = currentUserDoc?.isAdmin || false;

        setUsers(allUsers);
        setIsAdmin(isUserAdmin);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  if (loading) {
    return (
      <div className="text-center p-4">
        <AiOutlineLoading3Quarters
          className="animate-spin justify-center items-center w-full mt-[50vh]"
          size={50}
        />
      </div>
    );
  }

  return (
    <>
      <div className="p-8 max-sm:p-4">
        {isAdmin && user && (
          <>
            <div className="flex flex-row gap-3 items-center bg-base-300 rounded-xl p-2 w-fit">
              <button
                className="btn btn-ghost btn-md"
                onClick={() => Navigate(`/in/home`)}
              >
                <IoIosArrowDropleft size={30} />
              </button>
              <h1 className="text-2xl font-extrabold mr-4">{"Admin Panel"}</h1>
            </div>
            <AdminVetVerification users={users} />
            <SetAdmin users={users} />
            <AdminReports />
            <AdminFeedback />
            <AdminBugs />
            <AdminOthers />
            <AdminAnnouncements />
            <AdminAllAnnouncements />
          </>
        )}
      </div>
      {!isAdmin && user && (
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold mb-4">
            {"You are not authorized to view this page"}
          </h1>
          <p>{"Please contact an admin for more information."}</p>
          <button
            className="btn btn-secondary text-base-content py-4 my-4"
            onClick={() => Navigate(`/in/home`)}
          >
            {"Go to home"}
          </button>
        </div>
      )}
    </>
  );
};

export default Admin;
