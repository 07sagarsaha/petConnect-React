import React, { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useToast } from "../context/ToastContext";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { IoMdClose } from "react-icons/io";

const Admin = () => {
  const [vetUsers, setVetUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [isVetTableOpen, setIsVetTableOpen] = useState(true);
  const [isUserTableOpen, setIsUserTableOpen] = useState(false);
  const [isFeedbackTableOpen, setIsFeedbackTableOpen] = useState(false);
  const [isBugTableOpen, setIsBugTableOpen] = useState(false);
  const [isOthersTableOpen, setIsOthersTableOpen] = useState(false);
  const [confirmBox, setConfirmBox] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [feedbacks, setFeedback] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [others, setOthers] = useState([]);
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

        // Separate vet and all users
        const vetUsers = allUsers.filter((user) => user.isVet);
        const currentUserDoc = allUsers.find((u) => u.id === user?.id);
        const isUserAdmin = currentUserDoc?.isAdmin || false;

        setVetUsers(vetUsers);
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

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const feedbackCollection = collection(db, "feedback");
        const feedbackSnapshot = await getDocs(feedbackCollection);

        const feedbackList = feedbackSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const feedback = feedbackList.filter(
          (feedback) => feedback.feedbackType === "Feedback"
        );

        const bug = feedbackList.filter(
          (feedback) => feedback.feedbackType === "Bug"
        );

        const other = feedbackList.filter(
          (feedback) => feedback.feedbackType === "Others"
        );

        setFeedback(feedback);
        setBugs(bug);
        setOthers(other);
      } catch (error) {
        console.error(error);
      }
    };

    fetchFeedback();
  }, []);

  const handleVerification = async (userId, isApproved) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isVetVerified: isApproved,
        verificationDate: new Date().toISOString(),
      });

      // Update local state
      const updatedUsers = users.map((user) =>
        user.id === userId && user.isVet === true
          ? { ...user, isVetVerified: isApproved }
          : user
      );

      setUsers(updatedUsers);
      setVetUsers(updatedUsers.filter((user) => user.isVet));
      showToast(`Vet ${isApproved ? "approved" : "denied"} successfully`);
    } catch (error) {
      console.error("Error updating verification:", error);
      showToast("Failed to update verification status");
    }
  };

  const handleAdminStatus = async (userId, makeAdmin) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isAdmin: makeAdmin,
      });

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, isAdmin: makeAdmin } : user
        )
      );

      setConfirmBox(false);
      showToast(
        `${selectedUserId.name} ${makeAdmin ? "made admin" : "removed from admin"} successfully`
      );
    } catch (error) {
      console.error("Error updating admin status:", error);
      showToast("Failed to update admin status");
    }
  };

  const isClerkId = (id) => {
    // Clerk IDs typically start with 'user_' and are followed by a string of characters
    return typeof id === "string" && id.startsWith("user_");
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <>
      <div className="p-4">
        {isAdmin && user && (
          <>
            <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
            <button
              className="btn btn-secondary py-4 my-4"
              onClick={() => Navigate(`/in/home`)}
            >
              {"Go to home"}
            </button>
            <div
              className="flex items-center cursor-pointer bg-gray-800 text-white p-4 rounded-t"
              onClick={() => setIsVetTableOpen(!isVetTableOpen)}
            >
              <h1 className="text-2xl font-bold">Vet Verification Dashboard</h1>
              <span className="ml-2">{isVetTableOpen ? "▼" : "▶"}</span>
            </div>
            <div
              className={`transition-all duration-300 ${isVetTableOpen ? "max-h-[2000px] overflow-auto" : "max-h-0 overflow-hidden"}`}
            >
              <table className="w-full">
                <thead className="bg-base-300 w-full">
                  <tr>
                    <th className="p-4 text-start">User ID</th>
                    <th className="p-4 text-start">Email</th>
                    <th className="p-4 text-start">Name</th>
                    <th className="p-4 text-start">Vet RN</th>
                    <th className="p-4 text-start">isVet</th>
                    <th className="p-4 text-start">isVetVerified</th>
                    <th className="p-4 text-start">Status</th>
                    <th className="p-4 text-start">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-base-content w-full">
                  {vetUsers.map((user) => (
                    <>
                      <tr key={user.id} className={`border-b bg-base-200`}>
                        <td className="p-4 flex flex-row gap-3">
                          {user.isVetVerified === undefined && (
                            <div className="w-4 h-4 self-center rounded-full bg-red-500" />
                          )}
                          {user.id}
                        </td>
                        <td className="p-4">{user.email}</td>
                        <td className="p-4">{user.name}</td>
                        <td className="p-4">{user.rnum}</td>
                        <td className="p-4">
                          {user.isVet ? "User is vet" : "User is not vet"}
                        </td>
                        <td className="p-4">
                          {user.isVetVerified
                            ? "User is verified vet"
                            : user.isVetVerified === undefined
                              ? "User vet is pending"
                              : "User is Not Vet Verified"}
                        </td>
                        <td className="p-4">
                          {user.isVetVerified === true && "Approved"}
                          {user.isVetVerified === false && "Denied"}
                          {user.isVetVerified === undefined && "Pending"}
                        </td>
                        <td className="p-4 space-x-2 flex">
                          {!user.isVetVerified && (
                            <>
                              <button
                                onClick={() =>
                                  handleVerification(user.id, true)
                                }
                                className="bg-green-500 text-white px-3 py-1 rounded"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleVerification(user.id, false)
                                }
                                className="bg-red-500 text-white px-3 py-1 rounded"
                              >
                                Deny
                              </button>
                            </>
                          )}
                          {user.isVetVerified && (
                            <button
                              onClick={() => handleVerification(user.id, false)}
                              className="bg-red-500 text-white px-3 py-1 rounded"
                            >
                              Deny
                            </button>
                          )}
                        </td>
                      </tr>
                    </>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-8">
              <div
                className="flex items-center cursor-pointer bg-gray-800 text-white p-4 rounded-t"
                onClick={() => setIsUserTableOpen(!isUserTableOpen)}
              >
                <h2 className="text-2xl font-bold">User Management</h2>
                <span className="ml-2">{isUserTableOpen ? "▼" : "▶"}</span>
              </div>
              <div
                className={`transition-all duration-300 w-full ${isUserTableOpen ? "max-h-[2000px] overflow-auto" : "max-h-0 overflow-hidden"}`}
              >
                <table className="w-full">
                  <thead className="bg-gray-800 text-white w-full">
                    <tr>
                      <th className="p-4 text-start">User ID</th>
                      <th className="p-4 text-start">Email</th>
                      <th className="p-4 text-start">Name</th>
                      <th className="p-4 text-start">is using Clerk</th>
                      <th className="p-4 text-start">Is Admin</th>
                      <th className="p-4 text-start">Is Vet</th>
                      <th className="p-4 text-start">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-200 w-full">
                    {users.map((u) => (
                      <tr key={u.id} className="border-b">
                        <td className="p-4">{u.id}</td>
                        <td className="p-4">{u.email}</td>
                        <td className="p-4">{u.name}</td>
                        <td className="p-4">
                          {isClerkId(u.id) ? "using Clerk" : "using Firebase"}
                        </td>
                        <td className="p-4">
                          {u.isAdmin ? "Admin" : "Normal User"}
                        </td>
                        <td className="p-4">
                          {u.isVetVerified ? "Vet" : "Not Vet"}
                        </td>
                        <td className="p-4 space-x-2">
                          {u.id !== user.id ? (
                            <>
                              {!u.isAdmin ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedUserId(u);
                                      setConfirmBox(!confirmBox);
                                    }}
                                    className="bg-blue-500 text-white px-3 py-1 rounded w-52"
                                  >
                                    Make Admin
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleAdminStatus(u.id, false)}
                                  className="bg-orange-500 text-white px-3 py-1 rounded w-52"
                                >
                                  Remove Admin
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-500">You</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-8">
              <div
                className="flex items-center cursor-pointer bg-gray-800 text-white p-4 rounded-t"
                onClick={() => setIsFeedbackTableOpen(!isFeedbackTableOpen)}
              >
                <h2 className="text-2xl font-bold">Feedback</h2>
                <span className="ml-2">{isFeedbackTableOpen ? "▼" : "▶"}</span>
              </div>
              <div
                className={`transition-all duration-300 w-full ${isFeedbackTableOpen ? "max-h-[2000px] overflow-auto" : "max-h-0 overflow-hidden"}`}
              >
                <table className="w-full mb-6">
                  <thead className="bg-gray-800 text-white w-full">
                    <tr>
                      <th className="p-4 text-start">User ID</th>
                      <th className="p-4 text-start">Name</th>
                      <th className="p-4 text-start">Feedback</th>
                      <th className="p-4 text-start">Importance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-200 w-full">
                    {feedbacks.map((u) => (
                      <tr key={u.id} className="border-b">
                        <td className="p-4">{u.id}</td>
                        <td className="p-4">{u.name}</td>
                        <td className="p-4">{u.feedback}</td>
                        <td className="p-4">{u.importance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-8">
              <div
                className="flex items-center cursor-pointer bg-gray-800 text-white p-4 rounded-t"
                onClick={() => setIsBugTableOpen(!isBugTableOpen)}
              >
                <h2 className="text-2xl font-bold">Bugs</h2>
                <span className="ml-2">{isBugTableOpen ? "▼" : "▶"}</span>
              </div>
              <div
                className={`transition-all duration-300 w-full ${isBugTableOpen ? "max-h-[2000px] overflow-auto" : "max-h-0 overflow-hidden"}`}
              >
                <table className="w-full mb-6">
                  <thead className="bg-gray-800 text-white w-full">
                    <tr>
                      <th className="p-4 text-start">User ID</th>
                      <th className="p-4 text-start">Name</th>
                      <th className="p-4 text-start">Bug description</th>
                      <th className="p-4 text-start">Importance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-200 w-full">
                    {bugs.map((u) => (
                      <tr key={u.id} className="border-b">
                        <td className="p-4">{u.id}</td>
                        <td className="p-4">{u.name}</td>
                        <td className="p-4">{u.feedback}</td>
                        <td className="p-4">{u.importance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-8">
              <div
                className="flex items-center cursor-pointer bg-gray-800 text-white p-4 rounded-t"
                onClick={() => setIsOthersTableOpen(!isOthersTableOpen)}
              >
                <h2 className="text-2xl font-bold">{"Others"}</h2>
                <span className="ml-2">{isOthersTableOpen ? "▼" : "▶"}</span>
              </div>
              <div
                className={`transition-all duration-300 w-full ${isOthersTableOpen ? "max-h-[2000px] overflow-auto" : "max-h-0 overflow-hidden"}`}
              >
                <table className="w-full mb-6">
                  <thead className="bg-gray-800 text-white w-full">
                    <tr>
                      <th className="p-4 text-start">User ID</th>
                      <th className="p-4 text-start">Name</th>
                      <th className="p-4 text-start">{"User Says..."}</th>
                      <th className="p-4 text-start">Importance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-200 w-full">
                    {others.map((u) => (
                      <tr key={u.id} className="border-b">
                        <td className="p-4">{u.id}</td>
                        <td className="p-4">{u.name}</td>
                        <td className="p-4">{u.feedback}</td>
                        <td className="p-4">{u.importance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
      {!isAdmin && user && (
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold mb-4">
            You are not authorized to view this page
          </h1>
          <p>Please contact an admin for more information.</p>
          <button
            className="btn btn-secondary text-base-content py-4 my-4"
            onClick={() => Navigate(`/in/home`)}
          >
            {"Go to home"}
          </button>
        </div>
      )}

      {confirmBox && (
        <>
          <div
            className="fixed z-20 bg-black opacity-70 w-full h-full left-0 top-0"
            onClick={() => setConfirmBox(!confirmBox)}
          />
          <div className="fixed bg-base-200 flex justify-center items-center z-30 flex-col w-2/5 max-sm:w-4/5 h-fit left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-7 rounded-xl">
            <button
              className="text-lg p-2 rounded-full bg-primary text-base-100 hover:bg-base-300 hover:text-error transition-colors duration-200 self-end mb-5"
              onClick={() => setConfirmBox(!confirmBox)}
            >
              <IoMdClose />
            </button>
            <h3 className="text-2xl font-semibold mb-2 -translate-y-10">
              {"Are you sure?"}
            </h3>
            <p className="mb-4">{`You want to make ${selectedUserId.name} an Admin?`}</p>
            <div className="flex flex-row gap-5">
              <button
                className="bg-primary rounded-xl text-xl btn"
                onClick={() => handleAdminStatus(selectedUserId.id, true)}
              >
                Yes
              </button>
              <button
                className="border-2 border-primary btn rounded-xl text-xl"
                onClick={() => setConfirmBox(!confirmBox)}
              >
                No
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Admin;
